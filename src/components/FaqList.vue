<template>
  <div class="faq-list">
    <article
      v-for="(item, index) in faqItems"
      :key="faqKey(item, index)"
      class="faq-item"
      :class="{
        'is-collapsible': isCollapsible(item, index),
        'is-expanded': isExpanded(item, index),
        'is-default-collapsed': defaultCollapsed,
      }"
    >
      <div class="faq-question-row">
        <h3 class="faq-question">{{ item.question }}</h3>
        <button
          v-if="isCollapsible(item, index)"
          type="button"
          class="faq-toggle"
          :aria-expanded="isExpanded(item, index)"
          @click="toggleAnswer(item, index)"
        >
          {{ isExpanded(item, index) ? "Hide answer" : "View answer" }}
        </button>
      </div>

      <div
        class="faq-item-content"
        :class="{ 'is-hidden': defaultCollapsed && !isExpanded(item, index) }"
      >
        <p
          :ref="(el) => setAnswerRef(faqKey(item, index), el)"
          class="faq-answer"
          :class="{
            'is-clamped': isTextClamped(item, index),
          }"
        >
          {{ item.answer }}
        </p>

        <div
          v-if="item.videoUrl || item.images?.length"
          class="faq-media-panel"
          :class="{
            'has-video': item.videoUrl,
            'has-images': item.images?.length,
          }"
        >
          <div v-if="item.videoUrl" class="faq-video-block">
            <span class="faq-media-label">Video guide</span>
            <VideoModal
              :video-url="item.videoUrl"
              :title="item.question"
              image-loading="lazy"
              image-fetch-priority="low"
            />
          </div>

          <div v-if="item.images?.length" class="faq-image-block">
            <div class="faq-media-label-row">
              <span class="faq-media-label">Reference images</span>
              <small>{{ item.images.length }} {{ item.images.length > 1 ? "images" : "image" }}</small>
            </div>
            <div class="faq-image-grid">
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
          </div>
        </div>
      </div>
    </article>

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
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  reactive,
  ref,
} from "vue";
import VideoModal from "./VideoModal.vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  openFirst: {
    type: Boolean,
    default: true,
  },
  defaultCollapsed: {
    type: Boolean,
    default: false,
  },
});

const faqItems = computed(() => props.items || []);
const answerElements = new Map();
const overflowKeys = ref(new Set());
const expandedKeys = ref(new Set());

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

const faqKey = (item, index) =>
  `${item?.recordId || item?.id || item?.question || "faq"}-${index}`;

const sameSet = (left, right) =>
  left.size === right.size && [...left].every((item) => right.has(item));

const setAnswerRef = (key, el) => {
  if (el) {
    answerElements.set(key, el);
    return;
  }

  answerElements.delete(key);
};

const measureAnswerOverflow = () => {
  nextTick(() => {
    const nextOverflowKeys = new Set();

    answerElements.forEach((el, key) => {
      const style = window.getComputedStyle(el);
      const fontSize = Number.parseFloat(style.fontSize) || 16;
      const lineHeight =
        Number.parseFloat(style.lineHeight) || Math.round(fontSize * 1.75);
      const maxHeight = lineHeight * 4;

      if (el.scrollHeight > maxHeight + 2) {
        nextOverflowKeys.add(key);
      }
    });

    if (!sameSet(nextOverflowKeys, overflowKeys.value)) {
      overflowKeys.value = nextOverflowKeys;
    }
  });
};

const isCollapsible = (item, index) =>
  props.defaultCollapsed || overflowKeys.value.has(faqKey(item, index));
const isExpanded = (item, index) => expandedKeys.value.has(faqKey(item, index));
const isTextClamped = (item, index) =>
  !props.defaultCollapsed &&
  overflowKeys.value.has(faqKey(item, index)) &&
  !isExpanded(item, index);

const toggleAnswer = (item, index) => {
  const key = faqKey(item, index);
  const nextExpandedKeys = new Set(expandedKeys.value);

  if (nextExpandedKeys.has(key)) {
    nextExpandedKeys.delete(key);
  } else {
    nextExpandedKeys.add(key);
  }

  expandedKeys.value = nextExpandedKeys;
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

onMounted(measureAnswerOverflow);
onUpdated(measureAnswerOverflow);
onBeforeUnmount(closePreview);
</script>
