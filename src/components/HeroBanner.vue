<!-- src/components/HeroBanner.vue -->
<template>
  <section class="hero-banner">
    <div class="hero-mask">
      <div class="container hero-content">
  
        <span class="hero-tag">
          PROFESSIONAL AUTOMOTIVE SOLUTIONS
        </span>
  
        <h1>XUENAV</h1>
  
        <h2>
          AFTER-SALES SUPPORT CENTER
        </h2>
  
        <p>
          Professional support for OEM integration systems and multimedia upgrades.
        </p>
  
        <div class="hero-actions">
  
          <a href="#products" class="hero-btn primary">
            View Products
          </a>
  
          <a
            :href="`https://wa.me/${site.whatsapp}`"
            target="_blank"
            class="hero-btn ghost"
          >
            WhatsApp Us
          </a>
  
        </div>
  
      </div>
    </div>
  </section>
  </template>
  
  <script setup>
  import { siteInfo as site } from '../data/site'
  </script>