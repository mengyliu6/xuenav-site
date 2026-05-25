import assert from "node:assert/strict";
import adminHandler from "../api/admin.js";
import contentHandler from "../api/content.js";

const response = (data) => ({
  ok: true,
  json: async () => data,
});

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
      headers: { "x-admin-token": "token" },
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
  process.env.ADMIN_API_TOKEN = "token";
  process.env.FEISHU_APP_ID = "id";
  process.env.FEISHU_APP_SECRET = "secret";
  process.env.FEISHU_BITABLE_APP_TOKEN = "app";
  process.env.FEISHU_FAQS_TABLE_ID = "faqs";

  const attachmentCalls = await verifyAdminWriteTarget(17);
  assert.equal(attachmentCalls[0].create.field_name, "Image URLs");
  assert.match(attachmentCalls[1].fields["Image URLs"], /b\.jpg/);
  assert.equal(attachmentCalls[1].fields.Images, undefined);

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
    if (url.includes("/fields")) {
      throw new Error("Text-only FAQ should not inspect image fields.");
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
      headers: { "x-admin-token": "token" },
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
  process.env.FEISHU_GALLERY_TABLE_ID = "gallery";

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
                "Product ID": "p1",
                Name: "Product",
                Sort: 1,
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
    if (url.includes("/gallery/")) {
      return response({ code: 0, data: { items: [] } });
    }
    throw new Error(`Unexpected content fetch: ${url}`);
  };

  const { captured, res } = resCapture();
  await contentHandler({ method: "GET" }, res);
  const faqs = captured.body.products.p1.faqs;

  assert.equal(faqs[0].images.length, 2);
  assert.equal(faqs[1].images[0].url, "https://cdn.example/legacy.jpg");
};

await verifyAdminStorageRouting();
await verifyTextOnlyFaqDoesNotChangeSchema();
await verifyPublicImagePayload();
console.log("FAQ multi-image storage and rendering verified.");
