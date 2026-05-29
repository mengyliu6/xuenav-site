import xuenavLogo from "../assets/images/logo.png";
import xuenavLogoWhite from "../assets/images/logo-white.png";
import xuenavQr from "../assets/images/qrWendy.png";
import qrAbby from "../assets/images/qrAbby.png";
import qrHai from "../assets/images/qrHai.png";
import beautytreesLogo from "../assets/images/logoHai.png";

export const DEFAULT_SITE_KEY = "xuenav";
const XUENAV_DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&fm=webp&q=72&w=1920&h=560";

export const BRANDS = {
  xuenav: {
    siteKey: "xuenav",
    name: "XUENAV",
    hosts: ["xuenav.com", "www.xuenav.com"],
    logo: xuenavLogo,
    logoWhite: xuenavLogoWhite,
    favicon: "/favicon.png",
    qr: xuenavQr,
    defaultBanner: XUENAV_DEFAULT_BANNER,
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
      accent: "#ff9345",
      accentRgb: "255, 147, 69",
      mainDark: "#e85d00",
      mainLight: "#ffedd5",
      surfaceTint: "#fff7ed",
      navStart: "#17120f",
      navEnd: "#2b211a",
      navText: "#fff7ed",
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
    favicon: "/favicon-viknan.svg",
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
      accent: "#38bdf8",
      accentRgb: "56, 189, 248",
      mainDark: "#1d4ed8",
      mainLight: "#dbeafe",
      surfaceTint: "#eff6ff",
      navStart: "#101b34",
      navEnd: "#1e293b",
      navText: "#eff6ff",
      dark: "#07111c",
      dark2: "#0e1a27",
    },
  },
  boxnav: {
    siteKey: "boxnav",
    name: "BOXNAV",
    hosts: ["boxnav.com.cn", "www.boxnav.com.cn"],
    logo: "",
    logoWhite: "",
    favicon: "/favicon-boxnav.svg",
    qr: qrAbby,
    contact: {
      name: "Abby",
      whatsappDisplay: "+86 135 4428 3617",
      whatsappNumber: "8613544283617",
      email: "abby@viknav.com",
      website: "www.boxnav.com.cn",
    },
    theme: {
      main: "#0f766e",
      mainRgb: "15, 118, 110",
      accent: "#2dd4bf",
      accentRgb: "45, 212, 191",
      mainDark: "#115e59",
      mainLight: "#ccfbf1",
      surfaceTint: "#f0fdfa",
      navStart: "#092d2b",
      navEnd: "#112f31",
      navText: "#f0fdfa",
      dark: "#07111c",
      dark2: "#0e1a27",
    },
  },
  beautytrees: {
    siteKey: "beautytrees",
    name: "BEAUTYTREES",
    hosts: ["beautytrees.com", "www.beautytrees.com"],
    logo: beautytreesLogo,
    logoWhite: beautytreesLogo,
    favicon: "/favicon-beautytrees.svg",
    qr: qrHai,
    contact: {
      name: "Engineer Jayzhou",
      whatsappDisplay: "+86 134 2383 3705",
      whatsappNumber: "8613423833705",
      email: "autostereo@163.com",
      website: "www.beautytrees.com",
    },
    theme: {
      main: "#286bd2",
      mainRgb: "40, 107, 210",
      accent: "#43308e",
      accentRgb: "67, 48, 142",
      mainDark: "#312579",
      mainLight: "#e6eeff",
      surfaceTint: "#f1f5ff",
      navStart: "#12162d",
      navEnd: "#27204b",
      navText: "#eef3ff",
      dark: "#11172e",
      dark2: "#211b42",
    },
  },
};

export const BRAND_OPTIONS = Object.values(BRANDS).map(
  ({ siteKey, name, defaultBanner, contact }) => ({
    siteKey,
    name,
    contactName: contact?.name || "",
    defaultBanner: defaultBanner || "",
  }),
);

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

const updateBrandFavicon = (brand = CURRENT_BRAND) => {
  const favicon = brand.favicon || "/favicon.png";
  const type = favicon.endsWith(".svg") ? "image/svg+xml" : "image/png";
  const iconLinks = document.querySelectorAll(
    "link[rel='icon'], link[rel='shortcut icon']",
  );

  if (iconLinks.length) {
    iconLinks.forEach((link) => {
      link.setAttribute("href", favicon);
      link.setAttribute("type", type);
    });
  } else {
    const link = document.createElement("link");
    link.setAttribute("rel", "icon");
    link.setAttribute("type", type);
    link.setAttribute("href", favicon);
    document.head.appendChild(link);
  }

  const appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']");
  if (appleTouchIcon && !favicon.endsWith(".svg")) {
    appleTouchIcon.setAttribute("href", favicon);
  }
};

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
  updateBrandFavicon(brand);
};
