<template>
  <section
    ref="heroRef"
    class="hero-banner"
    :class="{ 'has-image': bannerImageSrc }"
    @pointermove="trackHeroPointer"
    @pointerleave="resetHeroPointer"
  >
    <img
      v-if="bannerImageSrc"
      class="hero-banner__image"
      :class="{ 'is-loaded': bannerImageLoaded }"
      :src="bannerImageSrc"
      alt=""
      loading="eager"
      fetchpriority="high"
      decoding="async"
      @load="bannerImageLoaded = true"
    />
    <div class="hero-hud hero-hud--ambient" aria-hidden="true">
      <svg class="hero-hud__map" viewBox="0 0 720 430" preserveAspectRatio="xMaxYMid meet">
        <path class="hero-hud__arc" d="M688 42 A168 168 0 0 0 520 210" />
        <path class="hero-hud__arc hero-hud__arc--inner" d="M671 68 A140 140 0 0 0 545 196" />
        <path
          class="hero-hud__route hero-hud__route--ambient"
          d="M176 348 L298 348 L359 285 L486 285 L548 223 L696 223"
        />
      </svg>
    </div>
    <div class="hero-hud hero-hud--signal" aria-hidden="true">
      <svg class="hero-hud__map" viewBox="0 0 720 430" preserveAspectRatio="xMaxYMid meet">
        <path
          class="hero-hud__route"
          d="M176 348 L298 348 L359 285 L486 285 L548 223 L696 223"
        />
        <path
          class="hero-hud__trace"
          pathLength="100"
          d="M176 348 L298 348 L359 285 L486 285 L548 223 L696 223"
        />
        <circle class="hero-hud__node hero-hud__node--one" cx="298" cy="348" r="5" />
        <circle class="hero-hud__node hero-hud__node--two" cx="486" cy="285" r="5" />
        <circle class="hero-hud__node hero-hud__node--three" cx="548" cy="223" r="5" />
      </svg>
    </div>
    <div class="hero-mask">
      <div class="container hero-content">
        <h1>{{ BRAND.name }}</h1>

        <h2>
          AFTER-SALES SUPPORT<br />
          CENTER
        </h2>

        <p>
          Professional support for OEM integration systems and multimedia upgrades.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { BRAND } from "../config/contact";

const props = defineProps({
  bannerImage: {
    type: String,
    default: "",
  },
  contentReady: {
    type: Boolean,
    default: true,
  },
});

const bannerImageSrc = computed(() => {
  const customImage = String(props.bannerImage || "").trim();
  if (/^https?:\/\//i.test(customImage)) return customImage;
  return props.contentReady ? BRAND.defaultBanner || "" : "";
});

const bannerImageLoaded = ref(false);
const heroRef = ref(null);
let pointerFrame = 0;

watch(bannerImageSrc, () => {
  bannerImageLoaded.value = false;
});

const trackHeroPointer = (event) => {
  if (event.pointerType && event.pointerType !== "mouse") return;
  if (pointerFrame) cancelAnimationFrame(pointerFrame);

  pointerFrame = requestAnimationFrame(() => {
    const banner = heroRef.value;
    if (!banner) return;

    const rect = banner.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
    const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);
    const shiftX = ((x / rect.width) - 0.5) * 7;
    const shiftY = ((y / rect.height) - 0.5) * 5;

    banner.style.setProperty("--hud-shift-x", `${shiftX}px`);
    banner.style.setProperty("--hud-shift-y", `${shiftY}px`);
    pointerFrame = 0;
  });
};

const resetHeroPointer = () => {
  const banner = heroRef.value;
  if (!banner) return;
  banner.style.setProperty("--hud-shift-x", "0px");
  banner.style.setProperty("--hud-shift-y", "0px");
};

onBeforeUnmount(() => {
  if (pointerFrame) cancelAnimationFrame(pointerFrame);
});
</script>
