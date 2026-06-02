const isBrowser = () => typeof window !== "undefined";
const CONTENT_CACHE_KEY = "remote_content_v2";
const CONTENT_CACHE_TTL = 24 * 60 * 60 * 1000;
const CONTENT_FETCH_TIMEOUT = 10000;

const emptyContent = () => ({
  products: {},
  defaultFaqs: [],
  settings: { bannerImage: "" },
});

const normalizeImages = (images = []) => {
  const items = Array.isArray(images) ? images : String(images || "").split(/[\n,]/);
  const seen = new Set();

  return items
    .map((item) => {
      const url = String(item?.url || item || "").trim();
      return {
        url,
        caption: String(item?.caption || "").trim(),
      };
    })
    .filter((item) => {
      if (!item.url || seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });
};

const normalizeFaqs = (items = []) =>
  items
    .map((item) => ({
      question: String(item?.question || "").trim(),
      answer: String(item?.answer || "").trim(),
      videoUrl: String(item?.videoUrl || item?.video || "").trim(),
      images: normalizeImages(item?.images),
    }))
    .filter((item) => item.question && item.answer);

const normalizeContent = (data, fallback = emptyContent()) => ({
  siteKey: String(data?.siteKey || fallback.siteKey || ""),
  products: data?.products && typeof data.products === "object"
    ? data.products
    : fallback.products || {},
  defaultFaqs: Array.isArray(data?.defaultFaqs)
    ? normalizeFaqs(data.defaultFaqs)
    : normalizeFaqs(fallback.defaultFaqs),
  settings: {
    bannerImage: String(data?.settings?.bannerImage || fallback.settings?.bannerImage || "").trim(),
  },
  configured: Boolean(data?.configured),
  error: data?.error || "",
});

const cacheKeyForSite = (siteKey) => `${CONTENT_CACHE_KEY}:${siteKey}`;

export const getCachedContent = (siteKey = "xuenav") => {
  if (!isBrowser()) return null;

  try {
    const cached = JSON.parse(window.localStorage.getItem(cacheKeyForSite(siteKey)) || "null");
    if (!cached?.savedAt || Date.now() - cached.savedAt > CONTENT_CACHE_TTL) return null;
    return normalizeContent(cached.content);
  } catch {
    return null;
  }
};

const cacheContent = (content, siteKey) => {
  if (!isBrowser() || !content?.configured) return;

  try {
    window.localStorage.setItem(
      cacheKeyForSite(siteKey),
      JSON.stringify({
        savedAt: Date.now(),
        content,
      })
    );
  } catch {
    // Storage can be unavailable in private browsing modes.
  }
};

export const loadRemoteContent = async (fallback = emptyContent(), siteKey = "xuenav") => {
  if (!isBrowser()) return fallback;

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), CONTENT_FETCH_TIMEOUT);

  try {
    const response = await fetch(`/api/content?siteKey=${encodeURIComponent(siteKey)}`, {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) return fallback;

    const data = await response.json();
    const content = normalizeContent(data, fallback);
    cacheContent(content, siteKey);
    return content;
  } catch {
    return getCachedContent(siteKey) || fallback;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const getProductOverride = (productId, content = emptyContent()) => {
  return content.products?.[productId] || {};
};

export const mergeProductContent = (product, fallbackFaqs = [], content) => {
  const override = getProductOverride(product.id, content);
  const name = String(override.name || product.name || "").trim();
  const image = String(override.image || product.image || "").trim();
  const videoUrl =
    typeof override.videoUrl === "string" ? override.videoUrl : product.videoUrl || "";
  const defaultFaqs = normalizeFaqs(content?.defaultFaqs);
  const productFaqs = normalizeFaqs(override.faqs).length
    ? normalizeFaqs(override.faqs)
    : normalizeFaqs(product.faqs).length
      ? normalizeFaqs(product.faqs)
      : defaultFaqs.length
        ? defaultFaqs
        : fallbackFaqs;

  return {
    ...product,
    name,
    image,
    videoUrl,
    start: Number(override.start ?? product.start ?? 0),
    sort: Number(override.sort ?? product.sort ?? 0),
    faqs: productFaqs,
    hasCustomFaqs: normalizeFaqs(override.faqs).length > 0,
  };
};

const productFromRemote = ([id, item]) =>
  mergeProductContent(
    {
      id,
      name: "",
      image: "",
      videoUrl: "",
      start: 0,
      sort: 0,
    },
    [],
    {
      products: {
        [id]: item,
      },
    }
  );

const bySortThenName = (a, b) => {
  const orderFor = (item) => {
    const sort = Number(item?.sort);
    return Number.isFinite(sort) && sort > 0 ? sort : Number.MAX_SAFE_INTEGER;
  };
  const sortA = orderFor(a);
  const sortB = orderFor(b);

  if (sortA !== sortB) return sortA - sortB;

  return String(a.name || a.id).localeCompare(String(b.name || b.id));
};

export const mergeProductsContent = (products, content = emptyContent()) => {
  const remoteProducts = Object.entries(content.products || {});

  if (content.configured && remoteProducts.length) {
    return remoteProducts.map(productFromRemote).sort(bySortThenName);
  }

  return products
    .map((product) => mergeProductContent(product, [], content))
    .sort(bySortThenName);
};

export const resolveProductContent = (
  productId,
  products,
  fallbackFaqs = [],
  content = emptyContent()
) => {
  const staticProduct = products.find((item) => item.id === productId);
  const remoteProduct = content.products?.[productId];

  if (remoteProduct) {
    return mergeProductContent(
      staticProduct || {
        id: productId,
        name: "",
        image: "",
        videoUrl: "",
        start: 0,
        sort: 0,
      },
      fallbackFaqs,
      content
    );
  }

  return staticProduct ? mergeProductContent(staticProduct, fallbackFaqs, content) : null;
};
