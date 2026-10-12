<script setup>
/* DISHCOVERY | RESTAURANT POP-UP (shared by Home, Restaurants and Favorites)
   Original modal.js structure, text and #restaurant target. Vue fills the existing target;
   Home stays Home and Favorites stays Favorites. Styles: restaurants.css + extras.css. */
import { nextTick, onUnmounted, ref, watch } from 'vue';
import { addFavorite, removeFavorite, getFavorites, getReview, addReview, deleteReview } from '../api.js';
import { ABOUT } from '../cuisineDescriptions.js';
const emit = defineEmits(["favoritesChanged"]);
const props = defineProps({ restaurant: { type: Object, default: null }, openKey: { type: Number, default: 0 } });
const panel = ref(null), rating = ref(0), text = ref(''), saved = ref(null), favorite = ref(false);
const message = ref(''), withLink = ref(false), loading = ref(false), pending = ref(false);
const toastVisible = ref(false);
let generation = 0, toastTimer;
function say(value, link = false) { message.value = value; withLink.value = link; }
function fillReview(review) {
  saved.value = review; rating.value = review?.rating || 0; text.value = review?.text || ''; say('');
}
// Reopening the same card resets unsaved edits exactly as the original fillReview().
watch([() => props.restaurant, () => props.openKey], async ([restaurant]) => {
  const token = ++generation;
  fillReview(null); favorite.value = false; pending.value = false;
  if (!restaurant) return;
  loading.value = true;
  try {
    const [favorites, review] = await Promise.all([getFavorites(), getReview(restaurant.id)]);
    if (token !== generation) return;
    favorite.value = favorites.includes(restaurant.id); fillReview(review);
    await nextTick(); if (panel.value) panel.value.scrollTop = 0;
  } catch (error) { if (token === generation) say(error.message); }
  finally { if (token === generation) loading.value = false; }
}, { immediate: true });
// One handler per Vue star button replaces the original global data-fav click listener.
async function toggleFavorite() {
  if (!props.restaurant || loading.value || pending.value) return;
  pending.value = true;
  const token = generation;
  try {
    const favorites = favorite.value ? await removeFavorite(props.restaurant.id) : await addFavorite(props.restaurant.id);
    if (token !== generation) return;
    favorite.value = favorites.includes(props.restaurant.id);
    emit("favoritesChanged", favorites);
    if (favorite.value) {
      toastVisible.value = true; clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toastVisible.value = false; }, 4200);
    }
  } catch (error) { if (token === generation) say(error.message); }
  finally { if (token === generation) pending.value = false; }
}
function setStars(value) { rating.value = value; say(''); }
// Add / edit: one review per restaurant, preserving the original validation messages.
async function saveReview() {
  if (!props.restaurant || pending.value || loading.value) return;
  if (!rating.value) return say('Pick a star rating first.');
  if (!text.value.trim()) return say('Write a few words about your visit.');
  pending.value = true;
  const token = generation;
  const edited = Boolean(saved.value);
  try {
    const r = props.restaurant;
    const review = await addReview({ rid: r.id, name: r.name, cuisine: r.cuisine, borough: r.borough,
      rating: rating.value, text: text.value.trim(), ts: Date.now() });
    if (token !== generation) return;
    fillReview(review); say(edited ? 'Review updated.' : 'Review saved.', true);
  } catch (error) { if (token === generation) say(error.message); }
  finally { if (token === generation) pending.value = false; }
}
// Delete: the original restaurant popup deletes immediately; Reviews page confirmation comes later.
async function removeReview() {
  if (!props.restaurant || pending.value || loading.value) return;
  pending.value = true;
  const token = generation;
  try { await deleteReview(props.restaurant.id); if (token === generation) { fillReview(null); say('Review deleted.'); } }
  catch (error) { if (token === generation) say(error.message); }
  finally { if (token === generation) pending.value = false; }
}
onUnmounted(() => { generation++; clearTimeout(toastTimer); });
</script>
<template>
  <!-- #restaurant and :target remain the mechanism opening the popup. -->
  <div class="modal" id="restaurant" role="dialog" aria-modal="true" aria-labelledby="r-title">
    <a href="#modal-none" class="modal__backdrop" tabindex="-1" aria-label="Close"></a>
    <div ref="panel" class="modal__panel rmodal">
      <a href="#modal-none" class="modal__close" aria-label="Close">&times;</a>
      <p class="rmodal__meta" id="r-meta">{{ restaurant ? restaurant.cuisine + ' | ' + restaurant.borough : '' }}</p>
      <div class="rmodal__head">
        <h2 class="modal__title rmodal__title" id="r-title">{{ restaurant?.name }}</h2>
        <button type="button" class="fav fav--bare" id="r-fav" :data-fav="restaurant?.id || ''" :aria-pressed="favorite" :aria-label="favorite ? 'Remove from favorites' : 'Add to favorites'" :disabled="loading || pending || !restaurant" @click="toggleFavorite">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.5l2.9 6.4 6.9.7-5.2 4.6 1.6 6.8L12 17.4 5.8 21l1.6-6.8L2.2 9.6l6.9-.7z" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div class="rstat"><b id="r-score">{{ restaurant?.score }}</b><span>Aggregated score</span></div>
      <p class="modal__label">Address</p><p class="modal__text" id="r-address">{{ restaurant ? restaurant.street + ', ' + restaurant.borough + (restaurant.zip ? ' ' + restaurant.zip : '') + ', NY' : '' }}</p>
      <p class="modal__label">Dishes offered</p><ul class="tags" id="r-dishes"><template v-if="restaurant"><li v-for="(meal, index) in restaurant.meals" :key="index">{{ meal }}</li><li v-if="!restaurant.meals.length">No dishes listed</li></template></ul>
      <p class="modal__label" id="r-about-label">{{ restaurant ? 'About ' + restaurant.cuisine + ' cuisine' : 'About the cuisine' }}</p><p class="modal__text" id="r-about">{{ ABOUT[restaurant?.cuisine] || '' }}</p>
      <p class="modal__label">Your review</p>
      <form class="rv" id="rv-form" novalidate @submit.prevent="saveReview">
        <div class="starpick" id="rv-stars" :data-value="rating" role="group" aria-label="Rating">
          <button v-for="n in 5" :key="n" type="button" :data-v="n" :class="{ on: n <= rating }" :aria-label="n + ' star' + (n > 1 ? 's' : '')" :disabled="loading || pending" @click="setStars(n)">&#9733;</button>
        </div>
        <label for="rv-text" class="visually-hidden">Write your review</label>
        <textarea v-model="text" class="field" id="rv-text" rows="3" maxlength="600" placeholder="What did you think?" :disabled="loading || pending"></textarea>
        <p class="rv__msg" id="rv-msg" :hidden="!message && !loading" role="status">{{ loading ? 'Loading your review…' : message }}<template v-if="withLink && !loading">{{ ' ' }}<RouterLink to="/reviews">View in My Reviews</RouterLink></template></p>
        <div class="rv__row"><button type="submit" class="btn btn--solid" id="rv-save" :disabled="loading || pending || !restaurant">{{ saved ? 'Update review' : 'Save review' }}</button>
          <button type="button" class="linkbtn" id="rv-del" :hidden="!saved" :disabled="loading || pending" @click="removeReview">Delete review</button></div>
      </form>
    </div>
  </div>
  <!-- Original 4200ms toast and classes; timers are cleaned up when leaving Home. -->
  <div id="toast" class="toast" :class="{ 'is-on': toastVisible }" role="status"><span>Added to favorites</span></div>
</template>
