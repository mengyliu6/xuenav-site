<template>
  <div class="faq-list">
    <details
      v-for="(item, index) in items"
      :key="item.question"
      class="faq-item"
      :open="index === 0 && openFirst"
    >
      <summary>
        <span>{{ item.question }}</span>
      </summary>
      <p>{{ item.answer }}</p>

      <div v-if="item.images?.length" class="faq-image-grid">
        <figure v-for="image in item.images" :key="image.url">
          <img :src="image.url" :alt="image.caption || item.question" />
          <figcaption v-if="image.caption">{{ image.caption }}</figcaption>
        </figure>
      </div>
    </details>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
  openFirst: {
    type: Boolean,
    default: true,
  },
});
</script>
