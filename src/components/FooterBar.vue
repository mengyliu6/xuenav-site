<!-- src/components/FooterBar.vue -->
<template>
  <footer class="footer">
  
    <div class="container footer-grid">
  
      <!-- left -->
      <div class="footer-brand">
  
        <img
          src="../assets/images/logo-white.png"
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
  
        <p>WhatsApp: {{ CONTACT.name }}</p>
          <p>{{ CONTACT.whatsappDisplay }}</p>
          <p>Email: {{ CONTACT.email }}</p>
          <p>Website: {{ CONTACT.website }}</p>

          <a
            class="footer-btn"
            :href="CONTACT.whatsappLink()"
            target="_blank"
          >
            Chat on WhatsApp
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
  import { CONTACT } from "../config/contact";
  </script>