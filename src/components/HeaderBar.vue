<template>
  <header class="top-header">
    <div class="container top-inner">
  
      <!-- 左侧logo -->
      <div class="logo-side">
        <img
          src="../assets/images/logo.png"
          class="logo-img"
          alt="XUENAV"
        />
      </div>
  
      <!-- 中间 Wendy -->
      <div class="info-side">
        <h3>{{ site.contactName }}</h3>
        <p>WhatsApp Business Account</p>
      </div>
  
      <!-- 二维码 -->
      <div class="qr-side">
        <img
          src="../assets/images/qr.png"
          class="qr-img"
        />
      </div>
  
      <!-- 右侧按钮 -->
      <div class="action-side">
  
        <a
          :href="`https://wa.me/${site.whatsapp}`"
          target="_blank"
          class="wa-btn"
        >
          Chat on WhatsApp
        </a>
  
        <span>Email: {{ site.email }}</span>
        <span>Website: {{ site.website }}</span>
  
      </div>
  
    </div>
  </header>
  </template>
  
  <script setup>
  import { siteInfo as site } from '../data/site'
  </script>