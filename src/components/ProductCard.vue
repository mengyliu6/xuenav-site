<template>
  <div class="product-card" @click="goDetail">
    <div class="card-image-wrap">
      <img :src="image" class="card-image" />
    </div>

    <div class="card-body">
      <h3>{{ title }}</h3>

      <div class="card-contact">
        <p>WhatsApp: Wendy</p>
        <p>Email: support@xuenav.com</p>
      </div>

      <a class="card-btn">GET SUPPORT</a>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  id: String,
  title: String,
  image: String
})

const router = useRouter()

const goDetail = () => {
  router.push(`/product/${props.id}`)
}
</script>