import { createRouter, createWebHistory } from "vue-router";
import AdminPage from "../pages/AdminPage.vue";
import Home from "../pages/Home.vue";
import FaqPage from "../pages/FaqPage.vue";
import ProductDetail from "../pages/ProductDetail.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/product/:id",
    name: "ProductDetail",
    component: ProductDetail,
  },
  {
    path: "/faq",
    name: "Faq",
    component: FaqPage,
  },
  {
    path: "/admin",
    name: "Admin",
    component: AdminPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,

  scrollBehavior(to) {
    if (to.hash) {
      return {
        el: to.hash,
        top: 90,
        behavior: "smooth",
      };
    }

    return {
      top: 0,
      behavior: "smooth",
    };
  },
});

export default router;
