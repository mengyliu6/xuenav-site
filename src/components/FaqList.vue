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
