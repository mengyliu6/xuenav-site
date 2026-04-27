<template>
  <div class="card">
  
    <img :src="product.image" />
  
    <h3>{{ product.name }}</h3>
  
    <p>WhatsApp: {{ site.contactName }}</p>
    <p>Email: {{ site.email }}</p>
  
    <a
      :href="`https://wa.me/${site.whatsapp}`"
      target="_blank"
      class="card-btn"
    >
      GET SUPPORT
    </a>
  
  </div>
  </template>
  
  <script setup>
  import { siteInfo as site } from '../data/site'
  
  defineProps({
    product: Object
  })
  </script>