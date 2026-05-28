<template>
  <RouterLink
    :to="`/product/${id}`"
    class="product-card-link"
    @pointerenter="measureCard"
    @pointermove="handlePointerMove"
    @pointerleave="resetCard"
    @pointercancel="resetCard"
    @blur="resetCard"
  >
    <article ref="cardRef" class="product-card">
      <div class="card-image-wrap" :class="{ 'is-loading': loading || !imageLoaded }">
        <div v-if="loading || !imageLoaded" class="card-image-loader" aria-hidden="true">
          <img :src="productLoadingDoodle" alt="" />
          <span class="card-image-loading-dots">
            <i></i>
            <i></i>
            <i></i>
          </span>
        </div>
        <img
          v-if="!loading && image"
          :key="image"
          :src="image"
          :alt="title"
          :loading="imageLoading"
          :fetchpriority="imageFetchPriority"
          :sizes="imageSizes"
          decoding="async"
          width="600"
          height="600"
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
import { onBeforeUnmount, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import productLoadingDoodle from "../assets/images/admin-loading-doodle.jpg";

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
  imageLoading: {
    type: String,
    default: "lazy",
  },
  imageFetchPriority: {
    type: String,
    default: "auto",
  },
  imageSizes: {
    type: String,
    default: "(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw",
  },
});

const cardRef = ref(null);
const imageLoaded = ref(false);
let linkRect = null;
let activeLink = null;
let pointerFrame = 0;
let pendingPointer = null;

watch(
  () => [props.image, props.loading],
  () => {
    imageLoaded.value = false;
  }
);

const measureCard = (event) => {
  const card = cardRef.value;
  if (!card) return;

  activeLink = event.currentTarget;
  linkRect = activeLink.getBoundingClientRect();
  handlePointerMove(event);
};

const handlePointerMove = (event) => {
  if (event.pointerType && event.pointerType !== "mouse") return;

  const card = cardRef.value;
  const link = event.currentTarget || activeLink;
  if (!card || !link) return;
  activeLink = link;
  if (!linkRect) linkRect = link.getBoundingClientRect();

  pendingPointer = {
    x: event.clientX,
    y: event.clientY,
  };

  if (pointerFrame) return;

  pointerFrame = requestAnimationFrame(() => {
    const rect = linkRect;
    const pointer = pendingPointer;
    pointerFrame = 0;

    if (!rect || !pointer) return;

    const x = Math.min(Math.max(pointer.x - rect.left, 0), rect.width);
    const y = Math.min(Math.max(pointer.y - rect.top, 0), rect.height);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((centerY - y) / centerY) * 2.4;
    const rotateY = ((x - centerX) / centerX) * 3;

    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;

    card.style.setProperty("--rx", `${rotateX.toFixed(2)}deg`);
    card.style.setProperty("--ry", `${rotateY.toFixed(2)}deg`);
    activeLink?.style.setProperty("--mx", `${shineX.toFixed(1)}%`);
    activeLink?.style.setProperty("--my", `${shineY.toFixed(1)}%`);
    card.classList.add("is-tilting");
    activeLink?.classList.add("is-tilting");
  });
};

const resetCard = (event) => {
  const card = cardRef.value;
  const link = event?.currentTarget || activeLink;
  if (!card) return;

  if (pointerFrame) cancelAnimationFrame(pointerFrame);
  pointerFrame = 0;
  pendingPointer = null;
  linkRect = null;
  activeLink = null;
  card.classList.remove("is-tilting");
  link?.classList.remove("is-tilting");
  card.style.setProperty("--rx", "0deg");
  card.style.setProperty("--ry", "0deg");
  link?.style.setProperty("--mx", "50%");
  link?.style.setProperty("--my", "50%");
};

onBeforeUnmount(() => {
  if (pointerFrame) cancelAnimationFrame(pointerFrame);
});
</script>
