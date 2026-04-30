<template>
  <main class="product-detail-page">
    <div class="container">
      <nav class="product-breadcrumb">
        <RouterLink to="/">Home</RouterLink>
        <span>/</span>
        <span>Product Detail</span>
      </nav>

      <template v-if="product">
        <section class="product-hero">
          <div class="product-hero__media">
            <VideoModal
              :video-url="product.videoUrl || product.videoId"
              :cover="product.image"
              :start="product.start || 0"
            />
          </div>

          <div class="product-hero__content">
            <span class="product-eyebrow">OEM Style Upgrade Solution</span>

            <h1>{{ product.name }}</h1>

            <p class="product-summary">
              Professional car multimedia upgrade solution with stable fitment,
              modern interface and installation support for global B2B customers.
            </p>

            <div class="product-badges">
              <span>Vehicle Specific</span>
              <span>Factory Style</span>
              <span>Installation Support</span>
            </div>

            <div class="product-actions">
              <a class="primary-btn" :href="whatsappUrl" target="_blank">
                Get Quote
              </a>

              <a class="secondary-btn" :href="emailUrl">
                Email Us
              </a>
            </div>

            <div class="trust-row">
              <div>
                <strong>10+</strong>
                <span>Years Experience</span>
              </div>
              <div>
                <strong>B2B</strong>
                <span>Wholesale Supply</span>
              </div>
              <div>
                <strong>Fast</strong>
                <span>Online Response</span>
              </div>
            </div>
          </div>
        </section>

        <section class="detail-grid">
          <article class="detail-card">
            <div class="section-title">
              <span>Support Process</span>
              <h2>After-Sales Support</h2>
            </div>

            <div class="feature-list">
              <div
                v-for="(item, index) in featureList"
                :key="item.title"
                class="feature-item"
              >
                <span class="feature-number">{{ index + 1 }}</span>
                <div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.desc }}</p>
                </div>
              </div>
            </div>
          </article>

          <aside class="detail-card specification-card">
            <div class="section-title">
              <span>Service Info</span>
              <h2>Support Details</h2>
            </div>

            <div class="spec-table">
              <div v-for="row in specRows" :key="row.label">
                <span>{{ row.label }}</span>
                <strong>{{ row.value }}</strong>
              </div>
            </div>
          </aside>
        </section>

        <section class="inquiry-banner">
          <div>
            <span>Need after-sales support?</span>
            <h2>Send us your order number, car model, year and issue video.</h2>
          </div>

          <a class="primary-btn white-btn" :href="whatsappUrl" target="_blank">
            Get Support Now
          </a>
        </section>
      </template>

      <template v-else>
        <section class="not-found-box">
          <h1>Product not found</h1>
          <RouterLink to="/">Back to Home</RouterLink>
        </section>
      </template>
    </div>
  </main>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { products } from "../data/products";
import VideoModal from "../components/VideoModal.vue";

const route = useRoute();

const product = computed(() =>
  products.find((item) => item.id === route.params.id)
);

const whatsappNumber = "8613800000000";
const email = "xuenav666@163.com";

const whatsappUrl = computed(() => {
  const productName = product.value?.name || "your car radio product";

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello, I want to know more about ${productName}.`
  )}`;
});

const emailUrl = computed(() => {
  const subject = product.value?.name || "Product Inquiry";

  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
});

const featureList = computed(() => [
  {
    title: "Confirm Your Product Model",
    desc: "Send us your order number, car model, year and product photo so we can confirm the correct device and version.",
  },
  {
    title: "Installation Troubleshooting",
    desc: "We help check common installation issues such as wiring, CANBUS, screen display, sound, camera and steering wheel control.",
  },
  {
    title: "Photo & Video Diagnosis",
    desc: "Please provide clear photos or a short video of the problem. This helps us find the cause faster and give the right solution.",
  },
  {
    title: "Solution Follow-Up",
    desc: "Our support team will guide you step by step and provide matching suggestions, settings guidance or further after-sales help.",
  },
]);

const specRows = computed(() => {
  const name = product.value?.name || "";

  return [
    {
      label: "Product",
      value: name,
    },
    {
      label: "Service Type",
      value: "After-sales support",
    },
    {
      label: "Required Info",
      value: "Order No. / Car model / Issue video",
    },
    {
      label: "Support",
      value: "Installation & troubleshooting guidance",
    },
    {
      label: "Contact",
      value: "WhatsApp / Email",
    },
  ];
});
</script>