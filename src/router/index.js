import { createRouter, createWebHistory } from "vue-router";
import Home from "../pages/Home.vue";
import ProductDetail from "../pages/ProductDetail.vue";

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/product/:id",
    component: ProductDetail,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
