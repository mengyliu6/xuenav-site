<template>
  <section class="hero-banner" :style="heroStyle">
    <div class="hero-mask">
      <div class="container hero-content">
        <h1>XUENAV</h1>

        <h2>
          AFTER-SALES SUPPORT<br />
          CENTER
        </h2>

        <p>
          Professional support for OEM integration systems and multimedia upgrades.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import heroBackground from "../assets/images/product/chevrolet-camaro-radio-2010-2015.jpg.jpeg";

const heroStyle = {
  "--hero-bg": `url("${heroBackground}")`,
};
</script>
