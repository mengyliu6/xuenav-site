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
            <span class="product-eyebrow">{{ BRAND.name }} Video Center</span>
            <h1>Installation Videos</h1>
            <p>
              Watch installation and product demonstration videos for {{ BRAND.name }}
              CarPlay, car radio and digital cluster solutions.
            </p>
          </div>

          <a
            v-if="CONTACT.whatsappNumber"
            class="primary-btn"
            :href="CONTACT.whatsappLink('Hello, I need help finding an installation video for my vehicle. My car model/year is: ')"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ask for Installation Help
          </a>
        </section>

        <label class="support-search installation-search" aria-label="Search installation videos">
          <span>Search Videos</span>
          <div class="support-search__control">
            <input
              v-model.trim="searchTerm"
              type="search"
              placeholder="Search by product name or vehicle model"
            />
            <button
              v-if="searchTerm"
              type="button"
              aria-label="Clear installation video search"
              @click="searchTerm = ''"
            >
              Clear
            </button>
          </div>
          <small v-if="searchTerm">
            Showing {{ filteredVideos.length }} video{{ filteredVideos.length === 1 ? "" : "s" }}
            for "{{ searchTerm }}"
          </small>
        </label>

        <section v-if="filteredVideos.length" class="installation-video-grid">
          <article
            v-for="(item, index) in filteredVideos"
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
          <h2>{{ searchTerm ? "No matching installation videos" : "Installation videos are being prepared" }}</h2>
          <p>
            {{
              searchTerm
                ? "Try another product or vehicle model, or ask our support team for the matching video."
                : "Please contact our support team for a matching installation guide."
            }}
          </p>
          <a
            v-if="CONTACT.whatsappNumber"
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
import { BRAND, CONTACT } from "../config/contact";
import { products } from "../data/products";
import {
  getCachedContent,
  loadRemoteContent,
  mergeProductsContent,
} from "../utils/contentManager";

const fallbackProducts = BRAND.siteKey === "xuenav" ? products : [];
const cachedContent = getCachedContent(BRAND.siteKey);
const content = ref(cachedContent || { configured: false, products: {}, defaultFaqs: [] });
const contentReady = ref(Boolean(cachedContent));
const searchTerm = ref("");
const managedProducts = computed(() => mergeProductsContent(fallbackProducts, content.value));

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
const filteredVideos = computed(() => {
  const keywords = searchTerm.value.toLowerCase().split(/\s+/).filter(Boolean);
  if (!keywords.length) return videoProducts.value;

  return videoProducts.value.filter((item) => {
    const searchable = `${item.name || ""} ${item.id || ""}`.toLowerCase();
    return keywords.every((part) => searchable.includes(part));
  });
});

onMounted(async () => {
  try {
    content.value = await loadRemoteContent(content.value, BRAND.siteKey);
  } finally {
    contentReady.value = true;
  }
});
</script>
