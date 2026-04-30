<template>
  <div class="container product-detail">
    <h1>{{ product.name }}</h1>

    <VideoModal :videoId="product.video" />

    <div class="contact-box">
      <h3>Contact Support</h3>

      <a class="wa-btn" href="https://wa.me/8613800000000" target="_blank">
        Chat on WhatsApp
      </a>

      <p>Email: xuenav666@163.com</p>
      <p>Website: www.xuenav.com</p>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { products } from "../data/products";
import VideoModal from "../components/VideoModal.vue";

const route = useRoute();

const product = products.find(p => p.id === route.params.id);
</script>