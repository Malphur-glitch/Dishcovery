<script setup>
defineProps({ restaurant: { type: Object, required: true } });
defineEmits(['open']);
const hideImage = event => { event.target.style.visibility = 'hidden'; };
</script>
<template>
  <!-- Original home.js card(r): random-looking photo from the restaurant's own cuisine. -->
  <!-- Learn more opens the pop-up here; only the hash changes and Home stays Home. -->
  <a href="#restaurant" class="featured__card reveal" :data-id="restaurant.id" @click="$emit('open', restaurant)">
    <div class="media" :style="{ '--h': restaurant.hue }">
      <img v-if="restaurant.photo" :src="restaurant.photo" alt="" @error="hideImage">
    </div>
    <h3 class="featured__name">{{ restaurant.name }}</h3>
    <span class="learn">Learn more</span>
  </a>
</template>
