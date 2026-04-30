<!-- src/components/HeaderBar.vue -->
<template>
  <header class="top-header">
    <div class="container top-grid">
  
      <!-- Logo -->
      <div class="logo-side">
        <img
          src="../assets/images/logo.png"
          alt="XUENAV"
          class="logo-img"
        />
      </div>
  
      <!-- Wendy -->
      <div class="name-side">
        <h3>{{ CONTACT.name }}</h3>
        <p>WhatsApp Business Account</p>
      </div>
  
      <!-- QR -->
      <div class="qr-side">
        <img
          src="../assets/images/qr.png"
          alt="QR"
          class="qr-img"
        />
      </div>
  
      <!-- Right -->
      <div class="action-side">
  
        <a
          class="wa-btn"
          :href="CONTACT.whatsappLink()"
          target="_blank"
        >
          Chat on WhatsApp
        </a>

        <span>Email: {{ CONTACT.email }}</span>
        <span>Website: {{ CONTACT.website }}</span>
  
      </div>
  
    </div>
  </header>
  </template>
  
  <script setup>
  import { siteInfo as site } from '../data/site'
  import { CONTACT } from "../config/contact";
  </script>