<script setup>
import { inject } from "vue";
const filterCount = inject("filterCount");
import { ref } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();
const logoFailed = ref(false);
const hideImage = event => { event.target.style.visibility = 'hidden'; };
// Preserve keyboard operation of the original checkbox/label menu and filter buttons.
function labelKey(event) {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.currentTarget.click(); }
}
</script>
<template>
<template v-if="route.path === '/'">
<nav class="menu" aria-label="Main menu">
    <label for="menu-toggle" class="menu__close" aria-label="Close menu">&times;</label>

    <!-- Items appear one after another (domino effect). --i sets the order. -->
    <ul class="menu__list">
      <li class="domino" style="--i:0"><RouterLink to="/">Home</RouterLink></li>
      <li class="domino" style="--i:1"><RouterLink to="/about">About</RouterLink></li>
      <li class="domino" style="--i:2"><RouterLink to="/restaurants">List of Restaurants</RouterLink></li>
      <li class="domino" style="--i:3"><RouterLink to="/favorites">Favorites</RouterLink></li>
      <li class="domino" style="--i:4"><RouterLink to="/reviews">My Reviews</RouterLink></li>
    </ul>

    <div class="menu__cards">
      <RouterLink to="/#featured" class="menu__card domino" style="--i:5">
        <div class="media">
          <img src="/img/italy-1.jpg" alt="Featured restaurant" @error="hideImage">
        </div>
        <span class="menu__card-title">Featured Restaurant</span><!-- EDIT -->
      </RouterLink>

      <RouterLink to="/#top-rated" class="menu__card domino" style="--i:6">
        <div class="media" style="--h:25">
          <img src="/img/mexico-5.jpg" alt="Top rated restaurants" @error="hideImage">
        </div>
        <span class="menu__card-title">Top Rated</span><!-- EDIT -->
      </RouterLink>
    </div>
  </nav>
<header class="topbar">
    <label for="menu-toggle" class="menu-btn" @keydown="labelKey" role="button" tabindex="0">
      <span class="menu-icon" aria-hidden="true"></span>
      Menu
    </label>

    <!-- LOGO: save your logo as img/logo.png (or change the src). If the file is missing, the alt text shows as text. -->
    <RouterLink to="/" class="logo">
      <img src="/img/dish.png" alt="Dishcovery" v-if="!logoFailed" @error="logoFailed = true"><span v-else>Dishcovery</span>
    </RouterLink>
  </header>
</template>
<template v-if="route.path === '/about'">
<nav class="menu" aria-label="Main menu">
    <label for="menu-toggle" class="menu__close" aria-label="Close menu">&times;</label>

    <ul class="menu__list">
      <li class="domino" style="--i:0"><RouterLink to="/">Home</RouterLink></li>
      <li class="domino" style="--i:1"><RouterLink to="/about" aria-current="page">About</RouterLink></li>
      <li class="domino" style="--i:2"><RouterLink to="/restaurants">List of Restaurants</RouterLink></li>
      <li class="domino" style="--i:3"><RouterLink to="/favorites">Favorites</RouterLink></li>
      <li class="domino" style="--i:4"><RouterLink to="/reviews">My Reviews</RouterLink></li>
    </ul>

    <div class="menu__cards">
      <RouterLink to="/#featured" class="menu__card domino" style="--i:5">
        <div class="media">
          <img src="/img/italy-1.jpg" alt="Featured restaurant" @error="hideImage">
        </div>
        <span class="menu__card-title">Featured Restaurant</span>
      </RouterLink>

      <RouterLink to="/#top-rated" class="menu__card domino" style="--i:6">
        <div class="media" style="--h:25">
          <img src="/img/mexico-5.jpg" alt="Top rated restaurants" @error="hideImage">
        </div>
        <span class="menu__card-title">Top Rated</span>
      </RouterLink>
    </div>
  </nav>
<header class="topbar">
    <label for="menu-toggle" class="menu-btn" @keydown="labelKey" role="button" tabindex="0">
      <span class="menu-icon" aria-hidden="true"></span>
      Menu
    </label>

    <RouterLink to="/" class="logo">
      <img src="/img/dish.png" alt="Dishcovery" v-if="!logoFailed" @error="logoFailed = true"><span v-else>Dishcovery</span>
    </RouterLink>
  </header>
</template>
<template v-if="route.path === '/restaurants'">
<nav class="menu" aria-label="Main menu">
    <label for="menu-toggle" class="menu__close" aria-label="Close menu">&times;</label>

    <ul class="menu__list">
      <li class="domino" style="--i:0"><RouterLink to="/">Home</RouterLink></li>
      <li class="domino" style="--i:1"><RouterLink to="/about">About</RouterLink></li>
      <li class="domino" style="--i:2"><RouterLink to="/restaurants" aria-current="page">List of Restaurants</RouterLink></li>
      <li class="domino" style="--i:3"><RouterLink to="/favorites">Favorites</RouterLink></li>
      <li class="domino" style="--i:4"><RouterLink to="/reviews">My Reviews</RouterLink></li>
    </ul>

    <div class="menu__cards">
      <RouterLink to="/#featured" class="menu__card domino" style="--i:5">
        <div class="media">
          <img src="/img/italy-1.jpg" alt="Featured restaurant" @error="hideImage">
        </div>
        <span class="menu__card-title">Featured Restaurant</span>
      </RouterLink>

      <RouterLink to="/#top-rated" class="menu__card domino" style="--i:6">
        <div class="media" style="--h:25">
          <img src="/img/mexico-5.jpg" alt="Top rated restaurants" @error="hideImage">
        </div>
        <span class="menu__card-title">Top Rated</span>
      </RouterLink>
    </div>
  </nav>
<header class="topbar">
    <label for="menu-toggle" class="menu-btn" @keydown="labelKey" role="button" tabindex="0">
      <span class="menu-icon" aria-hidden="true"></span>
      Menu
    </label>

    <RouterLink to="/" class="logo">
      <img src="/img/dish.png" alt="Dishcovery" v-if="!logoFailed" @error="logoFailed = true"><span v-else>Dishcovery</span>
    </RouterLink>

    <!-- FILTER button: same style as Menu, on the right -->
    <label for="filter-toggle" class="menu-btn filter-btn" @keydown="labelKey" role="button" tabindex="0">
      Filter
      <span class="filter-count" id="filter-count" :hidden="!filterCount">{{ filterCount }}</span>
      <svg class="filter-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
        <path d="M1 5h14M1 11h14" fill="none" stroke="currentColor" stroke-width="1"/>
        <circle cx="5.5" cy="5" r="2" fill="#000" stroke="currentColor" stroke-width="1"/>
        <circle cx="10.5" cy="11" r="2" fill="#000" stroke="currentColor" stroke-width="1"/>
      </svg>
    </label>
  </header>
</template>
<template v-if="route.path === '/favorites'">
<nav class="menu" aria-label="Main menu">
    <label for="menu-toggle" class="menu__close" aria-label="Close menu">&times;</label>

    <ul class="menu__list">
      <li class="domino" style="--i:0"><RouterLink to="/">Home</RouterLink></li>
      <li class="domino" style="--i:1"><RouterLink to="/about">About</RouterLink></li>
      <li class="domino" style="--i:2"><RouterLink to="/restaurants">List of Restaurants</RouterLink></li>
      <li class="domino" style="--i:3"><RouterLink to="/favorites" aria-current="page">Favorites</RouterLink></li>
      <li class="domino" style="--i:4"><RouterLink to="/reviews">My Reviews</RouterLink></li>
    </ul>

    <div class="menu__cards">
      <RouterLink to="/#featured" class="menu__card domino" style="--i:5">
        <div class="media">
          <img src="/img/italy-1.jpg" alt="Featured restaurant" @error="hideImage">
        </div>
        <span class="menu__card-title">Featured Restaurant</span>
      </RouterLink>

      <RouterLink to="/#top-rated" class="menu__card domino" style="--i:6">
        <div class="media" style="--h:25">
          <img src="/img/mexico-5.jpg" alt="Top rated restaurants" @error="hideImage">
        </div>
        <span class="menu__card-title">Top Rated</span>
      </RouterLink>
    </div>
  </nav>
<header class="topbar">
    <label for="menu-toggle" class="menu-btn" @keydown="labelKey" role="button" tabindex="0">
      <span class="menu-icon" aria-hidden="true"></span>
      Menu
    </label>
    <RouterLink to="/" class="logo">
      <img src="/img/dish.png" alt="Dishcovery" v-if="!logoFailed" @error="logoFailed = true"><span v-else>Dishcovery</span>
    </RouterLink>
  </header>
</template>
<template v-if="route.path === '/reviews'">
<nav class="menu" aria-label="Main menu">
    <label for="menu-toggle" class="menu__close" aria-label="Close menu">&times;</label>

    <ul class="menu__list">
      <li class="domino" style="--i:0"><RouterLink to="/">Home</RouterLink></li>
      <li class="domino" style="--i:1"><RouterLink to="/about">About</RouterLink></li>
      <li class="domino" style="--i:2"><RouterLink to="/restaurants">List of Restaurants</RouterLink></li>
      <li class="domino" style="--i:3"><RouterLink to="/favorites">Favorites</RouterLink></li>
      <li class="domino" style="--i:4"><RouterLink to="/reviews" aria-current="page">My Reviews</RouterLink></li>
    </ul>

    <div class="menu__cards">
      <RouterLink to="/#featured" class="menu__card domino" style="--i:5">
        <div class="media">
          <img src="/img/italy-1.jpg" alt="Featured restaurant" @error="hideImage">
        </div>
        <span class="menu__card-title">Featured Restaurant</span>
      </RouterLink>

      <RouterLink to="/#top-rated" class="menu__card domino" style="--i:6">
        <div class="media" style="--h:25">
          <img src="/img/mexico-5.jpg" alt="Top rated restaurants" @error="hideImage">
        </div>
        <span class="menu__card-title">Top Rated</span>
      </RouterLink>
    </div>
  </nav>
<header class="topbar">
    <label for="menu-toggle" class="menu-btn" @keydown="labelKey" role="button" tabindex="0">
      <span class="menu-icon" aria-hidden="true"></span>
      Menu
    </label>
    <RouterLink to="/" class="logo">
      <img src="/img/dish.png" alt="Dishcovery" v-if="!logoFailed" @error="logoFailed = true"><span v-else>Dishcovery</span>
    </RouterLink>
  </header>
</template>
</template>
