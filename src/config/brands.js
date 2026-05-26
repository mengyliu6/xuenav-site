import xuenavLogo from "../assets/images/logo.png";
import xuenavLogoWhite from "../assets/images/logo-white.png";
import xuenavQr from "../assets/images/qrWendy.png";
import qrAbby from "../assets/images/qrAbby.png";
import qrHai from "../assets/images/qrHai.png";

export const DEFAULT_SITE_KEY = "xuenav";

export const BRANDS = {
  xuenav: {
    siteKey: "xuenav",
    name: "XUENAV",
    hosts: ["xuenav.com", "www.xuenav.com"],
    logo: xuenavLogo,
    logoWhite: xuenavLogoWhite,
    qr: xuenavQr,
    contact: {
      name: "Wendy",
      whatsappDisplay: "+86 134 3447 3048",
      whatsappNumber: "8613434473048",
      email: "xuenav666@163.com",
      website: "www.xuenav.com",
    },
    theme: {
      main: "#ff6a00",
      mainRgb: "255, 106, 0",
      mainDark: "#e85d00",
      mainLight: "#ffedd5",
      dark: "#07111c",
      dark2: "#0e1a27",
    },
  },
  viknan: {
    siteKey: "viknan",
    name: "VIKNAN",
    hosts: ["viknan.com", "www.viknan.com"],
    logo: "",
    logoWhite: "",
    qr: qrAbby,
    contact: {
      name: "Abby",
      whatsappDisplay: "+86 135 4428 3617",
      whatsappNumber: "8613544283617",
      email: "abby@viknav.com",
      website: "www.viknan.com",
    },
    theme: {
      main: "#2563eb",
      mainRgb: "37, 99, 235",
      mainDark: "#1d4ed8",
      mainLight: "#dbeafe",
      dark: "#07111c",
      dark2: "#0e1a27",
    },
  },
  boxnav: {
    siteKey: "boxnav",
    name: "BOXNAV",
    hosts: ["boxnav.com", "www.boxnav.com"],
    logo: "",
    logoWhite: "",
    qr: qrAbby,
    contact: {
      name: "Abby",
      whatsappDisplay: "+86 135 4428 3617",
      whatsappNumber: "8613544283617",
      email: "abby@viknav.com",
      website: "www.boxnav.com",
    },
    theme: {
      main: "#0f766e",
      mainRgb: "15, 118, 110",
      mainDark: "#115e59",
      mainLight: "#ccfbf1",
      dark: "#07111c",
      dark2: "#0e1a27",
    },
  },
};

export const BRAND_OPTIONS = Object.values(BRANDS).map(({ siteKey, name }) => ({
  siteKey,
  name,
}));

const normalizeSiteKey = (value) => {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  return BRANDS[key] ? key : "";
};

export const resolveSiteKey = () => {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
  const matchedBrand = Object.values(BRANDS).find((brand) =>
    brand.hosts.includes(hostname),
  );

  if (matchedBrand) return matchedBrand.siteKey;

  const configuredFallback = normalizeSiteKey(
    import.meta.env.VITE_DEFAULT_SITE_KEY,
  );
  return configuredFallback || DEFAULT_SITE_KEY;
};

export const CURRENT_BRAND = BRANDS[resolveSiteKey()];

export const applyBrandTheme = (brand = CURRENT_BRAND) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  Object.entries(brand.theme).forEach(([key, value]) => {
    const variableName = key.replace(
      /[A-Z]/g,
      (letter) => `-${letter.toLowerCase()}`,
    );
    root.style.setProperty(`--${variableName}`, value);
  });
  document.title = `${brand.name} After-Sales Support`;
};
