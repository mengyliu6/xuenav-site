<!-- src/components/HeaderBar.vue -->
<template>
  <header class="top-header">
    <div class="container top-grid">
  
      <!-- Logo -->
      <RouterLink class="logo-side logo-home-link" to="/" aria-label="Back to home">
        <img
          v-if="BRAND.logo"
          :src="BRAND.logo"
          :alt="BRAND.name"
          class="logo-img"
          width="240"
          height="72"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
        <span v-else class="brand-wordmark">{{ BRAND.name }}</span>
      </RouterLink>
  
      <!-- Wendy -->
      <div class="name-side">
        <h3>{{ CONTACT.name || `${BRAND.name} Support` }}</h3>
        <p>{{ CONTACT.whatsappNumber ? "WhatsApp Business Account" : "Contact details pending" }}</p>
      </div>
  
      <!-- QR -->
      <div class="qr-side">
        <img
          v-if="BRAND.qr && CONTACT.whatsappNumber"
          :src="BRAND.qr"
          :alt="`${BRAND.name} WhatsApp QR`"
          class="qr-img"
          width="112"
          height="112"
          loading="lazy"
          decoding="async"
        />
        <span v-else>Contact</span>
      </div>
  
      <!-- Right -->
      <div class="action-side">
  
        <a
          v-if="CONTACT.whatsappNumber"
          class="wa-btn"
          :href="CONTACT.whatsappLink()"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chat on WhatsApp
        </a>

        <span v-if="CONTACT.email">Email: {{ CONTACT.email }}</span>
        <span v-if="CONTACT.whatsappDisplay">Phone: {{ CONTACT.whatsappDisplay }}</span>
  
      </div>
  
    </div>
  </header>
  </template>
  
  <script setup>
  import { BRAND, CONTACT } from "../config/contact";
  </script>
