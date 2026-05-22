<template>
  <RouterLink
    :to="`/product/${id}`"
    class="product-card-link"
    @mousemove="handleMouseMove"
    @mouseleave="resetCard"
  >
    <article ref="cardRef" class="product-card">
      <div class="card-image-wrap" :class="{ 'is-loading': loading || !imageLoaded }">
        <span v-if="loading || !imageLoaded" class="card-image-skeleton" aria-hidden="true"></span>
        <img
          v-if="!loading && image"
          :key="image"
          :src="image"
          :alt="title"
          class="card-image"
          :class="{ 'is-loaded': imageLoaded }"
          @load="imageLoaded = true"
          @error="imageLoaded = true"
        />
        <span class="card-badge">Support</span>
      </div>

      <div class="card-body">
        <h3>{{ title }}</h3>

        <span class="card-btn">
          View Support
          <span class="card-btn-arrow">→</span>
        </span>
      </div>
    </article>
  </RouterLink>
</template>

<script setup>
import { ref, watch } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const cardRef = ref(null);
const imageLoaded = ref(false);

watch(
  () => [props.image, props.loading],
  () => {
    imageLoaded.value = false;
  }
);

const handleMouseMove = (event) => {
  const card = cardRef.value;
  if (!card) return;

  const rect = card.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateX = ((centerY - y) / centerY) * 4;
  const rotateY = ((x - centerX) / centerX) * 5;

  const shineX = (x / rect.width) * 100;
  const shineY = (y / rect.height) * 100;

  card.style.setProperty("--rx", `${rotateX}deg`);
  card.style.setProperty("--ry", `${rotateY}deg`);
  card.style.setProperty("--mx", `${shineX}%`);
  card.style.setProperty("--my", `${shineY}%`);
};

const resetCard = () => {
  const card = cardRef.value;
  if (!card) return;

  card.style.setProperty("--rx", "0deg");
  card.style.setProperty("--ry", "0deg");
  card.style.setProperty("--mx", "50%");
  card.style.setProperty("--my", "50%");
};
</script>
