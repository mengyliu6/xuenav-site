<template>
  <div class="site-wrap">
    <HeaderBar />
    <NavBar />

    <main class="installation-page">
      <div class="container">
        <nav class="product-breadcrumb">
          <RouterLink to="/">Home</RouterLink>
          <span>/</span>
          <span>Installation</span>
        </nav>

        <section class="installation-hero">
          <div>
            <span class="product-eyebrow">Xuenav Video Center</span>
            <h1>Installation Videos</h1>
            <p>
              Watch installation and product demonstration videos for Xuenav
              CarPlay, car radio and digital cluster solutions.
            </p>
          </div>

          <a
            class="primary-btn"
            :href="CONTACT.whatsappLink('Hello, I need help finding an installation video for my vehicle. My car model/year is: ')"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ask for Installation Help
          </a>
        </section>

        <section v-if="videoProducts.length" class="installation-video-grid">
          <article
            v-for="(item, index) in videoProducts"
            :key="item.id"
            class="installation-video-card"
          >
            <VideoModal
              :video-url="item.videoUrl"
              :cover="item.image"
              :title="item.name"
              :start="item.start || 0"
              :image-loading="index < 2 ? 'eager' : 'lazy'"
              :image-fetch-priority="index < 2 ? 'high' : 'auto'"
            />
            <div class="installation-video-card__body">
              <span>Installation Video</span>
              <h2>{{ item.name }}</h2>
              <RouterLink :to="`/product/${item.id}`">
                View Product Support
              </RouterLink>
            </div>
          </article>
        </section>

        <section v-else-if="contentReady" class="not-found-box installation-empty">
          <h2>Installation videos are being prepared</h2>
          <p>Please contact our support team for a matching installation guide.</p>
          <a
            class="primary-btn"
            :href="CONTACT.whatsappLink('Hello, I need an installation guide for my vehicle. My car model/year is: ')"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact Support
          </a>
        </section>
      </div>
    </main>

    <FooterBar />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import FooterBar from "../components/FooterBar.vue";
import HeaderBar from "../components/HeaderBar.vue";
import NavBar from "../components/NavBar.vue";
import VideoModal from "../components/VideoModal.vue";
import { CONTACT } from "../config/contact";
import { products } from "../data/products";
import {
  getCachedContent,
  loadRemoteContent,
  mergeProductsContent,
} from "../utils/contentManager";

const cachedContent = getCachedContent();
const content = ref(cachedContent || { configured: false, products: {}, defaultFaqs: [] });
const contentReady = ref(Boolean(cachedContent));
const managedProducts = computed(() => mergeProductsContent(products, content.value));

const hasYoutubeVideo = (value) => {
  try {
    const url = new URL(String(value || "").trim());
    const host = url.hostname.replace(/^(www|m)\./, "");
    const paths = url.pathname.split("/").filter(Boolean);

    if (host === "youtu.be") return Boolean(paths[0]);
    if (host !== "youtube.com") return false;

    return (
      (url.pathname === "/watch" && Boolean(url.searchParams.get("v"))) ||
      (["embed", "shorts", "live"].includes(paths[0]) && Boolean(paths[1]))
    );
  } catch {
    return false;
  }
};

const videoProducts = computed(() =>
  managedProducts.value.filter((product) => hasYoutubeVideo(product.videoUrl))
);

onMounted(async () => {
  try {
    content.value = await loadRemoteContent(content.value);
  } finally {
    contentReady.value = true;
  }
});
</script>
