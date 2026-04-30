<template>
  <div class="site-wrap">
    <HeaderBar />
    <NavBar />

    <main class="product-detail-page">
      <div class="container">
        <nav class="product-breadcrumb">
          <RouterLink to="/">Home</RouterLink>
          <span>/</span>
          <RouterLink to="/">Product Support</RouterLink>
          <span>/</span>
          <span>{{ product?.name || "Product Detail" }}</span>
        </nav>

        <template v-if="product">
          <section class="product-hero">
            <div class="product-hero__media">
              <VideoModal
                :video-url="product.videoUrl || product.video"
                :video-id="product.videoId"
                :cover="product.image"
                :start="product.start || 0"
              />
            </div>

            <div class="product-hero__content">
              <span class="product-eyebrow">Xuenav After-Sales Support</span>

              <h1>{{ product.name }}</h1>

              <p class="product-summary">
                Get installation guidance, troubleshooting support and product
                confirmation for your Xuenav multimedia upgrade system.
              </p>

              <div class="product-badges">
                <span>Installation Support</span>
                <span>Model Confirmation</span>
                <span>Issue Diagnosis</span>
              </div>

              <div class="product-actions">
                <a class="primary-btn" :href="whatsappUrl" target="_blank">
                  Get Support Now
                </a>

                <a class="secondary-btn" :href="emailUrl">
                  Email Support
                </a>
              </div>

              <div class="trust-row">
                <div>
                  <strong>Fast</strong>
                  <span>Online Response</span>
                </div>

                <div>
                  <strong>Video</strong>
                  <span>Issue Diagnosis</span>
                </div>

                <div>
                  <strong>Step</strong>
                  <span>Guided Support</span>
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
              <h2>
                Send us your order number, car model, year and issue video.
              </h2>
            </div>

            <a class="primary-btn white-btn" :href="whatsappUrl" target="_blank">
              Contact Us
            </a>
          </section>
        </template>

        <template v-else>
          <section class="not-found-box">
            <h1>Product not found</h1>
            <p>Please return to the product support center.</p>
            <RouterLink to="/">Back to Home</RouterLink>
          </section>
        </template>
      </div>
    </main>

    <FooterBar />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import HeaderBar from "../components/HeaderBar.vue";
import NavBar from "../components/NavBar.vue";
import FooterBar from "../components/FooterBar.vue";
import VideoModal from "../components/VideoModal.vue";
import { products } from "../data/products";
import { CONTACT } from "../config/contact";

const route = useRoute();

const product = computed(() =>
  products.find((item) => item.id === route.params.id)
);



const whatsappUrl = computed(() => {
  const productName = product.value?.name || "Xuenav product";

  return CONTACT.whatsappLink(
    `Hello, I need after-sales support for ${productName}. My car model/year is: . My issue is: .`
  );
});

const emailUrl = computed(() => {
  const subject = product.value?.name
    ? `After-sales support - ${product.value.name}`
    : "Xuenav After-sales Support";

  return CONTACT.emailLink(subject);
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
      value: `${CONTACT.whatsappDisplay} / ${CONTACT.email}`,
    }
  ];
});
</script>