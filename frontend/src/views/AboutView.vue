<script setup>
import { ref } from 'vue';
// Preserve the original missing-image behavior without removing DOM nodes by hand.
// Signature failures reveal the original .is-empty placeholder from about.css.
const signatureFailed = ref({}), outroFailed = ref(false);
const hideImage = event => { event.target.style.visibility = 'hidden'; };
// Original about.js weighted scrolling and header hiding are initialized once in App.vue.
// All marquee, drift, floating-logo and member animations remain in the unchanged original CSS.
</script>
<template>
  <main id="top">

    <!-- ===================== HERO (video placeholder, fades into black on scroll) ===================== -->
    <section class="hero about-hero">
      <div class="media">
        <video autoplay muted loop playsinline>
          <source src="/video/italian.mp4" type="video/mp4"><!-- EDIT: hero video -->
        </video>
      </div>

      <div class="hero__content">
        <h1 class="hero__title">The Scoop</h1><!-- EDIT: headline (size: about.css [A1]) -->
        <p class="hero__tagline">Every craving leads to a discovery.</p><!-- EDIT -->
        <p class="hero__sub">Here in Dishcovery, You start your jJurney</p><!-- EDIT -->
      </div>
    </section>

    <!-- ===================== SCROLLING PHRASE =====================
         Loops on its own (it does not follow the mouse wheel). The phrase is written twice so the loop has no gap:
         if you change the words, change BOTH. Speed and size: about.css [A2]. -->
    <section class="marquee" aria-label="Life is too short to keep asking">
      <div class="marquee__track">
        <p class="marquee__text">Life is too short to keep asking</p><!-- EDIT: phrase -->
        <p class="marquee__text" aria-hidden="true">Life is too short to keep asking</p><!-- EDIT: same phrase again -->
      </div>
    </section>

    <!-- ===================== STORY + GROUP PHOTO ===================== -->
    <section class="story" id="story">
      <p class="story__text reveal">
        Made by SOC students (WD-301), Dishcovery is a website that puts the choice in your hands. Browse restaurants by cuisine, save the places you love and write down what you thought, so deciding where to eat is never up to anyone else.
      </p><!-- EDIT: story text -->

      <!-- Group photo placeholder. It drifts a little as you scroll (no blur). Save as img/team.jpg -->
      <figure class="team-photo media">
        <div class="drift"><img src="/img/team.jpg" alt="The Dishcovery team" @error="hideImage"></div>
      </figure>

      <!-- Floating logo: overlaps the group photo and moves faster than the scroll.
           Save your logo as img/about-logo.png. Resize it in about.css [A4]. -->
      <div class="floater-zone">
        <figure class="float-logo">
          <img src="/img/dish.png" alt="Dishcovery logo" @error="hideImage">
        </figure>
      </div>
    </section>

    <!-- ===================== MISSION + VIDEO ===================== -->
    <section class="mission" id="mission">
      <div class="mission__copy reveal">
        <h2 class="mission__title">Our mission</h2><!-- EDIT -->
        <p class="mission__text">Dishcovery exists to take the guesswork out of eating out. We bring restaurants, cuisines, favorites and honest reviews into one place, so finding your next great meal is quick, personal and a little bit exciting.</p><!-- EDIT -->
        <RouterLink to="/restaurants" class="btn">Start discovering</RouterLink><!-- EDIT: button text and link -->
      </div>

      <figure class="mission__video media">
        <video autoplay muted loop playsinline>
          <source src="/video/showcases.mp4" type="video/mp4"><!-- EDIT: mission video -->
        </video>
      </figure>
    </section>

    <!-- ===================== THE TEAM (4 members, left / right / left / right) ===================== -->
    <section class="team" id="team" aria-label="The team">

      <!-- MEMBER 1: block on the RIGHT, overlaps the video / row above -->
      <article class="member member--photo-left">
        <figure class="member__photo media" style="--h:215">
          <div class="drift"><img src="/img/justine.jpg" alt="Member 1" @error="hideImage"></div><!-- EDIT: img/member-1.jpg -->
        </figure>
        <div class="member__card">
          <div class="member__sig" :class="{ 'is-empty': signatureFailed[1] }"><img v-if="!signatureFailed[1]" src="/img/signature-1.png" alt="Signature of member 1" @error="signatureFailed[1] = true"></div><!-- EDIT: img/signature-1.png (transparent PNG) -->
          <h3 class="member__name reveal">Justine O. Lansangan</h3><!-- EDIT: name -->
          <p class="member__role reveal">Front End</p><!-- EDIT: role -->
        </div>
      </article>

      <!-- MEMBER 2: block on the LEFT, overlaps the row above -->
      <article class="member member--photo-right">
        <figure class="member__photo media" style="--h:12">
          <div class="drift"><img src="/img/ken.jpeg" alt="Member 2" @error="hideImage"></div><!-- EDIT: img/member-2.jpg -->
        </figure>
        <div class="member__card">
          <div class="member__sig" :class="{ 'is-empty': signatureFailed[2] }"><img v-if="!signatureFailed[2]" src="/img/signature-2.png" alt="Signature of member 2" @error="signatureFailed[2] = true"></div><!-- EDIT: img/signature-2.png (transparent PNG) -->
          <h3 class="member__name reveal">Louisse Ken W. Tiosejo</h3><!-- EDIT: name -->
          <p class="member__role reveal">Front End</p><!-- EDIT: role -->
        </div>
      </article>

      <!-- MEMBER 3: block on the RIGHT, overlaps the video / row above -->
      <article class="member member--photo-left">
        <figure class="member__photo media" style="--h:165">
          <div class="drift"><img src="/img/daniel.jpg" alt="Member 3" @error="hideImage"></div><!-- EDIT: img/member-3.jpg -->
        </figure>
        <div class="member__card">
          <div class="member__sig" :class="{ 'is-empty': signatureFailed[3] }"><img v-if="!signatureFailed[3]" src="/img/signature-3.png" alt="Signature of member 3" @error="signatureFailed[3] = true"></div><!-- EDIT: img/signature-3.png (transparent PNG) -->
          <h3 class="member__name reveal">Daniel D. Manabat</h3><!-- EDIT: name -->
          <p class="member__role reveal">Back End</p><!-- EDIT: role -->
        </div>
      </article>

      <!-- MEMBER 4: block on the LEFT, overlaps the row above -->
      <article class="member member--photo-right">
        <figure class="member__photo media" style="--h:32">
          <div class="drift"><img src="/img/brent2.jpeg" alt="Member 4" @error="hideImage"></div><!-- EDIT: img/member-4.jpg -->
        </figure>
        <div class="member__card">
          <div class="member__sig" :class="{ 'is-empty': signatureFailed[4] }"><img v-if="!signatureFailed[4]" src="/img/signature-4.png" alt="Signature of member 4" @error="signatureFailed[4] = true"></div><!-- EDIT: img/signature-4.png (transparent PNG) -->
          <h3 class="member__name reveal">John Brent C. Napukaw</h3><!-- EDIT: name -->
          <p class="member__role reveal">Back End</p><!-- EDIT: role -->
        </div>
      </article>
    </section>

    <!-- ===================== CLOSING SCREEN (plain black, logo only) ===================== -->
    <section class="outro" aria-label="Dishcovery">
      <img v-if="!outroFailed" class="reveal-in" src="/img/dish.png" alt="Dishcovery" @error="outroFailed = true"><template v-else>Dishcovery</template>
    </section>

  </main>
</template>
