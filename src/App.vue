<template>
  <RouterView />
  <WhatsAppFloat v-if="showWhatsAppFloat" />
  <BackToTop />
</template>

<script setup>
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import BackToTop from "./components/BackToTop.vue";
import WhatsAppFloat from "./components/WhatsAppFloat.vue";

const route = useRoute();
const showWhatsAppFloat = computed(() => route.name !== "Admin");
</script>
