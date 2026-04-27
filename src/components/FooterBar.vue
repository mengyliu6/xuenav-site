<!-- components/FooterBar.vue -->
<template>
  <footer class="footer">
  
    <div class="container footer-grid">
  
      <!-- logo -->
      <div>
        <img
          src="../assets/images/logo.png"
          class="footer-logo"
        />
  
        <p class="footer-desc">
          Professional after-sales support for
          CarPlay / Android Auto / OEM Integration.
        </p>
      </div>
  
      <!-- 联系方式 -->
      <div>
        <h4>CONTACT</h4>
  
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
      </div>
  
      <!-- 二维码 -->
      <div class="footer-qr-wrap">
        <img
          src="../assets/images/qr.png"
          class="footer-qr"
        />
      </div>
  
    </div>
  
    <div class="copy">
      © 2026 XUENAV All Rights Reserved.
    </div>
  
  </footer>
  </template>
  
  <script setup>
  import { siteInfo as site } from '../data/site'
  </script>