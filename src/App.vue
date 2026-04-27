<template>
  <div>
  
    <HeaderBar />
    <NavBar />
  
    <section class="hero">
      <div class="container hero-inner">
        <h1>XUENAV</h1>
        <h2>AFTER-SALES SUPPORT CENTER</h2>
        <p>Professional support for Car Radio</p>
      </div>
    </section>
  
    <section class="container products-wrap">
  
      <h2 class="section-title">
        PRODUCT SUPPORT
      </h2>
  
      <div class="grid">
  
        <ProductCard
          v-for="(item,index) in products"
          :key="index"
          :product="item"
        />
  
      </div>
  
    </section>
  
    <FooterBar />
  
  </div>
  </template>
  
  <script setup>
  import HeaderBar from './components/HeaderBar.vue'
  import NavBar from './components/NavBar.vue'
  import ProductCard from './components/ProductCard.vue'
  import FooterBar from './components/FooterBar.vue'
  
  import { products } from './data/products'
  </script>