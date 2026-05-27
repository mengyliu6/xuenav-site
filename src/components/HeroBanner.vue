<template>
  <section class="hero-banner" :class="{ 'has-image': bannerImageSrc }">
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
    <div class="hero-lineart" aria-hidden="true">
      <span class="hero-lineart__ring"></span>
      <span class="hero-lineart__corner"></span>
      <span class="hero-lineart__route"></span>
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
import { computed, ref, watch } from "vue";
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

watch(bannerImageSrc, () => {
  bannerImageLoaded.value = false;
});
</script>
