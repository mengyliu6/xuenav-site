<!-- src/components/FooterBar.vue -->
<template>
  <footer id="contact" class="footer">
  
    <div class="container footer-grid">
  
      <!-- left -->
      <div class="footer-brand">
  
        <img
          v-if="BRAND.logoWhite"
          :src="BRAND.logoWhite"
          :alt="BRAND.name"
          class="footer-logo"
          width="240"
          height="72"
          loading="lazy"
          decoding="async"
        />
        <span v-else class="footer-wordmark">{{ BRAND.name }}</span>
  
        <p class="footer-desc">
          {{ BRAND.name }} provides professional after-sales support
          for automotive multimedia systems, CarPlay,
          Android Auto and OEM integration solutions.
        </p>

        <p class="footer-request">
          If you need any CarPlay decoder, car radio or digital cluster,
          please contact us.
        </p>
  
      </div>
  
      <!-- middle -->
      <div class="footer-links">
  
        <h4>QUICK LINKS</h4>
  
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/#support-products">Products</RouterLink>
        <RouterLink to="/installation">Installation</RouterLink>
        <RouterLink to="/faq">FAQ</RouterLink>
        <a href="#">Downloads</a>
  
      </div>
  
      <!-- right -->
      <div class="footer-contact">
  
        <h4>CONTACT US</h4>
  
        <p v-if="CONTACT.name">WhatsApp: {{ CONTACT.name }}</p>
          <p v-if="CONTACT.whatsappDisplay">{{ CONTACT.whatsappDisplay }}</p>
          <p v-if="CONTACT.email">Email: {{ CONTACT.email }}</p>
          <p v-if="CONTACT.website">Website: {{ CONTACT.website }}</p>

          <a
            v-if="CONTACT.whatsappNumber"
            class="footer-btn"
            :href="CONTACT.whatsappLink()"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat on WhatsApp
          </a>
  
        <img
          v-if="BRAND.qr && CONTACT.whatsappNumber"
          :src="BRAND.qr"
          :alt="`${BRAND.name} WhatsApp QR Code`"
          class="footer-qr"
          width="130"
          height="130"
          loading="lazy"
          decoding="async"
        />
  
      </div>
  
    </div>
  
    <div class="copy">
      &copy; 2026 {{ BRAND.name }}. All Rights Reserved.
    </div>
  
  </footer>
  </template>
  
  <script setup>
  import { RouterLink } from "vue-router";
  import { BRAND, CONTACT } from "../config/contact";
  </script>
