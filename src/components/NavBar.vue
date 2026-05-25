<template>
  <nav class="navbar">
    <div class="container nav-inner">
      <RouterLink to="/">HOME</RouterLink>
      <RouterLink to="/#support-products">PRODUCTS</RouterLink>
      <RouterLink to="/installation">INSTALLATION</RouterLink>
      <RouterLink to="/faq">FAQ</RouterLink>
      <a href="#contact">CONTACT US</a>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from "vue-router";
</script>
