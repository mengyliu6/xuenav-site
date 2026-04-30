<template>
  <div>
    <!-- 封面 -->
    <div class="video-card" @click="open">
      <img :src="thumbnail" />
      <div class="play-btn">▶</div>
    </div>

    <!-- 弹窗 -->
    <div v-if="visible" class="video-modal" @click.self="close">
      <div class="video-wrapper">
        <iframe
          :src="embedUrl"
          frameborder="0"
          allow="autoplay; encrypted-media"
          allowfullscreen
        ></iframe>

        <span class="close-btn" @click="close">✕</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  videoId: String,
});

const visible = ref(false);

const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

const embedUrl = computed(() => {
  return `https://www.youtube.com/embed/${props.videoId}?autoplay=1`;
});

const thumbnail = computed(() => {
  return `https://img.youtube.com/vi/${props.videoId}/hqdefault.jpg`;
});
</script>