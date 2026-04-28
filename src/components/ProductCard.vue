<!-- src/components/ProductCard.vue -->
<template>
  <div class="product-card">
  
    <div class="card-image-wrap">
      <img
        :src="product.image"
        :alt="product.name"
        class="card-image"
      />
      <span class="card-badge">HOT</span>
    </div>
  
    <div class="card-body">
  
      <h3>{{ product.name }}</h3>
  
      <p class="card-desc">
        Professional installation guidance,
        troubleshooting and technical support.
      </p>
  
      <div class="card-contact">
        <span>{{ site.contactName }}</span>
        <span>{{ site.email }}</span>
      </div>
  
      <a
        :href="`https://wa.me/${site.whatsapp}`"
        target="_blank"
        class="card-btn"
      >
        GET SUPPORT
      </a>
  
    </div>
  
  </div>
  </template>
  
  <script setup>
  import { siteInfo as site } from '../data/site'
  
  defineProps({
    product: Object
  })
  </script>