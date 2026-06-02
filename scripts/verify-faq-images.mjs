import assert from "node:assert/strict";
import adminHandler from "../api/admin.js";
import contentHandler from "../api/content.js";

const response = (data) => ({
  ok: true,
  json: async () => data,
});

const xuenavHeaders = {
  "x-admin-username": "xuenav-admin",
  "x-admin-password": "xuenav-secret",
};

const resCapture = () => {
  const captured = {};
  return {
    captured,
    res: {
      setHeader() {},
      status(status) {
        captured.status = status;
        return this;
      },
      json(body) {
        captured.body = body;
      },
    },
  };
};

const verifyAdminWriteTarget = async (imagesType) => {
  const calls = [];
  global.fetch = async (url, options = {}) => {
    if (url.includes("tenant_access_token")) {
      return response({ code: 0, tenant_access_token: "tenant" });
    }
    if (url.includes("/tables/faqs/records?")) {
      return response({
        code: 0,
        data: { items: [{ record_id: "rec", fields: { "Product ID": "p1" } }] },
      });
    }
    if (url.includes("/fields") && !options.method) {
      return response({
        code: 0,
        data: { items: [{ field_name: "Images", type: imagesType }] },
      });
    }
    if (url.endsWith("/fields") && options.method === "POST") {
      calls.push({ create: JSON.parse(options.body) });
      return response({ code: 0 });
    }
    if (url.includes("/records?") && !options.method) {
      return response({
        code: 0,
        data: { items: [{ record_id: "rec", fields: { "Product ID": "p1" } }] },
      });
    }
    if (url.includes("/records/rec") && options.method === "PUT") {
      calls.push({ fields: JSON.parse(options.body).fields });
      return response({ code: 0, data: { record: {} } });
    }
    throw new Error(`Unexpected admin fetch: ${options.method || "GET"} ${url}`);
  };

  const { captured, res } = resCapture();
  await adminHandler(
    {
      method: "POST",
      headers: xuenavHeaders,
      body: {
        resource: "faq",
        recordId: "rec",
        fields: {
          Images: "https://cdn.example/a.jpg\nhttps://cdn.example/b.jpg",
        },
      },
    },
    res,
  );

  assert.equal(captured.status, 200);
  return calls;
};

const verifyAdminStorageRouting = async () => {
  process.env.ADMIN_XUENAV_USERNAME = xuenavHeaders["x-admin-username"];
  process.env.ADMIN_XUENAV_PASSWORD = xuenavHeaders["x-admin-password"];
  process.env.FEISHU_APP_ID = "id";
  process.env.FEISHU_APP_SECRET = "secret";
  process.env.FEISHU_BITABLE_APP_TOKEN = "app";
  process.env.FEISHU_FAQS_TABLE_ID = "faqs";

  const attachmentCalls = await verifyAdminWriteTarget(17);
  assert.equal(attachmentCalls[0].create.field_name, "Image URLs");
  assert.match(attachmentCalls[1].fields["Image URLs"], /b\.jpg/);
  assert.equal(attachmentCalls[1].fields.Images, undefined);
  assert.equal(attachmentCalls[1].fields["Site Key"], "xuenav");

  const textCalls = await verifyAdminWriteTarget(1);
  assert.equal(textCalls.length, 1);
  assert.match(textCalls[0].fields.Images, /a\.jpg/);
  assert.equal(textCalls[0].fields["Image URLs"], undefined);
};

const verifyTextOnlyFaqDoesNotChangeSchema = async () => {
  global.fetch = async (url, options = {}) => {
    if (url.includes("tenant_access_token")) {
      return response({ code: 0, tenant_access_token: "tenant" });
    }
    if (url.includes("/tables/faqs/records?")) {
      return response({
        code: 0,
        data: { items: [{ record_id: "rec", fields: { "Product ID": "p1" } }] },
      });
    }
    if (url.includes("/fields")) {
      throw new Error("Text-only FAQ should not inspect image fields.");
    }
    if (url.includes("/records?") && !options.method) {
      return response({
        code: 0,
        data: { items: [{ record_id: "rec", fields: { "Product ID": "p1" } }] },
      });
    }
    if (url.includes("/records/rec") && options.method === "PUT") {
      const fields = JSON.parse(options.body).fields;
      assert.equal(fields.Images, undefined);
      return response({ code: 0, data: { record: {} } });
    }
    throw new Error(`Unexpected text-only fetch: ${options.method || "GET"} ${url}`);
  };

  const { captured, res } = resCapture();
  await adminHandler(
    {
      method: "POST",
      headers: xuenavHeaders,
      body: {
        resource: "faq",
        recordId: "rec",
        fields: { Question: "Text only", Answer: "Answer" },
      },
    },
    res,
  );

  assert.equal(captured.status, 200);
};

const verifyPublicImagePayload = async () => {
  process.env.FEISHU_APP_ID = "id";
  process.env.FEISHU_APP_SECRET = "secret";
  process.env.FEISHU_BITABLE_APP_TOKEN = "app";
  process.env.FEISHU_PRODUCTS_TABLE_ID = "products";
  process.env.FEISHU_FAQS_TABLE_ID = "faqs";

  global.fetch = async (url) => {
    if (url.includes("tenant_access_token")) {
      return response({ code: 0, tenant_access_token: "tenant" });
    }
    if (url.includes("/products/")) {
      return response({
        code: 0,
        data: {
          items: [
            {
              fields: {
                "Product ID": "__site_settings__",
                "Cover Image": "https://cdn.example/banner.jpg",
                Status: "Published",
              },
            },
            {
              fields: {
                "Product ID": "p1",
                Name: "Product",
                Sort: 1,
                Status: "Published",
              },
            },
            {
              fields: {
                "Site Key": "viknan",
                "Product ID": "viknan-only",
                Name: "Viknan Product",
                Status: "Published",
              },
            },
          ],
        },
      });
    }
    if (url.includes("/faqs/")) {
      return response({
        code: 0,
        data: {
          items: [
            {
              fields: {
                "Product ID": "p1",
                Question: "New",
                Answer: "Answer",
                "Image URLs":
                  "https://cdn.example/a.jpg\nhttps://cdn.example/b.jpg",
                Images: "https://cdn.example/c.jpg",
                Status: "Published",
              },
            },
            {
              fields: {
                "Product ID": "p1",
                Question: "Legacy",
                Answer: "Answer",
                "Image URLs": "",
                Images: "https://cdn.example/legacy.jpg",
                Status: "Published",
              },
            },
          ],
        },
      });
    }
    throw new Error(`Unexpected content fetch: ${url}`);
  };

  const { captured, res } = resCapture();
  await contentHandler({ method: "GET" }, res);
  const faqs = captured.body.products.p1.faqs;

  assert.equal(faqs[0].images.length, 3);
  assert.equal(faqs[0].images[2].url, "https://cdn.example/c.jpg");
  assert.equal(faqs[1].images[0].url, "https://cdn.example/legacy.jpg");
  assert.equal(captured.body.products["viknan-only"], undefined);
  assert.equal(captured.body.products.__site_settings__, undefined);
  assert.equal(captured.body.settings.bannerImage, "https://cdn.example/banner.jpg");
};

const verifyProductDeleteRemovesRelatedFaqs = async () => {
  process.env.ADMIN_XUENAV_USERNAME = xuenavHeaders["x-admin-username"];
  process.env.ADMIN_XUENAV_PASSWORD = xuenavHeaders["x-admin-password"];
  process.env.FEISHU_APP_ID = "id";
  process.env.FEISHU_APP_SECRET = "secret";
  process.env.FEISHU_BITABLE_APP_TOKEN = "app";
  process.env.FEISHU_PRODUCTS_TABLE_ID = "products";
  process.env.FEISHU_FAQS_TABLE_ID = "faqs";

  const deletedUrls = [];
  global.fetch = async (url, options = {}) => {
    if (url.includes("tenant_access_token")) {
      return response({ code: 0, tenant_access_token: "tenant" });
    }
    if (url.includes("/tables/products/records?")) {
      return response({
        code: 0,
        data: {
          items: [
            { record_id: "product-record", fields: { "Product ID": "p1" } },
          ],
        },
      });
    }
    if (url.includes("/tables/faqs/records?")) {
      return response({
        code: 0,
        data: {
          items: [
            { record_id: "faq-product", fields: { "Product ID": "p1" } },
            {
              record_id: "faq-viknan-same-id",
              fields: { "Site Key": "viknan", "Product ID": "p1" },
            },
            { record_id: "faq-other", fields: { "Product ID": "p2" } },
            { record_id: "faq-default", fields: { "Product ID": "__default__" } },
          ],
        },
      });
    }
    if (options.method === "DELETE") {
      deletedUrls.push(url);
      return response({ code: 0 });
    }
    throw new Error(`Unexpected delete fetch: ${options.method || "GET"} ${url}`);
  };

  const { captured, res } = resCapture();
  await adminHandler(
    {
      method: "DELETE",
      headers: xuenavHeaders,
      body: {
        resource: "product",
        recordId: "product-record",
        productId: "stale-unsaved-id",
      },
    },
    res,
  );

  assert.equal(captured.status, 200);
  assert.equal(captured.body.deletedFaqCount, 1);
  assert.equal(deletedUrls.some((url) => url.includes("faq-product")), true);
  assert.equal(deletedUrls.some((url) => url.includes("faq-other")), false);
  assert.equal(deletedUrls.some((url) => url.includes("faq-default")), false);
  assert.equal(deletedUrls.some((url) => url.includes("faq-viknan-same-id")), false);
  assert.equal(deletedUrls.some((url) => url.includes("product-record")), true);
};

const verifyAdminAccountCannotSwitchSite = async () => {
  process.env.ADMIN_VIKNAN_USERNAME = "viknan-admin";
  process.env.ADMIN_VIKNAN_PASSWORD = "viknan-secret";
  process.env.FEISHU_APP_ID = "id";
  process.env.FEISHU_APP_SECRET = "secret";
  process.env.FEISHU_BITABLE_APP_TOKEN = "app";
  process.env.FEISHU_PRODUCTS_TABLE_ID = "products";
  process.env.FEISHU_FAQS_TABLE_ID = "faqs";

  global.fetch = async (url) => {
    if (url.includes("tenant_access_token")) {
      return response({ code: 0, tenant_access_token: "tenant" });
    }
    if (url.includes("/tables/products/records?")) {
      return response({
        code: 0,
        data: {
          items: [
            { record_id: "x-product", fields: { "Product ID": "x", Name: "Xuenav" } },
            {
              record_id: "v-product",
              fields: { "Site Key": "viknan", "Product ID": "v", Name: "Viknan" },
            },
          ],
        },
      });
    }
    if (url.includes("/tables/faqs/records?")) {
      return response({ code: 0, data: { items: [] } });
    }
    throw new Error(`Unexpected site isolation fetch: ${url}`);
  };

  const { captured, res } = resCapture();
  await adminHandler(
    {
      method: "GET",
      query: { siteKey: "xuenav" },
      headers: {
        "x-admin-username": "viknan-admin",
        "x-admin-password": "viknan-secret",
      },
    },
    res,
  );

  assert.equal(captured.status, 200);
  assert.equal(captured.body.siteKey, "viknan");
  assert.deepEqual(captured.body.products.map((product) => product.productId), ["v"]);

  const blocked = resCapture();
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    await adminHandler(
      {
        method: "POST",
        headers: {
          "x-admin-username": "viknan-admin",
          "x-admin-password": "viknan-secret",
        },
        body: {
          resource: "product",
          recordId: "x-product",
          fields: { Name: "Should not overwrite Xuenav" },
        },
      },
      blocked.res,
    );
  } finally {
    console.error = originalConsoleError;
  }

  assert.equal(blocked.captured.status, 500);
  assert.match(blocked.captured.body.error, /signed-in site/);
};

const verifyBannerSavesAsHiddenSettingsProduct = async () => {
  let savedFields;
  global.fetch = async (url, options = {}) => {
    if (url.includes("tenant_access_token")) {
      return response({ code: 0, tenant_access_token: "tenant" });
    }
    if (url.includes("/tables/products/records") && options.method === "POST") {
      savedFields = JSON.parse(options.body).fields;
      return response({ code: 0, data: { record: {} } });
    }
    throw new Error(`Unexpected banner fetch: ${options.method || "GET"} ${url}`);
  };

  const { captured, res } = resCapture();
  await adminHandler(
    {
      method: "POST",
      headers: xuenavHeaders,
      body: {
        resource: "settings",
        fields: { "Cover Image": "https://cdn.example/banner-1920x560.jpg" },
      },
    },
    res,
  );

  assert.equal(captured.status, 200);
  assert.equal(savedFields["Product ID"], "__site_settings__");
  assert.equal(savedFields["Site Key"], "xuenav");
  assert.equal(savedFields.Name, "Homepage Banner");
  assert.equal(savedFields["Cover Image"].link, "https://cdn.example/banner-1920x560.jpg");
};

await verifyAdminStorageRouting();
await verifyTextOnlyFaqDoesNotChangeSchema();
await verifyPublicImagePayload();
await verifyProductDeleteRemovesRelatedFaqs();
await verifyAdminAccountCannotSwitchSite();
await verifyBannerSavesAsHiddenSettingsProduct();
console.log("FAQ images, banner settings, cascading deletion and account site isolation verified.");
