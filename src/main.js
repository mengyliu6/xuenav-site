import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { applyBrandTheme } from "./config/brands";
import "./style.css";
import "./styles/effects.css";

applyBrandTheme();
createApp(App).use(router).mount("#app");
