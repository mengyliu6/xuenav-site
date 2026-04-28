<template>
  <div class="container product-detail">

    <!-- 标题 -->
    <h1>{{ product.title }}</h1>

    <!-- 视频 -->
    <div class="video-box">
      <iframe
        :src="product.video"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>

    <!-- 联系方式 -->
    <div class="contact-box">
      <h3>Contact Support</h3>

      <a class="wa-btn" href="https://wa.me/xxxx" target="_blank">
        Chat on WhatsApp
      </a>

      <p>Email: support@xuenav.com</p>
      <p>Website: www.xuenav.com</p>
    </div>

  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const products = {
  "lexus-es": {
    title: "Lexus ES Decoder",
    video: "https://www.youtube.com/embed/VIDEO_ID"
  },
  "bmw-screen": {
    title: "BMW Android Screen",
    video: "https://www.youtube.com/embed/VIDEO_ID"
  }
}

const product = products[route.params.id] || {
  title: "Product",
  video: ""
}
</script>