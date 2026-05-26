import { put } from "@vercel/blob";

const FEISHU_API = "https://open.feishu.cn/open-apis";
const FAQ_IMAGE_URL_FIELD = "Image URLs";
const DEFAULT_SITE_KEY = "xuenav";
const SITE_KEYS = new Set(["xuenav", "viknan", "boxnav"]);

const PRODUCTS_FIELDS = [
  "Site Key",
  "Product ID",
  "Name",
  "Cover Image",
  "Video URL",
  "Start",
  "Sort",
  "Status",
];

const FAQ_FIELDS = [
  "Site Key",
  "Product ID",
  "Question",
  "Answer",
  "Images",
  FAQ_IMAGE_URL_FIELD,
  "Sort",
  "Status",
];

const getEnv = (name) => process.env[name] || "";
const siteKeyFromValue = (value) => {
  const key = String(value || "").trim().toLowerCase();
  return SITE_KEYS.has(key) ? key : DEFAULT_SITE_KEY;
};
const siteKeyFromFields = (fields = {}) =>
  siteKeyFromValue(fields["Site Key"] || fields.siteKey || fields.site_key || fields["站点"]);
const requestedSiteKey = (req) =>
  siteKeyFromValue(req.query?.siteKey || req.body?.siteKey || DEFAULT_SITE_KEY);

const firstLineFromValue = (value) =>
  String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)[0] || "";

const requireAdmin = (req) => {
  const expected = getEnv("ADMIN_API_TOKEN");
  const received = req.headers["x-admin-token"];

  if (!expected) {
    return "Missing ADMIN_API_TOKEN";
  }

  if (!received || received !== expected) {
    return "Invalid admin token";
  }

  return "";
};

const textFromValue = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string" || typeof value === "number")
    return String(value).trim();
  if (typeof value === "boolean") return value ? "true" : "false";

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string" || typeof item === "number")
          return String(item);
        return (
          item?.url ||
          item?.tmp_url ||
          item?.link ||
          item?.href ||
          item?.text ||
          item?.name ||
          ""
        );
      })
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  return String(
    value.url ||
      value.tmp_url ||
      value.link ||
      value.href ||
      value.text ||
      value.name ||
      "",
  ).trim();
};

const linkTextFromValue = (value) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string" || typeof value === "number")
    return String(value).trim();

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string" || typeof item === "number")
          return String(item);
        return (
          item?.text ||
          item?.link ||
          item?.url ||
          item?.tmp_url ||
          item?.href ||
          item?.name ||
          ""
        );
      })
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  return String(
    value.text ||
      value.link ||
      value.url ||
      value.tmp_url ||
      value.href ||
      value.name ||
      "",
  ).trim();
};

const urlsFromValue = (value) => {
  const values = Array.isArray(value) ? value : [value];
  const urls = values.flatMap((item) => {
    if (typeof item === "string" || typeof item === "number") {
      return String(item).match(/https?:\/\/[^\s,，]+/gi) || [];
    }

    return [
      item?.url,
      item?.tmp_url,
      item?.link,
      item?.href,
      item?.text,
      item?.name,
    ].flatMap((part) => String(part || "").match(/https?:\/\/[^\s,，]+/gi) || []);
  });

  return [...new Set(urls)].join("\n");
};

const cleanFields = (fields, allowed) => {
  const next = {};

  allowed.forEach((field) => {
    if (fields[field] === undefined) return;
    next[field] = fields[field];
  });

  return next;
};

const hasField = (fields, field) =>
  Object.prototype.hasOwnProperty.call(fields, field);

const linkFieldFromValue = (value) => {
  if (!value) return null;

  const link = firstLineFromValue(value);
  if (!link) return null;

  return {
    link,
    text: link,
  };
};

const sanitizeFileName = (fileName = "image") => {
  const cleaned = String(fileName)
    .trim()
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleaned || "image";
};

const uploadBlobImage = async ({ siteKey, fileName, mimeType, content }) => {
  if (!getEnv("BLOB_READ_WRITE_TOKEN")) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN");
  }

  if (!fileName || !content) {
    throw new Error("Missing upload file name or content");
  }

  if (!String(mimeType || "").startsWith("image/")) {
    throw new Error("Only image uploads are supported");
  }

  const bytes = Buffer.from(content, "base64");
  const pathname = `${siteKey}/products/${Date.now()}-${sanitizeFileName(fileName)}`;
  const blob = await put(pathname, bytes, {
    access: "public",
    contentType: mimeType || "application/octet-stream",
    addRandomSuffix: true,
  });

  return blob.url;
};

const getTenantAccessToken = async () => {
  const appId = getEnv("FEISHU_APP_ID");
  const appSecret = getEnv("FEISHU_APP_SECRET");

  if (!appId || !appSecret) {
    throw new Error("Missing FEISHU_APP_ID or FEISHU_APP_SECRET");
  }

  const response = await fetch(
    `${FEISHU_API}/auth/v3/tenant_access_token/internal`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret,
      }),
    },
  );
  const data = await response.json();

  if (!response.ok || data.code !== 0) {
    throw new Error(data.msg || "Failed to get Feishu tenant_access_token");
  }

  return data.tenant_access_token;
};

const listRecords = async (token, appToken, tableId) => {
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
      },
    );
    const data = await response.json();

    if (!response.ok || data.code !== 0) {
      throw new Error(data.msg || `Failed to list records: ${tableId}`);
    }

    records.push(...(data.data?.items || []));
    pageToken = data.data?.page_token || "";
  } while (pageToken);

  return records;
};

const listFields = async (token, appToken, tableId) => {
  const response = await fetch(
    `${FEISHU_API}/bitable/v1/apps/${appToken}/tables/${tableId}/fields?page_size=100`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json();

  if (!response.ok || data.code !== 0) {
    throw new Error(data.msg || `Failed to list fields: ${tableId}`);
  }

  return data.data?.items || [];
};

const resolveFaqImageUrlsField = async (token, appToken, tableId) => {
  const fields = await listFields(token, appToken, tableId);
  const imageUrlsField = fields.find(
    (field) => field.field_name === FAQ_IMAGE_URL_FIELD,
  );

  if (imageUrlsField) {
    if (imageUrlsField.type !== 1) {
      throw new Error(`FAQ 表字段 "${FAQ_IMAGE_URL_FIELD}" 必须设置为文本类型。`);
    }
    return FAQ_IMAGE_URL_FIELD;
  }

  const legacyImagesField = fields.find((field) => field.field_name === "Images");
  if (legacyImagesField?.type === 1) {
    return "Images";
  }

  const response = await fetch(
    `${FEISHU_API}/bitable/v1/apps/${appToken}/tables/${tableId}/fields`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        field_name: FAQ_IMAGE_URL_FIELD,
        type: 1,
      }),
    },
  );
  const data = await response.json();

  if (!response.ok || data.code !== 0) {
    throw new Error(
      `无法自动创建 FAQ 文本字段 "${FAQ_IMAGE_URL_FIELD}"，请在飞书 FAQ 表新增该文本字段后重试。`,
    );
  }

  return FAQ_IMAGE_URL_FIELD;
};

const tableForResource = (resource) => {
  if (resource === "product") return getEnv("FEISHU_PRODUCTS_TABLE_ID");
  if (resource === "faq") return getEnv("FEISHU_FAQS_TABLE_ID");
  return "";
};

const allowedFieldsForResource = (resource) => {
  if (resource === "product") return PRODUCTS_FIELDS;
  if (resource === "faq") return FAQ_FIELDS;
  return [];
};

const normalizeProduct = (record) => ({
  recordId: record.record_id,
  siteKey: siteKeyFromFields(record.fields),
  productId: textFromValue(record.fields?.["Product ID"]),
  name: textFromValue(record.fields?.Name),
  image: textFromValue(record.fields?.["Cover Image"]),
  videoUrl: textFromValue(record.fields?.["Video URL"]),
  start: textFromValue(record.fields?.Start),
  sort: textFromValue(record.fields?.Sort),
  status: textFromValue(record.fields?.Status) || "Published",
});

const normalizeFaq = (record) => ({
  recordId: record.record_id,
  siteKey: siteKeyFromFields(record.fields),
  productId: textFromValue(record.fields?.["Product ID"]),
  question: textFromValue(record.fields?.Question),
  answer: textFromValue(record.fields?.Answer),
  images:
    urlsFromValue(record.fields?.[FAQ_IMAGE_URL_FIELD]) ||
    linkTextFromValue(record.fields?.[FAQ_IMAGE_URL_FIELD]) ||
    urlsFromValue(record.fields?.Images) ||
    linkTextFromValue(record.fields?.Images),
  sort: textFromValue(record.fields?.Sort),
  status: textFromValue(record.fields?.Status) || "Published",
});

const respondWithAdminContent = async (res, token, siteKey) => {
  const appToken = getEnv("FEISHU_BITABLE_APP_TOKEN");
  const productsTable = getEnv("FEISHU_PRODUCTS_TABLE_ID");
  const faqsTable = getEnv("FEISHU_FAQS_TABLE_ID");

  if (!appToken || !productsTable || !faqsTable) {
    res.status(500).json({
      error:
        "Missing FEISHU_BITABLE_APP_TOKEN, FEISHU_PRODUCTS_TABLE_ID or FEISHU_FAQS_TABLE_ID",
    });
    return;
  }

  const [products, faqs] = await Promise.all([
    listRecords(token, appToken, productsTable),
    listRecords(token, appToken, faqsTable),
  ]);

  res.status(200).json({
    siteKey,
    products: products.map(normalizeProduct).filter((record) => record.siteKey === siteKey),
    faqs: faqs.map(normalizeFaq).filter((record) => record.siteKey === siteKey),
  });
};

const saveRecord = async ({ token, resource, recordId, fields, siteKey }) => {
  const appToken = getEnv("FEISHU_BITABLE_APP_TOKEN");
  const tableId = tableForResource(resource);
  const allowedFields = allowedFieldsForResource(resource);

  if (!appToken || !tableId || !allowedFields.length) {
    throw new Error("Invalid resource or missing table configuration");
  }

  const nextFields = cleanFields(fields, allowedFields);
  nextFields["Site Key"] = siteKey;

  if (resource === "product") {
    if (hasField(nextFields, "Cover Image")) {
      nextFields["Cover Image"] = linkFieldFromValue(nextFields["Cover Image"]);
    }

    if (hasField(nextFields, "Video URL")) {
      nextFields["Video URL"] = linkFieldFromValue(nextFields["Video URL"]);
    }
  }

  if (
    resource === "faq" &&
    (hasField(nextFields, "Images") || hasField(nextFields, FAQ_IMAGE_URL_FIELD))
  ) {
    const imageUrls = nextFields[FAQ_IMAGE_URL_FIELD] ?? nextFields.Images;
    const imageUrlsField = await resolveFaqImageUrlsField(token, appToken, tableId);
    delete nextFields.Images;
    delete nextFields[FAQ_IMAGE_URL_FIELD];
    nextFields[imageUrlsField] = String(imageUrls || "").trim();
  }

  const body = JSON.stringify({
    fields: nextFields,
  });
  const baseUrl = `${FEISHU_API}/bitable/v1/apps/${appToken}/tables/${tableId}/records`;
  const response = await fetch(recordId ? `${baseUrl}/${recordId}` : baseUrl, {
    method: recordId ? "PUT" : "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body,
  });
  const data = await response.json();

  if (!response.ok || data.code !== 0) {
    throw new Error(JSON.stringify(data));
  }

  return data.data?.record;
};

const deleteRecord = async ({ token, resource, recordId }) => {
  const appToken = getEnv("FEISHU_BITABLE_APP_TOKEN");
  const tableId = tableForResource(resource);

  if (!appToken || !tableId || !recordId) {
    throw new Error("Invalid resource, table configuration or record id");
  }

  const response = await fetch(
    `${FEISHU_API}/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`,
    {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json();

  if (!response.ok || data.code !== 0) {
    throw new Error(data.msg || "Failed to delete Feishu record");
  }

  return true;
};

const deleteProductWithFaqs = async ({ token, recordId, siteKey }) => {
  const appToken = getEnv("FEISHU_BITABLE_APP_TOKEN");
  const productsTable = getEnv("FEISHU_PRODUCTS_TABLE_ID");
  const faqsTable = getEnv("FEISHU_FAQS_TABLE_ID");

  if (!appToken || !productsTable || !faqsTable || !recordId) {
    throw new Error("Invalid product delete configuration or record id");
  }

  const productRecords = await listRecords(token, appToken, productsTable);
  const productRecord = productRecords.find(
    (record) =>
      record.record_id === recordId && normalizeProduct(record).siteKey === siteKey,
  );
  const targetProductId = productRecord ? normalizeProduct(productRecord).productId : "";

  if (!targetProductId) {
    throw new Error("Cannot resolve product ID before deleting related FAQs");
  }

  const faqRecords = await listRecords(token, appToken, faqsTable);
  const relatedFaqRecords = faqRecords.filter(
    (record) =>
      normalizeFaq(record).siteKey === siteKey &&
      normalizeFaq(record).productId === targetProductId,
  );

  await Promise.all(
    relatedFaqRecords.map((record) =>
      deleteRecord({ token, resource: "faq", recordId: record.record_id }),
    ),
  );
  await deleteRecord({ token, resource: "product", recordId });

  return relatedFaqRecords.length;
};

const deleteSiteRecord = async ({ token, resource, recordId, siteKey }) => {
  const appToken = getEnv("FEISHU_BITABLE_APP_TOKEN");
  const tableId = tableForResource(resource);
  if (!appToken || !tableId || !recordId) {
    throw new Error("Invalid resource, table configuration or record id");
  }

  const records = await listRecords(token, appToken, tableId);
  const normalize = resource === "faq" ? normalizeFaq : normalizeProduct;
  const matchesSite = records.some(
    (record) => record.record_id === recordId && normalize(record).siteKey === siteKey,
  );
  if (!matchesSite) {
    throw new Error("Record does not belong to the selected site");
  }

  await deleteRecord({ token, resource, recordId });
};

export default async function handler(req, res) {
  const authError = requireAdmin(req);
  if (authError) {
    res
      .status(authError.startsWith("Missing") ? 500 : 401)
      .json({ error: authError });
    return;
  }

  try {
    const siteKey = requestedSiteKey(req);
    if (req.method === "POST") {
      const { resource, recordId, fields, fileName, mimeType, content } =
        req.body || {};

      if (resource === "upload") {
        const url = await uploadBlobImage({
          siteKey,
          fileName,
          mimeType,
          content,
        });
        res.status(200).json({ url });
        return;
      }

      const token = await getTenantAccessToken();
      const record = await saveRecord({
        token,
        resource,
        recordId,
        fields: fields || {},
        siteKey,
      });
      res.status(200).json({ record });
      return;
    }

    const token = await getTenantAccessToken();

    if (req.method === "GET") {
      await respondWithAdminContent(res, token, siteKey);
      return;
    }

    if (req.method === "DELETE") {
      const { resource, recordId } = req.body || {};
      if (resource === "product") {
        const deletedFaqCount = await deleteProductWithFaqs({
          token,
          recordId,
          siteKey,
        });
        res.status(200).json({ ok: true, deletedFaqCount });
        return;
      }

      await deleteSiteRecord({ token, resource, recordId, siteKey });
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message || "Admin API failed",
    });
  }
}
