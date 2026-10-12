<script setup>
/* DISHCOVERY | FAVORITES PAGE
   1. Hero slider: one image per cuisine (6), arrows / dots / swipe-free smooth slide.
   2. "My Favorites" cards, drawn the same way as the Restaurants page. */
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { getRestaurants, getFavorites, removeFavorite } from '../api.js';
import RestaurantListCard from '../components/RestaurantListCard.vue';
import RestaurantModal from '../components/RestaurantModal.vue';
const now = ref(0), restaurants = ref([]), favorites = ref([]), selected = ref(null), openKey = ref(0);
const loading = ref(false), error = ref(''), pending = reactive(new Set());
let alive = true, generation = 0;
const byId = computed(() => new Map(restaurants.value.map(r => [r.id,r])));
const list = computed(() => favorites.value.map(id => byId.value.get(id)).filter(Boolean));
const hideImage = event => { event.target.style.visibility = 'hidden'; };
/* ---------- hero slider ---------- */
function go(n) { now.value = (n + 6) % 6; }
function keydown(e) { if (e.key === 'ArrowLeft') go(now.value - 1); if (e.key === 'ArrowRight') go(now.value + 1); }
/* ---------- my favorites ---------- */
async function load() {
 const token = ++generation; loading.value = true; error.value = '';
 try { const [records, ids] = await Promise.all([getRestaurants(),getFavorites()]); if (!alive || token !== generation) return; restaurants.value = records; favorites.value = ids; }
 catch(e) { if (alive && token === generation) error.value = e.message; }
 finally { if (alive && token === generation) loading.value = false; }
}
// A card opens the pop-up right here on Favorites (it does not go to the Restaurants page).
function open(r) { selected.value = r; openKey.value++; }
// Un-starring a card removes it from this page, retaining the saved newest-first order.
async function remove(r) {
 if (pending.has(r.id)) return; pending.add(r.id);
 try { const ids = await removeFavorite(r.id); if (alive) { favorites.value = ids; error.value = ''; } }
 catch(e) { if (alive) error.value = e.message; }
 finally { pending.delete(r.id); }
}
onMounted(() => { load(); document.addEventListener('keydown',keydown); });
onUnmounted(() => { alive = false; generation++; document.removeEventListener('keydown',keydown); });
</script>
<template>
  <main id="top">

    <!-- ===================== HERO SLIDER: 6 images, one per cuisine. Images: img/italy.jpg, japan.jpg, mexico.jpg, india.jpg, chinese.jpg, thai.jpg ===================== -->
    <section class="fav-hero" aria-label="Cuisines">
      <div class="fav-track" :style="{transform: `translateX(-${now * 100}%)`}">
        <div class="fav-slide" :class="{'is-active': now === 0}" :aria-hidden="now !== 0" aria-roledescription="slide">
          <div class="media" style="--h:12"><img src="/img/favitaly.jpg" alt="" @error="hideImage"></div>
          <div class="fav-copy"><h1>Italian</h1><p>Handmade and wood-fired</p></div>
        </div>
        <div class="fav-slide" :class="{'is-active': now === 1}" :aria-hidden="now !== 1" aria-roledescription="slide">
          <div class="media" style="--h:345"><img src="/img/favjapan.jpg" alt="" @error="hideImage"></div>
          <div class="fav-copy"><h1>Japanese</h1><p>Precision and simplicity</p></div>
        </div>
        <div class="fav-slide" :class="{'is-active': now === 2}" :aria-hidden="now !== 2" aria-roledescription="slide">
          <div class="media" style="--h:95"><img src="/img/favmexico.jpg" alt="" @error="hideImage"></div>
          <div class="fav-copy"><h1>Mexican</h1><p>Bold, fresh and vibrant</p></div>
        </div>
        <div class="fav-slide" :class="{'is-active': now === 3}" :aria-hidden="now !== 3" aria-roledescription="slide">
          <div class="media" style="--h:32"><img src="/img/favindia.jpg" alt="" @error="hideImage"></div>
          <div class="fav-copy"><h1>Indian</h1><p>Spice and tradition</p></div>
        </div>
        <div class="fav-slide" :class="{'is-active': now === 4}" :aria-hidden="now !== 4" aria-roledescription="slide">
          <div class="media" style="--h:5"><img src="/img/favchina.jpg" alt="" @error="hideImage"></div>
          <div class="fav-copy"><h1>Chinese</h1><p>Centuries of technique</p></div>
        </div>
        <div class="fav-slide" :class="{'is-active': now === 5}" :aria-hidden="now !== 5" aria-roledescription="slide">
          <div class="media" style="--h:165"><img src="/img/favthai.jpg" alt="" @error="hideImage"></div>
          <div class="fav-copy"><h1>Thai</h1><p>Sweet, sour and fragrant</p></div>
        </div>
      </div>
      <div class="fav-ctrl">
        <button type="button" class="fav-arrow" id="fav-prev" @click="go(now - 1)" aria-label="Previous cuisine">&larr;</button>
        <div class="fav-dots"><button type="button" class="fav-dot" :class="{'is-on': now === 0}" @click="go(0)" aria-label="Show Italian"></button><button type="button" class="fav-dot" :class="{'is-on': now === 1}" @click="go(1)" aria-label="Show Japanese"></button><button type="button" class="fav-dot" :class="{'is-on': now === 2}" @click="go(2)" aria-label="Show Mexican"></button><button type="button" class="fav-dot" :class="{'is-on': now === 3}" @click="go(3)" aria-label="Show Indian"></button><button type="button" class="fav-dot" :class="{'is-on': now === 4}" @click="go(4)" aria-label="Show Chinese"></button><button type="button" class="fav-dot" :class="{'is-on': now === 5}" @click="go(5)" aria-label="Show Thai"></button></div>
        <button type="button" class="fav-arrow fav-arrow--next" id="fav-next" @click="go(now + 1)" aria-label="Next cuisine">&rarr;</button>
      </div>
    </section>

    <!-- ===================== MY FAVORITES ===================== -->
    <section class="section fav-list" id="my-favorites">
      <div class="fav-head">
        <h2 class="section__title reveal">My Favorites</h2>
        <p class="rl-count" id="count" aria-live="polite">{{ list.length }} {{ list.length === 1 ? "restaurant" : "restaurants" }}</p>
      </div>
      <p v-if="loading" class="rl-empty__text" role="status">Loading favorites…</p><div v-if="error" class="rl-empty"><p class="rl-empty__text" role="alert">{{ error }}</p><button type="button" class="btn" @click="load">Try again</button></div>
      <div class="rl-grid" id="grid"><RestaurantListCard v-for="(restaurant, index) in list" :key="restaurant.id" :restaurant="restaurant" :index="index" :favorite="true" :pending="pending.has(restaurant.id)" @open="open" @favorite="remove" /></div>
      <div class="rl-empty" id="empty" :hidden="loading || error || list.length > 0">
        <p class="rl-empty__title">No favorites yet</p>
        <p class="rl-empty__text">Tap the star on a restaurant to save it here.</p>
        <RouterLink class="btn" to="/restaurants">Browse restaurants</RouterLink>
      </div>
    </section>

  </main>


<!-- Fixed close target preserves the current page scroll position. -->
<div id="modal-none" class="modal-none" aria-hidden="true"></div>
<RestaurantModal :restaurant="selected" :open-key="openKey" @favorites-changed="favorites = $event" />
</template>
