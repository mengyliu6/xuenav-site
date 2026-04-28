<!-- src/components/FooterBar.vue -->
<template>
  <footer class="footer">
  
    <div class="container footer-grid">
  
      <!-- left -->
      <div class="footer-brand">
  
        <img
          src="../assets/images/logo.png"
          alt="XUENAV"
          class="footer-logo"
        />
  
        <p class="footer-desc">
          XUENAV provides professional after-sales support
          for automotive multimedia systems, CarPlay,
          Android Auto and OEM integration solutions.
        </p>
  
      </div>
  
      <!-- middle -->
      <div class="footer-links">
  
        <h4>QUICK LINKS</h4>
  
        <a href="#">Home</a>
        <a href="#">Products</a>
        <a href="#">Installation</a>
        <a href="#">FAQ</a>
        <a href="#">Downloads</a>
  
      </div>
  
      <!-- right -->
      <div class="footer-contact">
  
        <h4>CONTACT US</h4>
  
        <p>{{ site.contactName }}</p>
        <p>{{ site.email }}</p>
        <p>{{ site.website }}</p>
  
        <a
          :href="`https://wa.me/${site.whatsapp}`"
          target="_blank"
          class="footer-btn"
        >
          WhatsApp Us
        </a>
  
        <img
          src="../assets/images/qr.png"
          alt="QR Code"
          class="footer-qr"
        />
  
      </div>
  
    </div>
  
    <div class="copy">
      © 2026 XUENAV. All Rights Reserved.
    </div>
  
  </footer>
  </template>
  
  <script setup>
  import { siteInfo as site } from '../data/site'
  </script>