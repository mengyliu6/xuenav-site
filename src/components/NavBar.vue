<template>
  <nav class="navbar">
    <div class="container nav-inner">
      <RouterLink to="/" :class="{ 'nav-current': route.path === '/' && !route.hash }">HOME</RouterLink>
      <RouterLink to="/#support-products" :class="{ 'nav-current': route.path === '/' && route.hash === '#support-products' }">PRODUCTS</RouterLink>
      <RouterLink to="/installation" :class="{ 'nav-current': route.path === '/installation' }">INSTALLATION</RouterLink>
      <RouterLink to="/faq" :class="{ 'nav-current': route.path === '/faq' }">FAQ</RouterLink>
      <a href="#contact" :class="{ 'nav-current': route.hash === '#contact' }">CONTACT US</a>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { useRoute } from "vue-router";

const route = useRoute();
</script>
