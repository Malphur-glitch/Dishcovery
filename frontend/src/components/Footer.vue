<script setup>
import { useRoute } from 'vue-router';
const route = useRoute();
// Original footer word glows near the cursor and rests invisibly when the cursor leaves.
function glow(event) {
  const mark = event.currentTarget.querySelector('.mark');
  const rect = mark.getBoundingClientRect();
  mark.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  mark.style.setProperty('--my', `${event.clientY - rect.top}px`);
}
function clearGlow(event) {
  const mark = event.currentTarget.querySelector('.mark');
  mark.style.setProperty('--mx', '-2000px'); mark.style.setProperty('--my', '-2000px');
}
</script>
<template>
<template v-if="route.path === '/'">
<footer class="footer" @pointermove="glow" @pointerleave="clearGlow">
    <div class="footer__inner">

      <div class="footer__cols">
        <nav aria-label="Explore">
          <h2 class="footer__heading">Explore</h2>
          <ul class="footer__links">
            <li><RouterLink to="/">Home</RouterLink></li>
            <li><RouterLink to="/about">About</RouterLink></li>
            <li><RouterLink to="/restaurants">List of Restaurants</RouterLink></li>
            <li><RouterLink to="/favorites">Favorites</RouterLink></li>
            <li><RouterLink to="/reviews">My Reviews</RouterLink></li>
          </ul>
        </nav>

        <nav aria-label="Cuisines">
          <h2 class="footer__heading">Cuisines</h2>
          <ul class="footer__links">
            <li><RouterLink to="#card-italian">Italian</RouterLink></li>
            <li><RouterLink to="#card-japanese">Japanese</RouterLink></li>
            <li><RouterLink to="#card-mexican">Mexican</RouterLink></li>
            <li><RouterLink to="#card-indian">Indian</RouterLink></li>
            <li><RouterLink to="#card-chinese">Chinese</RouterLink></li>
            <li><RouterLink to="#card-thai">Thai</RouterLink></li>
          </ul>
        </nav>

        <nav aria-label="Discover">
          <h2 class="footer__heading">Discover</h2>
          <ul class="footer__links">
            <li><RouterLink to="#featured">Featured Restaurants</RouterLink></li>
            <li><RouterLink to="#top-rated">Top Rated</RouterLink></li>
          </ul>
        </nav>

        <!-- Logo: img/dish.png, centered in its column (size: style.css [J]) -->
        <div class="footer__logo">
          <RouterLink to="/" aria-label="Dishcovery home"><img src="/img/dish.png" alt="Dishcovery"></RouterLink>
        </div>
      </div>

      <div class="footer__bottom">
        <div class="footer__legal">
          <small>&copy; 2026 Dishcovery</small><!-- EDIT -->
          <RouterLink to="#">Legal Notice</RouterLink>
          <RouterLink to="#">Privacy Policy</RouterLink>
          <RouterLink to="#">Cookie Policy</RouterLink>
        </div>

        <div class="footer__aside">
          <div class="footer__lang">
            <span>Language</span>
            <RouterLink to="#" aria-current="true">English</RouterLink>
          </div>
          <!-- Social icons: images in the img folder (social-*.svg). Replace the files or change the src. -->
          <div class="social">
            <RouterLink to="#" aria-label="LinkedIn"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="Instagram"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="X"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="YouTube"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="Facebook"><span class="social-slot" aria-hidden="true"></span></RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Giant footer word. It sits outside .footer__inner so it runs edge to edge, flush with the bottom.
         EDIT THE WORD: change DISHCOVERY in BOTH <text> lines below (keep them identical).
         viewBox="12 0 976 182" trims 12 units of empty space on the left and right so the first and last
         letters touch the screen edges. Raise 12 (and lower 976 by twice as much) to cut deeper into the letters,
         lower it to leave some space. The last number, 182, is the height; the letters sit on the bottom edge.
         Change the numbers in BOTH lines. -->
    <div class="mark" aria-hidden="true">

      <!-- Resting word: same color as the footer background, so it is invisible -->
      <svg class="mark__layer mark__base" viewBox="12 0 976 182" focusable="false">
        <text x="0" y="182" font-size="250" textLength="1000" lengthAdjust="spacingAndGlyphs">DISHCOVERY</text>
      </svg>

      <!-- Lit word: only revealed around the cursor (fine film grain, clipped to the letters) -->
      <svg class="mark__layer mark__light" viewBox="12 0 976 182" focusable="false">
        <defs>
          <filter id="grain-light" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch" result="n"/>
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 -.2" result="g"/>
            <feComposite in="g" in2="SourceAlpha" operator="in" result="gt"/>
            <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gt"/></feMerge>
          </filter>
        </defs>
        <text x="0" y="182" font-size="250" textLength="1000" lengthAdjust="spacingAndGlyphs" filter="url(#grain-light)">DISHCOVERY</text>
      </svg>

    </div>
  </footer>
</template>
<template v-if="route.path === '/about'">
<footer class="footer" @pointermove="glow" @pointerleave="clearGlow">
    <div class="footer__inner">

      <div class="footer__cols">
        <nav aria-label="Explore">
          <h2 class="footer__heading">Explore</h2>
          <ul class="footer__links">
            <li><RouterLink to="/">Home</RouterLink></li>
            <li><RouterLink to="/about">About</RouterLink></li>
            <li><RouterLink to="/restaurants">List of Restaurants</RouterLink></li>
            <li><RouterLink to="/favorites">Favorites</RouterLink></li>
            <li><RouterLink to="/reviews">My Reviews</RouterLink></li>
          </ul>
        </nav>

        <!-- These links open this page already filtered by cuisine -->
        <nav aria-label="Cuisines">
          <h2 class="footer__heading">Cuisines</h2>
          <ul class="footer__links">
            <li><RouterLink to="/restaurants?cuisine=Italian">Italian</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Japanese">Japanese</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Mexican">Mexican</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Indian">Indian</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Chinese">Chinese</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Thai">Thai</RouterLink></li>
          </ul>
        </nav>

        <nav aria-label="Discover">
          <h2 class="footer__heading">Discover</h2>
          <ul class="footer__links">
            <li><RouterLink to="/#featured">Featured Restaurants</RouterLink></li>
            <li><RouterLink to="/#top-rated">Top Rated</RouterLink></li>
          </ul>
        </nav>

        <div class="footer__logo">
          <RouterLink to="/" aria-label="Dishcovery home"><img src="/img/dish.png" alt="Dishcovery"></RouterLink>
        </div>
      </div>

      <div class="footer__bottom">
        <div class="footer__legal">
          <small>&copy; 2026 Dishcovery</small>
          <RouterLink to="#">Legal Notice</RouterLink>
          <RouterLink to="#">Privacy Policy</RouterLink>
          <RouterLink to="#">Cookie Policy</RouterLink>
        </div>

        <div class="footer__aside">
          <div class="footer__lang">
            <span>Language</span>
            <RouterLink to="#" aria-current="true">English</RouterLink>
          </div>
          <div class="social">
            <RouterLink to="#" aria-label="LinkedIn"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="Instagram"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="X"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="YouTube"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="Facebook"><span class="social-slot" aria-hidden="true"></span></RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Giant footer word (same as the other pages). Change DISHCOVERY in BOTH <text> lines to edit it. -->
    <div class="mark" aria-hidden="true">
      <svg class="mark__layer mark__base" viewBox="12 0 976 182" focusable="false">
        <text x="0" y="182" font-size="250" textLength="1000" lengthAdjust="spacingAndGlyphs">DISHCOVERY</text>
      </svg>

      <svg class="mark__layer mark__light" viewBox="12 0 976 182" focusable="false">
        <defs>
          <filter id="grain-light" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch" result="n"/>
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 -.2" result="g"/>
            <feComposite in="g" in2="SourceAlpha" operator="in" result="gt"/>
            <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gt"/></feMerge>
          </filter>
        </defs>
        <text x="0" y="182" font-size="250" textLength="1000" lengthAdjust="spacingAndGlyphs" filter="url(#grain-light)">DISHCOVERY</text>
      </svg>
    </div>
  </footer>
</template>
<template v-if="route.path === '/restaurants'">
<footer class="footer" @pointermove="glow" @pointerleave="clearGlow">
    <div class="footer__inner">

      <div class="footer__cols">
        <nav aria-label="Explore">
          <h2 class="footer__heading">Explore</h2>
          <ul class="footer__links">
            <li><RouterLink to="/">Home</RouterLink></li>
            <li><RouterLink to="/about">About</RouterLink></li>
            <li><RouterLink to="/restaurants">List of Restaurants</RouterLink></li>
            <li><RouterLink to="/favorites">Favorites</RouterLink></li>
            <li><RouterLink to="/reviews">My Reviews</RouterLink></li>
          </ul>
        </nav>

        <!-- These links open this page already filtered by cuisine -->
        <nav aria-label="Cuisines">
          <h2 class="footer__heading">Cuisines</h2>
          <ul class="footer__links">
            <li><RouterLink to="/restaurants?cuisine=Italian">Italian</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Japanese">Japanese</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Mexican">Mexican</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Indian">Indian</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Chinese">Chinese</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Thai">Thai</RouterLink></li>
          </ul>
        </nav>

        <nav aria-label="Discover">
          <h2 class="footer__heading">Discover</h2>
          <ul class="footer__links">
            <li><RouterLink to="/#featured">Featured Restaurants</RouterLink></li>
            <li><RouterLink to="/restaurants?top=1">Top Rated</RouterLink></li>
          </ul>
        </nav>

        <div class="footer__logo">
          <RouterLink to="/" aria-label="Dishcovery home"><img src="/img/dish.png" alt="Dishcovery"></RouterLink>
        </div>
      </div>

      <div class="footer__bottom">
        <div class="footer__legal">
          <small>&copy; 2026 Dishcovery</small>
          <RouterLink to="#">Legal Notice</RouterLink>
          <RouterLink to="#">Privacy Policy</RouterLink>
          <RouterLink to="#">Cookie Policy</RouterLink>
        </div>

        <div class="footer__aside">
          <div class="footer__lang">
            <span>Language</span>
            <RouterLink to="#" aria-current="true">English</RouterLink>
          </div>
          <div class="social">
            <RouterLink to="#" aria-label="LinkedIn"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="Instagram"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="X"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="YouTube"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="Facebook"><span class="social-slot" aria-hidden="true"></span></RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Giant footer word (same as the home page). Change DISHCOVERY in BOTH <text> lines to edit it. -->
    <div class="mark" aria-hidden="true">
      <svg class="mark__layer mark__base" viewBox="12 0 976 182" focusable="false">
        <text x="0" y="182" font-size="250" textLength="1000" lengthAdjust="spacingAndGlyphs">DISHCOVERY</text>
      </svg>

      <svg class="mark__layer mark__light" viewBox="12 0 976 182" focusable="false">
        <defs>
          <filter id="grain-light" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch" result="n"/>
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 -.2" result="g"/>
            <feComposite in="g" in2="SourceAlpha" operator="in" result="gt"/>
            <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gt"/></feMerge>
          </filter>
        </defs>
        <text x="0" y="182" font-size="250" textLength="1000" lengthAdjust="spacingAndGlyphs" filter="url(#grain-light)">DISHCOVERY</text>
      </svg>
    </div>
  </footer>
</template>
<template v-if="route.path === '/favorites'">
<footer class="footer" @pointermove="glow" @pointerleave="clearGlow">
    <div class="footer__inner">

      <div class="footer__cols">
        <nav aria-label="Explore">
          <h2 class="footer__heading">Explore</h2>
          <ul class="footer__links">
            <li><RouterLink to="/">Home</RouterLink></li>
            <li><RouterLink to="/about">About</RouterLink></li>
            <li><RouterLink to="/restaurants">List of Restaurants</RouterLink></li>
            <li><RouterLink to="/favorites" aria-current="page">Favorites</RouterLink></li>
            <li><RouterLink to="/reviews">My Reviews</RouterLink></li>
          </ul>
        </nav>

        <!-- These links open this page already filtered by cuisine -->
        <nav aria-label="Cuisines">
          <h2 class="footer__heading">Cuisines</h2>
          <ul class="footer__links">
            <li><RouterLink to="/restaurants?cuisine=Italian">Italian</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Japanese">Japanese</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Mexican">Mexican</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Indian">Indian</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Chinese">Chinese</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Thai">Thai</RouterLink></li>
          </ul>
        </nav>

        <nav aria-label="Discover">
          <h2 class="footer__heading">Discover</h2>
          <ul class="footer__links">
            <li><RouterLink to="/#featured">Featured Restaurants</RouterLink></li>
            <li><RouterLink to="/restaurants?top=1">Top Rated</RouterLink></li>
          </ul>
        </nav>

        <div class="footer__logo">
          <RouterLink to="/" aria-label="Dishcovery home"><img src="/img/dish.png" alt="Dishcovery"></RouterLink>
        </div>
      </div>

      <div class="footer__bottom">
        <div class="footer__legal">
          <small>&copy; 2026 Dishcovery</small>
          <RouterLink to="#">Legal Notice</RouterLink>
          <RouterLink to="#">Privacy Policy</RouterLink>
          <RouterLink to="#">Cookie Policy</RouterLink>
        </div>

        <div class="footer__aside">
          <div class="footer__lang">
            <span>Language</span>
            <RouterLink to="#" aria-current="true">English</RouterLink>
          </div>
          <div class="social">
            <RouterLink to="#" aria-label="LinkedIn"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="Instagram"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="X"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="YouTube"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="Facebook"><span class="social-slot" aria-hidden="true"></span></RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Giant footer word (same as the home page). Change DISHCOVERY in BOTH <text> lines to edit it. -->
    <div class="mark" aria-hidden="true">
      <svg class="mark__layer mark__base" viewBox="12 0 976 182" focusable="false">
        <text x="0" y="182" font-size="250" textLength="1000" lengthAdjust="spacingAndGlyphs">DISHCOVERY</text>
      </svg>

      <svg class="mark__layer mark__light" viewBox="12 0 976 182" focusable="false">
        <defs>
          <filter id="grain-light" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch" result="n"/>
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 -.2" result="g"/>
            <feComposite in="g" in2="SourceAlpha" operator="in" result="gt"/>
            <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gt"/></feMerge>
          </filter>
        </defs>
        <text x="0" y="182" font-size="250" textLength="1000" lengthAdjust="spacingAndGlyphs" filter="url(#grain-light)">DISHCOVERY</text>
      </svg>
    </div>
  </footer>
</template>
<template v-if="route.path === '/reviews'">
<footer class="footer" @pointermove="glow" @pointerleave="clearGlow">
    <div class="footer__inner">

      <div class="footer__cols">
        <nav aria-label="Explore">
          <h2 class="footer__heading">Explore</h2>
          <ul class="footer__links">
            <li><RouterLink to="/">Home</RouterLink></li>
            <li><RouterLink to="/about">About</RouterLink></li>
            <li><RouterLink to="/restaurants">List of Restaurants</RouterLink></li>
            <li><RouterLink to="/favorites">Favorites</RouterLink></li>
            <li><RouterLink to="/reviews">My Reviews</RouterLink></li>
          </ul>
        </nav>

        <!-- These links open this page already filtered by cuisine -->
        <nav aria-label="Cuisines">
          <h2 class="footer__heading">Cuisines</h2>
          <ul class="footer__links">
            <li><RouterLink to="/restaurants?cuisine=Italian">Italian</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Japanese">Japanese</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Mexican">Mexican</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Indian">Indian</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Chinese">Chinese</RouterLink></li>
            <li><RouterLink to="/restaurants?cuisine=Thai">Thai</RouterLink></li>
          </ul>
        </nav>

        <nav aria-label="Discover">
          <h2 class="footer__heading">Discover</h2>
          <ul class="footer__links">
            <li><RouterLink to="/#featured">Featured Restaurants</RouterLink></li>
            <li><RouterLink to="/restaurants?top=1">Top Rated</RouterLink></li>
          </ul>
        </nav>

        <div class="footer__logo">
          <RouterLink to="/" aria-label="Dishcovery home"><img src="/img/dish.png" alt="Dishcovery"></RouterLink>
        </div>
      </div>

      <div class="footer__bottom">
        <div class="footer__legal">
          <small>&copy; 2026 Dishcovery</small>
          <RouterLink to="#">Legal Notice</RouterLink>
          <RouterLink to="#">Privacy Policy</RouterLink>
          <RouterLink to="#">Cookie Policy</RouterLink>
        </div>

        <div class="footer__aside">
          <div class="footer__lang">
            <span>Language</span>
            <RouterLink to="#" aria-current="true">English</RouterLink>
          </div>
          <div class="social">
            <RouterLink to="#" aria-label="LinkedIn"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="Instagram"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="X"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="YouTube"><span class="social-slot" aria-hidden="true"></span></RouterLink>
            <RouterLink to="#" aria-label="Facebook"><span class="social-slot" aria-hidden="true"></span></RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Giant footer word (same as the home page). Change DISHCOVERY in BOTH <text> lines to edit it. -->
    <div class="mark" aria-hidden="true">
      <svg class="mark__layer mark__base" viewBox="12 0 976 182" focusable="false">
        <text x="0" y="182" font-size="250" textLength="1000" lengthAdjust="spacingAndGlyphs">DISHCOVERY</text>
      </svg>

      <svg class="mark__layer mark__light" viewBox="12 0 976 182" focusable="false">
        <defs>
          <filter id="grain-light" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" stitchTiles="stitch" result="n"/>
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .5 -.2" result="g"/>
            <feComposite in="g" in2="SourceAlpha" operator="in" result="gt"/>
            <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="gt"/></feMerge>
          </filter>
        </defs>
        <text x="0" y="182" font-size="250" textLength="1000" lengthAdjust="spacingAndGlyphs" filter="url(#grain-light)">DISHCOVERY</text>
      </svg>
    </div>
  </footer>
</template>
</template>
