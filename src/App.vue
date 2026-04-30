<template>
  <RouterView />
  <BackToTop />
</template>

<script setup>
import { RouterView } from "vue-router";
import BackToTop from "./components/BackToTop.vue";
</script>