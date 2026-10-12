import { createRouter, createWebHistory } from 'vue-router';
import restaurantsCSS from '../assets/css/restaurants.css?url';
import extrasCSS from '../assets/css/extras.css?url';
import aboutCSS from '../assets/css/about.css?url';
// Poll until check() returns something truthy (or give up after `ms` and return null).
function waitFor(check, ms) {
  return new Promise(resolve => {
    const end = Date.now() + ms;
    (function poll() { const v = check(); if (v) return resolve(v); if (Date.now() > end) return resolve(null); setTimeout(poll, 50); })();
  });
}
const router = createRouter({
  history: createWebHistory(),
  async scrollBehavior(to, from, savedPosition) {
    if (to.path === from.path) {
      // Existing :target modal hashes must not trigger a top reset.
      if (to.hash && to.hash !== '#modal-none' && !document.getElementById(to.hash.slice(1))?.classList.contains('modal')) {
        const target = document.getElementById(to.hash.slice(1));
        if (target) return { el: target, behavior: 'smooth' };
      }
      return false;
    }
    window.dispatchEvent(new Event('dishcovery:route-reset'));
    if (savedPosition) return savedPosition;
    if (to.hash) {
      // The Home view is lazy-loaded and fills its cards after the data arrives, which pushes
      // the sections down. Wait for the section (and the cards) before scrolling to it.
      const find = () => { const el = document.getElementById(to.hash.slice(1)); return el && !el.classList.contains('modal') ? el : null; };
      const target = await waitFor(find, 4000);
      if (target) {
        if (to.path === '/') await waitFor(() => document.getElementById('featured-grid')?.children.length > 0, 4000);
        await new Promise(resolve => requestAnimationFrame(resolve));
        return { el: target };
      }
    }
    return { top: 0, left: 0, behavior: 'instant' };
  },
  routes: [
    { path: '/', meta: { title: "Dishcovery | Home" }, alias: '/index.html', component: () => import('../views/HomeView.vue') },
    { path: '/about', meta: { title: "Dishcovery | About" }, alias: '/about.html', component: () => import('../views/AboutView.vue') },
    { path: '/restaurants', meta: { title: "Dishcovery | Restaurants" }, alias: '/restaurants.html', component: () => import('../views/RestaurantsView.vue') },
    { path: '/favorites', meta: { title: "Dishcovery | Favorites" }, alias: '/favorites.html', component: () => import('../views/FavoritesView.vue') },
    { path: '/reviews', meta: { title: "Dishcovery | My Reviews" }, alias: '/reviews.html', component: () => import('../views/ReviewsView.vue') },
  ]
});
// Match each original page's CSS order, avoiding About styles on other pages.
router.beforeEach((to, from) => {
  const aliases = { '/index.html': '/', '/about.html': '/about', '/restaurants.html': '/restaurants', '/favorites.html': '/favorites', '/reviews.html': '/reviews' };
  if (aliases[to.path]) return { path: aliases[to.path], query: to.query, hash: to.hash, replace: true };
  if (from.matched.length && to.path === from.path) return;
  document.querySelectorAll('link[data-page-css]').forEach(link => link.remove());
  const sheets = to.path === '/about' ? [aboutCSS] : [restaurantsCSS, extrasCSS];
  for (const href of sheets) {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = href; link.dataset.pageCss = '';
    document.head.appendChild(link);
  }
});
// Retain the original HTML document title for each page.
router.afterEach(to => { document.title = to.meta.title || 'Dishcovery'; });
export default router;
