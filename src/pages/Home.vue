<template>
  <div class="site-wrap">
    <HeaderBar />
    <NavBar />
    <HeroBanner
      :banner-image="content.settings?.bannerImage"
      :content-ready="contentReady"
    />

    <main id="support-products" class="section-area support-section">
      <div class="container">
        <div class="section-head support-section-head">
          <div>
            <span class="section-eyebrow">{{ BRAND.name }} Support Center</span>
            <h2>PRODUCT SUPPORT</h2>
            <p>
              Select your product model to view installation videos,
              troubleshooting guidance and after-sales support information.
            </p>
          </div>

          <a href="#support-products">View All Products →</a>
        </div>

        <label class="support-search" aria-label="Search products">
          <span>Search Products</span>
          <div class="support-search__control">
            <input
              v-model.trim="searchTerm"
              type="search"
              placeholder="Search by product name or vehicle model"
            />
            <button
              v-if="searchTerm"
              type="button"
              aria-label="Clear product search"
              @click="searchTerm = ''"
            >
              Clear
            </button>
          </div>
          <small v-if="searchTerm">
            Showing {{ filteredProducts.length }} result{{ filteredProducts.length === 1 ? "" : "s" }}
            for "{{ searchTerm }}"
          </small>
        </label>

        <div class="product-grid">
          <ProductCard
            v-for="(item, index) in filteredProducts"
            :key="item.id"
            :id="item.id"
            :title="item.name"
            :image="item.image"
            :loading="!contentReady"
            :image-loading="index === 0 ? 'eager' : 'lazy'"
            :image-fetch-priority="index === 0 ? 'high' : 'low'"
          />
        </div>

        <section v-if="contentReady && !filteredProducts.length" class="support-empty-state">
          <h3>No matching products found</h3>
          <p>Try another model name, or contact us for product confirmation.</p>
        </section>
      </div>
    </main>

    <FooterBar />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import HeaderBar from "../components/HeaderBar.vue";
import NavBar from "../components/NavBar.vue";
import HeroBanner from "../components/HeroBanner.vue";
import ProductCard from "../components/ProductCard.vue";
import FooterBar from "../components/FooterBar.vue";
import { BRAND } from "../config/contact";
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
const filteredProducts = computed(() => {
  const keywords = searchTerm.value.toLowerCase().split(/\s+/).filter(Boolean);
  if (!keywords.length) return managedProducts.value;

  return managedProducts.value.filter((item) => {
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
