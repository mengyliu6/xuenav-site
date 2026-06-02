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
          <span class="product-eyebrow">{{ BRAND.name }} Support Center</span>
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

            <section v-if="productFaqSections.length" class="faq-product-sections">
              <div class="section-title">
                <span>Product FAQ</span>
                <h2>Product-Specific Support</h2>
              </div>

              <article
                v-for="product in productFaqSections"
                :key="product.id"
                class="faq-product-section"
              >
                <div class="faq-product-section__head">
                  <div>
                    <span>{{ product.faqs.length }} {{ product.faqs.length > 1 ? "FAQs" : "FAQ" }}</span>
                    <h3>{{ product.name || product.id }}</h3>
                  </div>
                  <RouterLink class="secondary-btn" :to="`/product/${product.id}`">
                    View Product
                  </RouterLink>
                </div>

                <FaqList :items="product.faqs" />
              </article>
            </section>
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
              v-if="CONTACT.whatsappNumber"
              class="primary-btn"
              :href="CONTACT.whatsappLink(`Hello, I need ${BRAND.name} after-sales support. My question is: `)"
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
import { products } from "../data/products";
import { BRAND, CONTACT } from "../config/contact";
import {
  getCachedContent,
  loadRemoteContent,
  mergeProductsContent,
} from "../utils/contentManager";

const fallbackFaqs = BRAND.siteKey === "xuenav" ? faqs : [];
const fallbackProducts = BRAND.siteKey === "xuenav" ? products : [];
const content = ref(
  getCachedContent(BRAND.siteKey) || { configured: false, products: {}, defaultFaqs: [] }
);
const managedFaqs = computed(() =>
  content.value.defaultFaqs?.length ? content.value.defaultFaqs : fallbackFaqs
);
const productFaqSections = computed(() =>
  mergeProductsContent(fallbackProducts, content.value).filter(
    (product) => product.hasCustomFaqs && product.faqs?.length
  )
);

onMounted(async () => {
  content.value = await loadRemoteContent(content.value, BRAND.siteKey);
});
</script>
