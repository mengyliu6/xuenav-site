<!-- src/components/FooterBar.vue -->
<template>
  <footer id="contact" class="footer">
  
    <div class="container footer-grid">
  
      <!-- left -->
      <div class="footer-brand">
  
        <img
          src="../assets/images/logo-white.png"
          alt="XUENAV"
          class="footer-logo"
          width="240"
          height="72"
          loading="lazy"
          decoding="async"
        />
  
        <p class="footer-desc">
          XUENAV provides professional after-sales support
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
  
        <p>WhatsApp: {{ CONTACT.name }}</p>
          <p>{{ CONTACT.whatsappDisplay }}</p>
          <p>Email: {{ CONTACT.email }}</p>
          <p>Website: {{ CONTACT.website }}</p>

          <a
            class="footer-btn"
            :href="CONTACT.whatsappLink()"
            target="_blank"
            rel="noopener noreferrer"
          >
            Chat on WhatsApp
          </a>
  
        <img
          src="../assets/images/qr.png"
          alt="QR Code"
          class="footer-qr"
          width="130"
          height="130"
          loading="lazy"
          decoding="async"
        />
  
      </div>
  
    </div>
  
    <div class="copy">
      © 2026 XUENAV. All Rights Reserved.
    </div>
  
  </footer>
  </template>
  
  <script setup>
  import { RouterLink } from "vue-router";
  import { CONTACT } from "../config/contact";
  </script>
