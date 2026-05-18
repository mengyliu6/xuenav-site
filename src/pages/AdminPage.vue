<template>
  <div class="admin-page">
    <header class="admin-topbar">
      <div>
        <span>XUENAV 管理后台</span>
        <h1>商品内容管理</h1>
      </div>
      <RouterLink to="/" class="secondary-btn">返回官网</RouterLink>
    </header>

    <main v-if="!unlocked" class="admin-auth">
      <form @submit.prevent="unlockAdmin">
        <span>XUENAV Admin</span>
        <h2>请输入后台密码</h2>
        <p>测试版为前端密码挡板，正式后台需要服务端登录鉴权。</p>
        <input
          v-model="passwordInput"
          type="password"
          autocomplete="current-password"
          placeholder="后台密码"
        />
        <button type="submit" class="primary-btn">进入后台</button>
      </form>
    </main>

    <main v-else class="admin-shell">
      <aside class="admin-sidebar">
        <label class="admin-search">
          <span>搜索商品</span>
          <input v-model="keyword" type="search" placeholder="输入车型或产品名称" />
        </label>

        <div class="admin-product-list">
          <button
            v-for="item in filteredProducts"
            :key="item.id"
            type="button"
            :class="{ active: item.id === selectedId }"
            @click="selectProduct(item.id)"
          >
            <strong>{{ item.name || "Untitled product" }}</strong>
            <small>{{ item.id }}</small>
          </button>
        </div>
      </aside>

      <section v-if="selectedProduct" class="admin-editor">
        <div class="admin-notice">
          <strong>当前为测试版后台。</strong>
          <span>
            内容保存在本机浏览器，可用于内部编辑体验和导出 JSON；正式上线给所有访客生效，需要接入数据库、图片存储和真实登录鉴权。
          </span>
        </div>

        <div class="admin-card">
          <div class="admin-section-title">
            <span>Basic Info</span>
            <h2>基础信息</h2>
          </div>

          <div class="admin-form-grid">
            <label>
              <span>商品名称</span>
              <input v-model="draft.name" type="text" />
            </label>

            <label>
              <span>封面图片 URL</span>
              <input v-model="draft.image" type="url" placeholder="https://..." />
            </label>

            <label>
              <span>YouTube 视频链接</span>
              <input v-model="draft.videoUrl" type="url" placeholder="可留空" />
            </label>
          </div>
        </div>

        <div class="admin-card">
          <div class="admin-section-title">
            <span>Gallery</span>
            <h2>商品图片</h2>
          </div>

          <div class="admin-repeater">
            <div
              v-for="(image, index) in draft.gallery"
              :key="index"
              class="admin-repeat-item"
            >
              <label>
                <span>图片 URL</span>
                <input v-model="image.url" type="url" placeholder="https://..." />
              </label>
              <label>
                <span>图片说明</span>
                <input v-model="image.caption" type="text" placeholder="例如：安装后效果" />
              </label>
              <label>
                <span>本地图片转入</span>
                <input type="file" accept="image/*" @change="uploadImage($event, image)" />
              </label>
              <button type="button" class="admin-danger" @click="removeGallery(index)">
                删除图片
              </button>
            </div>
          </div>

          <button type="button" class="admin-add-btn" @click="addGallery">
            添加图片
          </button>
        </div>

        <div class="admin-card">
          <div class="admin-section-title">
            <span>FAQ</span>
            <h2>商品专属 FAQ</h2>
          </div>

          <div class="admin-repeater">
            <div
              v-for="(faq, index) in draft.faqs"
              :key="index"
              class="admin-repeat-item admin-faq-edit"
            >
              <label>
                <span>问题</span>
                <input v-model="faq.question" type="text" placeholder="请输入问题" />
              </label>
              <label>
                <span>回答</span>
                <textarea v-model="faq.answer" rows="4" placeholder="请输入回答"></textarea>
              </label>

              <div class="admin-faq-images">
                <div
                  v-for="(image, imageIndex) in faq.images"
                  :key="imageIndex"
                  class="admin-inline-image"
                >
                  <input v-model="image.url" type="url" placeholder="FAQ 图片 URL" />
                  <input v-model="image.caption" type="text" placeholder="图片说明" />
                  <button
                    type="button"
                    class="admin-danger"
                    @click="removeFaqImage(index, imageIndex)"
                  >
                    删除
                  </button>
                </div>
                <button type="button" class="admin-add-btn" @click="addFaqImage(index)">
                  添加 FAQ 图片
                </button>
              </div>

              <button type="button" class="admin-danger" @click="removeFaq(index)">
                删除 FAQ
              </button>
            </div>
          </div>

          <button type="button" class="admin-add-btn" @click="addFaq">
            添加 FAQ
          </button>
        </div>

        <div class="admin-actions">
          <button type="button" class="primary-btn" @click="saveCurrent">
            保存当前商品
          </button>
          <button type="button" class="secondary-btn" @click="resetCurrent">
            清空当前商品自定义内容
          </button>
          <button type="button" class="secondary-btn" @click="exportContent">
            导出 JSON
          </button>
        </div>

        <div class="admin-card">
          <div class="admin-section-title">
            <span>Import / Export</span>
            <h2>导入导出</h2>
          </div>
          <textarea
            v-model="jsonBuffer"
            rows="8"
            class="admin-json"
            placeholder="导出的 JSON 会显示在这里，也可以粘贴 JSON 后点击导入"
          ></textarea>
          <button type="button" class="admin-add-btn" @click="importContent">
            导入 JSON
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { products } from "../data/products";
import {
  loadAdminContent,
  saveAdminContent,
  getProductOverride,
  mergeProductsContent,
} from "../utils/contentManager";

const keyword = ref("");
const content = ref(loadAdminContent());
const selectedId = ref(products[0]?.id || "");
const jsonBuffer = ref("");
const passwordInput = ref("");
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "xuenav2026";
const unlocked = ref(window.localStorage.getItem("xuenav_admin_unlocked") === "1");

const clone = (value) => JSON.parse(JSON.stringify(value));

const createDraft = (productId) => {
  const product = products.find((item) => item.id === productId) || products[0];
  const override = getProductOverride(product.id, content.value);

  return {
    name: override.name ?? product.name ?? "",
    image: override.image ?? product.image ?? "",
    videoUrl: override.videoUrl ?? product.videoUrl ?? "",
    gallery: Array.isArray(override.gallery)
      ? clone(override.gallery)
      : [],
    faqs: Array.isArray(override.faqs) ? clone(override.faqs) : [],
  };
};

const draft = reactive(createDraft(selectedId.value));

const managedProducts = computed(() => mergeProductsContent(products, content.value));

const filteredProducts = computed(() => {
  const text = keyword.value.trim().toLowerCase();
  if (!text) return managedProducts.value;

  return managedProducts.value.filter((item) =>
    `${item.name} ${item.id}`.toLowerCase().includes(text)
  );
});

const selectedProduct = computed(() =>
  managedProducts.value.find((item) => item.id === selectedId.value)
);

const applyDraft = (nextDraft) => {
  draft.name = nextDraft.name;
  draft.image = nextDraft.image;
  draft.videoUrl = nextDraft.videoUrl;
  draft.gallery = nextDraft.gallery;
  draft.faqs = nextDraft.faqs;
};

const selectProduct = (productId) => {
  selectedId.value = productId;
  applyDraft(createDraft(productId));
};

const addGallery = () => {
  draft.gallery.push({ url: "", caption: "" });
};

const removeGallery = (index) => {
  draft.gallery.splice(index, 1);
};

const addFaq = () => {
  draft.faqs.push({ question: "", answer: "", images: [] });
};

const removeFaq = (index) => {
  draft.faqs.splice(index, 1);
};

const addFaqImage = (faqIndex) => {
  draft.faqs[faqIndex].images ||= [];
  draft.faqs[faqIndex].images.push({ url: "", caption: "" });
};

const removeFaqImage = (faqIndex, imageIndex) => {
  draft.faqs[faqIndex].images.splice(imageIndex, 1);
};

const uploadImage = (event, target) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    target.url = String(reader.result || "");
  };
  reader.readAsDataURL(file);
};

const saveCurrent = () => {
  content.value.products ||= {};
  content.value.products[selectedId.value] = clone(draft);
  saveAdminContent(content.value);
  jsonBuffer.value = JSON.stringify(content.value, null, 2);
};

const resetCurrent = () => {
  delete content.value.products[selectedId.value];
  saveAdminContent(content.value);
  applyDraft(createDraft(selectedId.value));
};

const exportContent = () => {
  jsonBuffer.value = JSON.stringify(content.value, null, 2);
};

const importContent = () => {
  try {
    const parsed = JSON.parse(jsonBuffer.value);
    content.value = {
      products: parsed?.products && typeof parsed.products === "object"
        ? parsed.products
        : {},
    };
    saveAdminContent(content.value);
    applyDraft(createDraft(selectedId.value));
  } catch {
    window.alert("JSON 格式不正确，请检查后再导入。");
  }
};

const unlockAdmin = () => {
  if (passwordInput.value !== adminPassword) {
    window.alert("密码不正确。");
    return;
  }

  window.localStorage.setItem("xuenav_admin_unlocked", "1");
  unlocked.value = true;
};
</script>
