const FEISHU_API = "https://open.feishu.cn/open-apis";
const FEISHU_ATTACHMENT_PREFIX = "feishu:file_token:";

const FIELD_ALIASES = {
  productId: ["Product ID", "productId", "product_id", "\u5546\u54c1ID", "\u5546\u54c1 ID"],
  name: ["Name", "Product Name", "name", "\u5546\u54c1\u540d\u79f0", "\u4ea7\u54c1\u540d\u79f0"],
  image: ["Cover Image", "Cover", "Image", "image", "\u5c01\u9762\u56fe", "\u5c01\u9762\u56fe\u7247"],
  videoUrl: ["Video URL", "Video", "videoUrl", "video_url", "\u89c6\u9891\u94fe\u63a5"],
  start: ["Start", "Start Time", "start", "\u5f00\u59cb\u65f6\u95f4", "\u5f00\u59cb\u79d2\u6570"],
  status: ["Status", "status", "\u72b6\u6001"],
  sort: ["Sort", "sort", "\u6392\u5e8f"],
  question: ["Question", "question", "\u95ee\u9898"],
  answer: ["Answer", "answer", "\u56de\u7b54", "\u7b54\u6848"],
  galleryImage: ["Image", "Images", "Gallery Image", "image", "\u56fe\u7247", "\u5546\u54c1\u56fe\u7247"],
  faqImages: ["Images", "FAQ Images", "images", "\u56fe\u7247", "FAQ\u56fe\u7247"],
  caption: ["Caption", "caption", "\u8bf4\u660e", "\u56fe\u7247\u8bf4\u660e"],
};

const getEnv = (name) => process.env[name] || "";

const getField = (fields, key) => {
  const aliases = FIELD_ALIASES[key] || [key];
  const found = aliases.find((name) => fields[name] !== undefined);
  return found ? fields[found] : undefined;
};

const textFromValue = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (typeof value === "boolean") return value ? "true" : "false";

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string" || typeof item === "number") return String(item);
        return (
          item?.text ||
          item?.url ||
          item?.tmp_url ||
          item?.link ||
          item?.name ||
          (item?.file_token ? `${FEISHU_ATTACHMENT_PREFIX}${item.file_token}` : "") ||
          ""
        );
      })
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  return String(
    value.text ||
      value.url ||
      value.tmp_url ||
      value.link ||
      value.name ||
      (value.file_token ? `${FEISHU_ATTACHMENT_PREFIX}${value.file_token}` : "") ||
      "",
  ).trim();
};

const imagesFromValue = (value) => {
  if (!value) return [];

  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url) => ({ url, caption: "" }));
  }

  const items = Array.isArray(value) ? value : [value];

  return items
    .map((item) => {
      if (typeof item === "string") return { url: item, caption: "" };

      return {
        url: item?.url || item?.tmp_url || item?.link || "",
        caption: item?.name || item?.text || "",
      };
    })
    .filter((item) => item.url);
};

const isPublished = (fields) => {
  const status = textFromValue(getField(fields, "status")).toLowerCase();
  const hiddenStatuses = [
    "draft",
    "hidden",
    "disabled",
    "offline",
    "unpublished",
    "no",
    "false",
    "\u8349\u7a3f",
    "\u672a\u53d1\u5e03",
    "\u4e0b\u7ebf",
    "\u7981\u7528",
  ];

  return !hiddenStatuses.includes(status);
};

const sortRecords = (a, b) => {
  const left = Number(textFromValue(getField(a.fields, "sort")) || 0);
  const right = Number(textFromValue(getField(b.fields, "sort")) || 0);
  return left - right;
};

const getTenantAccessToken = async () => {
  const appId = getEnv("FEISHU_APP_ID");
  const appSecret = getEnv("FEISHU_APP_SECRET");

  if (!appId || !appSecret) {
    throw new Error("Missing FEISHU_APP_ID or FEISHU_APP_SECRET");
  }

  const response = await fetch(`${FEISHU_API}/auth/v3/tenant_access_token/internal`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret,
    }),
  });
  const data = await response.json();

  if (!response.ok || data.code !== 0) {
    throw new Error(data.msg || "Failed to get Feishu tenant_access_token");
  }

  return data.tenant_access_token;
};

const listRecords = async (token, appToken, tableId) => {
  if (!tableId) return [];

  const records = [];
  let pageToken = "";

  do {
    const params = new URLSearchParams({ page_size: "500" });
    if (pageToken) params.set("page_token", pageToken);

    const response = await fetch(
      `${FEISHU_API}/bitable/v1/apps/${appToken}/tables/${tableId}/records?${params.toString()}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();

    if (!response.ok || data.code !== 0) {
      throw new Error(data.msg || `Failed to list records: ${tableId}`);
    }

    records.push(...(data.data?.items || []));
    pageToken = data.data?.page_token || "";
  } while (pageToken);

  return records.filter((record) => isPublished(record.fields || {})).sort(sortRecords);
};

const toContent = ({ products, faqs, gallery }) => {
  const content = { products: {} };

  products.forEach((record) => {
    const fields = record.fields || {};
    const productId = textFromValue(getField(fields, "productId"));
    if (!productId) return;

    const cover =
      imagesFromValue(getField(fields, "image"))[0]?.url ||
      textFromValue(getField(fields, "image"));

    content.products[productId] = {
      name: textFromValue(getField(fields, "name")),
      image: cover,
      videoUrl: textFromValue(getField(fields, "videoUrl")),
      start: Number(textFromValue(getField(fields, "start")) || 0),
      sort: Number(textFromValue(getField(fields, "sort")) || 0),
      gallery: [],
      faqs: [],
    };
  });

  gallery.forEach((record) => {
    const fields = record.fields || {};
    const productId = textFromValue(getField(fields, "productId"));
    if (!productId) return;

    const product = content.products[productId];
    if (!product) return;

    imagesFromValue(getField(fields, "galleryImage")).forEach((image) => {
      product.gallery.push({
        url: image.url,
        caption: textFromValue(getField(fields, "caption")) || image.caption,
      });
    });
  });

  faqs.forEach((record) => {
    const fields = record.fields || {};
    const productId = textFromValue(getField(fields, "productId"));
    if (!productId) return;

    const question = textFromValue(getField(fields, "question"));
    const answer = textFromValue(getField(fields, "answer"));
    if (!question || !answer) return;

    const product = content.products[productId];
    if (!product) return;

    product.faqs.push({
      question,
      answer,
      images: imagesFromValue(getField(fields, "faqImages")),
    });
  });

  return content;
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const appToken = getEnv("FEISHU_BITABLE_APP_TOKEN");
    const productsTable = getEnv("FEISHU_PRODUCTS_TABLE_ID");
    const faqsTable = getEnv("FEISHU_FAQS_TABLE_ID");
    const galleryTable = getEnv("FEISHU_GALLERY_TABLE_ID");

    if (!appToken || !productsTable) {
      res.status(200).json({
        configured: false,
        products: {},
      });
      return;
    }

    const token = await getTenantAccessToken();
    const [products, faqs, gallery] = await Promise.all([
      listRecords(token, appToken, productsTable),
      listRecords(token, appToken, faqsTable),
      listRecords(token, appToken, galleryTable),
    ]);

    res.setHeader("cache-control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({
      configured: true,
      ...toContent({ products, faqs, gallery }),
    });
  } catch (error) {
    res.status(500).json({
      configured: false,
      products: {},
      error: error.message || "Failed to load content",
    });
  }
}
