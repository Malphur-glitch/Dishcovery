<script setup>
// Original shared.js cardHTML: reused by Restaurants and, next, Favorites.
defineProps({ restaurant: Object, index: {type:Number,default:0}, favorite:Boolean, pending:Boolean });
defineEmits(['open','favorite']);
const hideImage = event => { event.target.style.visibility = 'hidden'; };
</script>
<template>
<article class="rcard" :style="{'--h': restaurant.hue, '--i': Math.min(index,11)}">
 <div v-if="restaurant.photo" class="media rcard__photo" :style="{'--h': restaurant.hue}"><img :src="restaurant.photo" alt="" loading="lazy" @error="hideImage"></div>
 <span class="rcard__top"><span class="rcard__tag">{{ restaurant.cuisine }} | {{ restaurant.borough }}</span><button type="button" class="fav" :data-fav="restaurant.id" :aria-pressed="favorite" :aria-label="favorite ? 'Remove from favorites' : 'Add to favorites'" :disabled="pending" @click="$emit('favorite',restaurant)"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.5l2.9 6.4 6.9.7-5.2 4.6 1.6 6.8L12 17.4 5.8 21l1.6-6.8L2.2 9.6l6.9-.7z" stroke-linejoin="round"/></svg></button></span>
 <h3 class="rcard__name">{{ restaurant.name }}</h3>
 <p class="rcard__addr">{{ restaurant.street }}{{ restaurant.zip ? ' · ' + restaurant.zip : '' }}</p>
 <p class="rcard__dishes">{{ restaurant.meals.slice(0,3).join(' · ') }}</p>
 <span class="rcard__foot"><span>Score {{ restaurant.score }}</span><span class="rcard__arrow" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span>
 <a class="rcard__link" href="#restaurant" :data-id="restaurant.id" :aria-label="restaurant.name" @click="$emit('open',restaurant)"></a>
</article>
</template>
