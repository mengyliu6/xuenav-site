<template>
  <div class="container product-detail">
    <h1>{{ product?.name || "Product Not Found" }}</h1>

    <img
      v-if="product?.image"
      :src="product.image"
      class="detail-image"
    />

    <div v-if="product?.video" class="video-box">
      <iframe
        :src="product.video"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>

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
import { products } from "../data/products.js";

const route = useRoute();
const product = products.find((item) => item.id === route.params.id);
</script>