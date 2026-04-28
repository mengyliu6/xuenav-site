<!-- src/App.vue -->
<template>
  <div class="site-wrap">
  
    <HeaderBar />
    <NavBar />
    <HeroBanner />
  
    <main class="section-area">
      <div class="container">
  
        <div class="section-head">
          <h2>PRODUCT SUPPORT</h2>
          <a href="#">View All Products →</a>
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
  import HeaderBar from './components/HeaderBar.vue'
  import NavBar from './components/NavBar.vue'
  import HeroBanner from './components/HeroBanner.vue'
  import ProductCard from './components/ProductCard.vue'
  import FooterBar from './components/FooterBar.vue'
  
  import { products } from './data/products'
  </script>