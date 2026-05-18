<template>
  <RouterView />
  <WhatsAppFloat />
  <BackToTop />
</template>

<script setup>
import { RouterView } from "vue-router";
import BackToTop from "./components/BackToTop.vue";
import WhatsAppFloat from "./components/WhatsAppFloat.vue";
</script>
