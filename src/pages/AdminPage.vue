<template>
  <div class="admin-page">
    <div
      v-if="toast.message"
      class="admin-toast"
      :class="`admin-toast--${toast.type}`"
    >
      {{ toast.message }}
    </div>

    <header class="admin-topbar">
      <div class="admin-topbar__brand">
        <span>XUENAV Admin</span>
        <h1>XUENAV 后台管理</h1>
      </div>

      <section v-if="token" class="admin-status-card admin-status-card--topbar">
        <div>
          <h2>{{ statusTitle }}</h2>
          <p>{{ statusText }}</p>
        </div>

        <div class="admin-status-actions">
          <button
            type="button"
            class="secondary-btn"
            :disabled="loading"
            @click="loadAdminContent"
          >
            刷新数据
          </button>
          <button type="button" class="secondary-btn" @click="clearToken">
            退出登录
          </button>
        </div>
      </section>

      <div class="admin-topbar__actions">
        <a
          v-if="bitableUrl"
          class="primary-btn"
          :href="bitableUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          打开数据表
        </a>
      </div>
    </header>

    <main v-if="!token" class="admin-auth">
      <form @submit.prevent="saveToken">
        <span>运营后台登录</span>
        <h2>请输入后台管理令牌</h2>
        <p>
          登录后可以维护官网商品、封面图片、商品 FAQ 和全站默认
          FAQ。令牌由技术同事在 Vercel 环境变量
          <code>ADMIN_API_TOKEN</code> 中配置。
        </p>
        <input
          v-model="tokenInput"
          type="password"
          placeholder="请输入 Admin Token"
        />
        <button type="submit" class="primary-btn">进入后台</button>
      </form>
    </main>

    <main
      v-else-if="showingInitialLoader"
      class="admin-loading-stage"
      aria-live="polite"
      aria-busy="true"
    >
      <section class="admin-loading-card">
        <div class="admin-loading-illustration">
          <span class="admin-loading-orbit admin-loading-orbit--one" aria-hidden="true"></span>
          <span class="admin-loading-orbit admin-loading-orbit--two" aria-hidden="true"></span>
          <img :src="adminLoadingDoodle" alt="" />
        </div>
        <span class="admin-loading-eyebrow">XUENAV Admin</span>
        <h2>正在同步后台数据</h2>
        <p>正在读取商品、FAQ 与图片内容，请稍等片刻。</p>
        <div class="admin-loading-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </section>
    </main>

    <main v-else class="admin-workspace">
      <section class="admin-management-layout">
        <aside class="admin-left-rail">
          <nav class="admin-tabs" aria-label="后台管理导航">
            <button
              type="button"
              :class="{ active: activeTab === 'products' }"
              @click="activeTab = 'products'"
            >
              商品管理
            </button>
            <button
              type="button"
              :class="{ active: activeTab === 'defaultFaq' }"
              @click="activeTab = 'defaultFaq'"
            >
              默认 FAQ
            </button>
          </nav>

          <aside
            v-if="activeTab === 'products'"
            class="admin-card admin-sidebar"
          >
            <div class="admin-section-title">
              <span>商品</span>
              <h2>商品列表</h2>
            </div>

            <button type="button" class="admin-add-btn" @click="newProduct">
              新增商品
            </button>

            <p class="admin-sort-tip">按住排序图标拖动，松开后自动保存展示顺序。</p>

            <div class="admin-product-list">
              <button
                v-for="(item, index) in sortedProducts"
                :key="item.recordId || item.productId"
                type="button"
                :draggable="!loading && !uploading"
                :aria-grabbed="draggingProductId === itemKey(item)"
                :class="{
                  active: item.productId === productDraft.productId,
                  'is-dragging': draggingProductId === itemKey(item),
                  'is-drop-target': dragOverProductId === itemKey(item),
                }"
                @dragstart="startProductDrag(item)"
                @dragenter.prevent="setProductDropTarget(item)"
                @dragover.prevent="setProductDropTarget(item)"
                @drop.prevent="dropProduct(index)"
                @dragend="endDrag"
                @click="selectProduct(item)"
              >
                <span class="admin-drag-handle" aria-hidden="true">↕</span>
                <strong>{{ item.name || "未命名商品" }}</strong>
                <small>{{ item.productId || "未填写商品 ID" }}</small>
              </button>
            </div>
          </aside>
        </aside>

        <section v-if="activeTab === 'products'" class="admin-editor-main">
          <article class="admin-card">
            <div class="admin-card-head">
              <div class="admin-section-title">
                <span>商品编辑</span>
                <h2>基础信息</h2>
              </div>
            </div>

            <div class="admin-form-grid admin-product-form-grid">
              <label>
                <span>商品 ID</span>
                <input
                  v-model.trim="productDraft.productId"
                  type="text"
                  placeholder="camaro-radio-10-15"
                />
              </label>
              <label>
                <span>商品名称</span>
                <input
                  v-model.trim="productDraft.name"
                  type="text"
                  placeholder="官网显示的商品标题"
                />
              </label>
              <div
                class="admin-upload-field admin-product-image-field"
                :class="{
                  'is-drag-over': activeUploadDropzone === PRODUCT_IMAGE_DROPZONE,
                  'is-uploading': productImageUpload.state === 'uploading',
                }"
                @dragenter.prevent.stop="enterImageDropzone($event, PRODUCT_IMAGE_DROPZONE)"
                @dragover.prevent.stop="enterImageDropzone($event, PRODUCT_IMAGE_DROPZONE)"
                @dragleave.prevent.stop="leaveImageDropzone($event, PRODUCT_IMAGE_DROPZONE)"
                @drop.prevent.stop="dropProductCover"
              >
                <span>商品图片</span>
                <label class="admin-product-image-drop">
                  <input
                    type="file"
                    accept="image/*"
                    :disabled="uploading"
                    @change="uploadProductCover"
                  />
                  <img
                    v-if="productDraft.imagePreview"
                    :src="productDraft.imagePreview"
                    alt="商品图片预览"
                  />
                  <span v-else class="admin-upload-copy">
                    <strong>
                      {{
                        activeUploadDropzone === PRODUCT_IMAGE_DROPZONE
                          ? "释放即可上传"
                          : "拖拽图片到这里"
                      }}
                    </strong>
                    <small>{{ uploading ? "图片处理中..." : "或点击选择图片" }}</small>
                  </span>
                  <span
                    v-if="productDraft.imagePreview && activeUploadDropzone === PRODUCT_IMAGE_DROPZONE"
                    class="admin-image-drop-overlay"
                  >
                    释放替换当前图片
                  </span>
                  <span
                    v-if="productImageUpload.state === 'uploading'"
                    class="admin-upload-spinner"
                    aria-hidden="true"
                  ></span>
                </label>
                <button
                  type="button"
                  class="secondary-btn"
                  :disabled="uploading || !productDraft.image"
                  @click="clearProductImage"
                >
                  清空图片
                </button>
                <p
                  v-if="productImageUpload.message"
                  class="admin-upload-result"
                  :class="`admin-upload-result--${productImageUpload.state}`"
                  role="status"
                >
                  {{ productImageUpload.message }}
                </p>
                <p>
                  上传 JPG/PNG/WebP 后会自动压缩为首页商品图
                  WebP；单张不超过 3 MB，预览无误后点击“保存商品”。
                </p>
              </div>
              <label>
                <span>视频链接</span>
                <input
                  v-model.trim="productDraft.videoUrl"
                  type="url"
                  placeholder="https://www.youtube.com/..."
                />
              </label>
              <label>
                <span>排序</span>
                <input v-model.number="productDraft.sort" type="number" />
              </label>
              <label>
                <span>状态</span>
                <select v-model="productDraft.status">
                  <option>Published</option>
                  <option>Draft</option>
                  <option>Hidden</option>
                </select>
              </label>
            </div>

            <div class="admin-actions">
              <button
                type="button"
                class="primary-btn"
                :disabled="loading || uploading"
                @click="saveProduct"
              >
                保存商品
              </button>
              <button
                v-if="productDraft.recordId"
                type="button"
                class="admin-danger"
                :disabled="loading || uploading"
                @click="deleteProduct"
              >
                删除商品
              </button>
            </div>
          </article>

          <article class="admin-card">
            <div class="admin-card-head">
              <div class="admin-section-title">
                <span>商品 FAQ</span>
                <h2>当前商品常见问题</h2>
              </div>
              <button
                type="button"
                class="admin-preview-btn"
                :disabled="!selectedFaqs.length"
                @click="openFaqPreview(productDraft.productId)"
              >
                预览
              </button>
            </div>

            <div class="admin-faq-list">
              <div
                v-for="(faq, index) in selectedFaqs"
                :key="faq.recordId || faq.localId"
                class="admin-faq-card"
              >
                <div class="admin-card-toolbar">
                  <div class="admin-card-toolbar__meta">
                    <small>FAQ {{ index + 1 }} · 内容编辑</small>
                  </div>
                </div>
                <div class="admin-faq-content-grid">
                  <label>
                    <span>问题</span>
                    <input
                      v-model.trim="faq.question"
                      type="text"
                      placeholder="客户常问的问题"
                    />
                  </label>
                  <label>
                    <span>回答</span>
                    <textarea
                      v-model.trim="faq.answer"
                      rows="3"
                      placeholder="给客户看的标准回答"
                    ></textarea>
                  </label>
                </div>
                <div
                  class="admin-upload-field compact admin-dropzone"
                  :class="{
                    'is-drag-over': activeUploadDropzone === faqDropzoneId(faq),
                    'is-uploading': faq.imageUploadState === 'uploading',
                  }"
                  @dragenter.prevent.stop="enterImageDropzone($event, faqDropzoneId(faq))"
                  @dragover.prevent.stop="enterImageDropzone($event, faqDropzoneId(faq))"
                  @dragleave.prevent.stop="leaveImageDropzone($event, faqDropzoneId(faq))"
                  @drop.prevent.stop="dropFaqImage($event, faq)"
                >
                  <div class="admin-upload-title">
                    <span>FAQ 图片</span>
                    <small v-if="faqImageList(faq).length">
                      已有 {{ faqImageList(faq).length }} 张
                    </small>
                  </div>
                  <label class="admin-file-drop">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      :disabled="uploading"
                      @change="uploadFaqImage($event, faq)"
                    />
                    <strong>
                      {{
                        activeUploadDropzone === faqDropzoneId(faq)
                          ? "释放即可添加这些图片"
                          : faq.imageUploadState === "uploading"
                            ? "正在上传图片..."
                            : "拖拽多张图片到这里，或点击上传"
                      }}
                    </strong>
                    <small>支持一次选择多张图片，单张不超过 3 MB；保存 FAQ 后写入后台。</small>
                    <span
                      v-if="faq.imageUploadState === 'uploading'"
                      class="admin-upload-spinner"
                      aria-hidden="true"
                    ></span>
                  </label>
                  <p
                    v-if="faq.imageUploadMessage"
                    class="admin-upload-result"
                    :class="`admin-upload-result--${faq.imageUploadState}`"
                    role="status"
                  >
                    {{ faq.imageUploadMessage }}
                  </p>
                  <div
                    v-if="faqImageList(faq).length"
                    class="admin-faq-image-preview"
                  >
                    <figure v-for="image in faqImageList(faq)" :key="image">
                      <img :src="image" alt="FAQ 图片预览" />
                      <button
                        type="button"
                        class="admin-image-remove"
                        :disabled="uploading"
                        @click="removeFaqImage(faq, image)"
                      >
                        删除
                      </button>
                    </figure>
                  </div>
                </div>
                <div class="admin-form-grid compact">
                  <label>
                    <span>排序</span>
                    <input v-model.number="faq.sort" type="number" />
                  </label>
                  <label>
                    <span>状态</span>
                    <select v-model="faq.status">
                      <option>Published</option>
                      <option>Draft</option>
                      <option>Hidden</option>
                    </select>
                  </label>
                </div>
                <div class="admin-actions">
                  <button
                    type="button"
                    class="secondary-btn"
                    :disabled="loading || uploading"
                    @click="saveFaq(faq)"
                  >
                    保存 FAQ
                  </button>
                  <button
                    type="button"
                    class="admin-danger"
                    :disabled="loading || uploading"
                    @click="faq.recordId ? deleteFaq(faq) : removeFaqDraft(faq)"
                  >
                    删除 FAQ
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="admin-add-btn"
              :disabled="!savedProductForDraft"
              @click="newFaq"
            >
              新增商品 FAQ
            </button>
          </article>
        </section>

        <section v-else class="admin-editor-main">
          <article class="admin-card">
            <div class="admin-card-head">
              <div class="admin-section-title">
                <span>默认 FAQ</span>
                <h2>全站默认常见问题</h2>
              </div>
              <button
                type="button"
                class="admin-preview-btn"
                :disabled="!defaultFaqs.length"
                @click="openFaqPreview(DEFAULT_FAQ_PRODUCT_ID)"
              >
                预览
              </button>
            </div>

            <p class="admin-help-text">
              这里维护 FAQ 页面默认展示的内容，也会作为没有专属 FAQ
              的商品详情页兜底内容。
            </p>

            <div class="admin-actions admin-import-actions">
              <button
                type="button"
                class="secondary-btn"
                :disabled="loading || uploading"
                @click="importBuiltInFaqs"
              >
                导入网站默认 FAQ
              </button>
              <small>按问题自动跳过已存在的默认 FAQ。</small>
            </div>

            <div class="admin-faq-list">
              <div
                v-for="(faq, index) in defaultFaqs"
                :key="faq.recordId || faq.localId"
                class="admin-faq-card"
              >
                <div class="admin-card-toolbar">
                  <div class="admin-card-toolbar__meta">
                    <small>FAQ {{ index + 1 }} · 内容编辑</small>
                  </div>
                </div>
                <div class="admin-faq-content-grid">
                  <label>
                    <span>问题</span>
                    <input
                      v-model.trim="faq.question"
                      type="text"
                      placeholder="客户常问的问题"
                    />
                  </label>
                  <label>
                    <span>回答</span>
                    <textarea
                      v-model.trim="faq.answer"
                      rows="3"
                      placeholder="默认 FAQ 回答"
                    ></textarea>
                  </label>
                </div>
                <div
                  class="admin-upload-field compact admin-dropzone"
                  :class="{
                    'is-drag-over': activeUploadDropzone === faqDropzoneId(faq),
                    'is-uploading': faq.imageUploadState === 'uploading',
                  }"
                  @dragenter.prevent.stop="enterImageDropzone($event, faqDropzoneId(faq))"
                  @dragover.prevent.stop="enterImageDropzone($event, faqDropzoneId(faq))"
                  @dragleave.prevent.stop="leaveImageDropzone($event, faqDropzoneId(faq))"
                  @drop.prevent.stop="dropFaqImage($event, faq)"
                >
                  <div class="admin-upload-title">
                    <span>FAQ 图片</span>
                    <small v-if="faqImageList(faq).length">
                      已有 {{ faqImageList(faq).length }} 张
                    </small>
                  </div>
                  <label class="admin-file-drop">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      :disabled="uploading"
                      @change="uploadFaqImage($event, faq)"
                    />
                    <strong>
                      {{
                        activeUploadDropzone === faqDropzoneId(faq)
                          ? "释放即可添加这些图片"
                          : faq.imageUploadState === "uploading"
                            ? "正在上传图片..."
                            : "拖拽多张图片到这里，或点击上传"
                      }}
                    </strong>
                    <small>支持一次选择多张图片，单张不超过 3 MB；保存 FAQ 后写入后台。</small>
                    <span
                      v-if="faq.imageUploadState === 'uploading'"
                      class="admin-upload-spinner"
                      aria-hidden="true"
                    ></span>
                  </label>
                  <p
                    v-if="faq.imageUploadMessage"
                    class="admin-upload-result"
                    :class="`admin-upload-result--${faq.imageUploadState}`"
                    role="status"
                  >
                    {{ faq.imageUploadMessage }}
                  </p>
                  <div
                    v-if="faqImageList(faq).length"
                    class="admin-faq-image-preview"
                  >
                    <figure v-for="image in faqImageList(faq)" :key="image">
                      <img :src="image" alt="FAQ 图片预览" />
                      <button
                        type="button"
                        class="admin-image-remove"
                        :disabled="uploading"
                        @click="removeFaqImage(faq, image)"
                      >
                        删除
                      </button>
                    </figure>
                  </div>
                </div>
                <div class="admin-form-grid compact">
                  <label>
                    <span>排序</span>
                    <input v-model.number="faq.sort" type="number" />
                  </label>
                  <label>
                    <span>状态</span>
                    <select v-model="faq.status">
                      <option>Published</option>
                      <option>Draft</option>
                      <option>Hidden</option>
                    </select>
                  </label>
                </div>
                <div class="admin-actions">
                  <button
                    type="button"
                    class="secondary-btn"
                    :disabled="loading"
                    @click="saveDefaultFaq(faq)"
                  >
                    保存默认 FAQ
                  </button>
                  <button
                    type="button"
                    class="admin-danger"
                    :disabled="loading"
                    @click="faq.recordId ? deleteFaq(faq) : removeFaqDraft(faq)"
                  >
                    删除 FAQ
                  </button>
                </div>
              </div>
            </div>

            <button type="button" class="admin-add-btn" @click="newDefaultFaq">
              新增默认 FAQ
            </button>
          </article>
        </section>
      </section>
    </main>

    <div
      v-if="previewFaqItems.length"
      class="admin-preview-modal"
      @click.self="closeFaqPreview"
    >
      <article class="admin-preview-panel">
        <div class="admin-preview-head">
          <div>
            <span class="section-eyebrow">FAQ Preview</span>
            <h2>前台展示预览</h2>
            <p class="admin-sort-tip">拖拽问题卡片即可调整顺序，松开后自动保存。</p>
          </div>
          <button
            type="button"
            class="admin-preview-close"
            @click="closeFaqPreview"
          >
            关闭
          </button>
        </div>
        <div class="admin-preview-sort-list">
          <details
            v-for="(item, index) in previewFaqItems"
            :key="item.recordId || item.localId || item.question"
            class="faq-item admin-preview-faq-item"
            :class="{
              'is-dragging': draggingFaqId === itemKey(item),
              'is-drop-target': dragOverFaqId === itemKey(item),
            }"
            :open="index === 0"
            :draggable="!loading && !uploading"
            :aria-grabbed="draggingFaqId === itemKey(item)"
            @dragstart="startFaqDrag(item)"
            @dragenter.prevent="setFaqDropTarget(item)"
            @dragover.prevent="setFaqDropTarget(item)"
            @drop.prevent="dropFaq(index, previewFaqProductId)"
            @dragend="endDrag"
          >
            <summary>
              <span class="admin-drag-handle" aria-hidden="true">↕</span>
              <span>{{ item.question }}</span>
            </summary>
            <p>{{ item.answer }}</p>

            <div v-if="item.images?.length" class="faq-image-grid">
              <figure v-for="image in item.images" :key="image.url">
                <img
                  :src="image.url"
                  :alt="image.caption || item.question"
                  loading="lazy"
                  decoding="async"
                />
                <figcaption v-if="image.caption">
                  {{ image.caption }}
                </figcaption>
              </figure>
            </div>
          </details>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import adminLoadingDoodle from "../assets/images/admin-loading-doodle.jpg";
import { faqs as builtInFaqs } from "../data/faqs";

const DEFAULT_FAQ_PRODUCT_ID = "__default__";
const PRODUCT_IMAGE_DROPZONE = "product-cover";
const MAX_UPLOAD_SIZE = 3 * 1024 * 1024;
const PRODUCT_COVER_MAX_WIDTH = 900;
const PRODUCT_COVER_QUALITY = 0.82;
const IMAGE_MIME_TYPES = {
  avif: "image/avif",
  bmp: "image/bmp",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
};
const bitableUrl = import.meta.env.VITE_FEISHU_BITABLE_URL || "";
const token = ref(window.sessionStorage.getItem("xuenav_admin_token") || "");
const tokenInput = ref("");
const loading = ref(false);
const dataReady = ref(!token.value);
const uploading = ref(false);
const error = ref("");
const products = ref([]);
const faqs = ref([]);
const activeTab = ref("products");
const draggingProductId = ref("");
const draggingFaqId = ref("");
const dragOverProductId = ref("");
const dragOverFaqId = ref("");
const activeUploadDropzone = ref("");
const previewFaqProductId = ref("");
const toast = reactive({
  message: "",
  type: "info",
  timer: null,
});
const productImageUpload = reactive({
  message: "",
  state: "",
});

const emptyProduct = () => ({
  recordId: "",
  productId: "",
  name: "",
  image: "",
  imagePreview: "",
  videoUrl: "",
  start: 0,
  sort: 0,
  status: "Published",
});

const productDraft = reactive(emptyProduct());
const savedProductForDraft = computed(() =>
  products.value.find(
    (item) =>
      item.recordId === productDraft.recordId &&
      item.productId === productDraft.productId
  )
);

const sortPosition = (item) => {
  const sort = Number(item?.sort);
  return Number.isFinite(sort) && sort > 0 ? sort : Number.MAX_SAFE_INTEGER;
};

const sortItems = (items) =>
  [...items].sort((a, b) => {
    const orderDifference = sortPosition(a) - sortPosition(b);
    if (orderDifference) return orderDifference;

    return String(itemKey(a)).localeCompare(String(itemKey(b)), "zh-CN");
  });

const nextSort = (items) =>
  items.reduce((highest, item) => Math.max(highest, Number(item?.sort) || 0), 0) + 1;

const sortedProducts = computed(() =>
  sortItems(products.value)
);

const selectedFaqs = computed(() =>
  sortItems(faqs.value.filter((item) => item.productId === productDraft.productId))
);

const defaultFaqs = computed(() =>
  sortItems(faqs.value.filter((item) => item.productId === DEFAULT_FAQ_PRODUCT_ID))
);

const showingInitialLoader = computed(() => Boolean(token.value && !dataReady.value));

const previewFaqItems = computed(() => {
  if (!previewFaqProductId.value) return [];

  return sortItems(faqs.value.filter((item) => item.productId === previewFaqProductId.value))
    .map((faq) => ({
      ...faq,
      images: faqImageList(faq).map((url) => ({
        url,
        caption: "",
      })),
    }));
});

const statusTitle = computed(() => {
  if (showingInitialLoader.value) return "正在初始化后台";
  if (uploading.value) return "正在上传图片";
  if (loading.value) return "正在同步数据";
  if (error.value) return "同步失败";
  return "后台数据已连接";
});

const statusText = computed(() => {
  if (showingInitialLoader.value) return "正在读取商品、FAQ 与图片内容，请稍等片刻。";
  if (uploading.value) return "图片上传成功后，请继续点击保存按钮。";
  if (loading.value) return "正在读取或写入后台数据，请稍等。";
  if (error.value) return error.value;
  return `当前已读取 ${products.value.length} 个商品，${defaultFaqs.value.length} 条默认 FAQ，${faqs.value.length} 条全部 FAQ。`;
});

const notify = (message, type = "info") => {
  if (toast.timer) window.clearTimeout(toast.timer);
  toast.message = message;
  toast.type = type;
  toast.timer = window.setTimeout(() => {
    toast.message = "";
    toast.timer = null;
  }, 3600);
};

const imageCanPreview = (value = "") => {
  const image = String(value || "");
  return (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  );
};

const itemKey = (item) =>
  item?.recordId || item?.localId || item?.productId || "";

const faqDropzoneId = (faq) => `faq-images-${itemKey(faq)}`;

const faqImageList = (faq) =>
  (
    String(faq?.images || "").match(/(?:https?:\/\/|data:|blob:)[^\s,，]+/g) ||
    []
  )
    .map((item) => item.trim())
    .filter((item) => imageCanPreview(item));

const setFaqImages = (faq, images) => {
  faq.images = [
    ...new Set(images.map((item) => String(item || "").trim()).filter(Boolean)),
  ].join("\n");
};

const revokeLocalImages = (images) => {
  images
    .filter((item) => String(item || "").startsWith("blob:"))
    .forEach((url) => URL.revokeObjectURL(url));
};

const setFaqUploadStatus = (faq, message = "", state = "info") => {
  faq.imageUploadMessage = message;
  faq.imageUploadState = state;
};

const setProductUploadStatus = (message = "", state = "") => {
  productImageUpload.message = message;
  productImageUpload.state = state;
};

const imageMimeType = (file) => {
  if (String(file?.type || "").startsWith("image/")) return file.type;

  const extension = String(file?.name || "")
    .toLowerCase()
    .match(/\.([a-z0-9]+)$/)?.[1];
  return IMAGE_MIME_TYPES[extension] || "";
};

const hasDraggedFiles = (event) =>
  Array.from(event.dataTransfer?.types || []).includes("Files");

const enterImageDropzone = (event, dropzoneId) => {
  if (hasDraggedFiles(event) && !uploading.value) {
    activeUploadDropzone.value = dropzoneId;
  }
};

const leaveImageDropzone = (event, dropzoneId) => {
  const bounds = event.currentTarget.getBoundingClientRect();
  const outside =
    event.clientX <= bounds.left ||
    event.clientX >= bounds.right ||
    event.clientY <= bounds.top ||
    event.clientY >= bounds.bottom;

  if (outside && activeUploadDropzone.value === dropzoneId) {
    activeUploadDropzone.value = "";
  }
};

const assignProductDraft = (item) => {
  setProductUploadStatus();
  Object.assign(productDraft, emptyProduct(), {
    ...item,
    imagePreview: imageCanPreview(item?.image) ? item.image : "",
  });
};

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",").pop() : result);
    };
    reader.onerror = () =>
      reject(reader.error || new Error("读取文件失败，请重新选择图片。"));
    reader.readAsDataURL(file);
  });

const loadImageElement = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片读取失败，请换一张图片重试。"));
    };
    image.src = url;
  });

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });

const webpFileName = (fileName = "cover") =>
  String(fileName).replace(/\.[^.]+$/, "") + ".webp";

const compressProductCover = async (file) => {
  const image = await loadImageElement(file);
  const scale = Math.min(1, PRODUCT_COVER_MAX_WIDTH / image.naturalWidth);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return file;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, "image/webp", PRODUCT_COVER_QUALITY);
  if (!blob) return file;

  return new File([blob], webpFileName(file.name), {
    type: "image/webp",
    lastModified: Date.now(),
  });
};

const requestAdmin = async (method = "GET", body) => {
  const response = await fetch("/api/admin", {
    method,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-admin-token": token.value,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || "后台请求失败，请稍后重试。");
  }

  return data;
};

const validateProductDraft = () => {
  const productId = productDraft.productId.trim();

  if (!productId) return "请填写商品 ID。";
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(productId)) {
    return "商品 ID 只能使用英文、数字、短横线或下划线，不能包含空格。";
  }
  if (!productDraft.name.trim()) return "请填写商品名称。";
  if (productDraft.videoUrl && !/^https?:\/\//i.test(productDraft.videoUrl)) {
    return "视频链接需要以 http:// 或 https:// 开头。";
  }

  const duplicate = products.value.find(
    (item) =>
      item.productId === productId && item.recordId !== productDraft.recordId
  );
  if (duplicate) return `商品 ID「${productId}」已经存在，请换一个 ID。`;

  return "";
};

const validateFaqDraft = (faq, requireProduct = true) => {
  if (requireProduct) {
    const savedProduct = savedProductForDraft.value;
    if (!savedProduct)
      return "请先保存当前商品，再新增或保存该商品的 FAQ。";
    if (faq.productId !== savedProduct.productId)
      return "FAQ 关联商品已变化，请刷新后重新编辑。";
  }
  if (!faq.question?.trim()) return "请填写 FAQ 问题。";
  if (!faq.answer?.trim()) return "请填写 FAQ 回答。";
  return "";
};

const uploadImage = async (file) => {
  if (!file) return null;
  const mimeType = imageMimeType(file);
  if (!mimeType) {
    throw new Error("请选择 JPG、PNG、WebP 等图片文件。");
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("图片不能超过 3MB，请先压缩后再上传。");
  }

  const base64 = await fileToBase64(file);
  const data = await requestAdmin("POST", {
    resource: "upload",
    fileName: file.name,
    mimeType,
    size: file.size,
    content: base64,
  });

  if (!data.url) {
    throw new Error(
      "图片上传成功但没有返回 Blob URL，请检查 Vercel Blob 配置。"
    );
  }

  return data.url;
};

const uploadProductCover = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;

  activeUploadDropzone.value = "";
  await handleProductCoverFile(file);
};

const dropProductCover = async (event) => {
  activeUploadDropzone.value = "";
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;

  await handleProductCoverFile(file);
};

const handleProductCoverFile = async (file) => {
  uploading.value = true;
  error.value = "";
  setProductUploadStatus("正在压缩并上传商品图片，请稍等...", "uploading");
  notify("正在压缩并上传商品图片，请稍等...", "info");

  try {
    const optimizedFile = await compressProductCover(file);
    const imageUrl = await uploadImage(optimizedFile);
    productDraft.image = imageUrl;
    productDraft.imagePreview = URL.createObjectURL(optimizedFile);
    setProductUploadStatus(
      "商品图片已上传，请点击“保存商品”完成提交。",
      "success"
    );
    notify(
      "商品图片已压缩为 WebP 并上传成功，请点击“保存商品”完成提交。",
      "success"
    );
  } catch (err) {
    error.value = err?.message || "上传商品图片失败。";
    setProductUploadStatus(error.value, "error");
    notify(error.value, "error");
  } finally {
    uploading.value = false;
  }
};

const uploadFaqImageFiles = async (files, faq) => {
  const imageFiles = [...files].filter((file) => imageMimeType(file));
  if (!imageFiles.length) {
    const message = "请选择 JPG、PNG、WebP 等图片文件。";
    setFaqUploadStatus(faq, message, "error");
    notify(message, "error");
    return;
  }

  const previousImages = faqImageList(faq);
  const localImages = imageFiles.map((file) => URL.createObjectURL(file));
  setFaqImages(faq, [...previousImages, ...localImages]);

  uploading.value = true;
  error.value = "";
  const uploadingMessage = `正在上传 ${imageFiles.length} 张 FAQ 图片，请稍等...`;
  setFaqUploadStatus(faq, uploadingMessage, "uploading");
  notify(uploadingMessage, "info");

  try {
    const imageUrls = await Promise.all(
      imageFiles.map((file) => uploadImage(file))
    );
    setFaqImages(faq, [...previousImages, ...imageUrls]);
    faq.imagesDirty = true;
    const message = `${imageFiles.length} 张 FAQ 图片上传成功，请点击“保存 FAQ”完成提交。`;
    setFaqUploadStatus(faq, message, "success");
    notify(message, "success");
  } catch (err) {
    setFaqImages(faq, previousImages);
    error.value = err?.message || "上传 FAQ 图片失败。";
    setFaqUploadStatus(faq, error.value, "error");
    notify(error.value, "error");
  } finally {
    revokeLocalImages(localImages);
    uploading.value = false;
  }
};

const uploadFaqImage = async (event, faq) => {
  const files = [...(event.target.files || [])];
  event.target.value = "";
  activeUploadDropzone.value = "";
  await uploadFaqImageFiles(files, faq);
};

const dropFaqImage = async (event, faq) => {
  activeUploadDropzone.value = "";
  const files = event.dataTransfer?.files || [];
  await uploadFaqImageFiles(files, faq);
};

const removeFaqImage = (faq, image) => {
  setFaqImages(
    faq,
    faqImageList(faq).filter((item) => item !== image)
  );
  faq.imagesDirty = true;
  notify("已移除 FAQ 图片，保存 FAQ 后生效。", "info");
};

const openFaqPreview = (productId) => {
  previewFaqProductId.value = productId;
};

const closeFaqPreview = () => {
  previewFaqProductId.value = "";
};

const clearProductImage = () => {
  productDraft.image = "";
  productDraft.imagePreview = "";
  setProductUploadStatus("已清空封面图，保存商品后生效。", "info");
  notify("已清空封面图，保存商品后生效。", "info");
};

const loadAdminContent = async () => {
  if (!token.value) return;

  loading.value = true;
  error.value = "";

  try {
    const data = await requestAdmin();
    products.value = data.products || [];
    faqs.value = data.faqs || [];

    const current =
      products.value.find(
        (item) => item.productId === productDraft.productId
      ) || products.value[0];
    if (current) assignProductDraft(current);
    notify("后台数据已刷新。", "success");
  } catch (err) {
    error.value = err?.message || "读取后台数据失败。";
    notify(error.value, "error");
  } finally {
    dataReady.value = true;
    loading.value = false;
  }
};

const saveToken = () => {
  const nextToken = tokenInput.value.trim();
  if (!nextToken) {
    notify("请先输入后台管理令牌。", "error");
    return;
  }

  dataReady.value = false;
  token.value = nextToken;
  window.sessionStorage.setItem("xuenav_admin_token", token.value);
  notify("正在进入后台...", "info");
  loadAdminContent();
};

const clearToken = () => {
  token.value = "";
  dataReady.value = true;
  tokenInput.value = "";
  products.value = [];
  faqs.value = [];
  assignProductDraft(emptyProduct());
  window.sessionStorage.removeItem("xuenav_admin_token");
  notify("已退出后台。", "success");
};

const selectProduct = (item) => {
  assignProductDraft(item);
  notify(`正在编辑：${item.name || item.productId}`, "info");
};

const endDrag = () => {
  draggingProductId.value = "";
  draggingFaqId.value = "";
  dragOverProductId.value = "";
  dragOverFaqId.value = "";
};

const moveItem = (items, fromIndex, toIndex) => {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

const startProductDrag = (item) => {
  draggingProductId.value = itemKey(item);
  dragOverProductId.value = "";
};

const setProductDropTarget = (item) => {
  dragOverProductId.value =
    draggingProductId.value && itemKey(item) !== draggingProductId.value
      ? itemKey(item)
      : "";
};

const saveProductOrder = async (orderedProducts) => {
  loading.value = true;
  error.value = "";
  notify("正在保存商品排序...", "info");

  try {
    await Promise.all(
      orderedProducts
        .filter((item) => item.recordId)
        .map((item, index) =>
          requestAdmin("POST", {
            resource: "product",
            recordId: item.recordId,
            fields: {
              Sort: index + 1,
            },
          })
        )
    );
    notify("商品排序已保存，首页会按左侧从上到下显示。", "success");
  } catch (err) {
    error.value = err?.message || "保存商品排序失败。";
    notify(error.value, "error");
    await loadAdminContent();
  } finally {
    loading.value = false;
  }
};

const dropProduct = async (targetIndex) => {
  dragOverProductId.value = "";
  const fromIndex = sortedProducts.value.findIndex(
    (item) => itemKey(item) === draggingProductId.value
  );
  if (fromIndex < 0 || fromIndex === targetIndex) return;

  const orderedProducts = moveItem(
    sortedProducts.value,
    fromIndex,
    targetIndex
  ).map((item, index) => ({
    ...item,
    sort: index + 1,
  }));

  products.value = orderedProducts;
  const current = orderedProducts.find(
    (item) => item.productId === productDraft.productId
  );
  if (current) productDraft.sort = current.sort;
  await saveProductOrder(orderedProducts);
};

const startFaqDrag = (faq) => {
  draggingFaqId.value = itemKey(faq);
  dragOverFaqId.value = "";
};

const setFaqDropTarget = (faq) => {
  dragOverFaqId.value =
    draggingFaqId.value && itemKey(faq) !== draggingFaqId.value
      ? itemKey(faq)
      : "";
};

const saveFaqOrder = async (orderedFaqs) => {
  loading.value = true;
  error.value = "";
  notify("正在保存 FAQ 排序...", "info");

  try {
    await Promise.all(
      orderedFaqs
        .filter((item) => item.recordId)
        .map((item) =>
          requestAdmin("POST", {
            resource: "faq",
            recordId: item.recordId,
            fields: {
              Sort: Number(item.sort || 0),
            },
          })
        )
    );
    notify("FAQ 排序已保存。", "success");
  } catch (err) {
    error.value = err?.message || "保存 FAQ 排序失败。";
    notify(error.value, "error");
    await loadAdminContent();
  } finally {
    loading.value = false;
  }
};

const dropFaq = async (targetIndex, productId) => {
  dragOverFaqId.value = "";
  const currentFaqs = sortItems(
    faqs.value.filter((item) => item.productId === productId)
  );
  const fromIndex = currentFaqs.findIndex(
    (item) => itemKey(item) === draggingFaqId.value
  );
  if (fromIndex < 0 || fromIndex === targetIndex) return;

  const orderedFaqs = moveItem(currentFaqs, fromIndex, targetIndex).map(
    (item, index) => ({
      ...item,
      sort: index + 1,
    })
  );
  const orderMap = new Map(
    orderedFaqs.map((item) => [itemKey(item), item.sort])
  );
  faqs.value = faqs.value.map((item) =>
    item.productId === productId
      ? { ...item, sort: orderMap.get(itemKey(item)) || item.sort }
      : item
  );
  await saveFaqOrder(orderedFaqs);
};

const newProduct = () => {
  assignProductDraft({
    ...emptyProduct(),
    sort: nextSort(products.value),
  });
  notify("已新建商品草稿，请填写信息后保存。", "info");
};

const saveProduct = async () => {
  const validationError = validateProductDraft();
  if (validationError) {
    notify(validationError, "error");
    return;
  }

  loading.value = true;
  error.value = "";
  notify("正在保存商品，请稍等...", "info");

  try {
    const productId = productDraft.productId.trim();
    await requestAdmin("POST", {
      resource: "product",
      recordId: productDraft.recordId,
      fields: {
        "Product ID": productId,
        Name: productDraft.name.trim(),
        "Cover Image": productDraft.image,
        "Video URL": productDraft.videoUrl,
        Start: 0,
        Sort: Number(productDraft.sort || 0),
        Status: productDraft.status || "Published",
      },
    });
    await loadAdminContent();
    const current = products.value.find((item) => item.productId === productId);
    if (current) assignProductDraft(current);
    notify("商品保存成功，官网会在缓存刷新后显示最新内容。", "success");
  } catch (err) {
    error.value = err?.message || "保存商品失败。";
    notify(error.value, "error");
  } finally {
    loading.value = false;
  }
};

const deleteProduct = async () => {
  if (!productDraft.recordId) return;

  const storedProduct =
    products.value.find((product) => product.recordId === productDraft.recordId) ||
    productDraft;
  const linkedFaqCount = faqs.value.filter(
    (faq) => faq.recordId && faq.productId === storedProduct.productId
  ).length;
  const productName = storedProduct.name || storedProduct.productId;
  const linkedFaqMessage = linkedFaqCount
    ? `关联的 ${linkedFaqCount} 条 FAQ`
    : "关联的 FAQ（如有）";
  const confirmation = `确认删除商品“${productName}”吗？\n\n飞书表格中${linkedFaqMessage}也会被永久删除，此操作不可恢复。`;

  if (!window.confirm(confirmation)) return;

  loading.value = true;
  error.value = "";
  notify("正在删除商品及关联 FAQ...", "info");

  try {
    const result = await requestAdmin("DELETE", {
      resource: "product",
      recordId: productDraft.recordId,
    });
    assignProductDraft(emptyProduct());
    await loadAdminContent();
    const deletedFaqCount = Number(result.deletedFaqCount || 0);
    notify(
      deletedFaqCount
        ? `商品已删除，同时已从飞书删除 ${deletedFaqCount} 条关联 FAQ。`
        : "商品已删除。",
      "success"
    );
  } catch (err) {
    error.value = err?.message || "删除商品失败。";
    notify(error.value, "error");
  } finally {
    loading.value = false;
  }
};

const newFaq = () => {
  const savedProduct = savedProductForDraft.value;
  if (!savedProduct) {
    notify("请先保存当前商品，再新增商品 FAQ。", "error");
    return;
  }

  faqs.value.push({
    localId: `local-${Date.now()}`,
    recordId: "",
    productId: savedProduct.productId,
    question: "",
    answer: "",
    images: "",
    sort: nextSort(selectedFaqs.value),
    status: "Published",
  });
  notify("已新增商品 FAQ 草稿，请填写后保存。", "info");
};

const newDefaultFaq = () => {
  faqs.value.push({
    localId: `default-${Date.now()}`,
    recordId: "",
    productId: DEFAULT_FAQ_PRODUCT_ID,
    question: "",
    answer: "",
    images: "",
    sort: nextSort(defaultFaqs.value),
    status: "Published",
  });
  notify("已新增默认 FAQ 草稿，请填写后保存。", "info");
};

const importBuiltInFaqs = async () => {
  const existingQuestions = new Set(
    defaultFaqs.value.map((faq) => String(faq.question || "").trim().toLowerCase())
  );
  const pending = builtInFaqs.filter(
    (faq) => !existingQuestions.has(faq.question.trim().toLowerCase())
  );
  if (!pending.length) {
    notify("网站默认 FAQ 已全部存在，无需重复导入。", "info");
    return;
  }

  loading.value = true;
  error.value = "";
  notify(`正在写入 ${pending.length} 条网站默认 FAQ...`, "info");

  try {
    const firstSort = nextSort(defaultFaqs.value);
    await Promise.all(
      pending.map((faq, index) =>
        saveFaqRecord(
          {
            ...faq,
            recordId: "",
            images: "",
            sort: firstSort + index,
            status: "Published",
          },
          DEFAULT_FAQ_PRODUCT_ID
        )
      )
    );
    await loadAdminContent();
    notify(`已写入 ${pending.length} 条网站默认 FAQ。`, "success");
  } catch (err) {
    error.value = err?.message || "导入网站默认 FAQ 失败。";
    notify(error.value, "error");
  } finally {
    loading.value = false;
  }
};

const removeFaqDraft = (faq) => {
  faqs.value = faqs.value.filter((item) => item !== faq);
  notify("已删除未保存的 FAQ 草稿。", "success");
};

const saveFaqRecord = async (faq, productId) => {
  await requestAdmin("POST", {
    resource: "faq",
    recordId: faq.recordId,
    fields: {
      "Product ID": productId,
      Question: faq.question.trim(),
      Answer: faq.answer.trim(),
      ...(faq.images || faq.imagesDirty ? { Images: faq.images } : {}),
      Sort: Number(faq.sort || 0),
      Status: faq.status || "Published",
    },
  });
};

const saveFaq = async (faq) => {
  const validationError = validateFaqDraft(faq);
  if (validationError) {
    notify(validationError, "error");
    return;
  }

  loading.value = true;
  error.value = "";
  notify("正在保存商品 FAQ，请稍等...", "info");

  try {
    await saveFaqRecord(faq, productDraft.productId);
    await loadAdminContent();
    notify("商品 FAQ 保存成功。", "success");
  } catch (err) {
    error.value = err?.message || "保存 FAQ 失败。";
    notify(error.value, "error");
  } finally {
    loading.value = false;
  }
};

const saveDefaultFaq = async (faq) => {
  const validationError = validateFaqDraft(faq, false);
  if (validationError) {
    notify(validationError, "error");
    return;
  }

  loading.value = true;
  error.value = "";
  notify("正在保存默认 FAQ，请稍等...", "info");

  try {
    await saveFaqRecord(faq, DEFAULT_FAQ_PRODUCT_ID);
    await loadAdminContent();
    notify("默认 FAQ 保存成功。", "success");
  } catch (err) {
    error.value = err?.message || "保存默认 FAQ 失败。";
    notify(error.value, "error");
  } finally {
    loading.value = false;
  }
};

const deleteFaq = async (faq) => {
  if (!faq.recordId || !window.confirm("确认删除这条 FAQ 吗？")) return;

  loading.value = true;
  error.value = "";
  notify("正在删除 FAQ...", "info");

  try {
    await requestAdmin("DELETE", {
      resource: "faq",
      recordId: faq.recordId,
    });
    await loadAdminContent();
    notify("FAQ 已删除。", "success");
  } catch (err) {
    error.value = err?.message || "删除 FAQ 失败。";
    notify(error.value, "error");
  } finally {
    loading.value = false;
  }
};

onMounted(loadAdminContent);
</script>
