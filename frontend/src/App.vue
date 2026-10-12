<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick, provide } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import { initializeSmoothScroll } from './behaviors/smoothScroll.js';
const route = useRoute();
const menuOpen = ref(false);
const filterOpen = ref(false);
const filterCount = ref(0); provide("filterCount", filterCount);
let cleanupScroll = () => {};
// About's original header-hide behavior is route-specific; weighted scrolling is global only once.
function updateHeader() {
  const bar = document.querySelector('.topbar');
  const outro = route.path === '/about' ? document.querySelector('.outro') : null;
  bar?.classList.toggle('is-hidden', Boolean(outro && outro.getBoundingClientRect().top < innerHeight * 0.5));
}
// Clicking a menu link must always close the menu, even when the route doesn't change
// (e.g. you're already at #featured, so the router sees a duplicate navigation and the
// route watcher below never fires).
function menuLinkClick(event) {
  const link = event.target.closest?.('.menu a');
  if (!link) return;
  menuOpen.value = false;
  // Same page + same hash: the router won't scroll, so do it here.
  if (link.hash && link.pathname === location.pathname && link.hash === location.hash) {
    const el = document.getElementById(link.hash.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}
function escape(event) {
  if (event.key !== 'Escape') return;
  menuOpen.value = filterOpen.value = false;
  document.querySelector('.modal:target .modal__close')?.click();
}
watch(() => route.fullPath, async (to, from) => {
  // Close the menu on ANY navigation, including same-page #featured / #top-rated links.
  menuOpen.value = false;
  if (to.split("?")[0].split("#")[0] !== (from || "").split("?")[0].split("#")[0]) filterOpen.value = false;
  document.body.classList.toggle('about-page', route.path === '/about');
  await nextTick();
  // A modal hash change must not reset the page position.
  if (to.split('?')[0].split('#')[0] !== (from || '').split('?')[0].split('#')[0]) {
    window.dispatchEvent(new Event('dishcovery:route-reset'));
  }
  updateHeader();
}, { immediate: true });
onMounted(() => {
  cleanupScroll = initializeSmoothScroll();
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', updateHeader);
  document.addEventListener('keydown', escape);
  document.addEventListener('click', menuLinkClick);
});
onUnmounted(() => {
  cleanupScroll();
  window.removeEventListener('scroll', updateHeader);
  window.removeEventListener('resize', updateHeader);
  document.removeEventListener('keydown', escape);
  document.removeEventListener('click', menuLinkClick);
  document.body.classList.remove('about-page');
});
</script>
<template>
  <!-- Menu and Filter open/close switches (CSS only). Keep before their sibling panels. -->
  <input type="checkbox" id="menu-toggle" v-model="menuOpen" class="menu-toggle visually-hidden">
  <input v-if="route.path === '/restaurants'" type="checkbox" id="filter-toggle" v-model="filterOpen" class="filter-toggle visually-hidden">
  <label for="menu-toggle" class="scrim" aria-label="Close menu"></label>
  <label v-if="route.path === '/restaurants'" for="filter-toggle" class="fscrim" aria-label="Close filter"></label>
  <!-- Fragment components retain the original sibling selectors without introducing wrapper divs. -->
  <Navbar />
  <RouterView />
  <Footer />
</template>
