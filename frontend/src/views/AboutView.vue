<script setup>
import { ref } from 'vue';

const signatureFailed = ref({}), outroFailed = ref(false);
const hideImage = event => { event.target.style.visibility = 'hidden'; };

</script>
<template>
  <main id="top">

    <section class="hero about-hero">
      <div class="media">
        <video autoplay muted loop playsinline>
          <source src="/video/italian.mp4" type="video/mp4">
        </video>
      </div>

      <div class="hero__content">
        <h1 class="hero__title">The Scoop</h1>
        <p class="hero__tagline">Every craving leads to a discovery.</p>
        <p class="hero__sub">Here in Dishcovery, You start your journey</p>
      </div>
    </section>

    <section class="marquee" aria-label="Life is too short to keep asking">
      <div class="marquee__track">
        <p class="marquee__text">Life is too short to keep asking</p>
        <p class="marquee__text" aria-hidden="true">Life is too short to keep asking</p>
      </div>
    </section>

    <section class="story" id="story">
      <p class="story__text reveal">
        Made by SOC students (WD-301), Dishcovery is a website that puts the choice in your hands. Browse restaurants by cuisine, save the places you love and write down what you thought, so deciding where to eat is never up to anyone else.
      </p>
      
      <figure class="team-photo media">
        <div class="drift"><img src="/img/team.jpg" alt="The Dishcovery team" @error="hideImage"></div>
      </figure>

      <div class="floater-zone">
        <figure class="float-logo">
          <img src="/img/dish.png" alt="Dishcovery logo" @error="hideImage">
        </figure>
      </div>
    </section>


    <section class="mission" id="mission">
      <div class="mission__copy reveal">
        <h2 class="mission__title">Our mission</h2>
        <p class="mission__text">Dishcovery exists to take the guesswork out of eating out. We bring restaurants, cuisines, favorites and honest reviews into one place, so finding your next great meal is quick, personal and a little bit exciting.</p><!-- EDIT -->
        <RouterLink to="/restaurants" class="btn">Start discovering</RouterLink>
      </div>

      <figure class="mission__video media">
        <video autoplay muted loop playsinline>
          <source src="/video/showcases.mp4" type="video/mp4">
        </video>
      </figure>
    </section>

    <section class="team" id="team" aria-label="The team">

      <article class="member member--photo-left">
        <figure class="member__photo media" style="--h:215">
          <div class="drift"><img src="/img/justine.jpg" alt="Member 1" @error="hideImage"></div>
        </figure>
        <div class="member__card">
          <div class="member__sig" :class="{ 'is-empty': signatureFailed[1] }"><img v-if="!signatureFailed[1]" src="/img/signature-1.png" alt="Signature of member 1" @error="signatureFailed[1] = true"></div><!-- EDIT: img/signature-1.png (transparent PNG) -->
          <h3 class="member__name reveal">Justine O. Lansangan</h3>
          <p class="member__role reveal">Front End</p>
        </div>
      </article>

      <article class="member member--photo-right">
        <figure class="member__photo media" style="--h:12">
          <div class="drift"><img src="/img/ken.jpeg" alt="Member 2" @error="hideImage"></div>
        </figure>
        <div class="member__card">
          <div class="member__sig" :class="{ 'is-empty': signatureFailed[2] }"><img v-if="!signatureFailed[2]" src="/img/signature-2.png" alt="Signature of member 2" @error="signatureFailed[2] = true"></div><!-- EDIT: img/signature-2.png (transparent PNG) -->
          <h3 class="member__name reveal">Louisse Ken W. Tiosejo</h3>
          <p class="member__role reveal">Front End</p>
        </div>
      </article>

      <article class="member member--photo-left">
        <figure class="member__photo media" style="--h:165">
          <div class="drift"><img src="/img/daniel.jpg" alt="Member 3" @error="hideImage"></div>
        </figure>
        <div class="member__card">
          <div class="member__sig" :class="{ 'is-empty': signatureFailed[3] }"><img v-if="!signatureFailed[3]" src="/img/signature-3.png" alt="Signature of member 3" @error="signatureFailed[3] = true"></div><!-- EDIT: img/signature-3.png (transparent PNG) -->
          <h3 class="member__name reveal">Daniel D. Manabat</h3>
          <p class="member__role reveal">Back End</p>
        </div>
      </article>

      <article class="member member--photo-right">
        <figure class="member__photo media" style="--h:32">
          <div class="drift"><img src="/img/brent2.jpeg" alt="Member 4" @error="hideImage"></div>
        </figure>
        <div class="member__card">
          <div class="member__sig" :class="{ 'is-empty': signatureFailed[4] }"><img v-if="!signatureFailed[4]" src="/img/signature-4.png" alt="Signature of member 4" @error="signatureFailed[4] = true"></div><!-- EDIT: img/signature-4.png (transparent PNG) -->
          <h3 class="member__name reveal">John Brent C. Napukaw</h3>
          <p class="member__role reveal">Back End</p>
        </div>
      </article>
    </section>

    <section class="outro" aria-label="Dishcovery">
      <img v-if="!outroFailed" class="reveal-in" src="/img/dish.png" alt="Dishcovery" @error="outroFailed = true"><template v-else>Dishcovery</template>
    </section>

  </main>
</template>
