<template>
  <div class="admin-page">
    <header class="admin-topbar">
      <div>
        <span>XUENAV Internal CMS</span>
        <h1>飞书内容管理后台</h1>
      </div>

      <div class="admin-topbar__actions">
        <a
          v-if="bitableUrl"
          class="primary-btn"
          :href="bitableUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          打开飞书表格
        </a>
        <RouterLink to="/" class="secondary-btn">返回官网</RouterLink>
      </div>
    </header>

    <main class="admin-dashboard">
      <section class="admin-status-card">
        <div>
          <span class="section-eyebrow">Connection</span>
          <h2>{{ statusTitle }}</h2>
          <p>{{ statusText }}</p>
        </div>

        <button type="button" class="secondary-btn" @click="loadContent">
          刷新同步状态
        </button>
      </section>

      <section class="admin-metric-grid">
        <article>
          <span>Products</span>
          <strong>{{ stats.products }}</strong>
          <p>已同步商品</p>
        </article>
        <article>
          <span>FAQ</span>
          <strong>{{ stats.faqs }}</strong>
          <p>商品专属 FAQ</p>
        </article>
        <article>
          <span>Images</span>
          <strong>{{ stats.images }}</strong>
          <p>封面 / FAQ 图片</p>
        </article>
      </section>

      <section class="admin-content-grid">
        <article class="admin-card">
          <div class="admin-section-title">
            <span>Content</span>
            <h2>商品内容状态</h2>
          </div>

          <div class="admin-product-table">
            <div class="admin-product-table__head">
              <span>Product ID</span>
              <span>Name</span>
              <span>Video</span>
              <span>FAQ</span>
            </div>

            <div
              v-for="item in productRows"
              :key="item.id"
              class="admin-product-row"
            >
              <code>{{ item.id }}</code>
              <strong>{{ item.name || "未填写商品名称" }}</strong>
              <span>{{ item.videoUrl ? "已配置" : "未配置" }}</span>
              <span>{{ item.faqCount }}</span>
            </div>
          </div>
        </article>

        <aside class="admin-card">
          <div class="admin-section-title">
            <span>How To Edit</span>
            <h2>编辑方式</h2>
          </div>

          <ol class="admin-steps">
            <li>在飞书 Products 表编辑商品名称、封面图、视频链接。</li>
            <li>在 FAQs 表添加每个商品的专属 FAQ，可插入多张 FAQ 图片。</li>
            <li>确认 Status 为 Published 或 已发布。</li>
            <li>回到本页面点击“刷新同步状态”。</li>
          </ol>

          <div class="admin-env-list">
            <code>Products: Product ID / Name / Cover Image / Video URL</code>
            <code>FAQs: Product ID / Question / Answer / Images</code>
          </div>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

const bitableUrl = import.meta.env.VITE_FEISHU_BITABLE_URL || "";
const content = ref({ configured: false, products: {} });
const loading = ref(false);
const error = ref("");

const productRows = computed(() =>
  Object.entries(content.value.products || {}).map(([id, item]) => ({
    id,
    name: item?.name || "",
    videoUrl: item?.videoUrl || "",
    faqCount: Array.isArray(item?.faqs) ? item.faqs.length : 0,
    imageCount:
      (item?.image ? 1 : 0) +
      (Array.isArray(item?.faqs)
        ? item.faqs.reduce(
            (total, faq) => total + (Array.isArray(faq.images) ? faq.images.length : 0),
            0
          )
        : 0),
  }))
);

const stats = computed(() => ({
  products: productRows.value.length,
  faqs: productRows.value.reduce((total, item) => total + item.faqCount, 0),
  images: productRows.value.reduce((total, item) => total + item.imageCount, 0),
}));

const statusTitle = computed(() => {
  if (loading.value) return "正在读取飞书内容...";
  if (error.value) return "飞书同步异常";
  if (content.value.configured) return "飞书后台已连接";
  return "飞书后台未完成配置";
});

const statusText = computed(() => {
  if (loading.value) return "正在通过 Vercel API 读取 /api/content。";
  if (error.value) return error.value;
  if (content.value.configured) {
    return "环境变量已生效，官网会读取飞书多维表格里的商品和 FAQ 内容。";
  }
  return "请检查 Vercel 环境变量，并重新部署测试环境。";
});

const loadContent = async () => {
  loading.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/content", {
      headers: { accept: "application/json" },
    });
    const data = await response.json();
    content.value = data;
    error.value = data?.error || "";
  } catch (err) {
    error.value = err?.message || "读取 /api/content 失败。";
  } finally {
    loading.value = false;
  }
};

onMounted(loadContent);
</script>
