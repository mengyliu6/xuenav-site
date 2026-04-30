<template>
  <nav class="navbar">
    <div class="container nav-inner">
      <RouterLink to="/">HOME</RouterLink>
      <RouterLink to="/#support-products">PRODUCTS</RouterLink>
      <a href="#installation">INSTALLATION</a>
      <a href="#faq">FAQ</a>
      <a href="#contact">CONTACT US</a>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from "vue-router";
</script>