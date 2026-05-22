<template>
  <div class="site-wrap">
    <HeaderBar />
    <NavBar />
    <HeroBanner />

    <main id="support-products" class="section-area support-section">
      <div class="container">
        <div class="section-head support-section-head">
          <div>
            <span class="section-eyebrow">Xuenav Support Center</span>
            <h2>PRODUCT SUPPORT</h2>
            <p>
              Select your product model to view installation videos,
              troubleshooting guidance and after-sales support information.
            </p>
          </div>

          <a href="#support-products">View All Products →</a>
        </div>

        <div class="product-grid">
          <ProductCard
            v-for="(item, index) in managedProducts"
            :key="item.id"
            :id="item.id"
            :title="item.name"
            :image="item.image"
            :loading="!contentReady"
            :image-loading="index < 3 ? 'eager' : 'lazy'"
            :image-fetch-priority="index < 3 ? 'high' : 'auto'"
          />
        </div>
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
import { products } from "../data/products";
import {
  loadRemoteContent,
  mergeProductsContent,
} from "../utils/contentManager";

const content = ref({ configured: false, products: {}, defaultFaqs: [] });
const contentReady = ref(false);
const managedProducts = computed(() => mergeProductsContent(products, content.value));

onMounted(async () => {
  try {
    content.value = await loadRemoteContent(content.value);
  } finally {
    contentReady.value = true;
  }
});
</script>
