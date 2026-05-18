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
    gallery,
    faqs: productFaqs,
    hasCustomGallery: normalizeImages(override.gallery).length > 0,
    hasCustomFaqs: normalizeFaqs(override.faqs).length > 0,
  };
};

export const mergeProductsContent = (products, content = emptyContent()) =>
  products.map((product) => mergeProductContent(product, [], content));
