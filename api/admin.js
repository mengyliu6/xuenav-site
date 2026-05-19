const FEISHU_API = "https://open.feishu.cn/open-apis";

const PRODUCTS_FIELDS = [
  "Product ID",
  "Name",
  "Cover Image",
  "Video URL",
  "Start",
  "Sort",
  "Status",
];

const FAQ_FIELDS = [
  "Product ID",
  "Question",
  "Answer",
  "Images",
  "Sort",
  "Status",
];

const getEnv = (name) => process.env[name] || "";

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
          item?.text ||
          item?.name ||
          item?.url ||
          item?.tmp_url ||
          item?.link ||
          ""
        );
      })
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  return String(
    value.text || value.name || value.url || value.tmp_url || value.link || "",
  ).trim();
};

const cleanFields = (fields, allowed) => {
  const next = {};

  allowed.forEach((field) => {
    if (fields[field] === undefined) return;
    next[field] = fields[field];
  });

  return next;
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
  productId: textFromValue(record.fields?.["Product ID"]),
  question: textFromValue(record.fields?.Question),
  answer: textFromValue(record.fields?.Answer),
  images: textFromValue(record.fields?.Images),
  sort: textFromValue(record.fields?.Sort),
  status: textFromValue(record.fields?.Status) || "Published",
});

const respondWithAdminContent = async (res, token) => {
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
    products: products.map(normalizeProduct),
    faqs: faqs.map(normalizeFaq),
  });
};

const saveRecord = async ({ token, resource, recordId, fields }) => {
  const appToken = getEnv("FEISHU_BITABLE_APP_TOKEN");
  const tableId = tableForResource(resource);
  const allowedFields = allowedFieldsForResource(resource);

  if (!appToken || !tableId || !allowedFields.length) {
    throw new Error("Invalid resource or missing table configuration");
  }

  const body = JSON.stringify({
    fields: cleanFields(fields, allowedFields),
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
    console.log(data);
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

export default async function handler(req, res) {
  const authError = requireAdmin(req);
  if (authError) {
    res
      .status(authError.startsWith("Missing") ? 500 : 401)
      .json({ error: authError });
    return;
  }

  try {
    const token = await getTenantAccessToken();

    if (req.method === "GET") {
      await respondWithAdminContent(res, token);
      return;
    }

    if (req.method === "POST") {
      const { resource, recordId, fields } = req.body || {};
      const record = await saveRecord({
        token,
        resource,
        recordId,
        fields: fields || {},
      });
      res.status(200).json({ record });
      return;
    }

    if (req.method === "DELETE") {
      const { resource, recordId } = req.body || {};
      await deleteRecord({ token, resource, recordId });
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
