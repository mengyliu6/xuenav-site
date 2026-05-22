<template>
  <div class="admin-page">
    <div v-if="toast.message" class="admin-toast" :class="`admin-toast--${toast.type}`">
      {{ toast.message }}
    </div>

    <header class="admin-topbar">
      <div>
        <span>XUENAV Admin</span>
        <h1>XUENAV 后台管理</h1>
      </div>

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
        <RouterLink to="/" class="secondary-btn">返回官网</RouterLink>
      </div>
    </header>

    <main v-if="!token" class="admin-auth">
      <form @submit.prevent="saveToken">
        <span>运营后台登录</span>
        <h2>请输入后台管理令牌</h2>
        <p>
          登录后可以维护官网商品、封面图片、商品 FAQ 和全站默认 FAQ。令牌由技术同事在
          Vercel 环境变量 <code>ADMIN_API_TOKEN</code> 中配置。
        </p>
        <input v-model="tokenInput" type="password" placeholder="请输入 Admin Token" />
        <button type="submit" class="primary-btn">进入后台</button>
      </form>
    </main>

    <main v-else class="admin-workspace">
      <section class="admin-control-row">
        <section class="admin-status-card">
          <div>
            <span class="section-eyebrow">XUENAV CMS</span>
            <h2>{{ statusTitle }}</h2>
            <p>{{ statusText }}</p>
          </div>

          <div class="admin-status-actions">
            <button type="button" class="secondary-btn" :disabled="loading" @click="loadAdminContent">
              刷新数据
            </button>
            <button type="button" class="secondary-btn" @click="clearToken">
              退出登录
            </button>
          </div>
        </section>
      </section>

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

          <aside v-if="activeTab === 'products'" class="admin-card admin-sidebar">
            <div class="admin-section-title">
              <span>商品</span>
              <h2>商品列表</h2>
            </div>

            <button type="button" class="admin-add-btn" @click="newProduct">
              新增商品
            </button>

            <div class="admin-product-list">
              <button
                v-for="item in sortedProducts"
                :key="item.recordId || item.productId"
                type="button"
                :class="{ active: item.productId === productDraft.productId }"
                @click="selectProduct(item)"
              >
                <strong>{{ item.name || "未命名商品" }}</strong>
                <small>{{ item.productId || "未填写商品 ID" }}</small>
              </button>
            </div>
          </aside>
        </aside>

        <section v-if="activeTab === 'products'" class="admin-editor-main">
          <article class="admin-card">
            <div class="admin-section-title">
              <span>商品编辑</span>
              <h2>基础信息</h2>
            </div>

            <div class="admin-form-grid">
              <label>
                <span>商品 ID</span>
                <input v-model.trim="productDraft.productId" type="text" placeholder="camaro-radio-10-15" />
              </label>
              <label>
                <span>商品名称</span>
                <input v-model.trim="productDraft.name" type="text" placeholder="官网显示的商品标题" />
              </label>
              <label class="admin-wide-field">
                <span>封面图片</span>
                <input
                  v-model.trim="productDraft.image"
                  type="text"
                  placeholder="可粘贴图片 URL，也可用下方按钮上传图片"
                />
              </label>
              <div class="admin-upload-field">
                <span>上传封面图</span>
                <div class="admin-upload-row">
                  <input type="file" accept="image/*" @change="uploadProductCover" />
                  <button type="button" class="secondary-btn" :disabled="uploading" @click="clearProductImage">
                    清空图片
                  </button>
                </div>
                <img v-if="productDraft.imagePreview" :src="productDraft.imagePreview" alt="封面预览" />
                <p v-else>建议上传压缩后的 JPG/PNG 图片；上传成功后先预览，再点击“保存商品”。</p>
              </div>
              <label>
                <span>视频链接</span>
                <input v-model.trim="productDraft.videoUrl" type="url" placeholder="https://www.youtube.com/..." />
              </label>
              <label>
                <span>视频开始秒数</span>
                <input v-model.number="productDraft.start" type="number" min="0" />
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
              <button type="button" class="primary-btn" :disabled="loading || uploading" @click="saveProduct">
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
            <div class="admin-section-title">
              <span>商品 FAQ</span>
              <h2>当前商品常见问题</h2>
            </div>

            <div class="admin-faq-list">
              <div
                v-for="faq in selectedFaqs"
                :key="faq.recordId || faq.localId"
                class="admin-faq-card"
              >
                <label>
                  <span>问题</span>
                  <input v-model.trim="faq.question" type="text" placeholder="客户常问的问题" />
                </label>
                <label>
                  <span>回答</span>
                  <textarea v-model.trim="faq.answer" rows="4" placeholder="给客户看的标准回答"></textarea>
                </label>
                <label>
                  <span>图片</span>
                  <textarea
                    v-model.trim="faq.images"
                    rows="3"
                    placeholder="可选，一行一张图片；也可以用下方按钮上传"
                  ></textarea>
                </label>
                <div class="admin-upload-field compact">
                  <span>上传 FAQ 图片</span>
                  <div class="admin-upload-row">
                    <input type="file" accept="image/*" @change="(event) => uploadFaqImage(event, faq)" />
                  </div>
                  <p>可重复上传多张图片，最后点击“保存 FAQ”写入后台。</p>
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
                  <button type="button" class="secondary-btn" :disabled="loading || uploading" @click="saveFaq(faq)">
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

            <button type="button" class="admin-add-btn" @click="newFaq">
              新增商品 FAQ
            </button>
          </article>
        </section>

        <section v-else class="admin-editor-main">
        <article class="admin-card">
          <div class="admin-section-title">
            <span>默认 FAQ</span>
            <h2>全站默认常见问题</h2>
          </div>

          <p class="admin-help-text">
            这里维护 FAQ 页面默认展示的内容，也会作为没有专属 FAQ 的商品详情页兜底内容。
          </p>

          <div class="admin-faq-list">
            <div
              v-for="faq in defaultFaqs"
              :key="faq.recordId || faq.localId"
              class="admin-faq-card"
            >
              <label>
                <span>问题</span>
                <input v-model.trim="faq.question" type="text" placeholder="客户常问的问题" />
              </label>
              <label>
                <span>回答</span>
                <textarea v-model.trim="faq.answer" rows="4" placeholder="默认 FAQ 回答"></textarea>
              </label>
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
                <button type="button" class="secondary-btn" :disabled="loading" @click="saveDefaultFaq(faq)">
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
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { RouterLink } from "vue-router";

const DEFAULT_FAQ_PRODUCT_ID = "__default__";
const MAX_UPLOAD_SIZE = 3 * 1024 * 1024;
const bitableUrl = import.meta.env.VITE_FEISHU_BITABLE_URL || "";
const token = ref(window.sessionStorage.getItem("xuenav_admin_token") || "");
const tokenInput = ref("");
const loading = ref(false);
const uploading = ref(false);
const error = ref("");
const products = ref([]);
const faqs = ref([]);
const activeTab = ref("products");
const toast = reactive({
  message: "",
  type: "info",
  timer: null,
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

const sortedProducts = computed(() =>
  [...products.value].sort((a, b) => {
    const sortA = Number(a.sort || 0);
    const sortB = Number(b.sort || 0);

    if (sortA !== sortB) return sortA - sortB;

    return String(a.name || a.productId).localeCompare(String(b.name || b.productId), "zh-CN");
  })
);

const selectedFaqs = computed(() =>
  faqs.value
    .filter((item) => item.productId === productDraft.productId)
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
);

const defaultFaqs = computed(() =>
  faqs.value
    .filter((item) => item.productId === DEFAULT_FAQ_PRODUCT_ID)
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
);

const statusTitle = computed(() => {
  if (uploading.value) return "正在上传图片";
  if (loading.value) return "正在同步数据";
  if (error.value) return "同步失败";
  return "后台数据已连接";
});

const statusText = computed(() => {
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
  return image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:");
};

const assignProductDraft = (item) => {
  Object.assign(productDraft, emptyProduct(), {
    ...item,
    imagePreview: imageCanPreview(item?.image) ? item.image : "",
  });
};

const appendLine = (value, line) => [value, line].filter(Boolean).join("\n");

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",").pop() : result);
    };
    reader.onerror = () => reject(reader.error || new Error("读取文件失败，请重新选择图片。"));
    reader.readAsDataURL(file);
  });

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
    (item) => item.productId === productId && item.recordId !== productDraft.recordId
  );
  if (duplicate) return `商品 ID「${productId}」已经存在，请换一个 ID。`;

  return "";
};

const validateFaqDraft = (faq, requireProduct = true) => {
  if (requireProduct && !productDraft.productId) return "请先选择或保存一个商品。";
  if (!faq.question?.trim()) return "请填写 FAQ 问题。";
  if (!faq.answer?.trim()) return "请填写 FAQ 回答。";
  return "";
};

const uploadImage = async (file) => {
  if (!file) return null;
  if (!file.type.startsWith("image/")) {
    throw new Error("请选择 JPG、PNG、WebP 等图片文件。");
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("图片不能超过 3MB，请先压缩后再上传。");
  }

  const base64 = await fileToBase64(file);
  const data = await requestAdmin("POST", {
    resource: "upload",
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    content: base64,
  });

  if (!data.url) {
    throw new Error("图片上传成功但没有返回 Blob URL，请检查 Vercel Blob 配置。");
  }

  return data.url;
};

const uploadProductCover = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;

  uploading.value = true;
  error.value = "";
  notify("正在上传封面图，请稍等...", "info");

  try {
    const imageUrl = await uploadImage(file);
    productDraft.image = imageUrl;
    productDraft.imagePreview = URL.createObjectURL(file);
    notify("封面图上传成功，请点击“保存商品”完成提交。", "success");
  } catch (err) {
    error.value = err?.message || "上传封面图失败。";
    notify(error.value, "error");
  } finally {
    uploading.value = false;
  }
};

const uploadFaqImage = async (event, faq) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;

  uploading.value = true;
  error.value = "";
  notify("正在上传 FAQ 图片，请稍等...", "info");

  try {
    const imageUrl = await uploadImage(file);
    faq.images = appendLine(faq.images, imageUrl);
    notify("FAQ 图片上传成功，请点击“保存 FAQ”完成提交。", "success");
  } catch (err) {
    error.value = err?.message || "上传 FAQ 图片失败。";
    notify(error.value, "error");
  } finally {
    uploading.value = false;
  }
};

const clearProductImage = () => {
  productDraft.image = "";
  productDraft.imagePreview = "";
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
      products.value.find((item) => item.productId === productDraft.productId) || products.value[0];
    if (current) assignProductDraft(current);
    notify("后台数据已刷新。", "success");
  } catch (err) {
    error.value = err?.message || "读取后台数据失败。";
    notify(error.value, "error");
  } finally {
    loading.value = false;
  }
};

const saveToken = () => {
  const nextToken = tokenInput.value.trim();
  if (!nextToken) {
    notify("请先输入后台管理令牌。", "error");
    return;
  }

  token.value = nextToken;
  window.sessionStorage.setItem("xuenav_admin_token", token.value);
  notify("正在进入后台...", "info");
  loadAdminContent();
};

const clearToken = () => {
  token.value = "";
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

const newProduct = () => {
  assignProductDraft(emptyProduct());
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
        Start: Number(productDraft.start || 0),
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
  if (!productDraft.recordId || !window.confirm("确认删除这个商品吗？")) return;

  loading.value = true;
  error.value = "";
  notify("正在删除商品...", "info");

  try {
    await requestAdmin("DELETE", {
      resource: "product",
      recordId: productDraft.recordId,
    });
    assignProductDraft(emptyProduct());
    await loadAdminContent();
    notify("商品已删除。", "success");
  } catch (err) {
    error.value = err?.message || "删除商品失败。";
    notify(error.value, "error");
  } finally {
    loading.value = false;
  }
};

const newFaq = () => {
  if (!productDraft.productId) {
    notify("请先选择或保存一个商品，再新增 FAQ。", "error");
    return;
  }

  faqs.value.push({
    localId: `local-${Date.now()}`,
    recordId: "",
    productId: productDraft.productId,
    question: "",
    answer: "",
    images: "",
    sort: selectedFaqs.value.length + 1,
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
    sort: defaultFaqs.value.length + 1,
    status: "Published",
  });
  notify("已新增默认 FAQ 草稿，请填写后保存。", "info");
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
      Images: faq.images,
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
