<template>
  <button
    v-show="visible"
    class="back-to-top"
    type="button"
    aria-label="Back to top"
    @click="scrollToTop"
  >
    ↑
  </button>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const visible = ref(false);

const handleScroll = () => {
  visible.value = window.scrollY > 360;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

onMounted(() => {
  handleScroll();
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>