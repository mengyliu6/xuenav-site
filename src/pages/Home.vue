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
            v-for="item in products"
            :key="item.id"
            :id="item.id"
            :title="item.name"
            :image="item.image"
          />
        </div>
      </div>
    </main>

    <FooterBar />
  </div>
</template>

<script setup>
import HeaderBar from "../components/HeaderBar.vue";
import NavBar from "../components/NavBar.vue";
import HeroBanner from "../components/HeroBanner.vue";
import ProductCard from "../components/ProductCard.vue";
import FooterBar from "../components/FooterBar.vue";
import { products } from "../data/products";
</script>