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
        <figure v-for="(image, imageIndex) in item.images" :key="image.url">
          <button
            type="button"
            class="faq-image-trigger"
            :aria-label="`Preview image ${imageIndex + 1} for ${item.question}`"
            @click="openPreview(item, imageIndex)"
          >
            <img
              :src="image.url"
              :alt="image.caption || item.question"
              loading="lazy"
              decoding="async"
            />
          </button>
          <figcaption v-if="visibleCaption(image.caption)">{{ image.caption }}</figcaption>
        </figure>
      </div>
    </details>

    <Teleport to="body">
      <div
        v-if="preview.item"
        class="faq-lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="preview.item.question"
        @click.self="closePreview"
      >
        <button
          type="button"
          class="faq-lightbox__close"
          aria-label="Close image preview"
          @click="closePreview"
        >
          &times;
        </button>
        <button
          v-if="previewImages.length > 1"
          type="button"
          class="faq-lightbox__nav faq-lightbox__nav--previous"
          aria-label="Previous image"
          @click="showPrevious"
        >
          &#8249;
        </button>
        <figure class="faq-lightbox__figure">
          <img
            :src="activeImage.url"
            :alt="activeImage.caption || preview.item.question"
          />
          <figcaption v-if="visibleCaption(activeImage.caption)">
            {{ activeImage.caption }}
          </figcaption>
          <span v-if="previewImages.length > 1" class="faq-lightbox__count">
            {{ preview.index + 1 }} / {{ previewImages.length }}
          </span>
        </figure>
        <button
          v-if="previewImages.length > 1"
          type="button"
          class="faq-lightbox__nav faq-lightbox__nav--next"
          aria-label="Next image"
          @click="showNext"
        >
          &#8250;
        </button>
        <a
          class="faq-lightbox__download"
          :href="downloadUrl"
          :download="downloadName"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download
        </a>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive } from "vue";

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

const preview = reactive({
  item: null,
  index: 0,
});

const previewImages = computed(() => preview.item?.images || []);
const activeImage = computed(() => previewImages.value[preview.index] || {});
const downloadName = computed(() => {
  const pathname = String(activeImage.value.url || "").split("?")[0];
  return pathname.split("/").pop() || "faq-image";
});
const downloadUrl = computed(() => {
  const url = String(activeImage.value.url || "");
  if (!url.includes(".blob.vercel-storage.com")) return url;

  return `${url}${url.includes("?") ? "&" : "?"}download=1`;
});

const visibleCaption = (caption = "") => {
  const text = String(caption || "").trim();
  return text && !/^https?:\/\//i.test(text);
};

const openPreview = (item, index) => {
  preview.item = item;
  preview.index = index;
  document.body.classList.add("lightbox-open");
  window.addEventListener("keydown", handleKeydown);
};

const closePreview = () => {
  preview.item = null;
  preview.index = 0;
  document.body.classList.remove("lightbox-open");
  window.removeEventListener("keydown", handleKeydown);
};

const showPrevious = () => {
  preview.index =
    (preview.index - 1 + previewImages.value.length) % previewImages.value.length;
};

const showNext = () => {
  preview.index = (preview.index + 1) % previewImages.value.length;
};

const handleKeydown = (event) => {
  if (event.key === "Escape") closePreview();
  if (event.key === "ArrowLeft" && previewImages.value.length > 1) showPrevious();
  if (event.key === "ArrowRight" && previewImages.value.length > 1) showNext();
};

onBeforeUnmount(closePreview);
</script>
