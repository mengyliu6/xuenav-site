const FEISHU_API = "https://open.feishu.cn/open-apis";

const getEnv = (name) => process.env[name] || "";

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

const isJsonResponse = (response) =>
  (response.headers.get("content-type") || "").includes("application/json");

const fetchDirectFeishuImage = async (token, fileToken) => {
  const encodedToken = encodeURIComponent(fileToken);
  const urls = [
    `${FEISHU_API}/drive/v1/files/${encodedToken}/download`,
    `${FEISHU_API}/drive/v1/medias/${encodedToken}/download`,
  ];
  let lastResponse = null;

  for (const url of urls) {
    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    if (response.ok && !isJsonResponse(response)) return response;
    lastResponse = response;
  }

  return lastResponse;
};

const fetchTmpDownloadUrl = async (token, fileToken) => {
  const params = new URLSearchParams({
    file_tokens: fileToken,
  });
  const response = await fetch(
    `${FEISHU_API}/drive/v1/medias/batch_get_tmp_download_url?${params.toString()}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.code !== 0) return "";

  return data.data?.tmp_download_urls?.[0]?.tmp_download_url || "";
};

const fetchFeishuImage = async (token, fileToken) => {
  const directResponse = await fetchDirectFeishuImage(token, fileToken);
  if (directResponse?.ok && !isJsonResponse(directResponse)) {
    return directResponse;
  }

  const tmpUrl = await fetchTmpDownloadUrl(token, fileToken);
  if (!tmpUrl) return directResponse;

  const tmpResponse = await fetch(tmpUrl);
  return tmpResponse.ok ? tmpResponse : directResponse;
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const fileToken = String(req.query?.token || "").trim();
  if (!fileToken) {
    res.status(400).json({ error: "Missing file token" });
    return;
  }

  try {
    const token = await getTenantAccessToken();
    const response = await fetchFeishuImage(token, fileToken);

    if (!response.ok) {
      const message = await response.text();
      res.status(response.status).json({
        error: message || "Failed to download Feishu image",
      });
      return;
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const contentLength = response.headers.get("content-length");
    const data = Buffer.from(await response.arrayBuffer());

    res.setHeader("content-type", contentType);
    res.setHeader("content-disposition", "inline");
    if (contentLength) res.setHeader("content-length", contentLength);
    res.setHeader("cache-control", "s-maxage=86400, stale-while-revalidate=604800");
    res.status(200).send(data);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Image proxy failed",
    });
  }
}
