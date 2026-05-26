<template>
  <section class="hero-banner" :style="bannerStyle">
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
import { computed } from "vue";
import { BRAND } from "../config/contact";

const props = defineProps({
  bannerImage: {
    type: String,
    default: "",
  },
});

const bannerStyle = computed(() => {
  const image = String(props.bannerImage || "").trim();
  if (!/^https?:\/\//i.test(image)) return {};
  return { "--hero-image": `url("${image.replaceAll('"', "%22")}")` };
});
</script>
