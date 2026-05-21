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

    <main v-if="!token" class="admin-auth">
      <form @submit.prevent="saveToken">
        <span>Admin Token</span>
        <h2>输入内部管理令牌</h2>
        <p>
          这个令牌对应 Vercel 环境变量 <code>ADMIN_API_TOKEN</code>，仅用于公司内部人员编辑内容。
        </p>
        <input v-model="tokenInput" type="password" placeholder="ADMIN_API_TOKEN" />
        <button type="submit" class="primary-btn">进入后台</button>
      </form>
    </main>

    <main v-else class="admin-workspace">
      <section class="admin-status-card">
        <div>
          <span class="section-eyebrow">Feishu CMS</span>
          <h2>{{ statusTitle }}</h2>
          <p>{{ statusText }}</p>
        </div>

        <div class="admin-status-actions">
          <button type="button" class="secondary-btn" :disabled="loading" @click="loadAdminContent">
            刷新
          </button>
          <button type="button" class="secondary-btn" @click="clearToken">
            退出
          </button>
        </div>
      </section>

      <section class="admin-editor-grid">
        <aside class="admin-card admin-sidebar">
          <div class="admin-section-title">
            <span>Products</span>
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
              <small>{{ item.productId || "未填写 Product ID" }}</small>
            </button>
          </div>
        </aside>

        <section class="admin-editor-main">
          <article class="admin-card">
            <div class="admin-section-title">
              <span>Product Editor</span>
              <h2>商品信息</h2>
            </div>

            <div class="admin-form-grid">
              <label>
                <span>Product ID</span>
                <input v-model.trim="productDraft.productId" type="text" placeholder="camaro-radio-10-15" />
              </label>
              <label>
                <span>Name</span>
                <input v-model.trim="productDraft.name" type="text" placeholder="商品名称" />
              </label>
              <label class="admin-wide-field">
                <span>Cover Image URL / Attachment</span>
                <input v-model.trim="productDraft.image" type="text" placeholder="https://... 或上传后自动填入附件标记" />
              </label>
              <div class="admin-upload-field">
                <span>Upload Cover Image</span>
                <div class="admin-upload-row">
                  <input type="file" accept="image/*" @change="uploadProductCover" />
                  <button type="button" class="secondary-btn" :disabled="uploading" @click="clearProductImage">
                    清空图片
                  </button>
                </div>
                <img v-if="productDraft.imagePreview" :src="productDraft.imagePreview" alt="Cover preview" />
                <p v-else>选择本地图片后会上传到飞书附件字段；也可以继续直接填写公网图片 URL。</p>
              </div>
              <label>
                <span>Video URL</span>
                <input v-model.trim="productDraft.videoUrl" type="url" placeholder="https://www.youtube.com/..." />
              </label>
              <label>
                <span>Start</span>
                <input v-model.number="productDraft.start" type="number" min="0" />
              </label>
              <label>
                <span>Sort</span>
                <input v-model.number="productDraft.sort" type="number" />
              </label>
              <label>
                <span>Status</span>
                <select v-model="productDraft.status">
                  <option>Published</option>
                  <option>Draft</option>
                  <option>Hidden</option>
                </select>
              </label>
            </div>

            <div class="admin-actions">
              <button type="button" class="primary-btn" :disabled="loading" @click="saveProduct">
                保存商品
              </button>
              <button
                v-if="productDraft.recordId"
                type="button"
                class="admin-danger"
                :disabled="loading"
                @click="deleteProduct"
              >
                删除商品
              </button>
            </div>
          </article>

          <article class="admin-card">
            <div class="admin-section-title">
              <span>FAQ Editor</span>
              <h2>商品 FAQ</h2>
            </div>

            <div class="admin-faq-list">
              <div
                v-for="faq in selectedFaqs"
                :key="faq.recordId || faq.localId"
                class="admin-faq-card"
              >
                <label>
                  <span>Question</span>
                  <input v-model.trim="faq.question" type="text" placeholder="FAQ 问题" />
                </label>
                <label>
                  <span>Answer</span>
                  <textarea v-model.trim="faq.answer" rows="4" placeholder="FAQ 回答"></textarea>
                </label>
                <label>
                  <span>Images</span>
                  <textarea
                    v-model.trim="faq.images"
                    rows="3"
                    placeholder="可选，一行一个图片 URL；上传图片后会自动追加附件标记"
                  ></textarea>
                </label>
                <div class="admin-upload-field compact">
                  <span>Upload FAQ Image</span>
                  <div class="admin-upload-row">
                    <input type="file" accept="image/*" @change="(event) => uploadFaqImage(event, faq)" />
                  </div>
                  <p>可重复上传多张，保存 FAQ 时一起写入飞书。</p>
                </div>
                <div class="admin-form-grid compact">
                  <label>
                    <span>Sort</span>
                    <input v-model.number="faq.sort" type="number" />
                  </label>
                  <label>
                    <span>Status</span>
                    <select v-model="faq.status">
                      <option>Published</option>
                      <option>Draft</option>
                      <option>Hidden</option>
                    </select>
                  </label>
                </div>
                <div class="admin-actions">
                  <button type="button" class="secondary-btn" :disabled="loading" @click="saveFaq(faq)">
                    保存 FAQ
                  </button>
                  <button
                    v-if="faq.recordId"
                    type="button"
                    class="admin-danger"
                    :disabled="loading"
                    @click="deleteFaq(faq)"
                  >
                    删除 FAQ
                  </button>
                </div>
              </div>
            </div>

            <button type="button" class="admin-add-btn" @click="newFaq">
              新增 FAQ
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

const FEISHU_ATTACHMENT_PREFIX = "feishu:file_token:";
const bitableUrl = import.meta.env.VITE_FEISHU_BITABLE_URL || "";
const token = ref(window.sessionStorage.getItem("xuenav_admin_token") || "");
const tokenInput = ref("");
const loading = ref(false);
const uploading = ref(false);
const error = ref("");
const products = ref([]);
const faqs = ref([]);

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

    return String(a.name || a.productId).localeCompare(String(b.name || b.productId));
  })
);

const selectedFaqs = computed(() =>
  faqs.value
    .filter((item) => item.productId === productDraft.productId)
    .sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0))
);

const statusTitle = computed(() => {
  if (uploading.value) return "正在上传图片...";
  if (loading.value) return "正在同步飞书...";
  if (error.value) return "同步失败";
  return "飞书后台已连接";
});

const statusText = computed(() => {
  if (uploading.value) return "图片正在上传到飞书附件，请稍等。";
  if (loading.value) return "正在读取或写入飞书多维表格。";
  if (error.value) return error.value;
  return `当前已读取 ${products.value.length} 个商品，${faqs.value.length} 条 FAQ。`;
});

const assignProductDraft = (item) => {
  Object.assign(productDraft, emptyProduct(), {
    ...item,
    imagePreview: imageCanPreview(item?.image) ? item.image : "",
  });
};

const imageCanPreview = (value = "") => {
  const image = String(value || "");
  return image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:");
};

const toAttachmentToken = (fileToken) => `${FEISHU_ATTACHMENT_PREFIX}${fileToken}`;

const appendLine = (value, line) => [value, line].filter(Boolean).join("\n");

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",").pop() : result);
    };
    reader.onerror = () => reject(reader.error || new Error("读取文件失败"));
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
    throw new Error(data?.error || "后台 API 请求失败");
  }

  return data;
};

const uploadImage = async (file) => {
  if (!file) return null;
  if (!file.type.startsWith("image/")) {
    throw new Error("请选择图片文件");
  }

  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("图片不能超过 20MB");
  }

  const base64 = await fileToBase64(file);
  const data = await requestAdmin("POST", {
    resource: "upload",
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    content: base64,
  });

  return data.fileToken;
};

const uploadProductCover = async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;

  uploading.value = true;
  error.value = "";

  try {
    const fileToken = await uploadImage(file);
    productDraft.image = toAttachmentToken(fileToken);
    productDraft.imagePreview = URL.createObjectURL(file);
  } catch (err) {
    error.value = err?.message || "上传封面图片失败";
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

  try {
    const fileToken = await uploadImage(file);
    faq.images = appendLine(faq.images, toAttachmentToken(fileToken));
  } catch (err) {
    error.value = err?.message || "上传 FAQ 图片失败";
  } finally {
    uploading.value = false;
  }
};

const clearProductImage = () => {
  productDraft.image = "";
  productDraft.imagePreview = "";
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
  } catch (err) {
    error.value = err?.message || "读取飞书数据失败";
  } finally {
    loading.value = false;
  }
};

const saveToken = () => {
  const nextToken = tokenInput.value.trim();
  if (!nextToken) {
    window.alert("请填写 Admin Token。");
    return;
  }

  token.value = nextToken;
  window.sessionStorage.setItem("xuenav_admin_token", token.value);
  loadAdminContent();
};

const clearToken = () => {
  token.value = "";
  tokenInput.value = "";
  products.value = [];
  faqs.value = [];
  window.sessionStorage.removeItem("xuenav_admin_token");
};

const selectProduct = (item) => {
  assignProductDraft(item);
};

const newProduct = () => {
  assignProductDraft(emptyProduct());
};

const saveProduct = async () => {
  if (!productDraft.productId) {
    window.alert("请填写 Product ID。");
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const productId = productDraft.productId;
    await requestAdmin("POST", {
      resource: "product",
      recordId: productDraft.recordId,
      fields: {
        "Product ID": productId,
        Name: productDraft.name,
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
  } catch (err) {
    error.value = err?.message || "保存商品失败";
  } finally {
    loading.value = false;
  }
};

const deleteProduct = async () => {
  if (!productDraft.recordId || !window.confirm("确认删除这个商品吗？")) return;

  loading.value = true;
  error.value = "";

  try {
    await requestAdmin("DELETE", {
      resource: "product",
      recordId: productDraft.recordId,
    });
    assignProductDraft(emptyProduct());
    await loadAdminContent();
  } catch (err) {
    error.value = err?.message || "删除商品失败";
  } finally {
    loading.value = false;
  }
};

const newFaq = () => {
  if (!productDraft.productId) {
    window.alert("请先选择或保存一个商品。");
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
};

const saveFaq = async (faq) => {
  if (!productDraft.productId || !faq.question || !faq.answer) {
    window.alert("请填写 FAQ 的问题和回答。");
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    await requestAdmin("POST", {
      resource: "faq",
      recordId: faq.recordId,
      fields: {
        "Product ID": productDraft.productId,
        Question: faq.question,
        Answer: faq.answer,
        Images: faq.images,
        Sort: Number(faq.sort || 0),
        Status: faq.status || "Published",
      },
    });
    await loadAdminContent();
  } catch (err) {
    error.value = err?.message || "保存 FAQ 失败";
  } finally {
    loading.value = false;
  }
};

const deleteFaq = async (faq) => {
  if (!faq.recordId || !window.confirm("确认删除这条 FAQ 吗？")) return;

  loading.value = true;
  error.value = "";

  try {
    await requestAdmin("DELETE", {
      resource: "faq",
      recordId: faq.recordId,
    });
    await loadAdminContent();
  } catch (err) {
    error.value = err?.message || "删除 FAQ 失败";
  } finally {
    loading.value = false;
  }
};

onMounted(loadAdminContent);
</script>
