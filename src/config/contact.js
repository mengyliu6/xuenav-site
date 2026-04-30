export const CONTACT = {
  name: "Wendy",
  whatsappDisplay: "+86 134 3447 3048",
  whatsappNumber: "8613434473048",
  email: "xuenav666@163.com",
  website: "www.xuenav.com",

  whatsappLink(message = "Hello, I need Xuenav after-sales support.") {
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(
      message
    )}`;
  },

  emailLink(subject = "Xuenav After-sales Support") {
    return `mailto:${this.email}?subject=${encodeURIComponent(subject)}`;
  },
};
