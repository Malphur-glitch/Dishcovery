<script setup>
/* DISHCOVERY | MY REVIEWS PAGE
   Lists the reviews saved from the Restaurants page. Each one can be edited
   (it is really changed in the store) or deleted (it is really removed). */
import { onMounted, onUnmounted, ref } from 'vue';
import { getReviews, updateReview, deleteReview, getRestaurantPhoto } from '../api.js';
const reviews = ref([]), editing = ref(null), rating = ref(0), text = ref(''), message = ref('');
const loading = ref(false), error = ref(''), pending = ref(false);
let alive = true, generation = 0;
function date(ts) { return new Date(ts).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}); }
const hideImage = e => { e.target.style.display = 'none'; };
function edit(r) { editing.value = r.rid; rating.value = r.rating; text.value = r.text; message.value = ''; }
function cancel() { editing.value = null; message.value = ''; }
async function load() {
 const token = ++generation; loading.value = true; error.value = '';
 try { const list = await getReviews(); if (alive && token === generation) reviews.value = list; }
 catch(e) { if (alive && token === generation) error.value = e.message; }
 finally { if (alive && token === generation) loading.value = false; }
}
async function save(r) {
 if (pending.value) return;
 if (!rating.value || !text.value.trim()) { message.value = !rating.value ? 'Pick a star rating.' : 'Write a few words about your visit.'; return; }
 pending.value = true;
 try {
  const saved = await updateReview(r.rid,{rating:rating.value,text:text.value.trim(),ts:Date.now()});
  if (!alive) return;
  reviews.value = [saved,...reviews.value.filter(old => old.rid !== r.rid)]; cancel(); error.value = '';
 } catch(e) { if (alive) message.value = e.message; }
 finally { pending.value = false; }
}
async function remove(r) {
 if (pending.value || !window.confirm('Delete this review?')) return;
 pending.value = true;
 try { await deleteReview(r.rid); if (alive) { reviews.value = reviews.value.filter(old => old.rid !== r.rid); cancel(); error.value = ''; } }
 catch(e) { if (alive) error.value = e.message; }
 finally { pending.value = false; }
}
onMounted(load);
onUnmounted(() => { alive = false; generation++; });
</script>
<template>
  <main id="top" class="rv-page">
    <!-- Title on top; the text fades like the other pages when you scroll -->
    <h1 class="rv-title reveal">My Reviews</h1>
    <!-- Glass panel: restaurant name on the left, my review on the right. reviews.js fills it in. -->
    <section class="glass rv-panel" id="panel" aria-label="My reviews">
      <p v-if="loading" class="rl-empty__text" role="status">Loading reviews…</p>
      <div v-if="error" class="rv-empty"><p class="rl-empty__text" role="alert">{{ error }}</p><button type="button" class="btn" @click="load">Try again</button></div>
      <article v-for="r in reviews" :key="r.rid" class="rv-row reveal" :data-rid="r.rid">
        <img v-if="getRestaurantPhoto({id:r.rid,cuisine:r.cuisine})" class="rv-row__photo" :src="getRestaurantPhoto({id:r.rid,cuisine:r.cuisine})" alt="" @error="hideImage">
        <div><RouterLink class="rv-name" :to="{path:'/restaurants',query:{open:r.rid}}">{{ r.name }}</RouterLink><p class="rv-meta">{{ r.cuisine }} | {{ r.borough }}</p></div>
        <div>
          <div v-if="editing === r.rid" class="rv-edit">
            <div class="starpick" :data-value="rating" role="group" aria-label="Rating"><button v-for="n in 5" :key="n" type="button" :data-v="n" :class="{on:n <= rating}" :aria-label="n + ' star' + (n > 1 ? 's' : '')" :disabled="pending" @click="rating = n">★</button></div>
            <textarea v-model="text" class="field" rows="4" maxlength="600" aria-label="Your review" :disabled="pending"></textarea>
            <p class="rv__msg" :hidden="!message" role="status">{{ message }}</p>
            <div class="rv__row"><button type="button" class="btn btn--solid" data-act="save" :disabled="pending" @click="save(r)">Save changes</button><button type="button" class="linkbtn" data-act="cancel" :disabled="pending" @click="cancel">Cancel</button></div>
          </div>
          <template v-else>
            <span class="rstars" role="img" :aria-label="r.rating + ' out of 5 stars'">{{ "★".repeat(r.rating) }}<i v-for="n in 5 - r.rating" :key="n">★</i></span>
            <p class="rv-text">{{ r.text }}</p><p class="rv-date">{{ date(r.ts) }}</p>
            <div class="rv-actions"><button type="button" class="linkbtn" data-act="edit" :disabled="pending" @click="edit(r)">Edit</button><button type="button" class="linkbtn" data-act="delete" :disabled="pending" @click="remove(r)">Delete</button></div>
          </template>
        </div>
      </article>
      <div v-if="!loading && !error && !reviews.length" class="rv-empty"><p class="rl-empty__title">No reviews yet</p><p class="rl-empty__text">Open a restaurant, pick your stars and write a few words.</p><RouterLink class="btn" to="/restaurants">Browse restaurants</RouterLink></div>
    </section>
  </main>
</template>
