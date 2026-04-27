<!-- components/HeaderBar.vue -->
<template>
  <header class="top-header">
    <div class="container top-inner">
  
      <!-- 左侧 LOGO -->
      <div class="brand-wrap">
        <img
          src="../assets/images/logo.png"
          alt="XUENAV Logo"
          class="logo-img"
        />
      </div>
  
      <!-- 右侧联系方式 -->
      <div class="contact-area">
  
        <!-- 二维码 -->
        <div class="qr-wrap">
          <img
            src="../assets/images/qr.png"
            alt="WhatsApp QR"
            class="qr-img"
          />
        </div>
  
        <!-- 联系信息 -->
        <div class="contact-info">
  
          <h3>{{ site.contactName }}</h3>
  
          <span class="sub-title">
            WhatsApp Business Account
          </span>
  
          <a
            :href="`https://wa.me/${site.whatsapp}`"
            target="_blank"
            class="wa-btn"
          >
            Chat on WhatsApp
          </a>
  
          <div class="contact-lines">
            <p>Email: {{ site.email }}</p>
            <p>Website: {{ site.website }}</p>
          </div>
  
        </div>
  
      </div>
  
    </div>
  </header>
  </template>
  
  <script setup>
  import { siteInfo as site } from '../data/site'
  </script>