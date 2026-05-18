const STORAGE_KEY = "xuenav_admin_content_v1";

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

export const loadAdminContent = () => {
  if (!isBrowser()) return emptyContent();

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "");
    return {
      products: parsed?.products && typeof parsed.products === "object"
        ? parsed.products
        : {},
    };
  } catch {
    return emptyContent();
  }
};

export const saveAdminContent = (content) => {
  if (!isBrowser()) return;

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      products: content?.products || {},
    })
  );

  window.dispatchEvent(new CustomEvent("xuenav-content-updated"));
};

export const getProductOverride = (productId, content = loadAdminContent()) => {
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

export const mergeProductsContent = (products, content = loadAdminContent()) =>
  products.map((product) => mergeProductContent(product, [], content));

export const STORAGE_LABEL = STORAGE_KEY;
