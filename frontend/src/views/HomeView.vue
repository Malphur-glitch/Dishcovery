<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { getHomeData } from '../api.js';
import { selectHomePicks } from '../homePicks.js';
import RestaurantCard from '../components/RestaurantCard.vue';
import RestaurantModal from '../components/RestaurantModal.vue';
// Reactive data replaces home.js innerHTML; original structures, seed and classes are preserved.
const restaurants = ref([]), selected = ref(null), openKey = ref(0), loading = ref(true), error = ref('');
function openRestaurant(restaurant) { selected.value = restaurant; openKey.value++; }
const scoreResults = ref(null);
const picks = computed(() => selectHomePicks(restaurants.value, undefined, scoreResults.value));
let mounted = true;
async function load() {
  loading.value = true; error.value = '';
  try { const records = await getHomeData(); if (mounted) { restaurants.value = records.restaurants; scoreResults.value = records.scoreResults; } }
  catch (failure) { if (mounted) error.value = failure.message; }
  finally { if (mounted) loading.value = false; }
}
const hideImage = event => { event.target.style.visibility = 'hidden'; };
// Original sample dish arrows scroll exactly one track width; no global click listener.
function slideDishes(event, direction) {
  const track = event.currentTarget.closest('.samples').querySelector('.samples__track');
  track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
}
onMounted(load);
onUnmounted(() => { mounted = false; });
</script>
<template>
  <main id="top">

    <!-- ===================== HERO ===================== -->
    <section class="hero">
      <div class="media">
        <!-- VIDEO: save your video as video/hero.mp4 (or change the src). Zoom: style.css [K] -->
        <video autoplay muted loop playsinline>
          <source src="/video/mont.mp4" type="video/mp4">
        </video>
      </div>

      <div class="hero__content">
        <h1 class="hero__title">Dishcovery</h1><!-- EDIT: headline (size: style.css [C]) -->
        <p class="hero__tagline">A journey that satisfies every craving.</p><!-- EDIT -->
        <a href="restaurants" class="btn">Discover pure beauty</a><!-- EDIT: button text and link -->
      </div>
    </section>

    <!-- ===================== FEATURED RESTAURANTS ===================== -->
    <section class="section" id="featured">
      <h2 class="section__title reveal">Featured Restaurants</h2><!-- EDIT -->

      <!-- Filled by Vue with the original home.js selection logic with real restaurants (random picks that change once a day) -->
      <div class="featured__grid" id="featured-grid">
        <RestaurantCard v-for="r in picks.featured" :key="r.id" :restaurant="r" @open="openRestaurant" />
      </div>
      <p v-if="loading" class="rl-empty__text" role="status">Loading restaurants…</p>
      <p v-else-if="error" class="rl-empty__text" role="alert">{{ error }} <button class="linkbtn" @click="load">Try again</button></p>
      <p v-else-if="!picks.featured.length" class="rl-empty__text">No restaurants available.</p>
    </section>

    <!-- ===================== SHOWCASE (full-screen video) ===================== -->
    <section class="showcase">
      <div class="media">
        <!-- VIDEO: save your video as video/showcase.mp4 (or change the src). Zoom: style.css [K] -->
        <video autoplay muted loop playsinline>
          <source src="/video/showcases.mp4" type="video/mp4">
        </video>
      </div>

      <div class="showcase__content reveal">
        <h2 class="showcase__title">The Scoop</h2><!-- EDIT -->
        <p class="hero__tagline">Every craving leads to a discovery.</p><!-- EDIT -->
        <RouterLink to="/about" class="btn">A Taste of Who We Are</RouterLink><!-- EDIT -->
      </div>
    </section>

    <!-- ===================== TOP RATED RESTAURANTS (same design as Featured Restaurants) ===================== -->
    <section class="section" id="top-rated">
      <h2 class="section__title reveal">Top Rated Restaurants</h2><!-- EDIT -->

      <!-- Filled by Vue with the original home.js selection logic with real restaurants (random picks that change on every refresh) -->
      <div class="featured__grid" id="top-rated-grid">
        <RestaurantCard v-for="r in picks.top" :key="r.id" :restaurant="r" @open="openRestaurant" />
      </div>
      <p v-if="!loading && !error && !picks.top.length" class="rl-empty__text">No restaurants with aggregated scores above 90.</p>
    </section>

    <!-- ===================== CUISINES (glass panel) ===================== -->
    <section class="cuisines" id="cuisines">
      <div class="section">
        <h2 class="section__title reveal">The Cuisines</h2><!-- EDIT -->

        <div class="cuisines__panel">
          <div class="cuisines__grid">

            <!-- Each card: image (img folder), hover video (video folder), caption, name, learn more.
                 --h only changes the placeholder color shown when an image is missing. -->

            <article class="cuisine" id="card-italian">
              <div class="media" style="--h:12">
                <img src="/img/italy.jpg" alt="Italian cuisine" @error="hideImage">
                <video class="cuisine__video" muted loop playsinline autoplay>
                  <source src="/video/italian.mp4" type="video/mp4">
                </video>
              </div>
              <div class="cuisine__body">
                <p class="cuisine__caption reveal">Handmade and wood-fired</p>
                <h3 class="cuisine__name reveal">Italian</h3>
                <a href="#modal-italian" class="learn"><span class="reveal">Learn more</span></a>
              </div>
            </article>

            <article class="cuisine" id="card-japanese">
              <div class="media" style="--h:345">
                <img src="/img/japan.jpg" alt="Japanese cuisine" @error="hideImage">
                <video class="cuisine__video" muted loop playsinline autoplay>
                  <source src="/video/japanese.mp4" type="video/mp4">
                </video>
              </div>
              <div class="cuisine__body">
                <p class="cuisine__caption reveal">Precision and simplicity</p>
                <h3 class="cuisine__name reveal">Japanese</h3>
                <a href="#modal-japanese" class="learn"><span class="reveal">Learn more</span></a>
              </div>
            </article>

            <article class="cuisine" id="card-mexican">
              <div class="media" style="--h:95">
                <img src="/img/mexico.jpg" alt="Mexican cuisine" @error="hideImage">
                <video class="cuisine__video" muted loop playsinline autoplay>
                  <source src="/video/mexican.mp4" type="video/mp4">
                </video>
              </div>
              <div class="cuisine__body">
                <p class="cuisine__caption reveal">Bold, fresh and vibrant</p>
                <h3 class="cuisine__name reveal">Mexican</h3>
                <a href="#modal-mexican" class="learn"><span class="reveal">Learn more</span></a>
              </div>
            </article>

            <article class="cuisine" id="card-indian">
              <div class="media" style="--h:32">
                <img src="/img/india.jpg" alt="Indian cuisine" @error="hideImage">
                <video class="cuisine__video" muted loop playsinline autoplay>
                  <source src="/video/indian.mp4" type="video/mp4">
                </video>
              </div>
              <div class="cuisine__body">
                <p class="cuisine__caption reveal">Spice and tradition</p>
                <h3 class="cuisine__name reveal">Indian</h3>
                <a href="#modal-indian" class="learn"><span class="reveal">Learn more</span></a>
              </div>
            </article>

            <article class="cuisine" id="card-chinese">
              <div class="media" style="--h:5">
                <img src="/img/chinese.jpg" alt="Chinese cuisine" @error="hideImage">
                <video class="cuisine__video" muted loop playsinline autoplay>
                  <source src="/video/chinese.mp4" type="video/mp4">
                </video>
              </div>
              <div class="cuisine__body">
                <p class="cuisine__caption reveal">Centuries of technique</p>
                <h3 class="cuisine__name reveal">Chinese</h3>
                <a href="#modal-chinese" class="learn"><span class="reveal">Learn more</span></a>
              </div>
            </article>

            <article class="cuisine" id="card-thai">
              <div class="media" style="--h:165">
                <img src="/img/thai.jpg" alt="Thai cuisine" @error="hideImage">
                <video class="cuisine__video" muted loop playsinline autoplay>
                  <source src="/video/thai.mp4" type="video/mp4">
                </video>
              </div>
              <div class="cuisine__body">
                <p class="cuisine__caption reveal">Sweet, sour and fragrant</p>
                <h3 class="cuisine__name reveal">Thai</h3>
                <a href="#modal-thai" class="learn"><span class="reveal">Learn more</span></a>
              </div>
            </article>

          </div>
        </div>
      </div>
    </section>

    <!-- ===================== HANDWRITTEN QUOTE (one line; size: style.css [I]) ===================== -->
    <section class="quote">
      <p class="quote__text reveal">Life is too short to keep asking</p><!-- EDIT -->
    </section>

  </main>


  <!-- Invisible fixed element. Closing a pop-up points here, so the page stays exactly where it was. -->
  <div id="modal-none" class="modal-none" aria-hidden="true"></div>

  <!-- ===================== POP-UPS (open with "Learn more" on a cuisine card) =====================
       Each pop-up has a short history and a short "About". EDIT the text freely.
       Size, width and blur are in style.css [L]. -->
  <div class="modal" id="modal-italian" role="dialog" aria-modal="true" aria-labelledby="modal-italian-title">
    <a href="#modal-none" class="modal__backdrop" tabindex="-1" aria-label="Close"></a>
    <div class="modal__panel">
      <a href="#modal-none" class="modal__close" aria-label="Close">&times;</a>
      <h2 class="modal__title" id="modal-italian-title">Italian Cuisine</h2>
      <p class="modal__label">A short history</p>
      <p class="modal__text">Italian cooking grew out of regional kitchens long before Italy became one country in 1861. Ancient Roman and Greek traditions, plus Arab influences in Sicily, shaped early dishes. Tomatoes, brought from the Americas in the 1500s, later became a staple. Pasta, pizza and risotto each developed in different regions before spreading around the world.</p>
      <p class="modal__label">About</p>
      <p class="modal__text">Italian cuisine is built on a few good ingredients cooked simply: fresh pasta, olive oil, tomatoes, cheese, herbs and cured meats. Every region has its own specialties, from Neapolitan pizza in the south to polenta and risotto in the north.</p>
      <!-- Sample dishes: 6 images, 2 per slide. Save yours as img/italy-1.jpg to img/italy-6.jpg (or change the src). -->
      <div class="samples">
        <div class="samples__head">
          <p class="modal__label">Sample dishes</p>
          <div class="samples__nav">
            <button type="button" class="samples__btn" data-slide="prev" @click="slideDishes($event, -1)" aria-label="Previous dishes">&lsaquo;</button>
            <button type="button" class="samples__btn" data-slide="next" @click="slideDishes($event, 1)" aria-label="Next dishes">&rsaquo;</button>
          </div>
        </div>
        <div class="samples__track" tabindex="0" aria-label="Sample dishes, scroll sideways">
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:12">
                <img src="/img/italy-1.jpg" alt="Margherita Pizza" @error="hideImage">
              </div>
              <figcaption class="sample__name">Margherita Pizza</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:12">
                <img src="/img/italy-2.jpg" alt="Spaghetti Carbonara" @error="hideImage">
              </div>
              <figcaption class="sample__name">Spaghetti Carbonara</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:12">
                <img src="/img/italy-3.jpg" alt="Risotto alla Milanese" @error="hideImage">
              </div>
              <figcaption class="sample__name">Risotto alla Milanese</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:12">
                <img src="/img/italy-4.jpg" alt="Lasagna" @error="hideImage">
              </div>
              <figcaption class="sample__name">Lasagna</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:12">
                <img src="/img/italy-5.jpg" alt="Tiramisu" @error="hideImage">
              </div>
              <figcaption class="sample__name">Tiramisu</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:12">
                <img src="/img/italy-6.jpg" alt="Bruschetta" @error="hideImage">
              </div>
              <figcaption class="sample__name">Bruschetta</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-japanese" role="dialog" aria-modal="true" aria-labelledby="modal-japanese-title">
    <a href="#modal-none" class="modal__backdrop" tabindex="-1" aria-label="Close"></a>
    <div class="modal__panel">
      <a href="#modal-none" class="modal__close" aria-label="Close">&times;</a>
      <h2 class="modal__title" id="modal-japanese-title">Japanese Cuisine</h2>
      <p class="modal__label">A short history</p>
      <p class="modal__text">Japanese cooking began with rice farming, which took hold more than 2,000 years ago. Buddhist customs once limited meat eating, which shaped a cuisine of rice, fish, vegetables and soy. In the Edo period (1603 to 1868), food sellers in Edo, now Tokyo, developed nigiri sushi. Traditional Japanese cuisine, known as washoku, joined UNESCO's heritage list in 2013.</p>
      <p class="modal__label">About</p>
      <p class="modal__text">Japanese cuisine values seasonal ingredients, clean flavors and careful presentation. Expect sushi and sashimi, ramen, tempura, miso soup and rice dishes, often built on the deep savory taste of dashi, soy sauce and miso.</p>
      <!-- Sample dishes: 6 images, 2 per slide. Save yours as img/japan-1.jpg to img/japan-6.jpg (or change the src). -->
      <div class="samples">
        <div class="samples__head">
          <p class="modal__label">Sample dishes</p>
          <div class="samples__nav">
            <button type="button" class="samples__btn" data-slide="prev" @click="slideDishes($event, -1)" aria-label="Previous dishes">&lsaquo;</button>
            <button type="button" class="samples__btn" data-slide="next" @click="slideDishes($event, 1)" aria-label="Next dishes">&rsaquo;</button>
          </div>
        </div>
        <div class="samples__track" tabindex="0" aria-label="Sample dishes, scroll sideways">
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:345">
                <img src="/img/japan-1.jpg" alt="Sushi Platter" @error="hideImage">
              </div>
              <figcaption class="sample__name">Sushi Platter</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:345">
                <img src="/img/japan-2.jpg" alt="Tonkotsu Ramen" @error="hideImage">
              </div>
              <figcaption class="sample__name">Tonkotsu Ramen</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:345">
                <img src="/img/japan-3.jpg" alt="Tempura" @error="hideImage">
              </div>
              <figcaption class="sample__name">Tempura</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:345">
                <img src="/img/japan-4.jpg" alt="Okonomiyaki" @error="hideImage">
              </div>
              <figcaption class="sample__name">Okonomiyaki</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:345">
                <img src="/img/japan-5.jpg" alt="Matcha Mochi" @error="hideImage">
              </div>
              <figcaption class="sample__name">Matcha Mochi</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:345">
                <img src="/img/japan-6.jpg" alt="Yakitori" @error="hideImage">
              </div>
              <figcaption class="sample__name">Yakitori</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-mexican" role="dialog" aria-modal="true" aria-labelledby="modal-mexican-title">
    <a href="#modal-none" class="modal__backdrop" tabindex="-1" aria-label="Close"></a>
    <div class="modal__panel">
      <a href="#modal-none" class="modal__close" aria-label="Close">&times;</a>
      <h2 class="modal__title" id="modal-mexican-title">Mexican Cuisine</h2>
      <p class="modal__label">A short history</p>
      <p class="modal__text">Mexican cuisine begins with the Maya and Aztec civilizations, who built their diet on maize, beans, squash and chili peppers. After the Spanish arrived in the 1500s, pork, beef, cheese and rice joined the table and blended with Indigenous cooking. UNESCO recognized traditional Mexican cuisine as an Intangible Cultural Heritage in 2010.</p>
      <p class="modal__label">About</p>
      <p class="modal__text">Mexican food is bold, fresh and layered, with tortillas, salsas, slow-cooked meats and plenty of lime, chili and fresh herbs. Tacos, tamales, mole and ceviche vary from region to region.</p>
      <!-- Sample dishes: 6 images, 2 per slide. Save yours as img/mexico-1.jpg to img/mexico-6.jpg (or change the src). -->
      <div class="samples">
        <div class="samples__head">
          <p class="modal__label">Sample dishes</p>
          <div class="samples__nav">
            <button type="button" class="samples__btn" data-slide="prev" @click="slideDishes($event, -1)" aria-label="Previous dishes">&lsaquo;</button>
            <button type="button" class="samples__btn" data-slide="next" @click="slideDishes($event, 1)" aria-label="Next dishes">&rsaquo;</button>
          </div>
        </div>
        <div class="samples__track" tabindex="0" aria-label="Sample dishes, scroll sideways">
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:95">
                <img src="/img/mexico-1.jpg" alt="Tacos al Pastor" @error="hideImage">
              </div>
              <figcaption class="sample__name">Tacos al Pastor</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:95">
                <img src="/img/mexico-2.jpg" alt="Guacamole" @error="hideImage">
              </div>
              <figcaption class="sample__name">Guacamole</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:95">
                <img src="/img/mexico-3.jpg" alt="Enchiladas" @error="hideImage">
              </div>
              <figcaption class="sample__name">Enchiladas</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:95">
                <img src="/img/mexico-4.jpg" alt="Tamales" @error="hideImage">
              </div>
              <figcaption class="sample__name">Tamales</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:95">
                <img src="/img/mexico-5.jpg" alt="Churros" @error="hideImage">
              </div>
              <figcaption class="sample__name">Churros</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:95">
                <img src="/img/mexico-6.jpg" alt="Mole Poblano" @error="hideImage">
              </div>
              <figcaption class="sample__name">Mole Poblano</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-indian" role="dialog" aria-modal="true" aria-labelledby="modal-indian-title">
    <a href="#modal-none" class="modal__backdrop" tabindex="-1" aria-label="Close"></a>
    <div class="modal__panel">
      <a href="#modal-none" class="modal__close" aria-label="Close">&times;</a>
      <h2 class="modal__title" id="modal-indian-title">Indian Cuisine</h2>
      <p class="modal__label">A short history</p>
      <p class="modal__text">Indian cooking has evolved over thousands of years, shaped by the spice trade and many cultures. The Mughal Empire (1526 to 1857) brought rich gravies, biryani and tandoor cooking to the north, while chili peppers arrived with Portuguese traders in the 1500s.</p>
      <p class="modal__label">About</p>
      <p class="modal__text">Indian cuisine is known for its spices, lentils, rice and breads, with a strong tradition of vegetarian cooking. Dishes differ widely by region, from creamy curries in the north to coconut and seafood in the south.</p>
      <!-- Sample dishes: 6 images, 2 per slide. Save yours as img/india-1.jpg to img/india-6.jpg (or change the src). -->
      <div class="samples">
        <div class="samples__head">
          <p class="modal__label">Sample dishes</p>
          <div class="samples__nav">
            <button type="button" class="samples__btn" data-slide="prev" @click="slideDishes($event, -1)" aria-label="Previous dishes">&lsaquo;</button>
            <button type="button" class="samples__btn" data-slide="next" @click="slideDishes($event, 1)" aria-label="Next dishes">&rsaquo;</button>
          </div>
        </div>
        <div class="samples__track" tabindex="0" aria-label="Sample dishes, scroll sideways">
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:32">
                <img src="/img/india-1.jpg" alt="Butter Chicken" @error="hideImage">
              </div>
              <figcaption class="sample__name">Butter Chicken</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:32">
                <img src="/img/india-2.jpg" alt="Chicken Biryani" @error="hideImage">
              </div>
              <figcaption class="sample__name">Chicken Biryani</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:32">
                <img src="/img/india-3.jpg" alt="Masala Dosa" @error="hideImage">
              </div>
              <figcaption class="sample__name">Masala Dosa</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:32">
                <img src="/img/india-4.jpg" alt="Palak Paneer" @error="hideImage">
              </div>
              <figcaption class="sample__name">Palak Paneer</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:32">
                <img src="/img/india-5.jpg" alt="Samosa" @error="hideImage">
              </div>
              <figcaption class="sample__name">Samosa</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:32">
                <img src="/img/india-6.jpg" alt="Gulab Jamun" @error="hideImage">
              </div>
              <figcaption class="sample__name">Gulab Jamun</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-chinese" role="dialog" aria-modal="true" aria-labelledby="modal-chinese-title">
    <a href="#modal-none" class="modal__backdrop" tabindex="-1" aria-label="Close"></a>
    <div class="modal__panel">
      <a href="#modal-none" class="modal__close" aria-label="Close">&times;</a>
      <h2 class="modal__title" id="modal-chinese-title">Chinese Cuisine</h2>
      <p class="modal__label">A short history</p>
      <p class="modal__text">Chinese cuisine reaches back thousands of years, and noodles found in China are about 4,000 years old. Regional traditions grew around local climate and ingredients, and are often grouped into eight great cuisines, including Sichuan, Cantonese and Shandong. Chili peppers reached China in the 1500s and became central to Sichuan and Hunan cooking.</p>
      <p class="modal__label">About</p>
      <p class="modal__text">Chinese cooking balances flavor, color and texture, using techniques like stir-frying, steaming and braising. Rice, noodles, dumplings and tea are staples, and dishes are usually shared family-style.</p>
      <!-- Sample dishes: 6 images, 2 per slide. Save yours as img/chinese-1.jpg to img/chinese-6.jpg (or change the src). -->
      <div class="samples">
        <div class="samples__head">
          <p class="modal__label">Sample dishes</p>
          <div class="samples__nav">
            <button type="button" class="samples__btn" data-slide="prev" @click="slideDishes($event, -1)" aria-label="Previous dishes">&lsaquo;</button>
            <button type="button" class="samples__btn" data-slide="next" @click="slideDishes($event, 1)" aria-label="Next dishes">&rsaquo;</button>
          </div>
        </div>
        <div class="samples__track" tabindex="0" aria-label="Sample dishes, scroll sideways">
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:5">
                <img src="/img/chinese-1.jpg" alt="Peking Duck" @error="hideImage">
              </div>
              <figcaption class="sample__name">Peking Duck</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:5">
                <img src="/img/chinese-2.jpg" alt="Dim Sum" @error="hideImage">
              </div>
              <figcaption class="sample__name">Dim Sum</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:5">
                <img src="/img/chinese-3.jpg" alt="Mapo Tofu" @error="hideImage">
              </div>
              <figcaption class="sample__name">Mapo Tofu</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:5">
                <img src="/img/chinese-4.jpg" alt="Kung Pao Chicken" @error="hideImage">
              </div>
              <figcaption class="sample__name">Kung Pao Chicken</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:5">
                <img src="/img/chinese-5.jpg" alt="Chow Mein" @error="hideImage">
              </div>
              <figcaption class="sample__name">Chow Mein</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:5">
                <img src="/img/chinese-6.jpg" alt="Xiaolongbao" @error="hideImage">
              </div>
              <figcaption class="sample__name">Xiaolongbao</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal" id="modal-thai" role="dialog" aria-modal="true" aria-labelledby="modal-thai-title">
    <a href="#modal-none" class="modal__backdrop" tabindex="-1" aria-label="Close"></a>
    <div class="modal__panel">
      <a href="#modal-none" class="modal__close" aria-label="Close">&times;</a>
      <h2 class="modal__title" id="modal-thai-title">Thai Cuisine</h2>
      <p class="modal__label">A short history</p>
      <p class="modal__text">Thai cuisine grew from local ingredients and from Chinese, Indian and later Portuguese influences. The Portuguese brought chili peppers in the 1500s. Each region developed its own style, and pad thai was promoted as a national dish in the 1930s and 1940s.</p>
      <p class="modal__label">About</p>
      <p class="modal__text">Thai food balances sweet, sour, salty and spicy in the same dish, with fresh herbs like lemongrass, basil and galangal. Curries, noodle dishes, soups and salads are served with jasmine rice.</p>
      <!-- Sample dishes: 6 images, 2 per slide. Save yours as img/thai-1.jpg to img/thai-6.jpg (or change the src). -->
      <div class="samples">
        <div class="samples__head">
          <p class="modal__label">Sample dishes</p>
          <div class="samples__nav">
            <button type="button" class="samples__btn" data-slide="prev" @click="slideDishes($event, -1)" aria-label="Previous dishes">&lsaquo;</button>
            <button type="button" class="samples__btn" data-slide="next" @click="slideDishes($event, 1)" aria-label="Next dishes">&rsaquo;</button>
          </div>
        </div>
        <div class="samples__track" tabindex="0" aria-label="Sample dishes, scroll sideways">
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:165">
                <img src="/img/thai-1.jpg" alt="Pad Thai" @error="hideImage">
              </div>
              <figcaption class="sample__name">Pad Thai</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:165">
                <img src="/img/thai-2.jpg" alt="Green Curry" @error="hideImage">
              </div>
              <figcaption class="sample__name">Green Curry</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:165">
                <img src="/img/thai-3.jpg" alt="Tom Yum Soup" @error="hideImage">
              </div>
              <figcaption class="sample__name">Tom Yum Soup</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:165">
                <img src="/img/thai-4.jpg" alt="Som Tam" @error="hideImage">
              </div>
              <figcaption class="sample__name">Som Tam</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
          <div class="samples__slide">
            <figure class="sample">
              <div class="media" style="--h:165">
                <img src="/img/thai-5.jpg" alt="Mango Sticky Rice" @error="hideImage">
              </div>
              <figcaption class="sample__name">Mango Sticky Rice</figcaption><!-- EDIT: dish name -->
            </figure>
            <figure class="sample">
              <div class="media" style="--h:165">
                <img src="/img/thai-6.jpg" alt="Massaman Curry" @error="hideImage">
              </div>
              <figcaption class="sample__name">Massaman Curry</figcaption><!-- EDIT: dish name -->
            </figure>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Shared restaurant target exists before async data loads; CSS :target continues opening it. -->
  <RestaurantModal :restaurant="selected" :open-key="openKey" />
</template>
