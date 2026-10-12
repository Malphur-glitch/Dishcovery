<script setup>
/* Original restaurants.js: combined OR-within / AND-between filters, 36-card chunks,
   contextual counts, search terms, URL choices and native CSS :target pop-up links. */
import { computed, inject, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getHomeData, getFavorites, addFavorite, removeFavorite } from '../api.js';
import RestaurantListCard from '../components/RestaurantListCard.vue';
import RestaurantModal from '../components/RestaurantModal.vue';
const route = useRoute(), router = useRouter(), badge = inject('filterCount');
const data = ref([]), scoreIds = ref(null), favorites = ref([]), loading = ref(false), error = ref('');
const selected = ref(null), openKey = ref(0), shown = ref(36), sentinel = ref(null), searchInput = ref(null), searchText = ref('');
const pending = reactive(new Set()), toast = ref('');
const state = reactive({ q: '', cuisine: [], borough: [], top: false, sort: 'random' });
let typing, toastTimer, observer, alive = true, generation = 0;
const number = n => Number(n).toLocaleString('en-US');
const titleCase = s => String(s).toLowerCase().replace(/(^|[\s\-\/])([a-z])/g, (_, a, b) => a + b.toUpperCase());
const boroughOrder = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
const options = computed(() => {
 const cuisine = [...new Set(data.value.map(r => r.cuisine))].sort();
 const values = [...new Set(data.value.map(r => r.borough))];
 return { cuisine, borough: [...boroughOrder.filter(v => values.includes(v)), ...values.filter(v => !boroughOrder.includes(v)).sort()] };
});
const query = computed(() => {
 let text = state.q.toLowerCase(); const out = { words: [], cuisine: [], borough: [] };
 if (text.includes('staten island')) { out.borough.push('Staten Island'); text = text.replace('staten island', ' '); }
 text.split(/\s+/).filter(Boolean).forEach(word => {
  const cuisine = options.value.cuisine.find(v => v.toLowerCase() === word), borough = options.value.borough.find(v => v.toLowerCase() === word);
  if (cuisine) out.cuisine.push(cuisine); else if (borough) out.borough.push(borough); else out.words.push(word);
 }); return out;
});
function matches(r, ignore) {
 if (!query.value.words.every(word => r.haystack.includes(word))) return false;
 for (const group of ['cuisine', 'borough']) {
  if (query.value[group].length && !query.value[group].includes(r[group])) return false;
  if (group !== ignore && state[group].length && !state[group].includes(r[group])) return false;
 }
 return !state.top || (scoreIds.value ? scoreIds.value.has(r.id) : r.score > 90);
}
// Default order is random (no sort chip selected). The order is fixed for the page load so it
// doesn't reshuffle while you filter or scroll; it changes on refresh and on "Clear all".
const shuffleSeed = ref(Math.floor(Math.random() * 2147483647));
const mixCache = new Map();
function reshuffle() { mixCache.clear(); shuffleSeed.value = Math.floor(Math.random() * 2147483647); }
function mix(id) {
 let h = mixCache.get(id);
 if (h === undefined) { h = shuffleSeed.value; for (const ch of String(id)) h = Math.imul(h ^ ch.charCodeAt(0), 2654435761) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; mixCache.set(id, h); }
 return h;
}
const results = computed(() => data.value.filter(r => matches(r)).sort((a,b) => state.sort === 'random' ? mix(a.id) - mix(b.id) : (state.sort === 'high' ? b.score-a.score : state.sort === 'low' ? a.score-b.score : 0) || a.name.localeCompare(b.name)));
const resultLabel = computed(() => results.value.length ? number(results.value.length) + (results.value.length === 1 ? ' restaurant' : ' restaurants') : '');
const counts = computed(() => Object.fromEntries(['cuisine','borough'].map(group => {
 const count = {}; data.value.forEach(r => { if (matches(r,group)) count[r[group]] = (count[r[group]] || 0) + 1; }); return [group,count];
})));
const tokens = computed(() => [ ...(state.q ? [{group:'q',value:state.q,label:'“'+state.q+'”'}] : []), ...['cuisine','borough'].flatMap(group => state[group].map(value => ({group,value,label:value}))), ...(state.top ? [{group:'top',value:'1',label:'Top rated'}] : []) ]);
watch(() => state.cuisine.length + state.borough.length + Number(state.top), n => { badge.value = n; }, {immediate:true});
watch(results, () => { shown.value = 36; });
function readURL() {
 clearTimeout(typing);
 for (const group of ['cuisine','borough']) state[group] = String(route.query[group] || '').split(',').map(v => titleCase(v.trim())).filter(Boolean);
 state.q = String(route.query.q || '').trim(); searchText.value = state.q;
 state.top = route.query.top === '1'; state.sort = ['random','name','high','low'].includes(route.query.sort) ? route.query.sort : 'random';
}
watch(() => route.query, readURL, {immediate:true});
function commit() {
 state.q = searchText.value.trim(); const query = {};
 if (state.q) query.q = state.q;
 for (const group of ['cuisine','borough']) if (state[group].length) query[group] = state[group].join(',');
 if (state.top) query.top = '1'; if (state.sort !== 'random') query.sort = state.sort;
 router.replace({path:route.path, query, hash:route.hash});
}
function typeSearch() { clearTimeout(typing); typing = setTimeout(commit,120); }
function clearSearch() { searchText.value = ''; commit(); searchInput.value?.focus(); }
function clearAll() { clearTimeout(typing); state.cuisine = []; state.borough = []; state.top = false; state.sort = 'random'; searchText.value = ''; reshuffle(); commit(); }
function removeToken(t) { if (t.group === 'q') searchText.value = ''; else if (t.group === 'top') state.top = false; else state[t.group] = state[t.group].filter(v => v !== t.value); commit(); }
function drawChunk() { shown.value = Math.min(results.value.length, shown.value + 36); }
function open(r) { selected.value = r; openKey.value++; }
function notify(message) { toast.value = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toast.value = ''; },4200); }
async function toggleFavorite(r) {
 if (pending.has(r.id)) return; pending.add(r.id);
 try { const added = !favorites.value.includes(r.id); const ids = await (added ? addFavorite(r.id) : removeFavorite(r.id)); if (!alive) return; favorites.value = ids; if (added) notify('Added to favorites'); }
 catch (e) { if (alive) notify(e.message); } finally { pending.delete(r.id); }
}
async function load() {
 const token = ++generation; loading.value = true; error.value = '';
 try {
  const [payload, ids] = await Promise.all([getHomeData(),getFavorites()]); if (!alive || token !== generation) return;
  data.value = payload.restaurants; scoreIds.value = payload.scoreResults ? new Set(payload.scoreResults.map(r => r.id)) : null; favorites.value = ids;
  const r = data.value.find(r => r.id === String(route.query.open));
  if (r) { open(r); await nextTick(); location.hash = 'restaurant'; }
 } catch(e) { if (alive && token === generation) error.value = e.message; }
 finally { if (alive && token === generation) loading.value = false; }
}
onMounted(() => {
 load(); if ('IntersectionObserver' in window) { observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) drawChunk(); }, {rootMargin:'600px 0px'}); observer.observe(sentinel.value); }
});
onUnmounted(() => { alive = false; generation++; clearTimeout(typing); clearTimeout(toastTimer); observer?.disconnect(); badge.value = 0; });
</script>
<template>
  <!-- ===================== FILTER PANEL (slides in from the right) =====================
       All options are built from the data by restaurants.js, so you do not need to edit them here.
       The form uses normal names (cuisine, borough, top, sort) so it can become a real
       GET form for the backend later. -->
  <aside class="filter" aria-label="Filter restaurants">
    <form id="filters" class="filter__form" action="/restaurants" method="get" @submit.prevent @change="commit">

      <header class="filter__head">
        <h2 class="filter__title">Filter</h2>
        <label for="filter-toggle" class="filter__close" aria-label="Close filter">&times;</label>
      </header>

      <div class="filter__body">

        <fieldset class="fgroup domino" style="--i:0">
          <legend class="fgroup__label">Cuisine</legend>
          <div class="chips" id="opt-cuisine"><label v-for="value in options.cuisine" :key="value" class="chip"><input type="checkbox" name="cuisine" :value="value" v-model="state.cuisine" :disabled="!counts.cuisine[value] && !state.cuisine.includes(value)"><span>{{ value }}</span><em :data-count="'cuisine:' + value">{{ number(counts.cuisine[value] || 0) }}</em></label></div>
        </fieldset>

        <fieldset class="fgroup domino" style="--i:1">
          <legend class="fgroup__label">Borough</legend>
          <div class="chips" id="opt-borough"><label v-for="value in options.borough" :key="value" class="chip"><input type="checkbox" name="borough" :value="value" v-model="state.borough" :disabled="!counts.borough[value] && !state.borough.includes(value)"><span>{{ value }}</span><em :data-count="'borough:' + value">{{ number(counts.borough[value] || 0) }}</em></label></div>
        </fieldset>

        <div class="fgroup domino" style="--i:2">
          <label class="switch">
            <span class="switch__text">
              <strong>Top rated only</strong>
              <small>Aggregated score above 90</small><!-- EDIT -->
            </span>
            <input type="checkbox" name="top" value="1" id="opt-top" v-model="state.top">
            <span class="switch__track" aria-hidden="true"></span>
          </label>
        </div>

        <fieldset class="fgroup domino" style="--i:3">
          <legend class="fgroup__label">Sort by</legend>
          <div class="chips" id="opt-sort">
            <label class="chip"><input type="radio" name="sort" v-model="state.sort" value="name"><span>Name A to Z</span></label>
            <label class="chip"><input type="radio" name="sort" v-model="state.sort" value="high"><span>Highest score</span></label>
            <label class="chip"><input type="radio" name="sort" v-model="state.sort" value="low"><span>Lowest score</span></label>
          </div>
        </fieldset>

      </div>

      <footer class="filter__foot">
        <button type="button" class="linkbtn" id="clear-all" @click="clearAll">Clear all</button>
        <label for="filter-toggle" class="btn btn--solid" id="apply-btn">{{ resultLabel ? "Show " + resultLabel : "No restaurants" }}</label>
      </footer>
    </form>
  </aside>

  <main id="top">

    <!-- ===================== INTRO + SEARCH ===================== -->
    <section class="rl-hero">
      <div class="media">
        <!-- VIDEO PLACEHOLDER: save your video as video/restaurants.mp4 (or change the src). Zoom: restaurants.css [N] -->
        <video autoplay muted loop playsinline>
          <source src="/video/restaurants.mp4" type="video/mp4">
        </video>
      </div>

      <div class="rl-intro">
        <h1 class="rl-title">Restaurants</h1><!-- EDIT: title (size: restaurants.css [N]) -->
        <p class="hero__tagline">Search by name, cuisine, borough or dish.</p><!-- EDIT -->

        <div class="rl-search">
          <svg class="rl-search__icon" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
            <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
            <path d="M13.5 13.5L18 18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <label for="q" class="visually-hidden">Search restaurants</label>
          <input type="search" id="q" ref="searchInput" v-model="searchText" @input="typeSearch" name="q" placeholder="Try Japanese, ramen or Brooklyn" autocomplete="off" spellcheck="false">
          <button type="button" class="rl-search__clear" id="q-clear" @click="clearSearch" aria-label="Clear search">&times;</button>
        </div>
      </div>
    </section>

    <!-- ===================== RESULTS ===================== -->
    <section class="section rl-results" id="results">

      <h2 class="section__title reveal">All Restaurants</h2>

      <div class="rl-bar">
        <!-- Selected filters, for example:  Japanese | Manhattan  (click one to remove it) -->
        <div class="tokens" id="tokens" aria-live="polite"><span v-if="!tokens.length" class="tokens__empty">All restaurants</span><span v-for="token in tokens" :key="token.group + token.value" class="tokens__item"><button type="button" class="token" :data-group="token.group" :data-value="token.value" :aria-label="'Remove ' + token.label" @click="removeToken(token)">{{ token.label }}<i aria-hidden="true">&times;</i></button></span></div>
        <div class="rl-bar__side">
          <button type="button" class="linkbtn" id="clear-bar" :hidden="!tokens.length" @click="clearAll">Clear all</button>
          <p class="rl-count" id="count" aria-live="polite">{{ number(results.length) }} {{ results.length === 1 ? "restaurant" : "restaurants" }}</p>
        </div>
      </div>

      <p v-if="loading" class="rl-empty__text" role="status">Loading restaurants…</p><div v-if="error" class="rl-empty"><p class="rl-empty__text" role="alert">{{ error }}</p><button class="btn" @click="load">Try again</button></div><div class="rl-grid" id="grid"><RestaurantListCard v-for="(restaurant, index) in results.slice(0, shown)" :key="restaurant.id" :restaurant="restaurant" :index="index % 36" :favorite="favorites.includes(restaurant.id)" :pending="pending.has(restaurant.id)" @open="open" @favorite="toggleFavorite" /></div>

      <div class="rl-empty" id="empty" :hidden="loading || error || results.length > 0">
        <p class="rl-empty__title">No restaurants match</p>
        <p class="rl-empty__text">Try removing a filter or searching for something else.</p>
        <button type="button" class="btn" id="clear-empty" @click="clearAll">Clear all</button>
      </div>

      <div class="rl-more" id="more-wrap" :hidden="shown >= results.length">
        <button type="button" class="btn" id="more" @click="drawChunk">Show more · {{ number(results.length - shown) }} left</button>
      </div>
      <div id="sentinel" ref="sentinel" aria-hidden="true"></div>

      <noscript><p class="rl-empty__text">This page needs JavaScript to load the restaurant list.</p></noscript>
    </section>

  </main>

  <!-- Invisible fixed element. Closing a pop-up points here, so the page stays exactly where it was. -->
  <div id="modal-none" class="modal-none" aria-hidden="true"></div>


<RestaurantModal :restaurant="selected" :open-key="openKey" @favorites-changed="favorites = $event" />
<div v-if="toast" class="toast is-on" role="status"><span>{{ toast }}</span></div>
</template>
