import { CURRENT_BRAND } from "./brands";

export const BRAND = CURRENT_BRAND;
export const CONTACT = {
  ...CURRENT_BRAND.contact,

  whatsappLink(message = `Hello, I need ${CURRENT_BRAND.name} after-sales support.`) {
    if (!this.whatsappNumber) return "";
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
  },

  emailLink(subject = `${CURRENT_BRAND.name} After-sales Support`) {
    if (!this.email) return "";
    return `mailto:${this.email}?subject=${encodeURIComponent(subject)}`;
  },
};
