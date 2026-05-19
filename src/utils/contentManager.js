const isBrowser = () => typeof window !== "undefined";

const emptyContent = () => ({
  products: {},
});

const normalizeImages = (images = []) =>
  images
    .map((item) => ({
      url: String(item?.url || "").trim(),
      caption: String(item?.caption || "").trim(),
    }))
    .filter((item) => item.url);

const normalizeFaqs = (items = []) =>
  items
    .map((item) => ({
      question: String(item?.question || "").trim(),
      answer: String(item?.answer || "").trim(),
      images: normalizeImages(item?.images),
    }))
    .filter((item) => item.question && item.answer);

export const loadRemoteContent = async (fallback = emptyContent()) => {
  if (!isBrowser()) return fallback;

  try {
    const response = await fetch("/api/content", {
      headers: { accept: "application/json" },
    });

    if (!response.ok) return fallback;

    const data = await response.json();
    return {
      products: data?.products && typeof data.products === "object"
        ? data.products
        : fallback.products || {},
      configured: Boolean(data?.configured),
      error: data?.error || "",
    };
  } catch {
    return fallback;
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
  const gallery = normalizeImages(override.gallery).length
    ? normalizeImages(override.gallery)
    : normalizeImages(product.gallery).length
      ? normalizeImages(product.gallery)
      : image
        ? [{ url: image, caption: name || "Product image" }]
        : [];
  const productFaqs = normalizeFaqs(override.faqs).length
    ? normalizeFaqs(override.faqs)
    : normalizeFaqs(product.faqs).length
      ? normalizeFaqs(product.faqs)
      : fallbackFaqs;

  return {
    ...product,
    name,
    image,
    videoUrl,
    start: Number(override.start ?? product.start ?? 0),
    sort: Number(override.sort ?? product.sort ?? 0),
    gallery,
    faqs: productFaqs,
    hasCustomGallery: normalizeImages(override.gallery).length > 0,
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
  const sortA = Number(a.sort || 0);
  const sortB = Number(b.sort || 0);

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
