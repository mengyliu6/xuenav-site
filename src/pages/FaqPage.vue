<template>
  <div class="site-wrap">
    <HeaderBar />
    <NavBar />

    <main class="faq-page">
      <div class="container">
        <nav class="product-breadcrumb">
          <RouterLink to="/">Home</RouterLink>
          <span>/</span>
          <span>FAQ</span>
        </nav>

        <section class="faq-hero">
          <span class="product-eyebrow">Xuenav Support Center</span>
          <h1>Frequently Asked Questions</h1>
          <p>
            Quick answers for model confirmation, installation troubleshooting,
            video support and after-sales service.
          </p>
        </section>

        <section class="faq-page-grid">
          <article class="detail-card faq-page-card">
            <div class="section-title">
              <span>Support FAQ</span>
              <h2>Before You Contact Us</h2>
            </div>

            <FaqList :items="managedFaqs" />
          </article>

          <aside class="detail-card faq-contact-card">
            <div class="section-title">
              <span>Need Help</span>
              <h2>Send Us Details</h2>
            </div>

            <p>
              For faster diagnosis, include your order number, car model, year,
              product photos and a short issue video.
            </p>

            <a
              class="primary-btn"
              :href="CONTACT.whatsappLink('Hello, I need Xuenav after-sales support. My question is: ')"
              target="_blank"
              rel="noopener noreferrer"
            >
              Chat on WhatsApp
            </a>
          </aside>
        </section>
      </div>
    </main>

    <FooterBar />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import HeaderBar from "../components/HeaderBar.vue";
import NavBar from "../components/NavBar.vue";
import FooterBar from "../components/FooterBar.vue";
import FaqList from "../components/FaqList.vue";
import { faqs } from "../data/faqs";
import { CONTACT } from "../config/contact";
import { loadRemoteContent } from "../utils/contentManager";

const content = ref({ configured: false, products: {}, defaultFaqs: [] });
const managedFaqs = computed(() =>
  content.value.defaultFaqs?.length ? content.value.defaultFaqs : faqs
);

onMounted(async () => {
  content.value = await loadRemoteContent(content.value);
});
</script>
