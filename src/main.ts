import { createApp } from "vue";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "element-plus/dist/index.css";
import "./assets/css/index.scss";
import "./assets/icons/index.js";

import { ComponentCustomProperties } from "vue";
import { Store } from "vuex";
declare module "@vue/runtime-core" {
  interface State {
    count: number;
  }

  interface ComponentCustomProperties {
    $store: Store<State>;
  }
}

// 跨标签 / 浏览器重开恢复登录态：user 模块的 state 已经从 localStorage 取了 authToken，
// 这里把 configure.token 也置 true，让 router beforeEach 守卫能放行受保护页面
if (store.getters.authToken && !store.getters.token) {
  store.commit("setToken", true);
}

createApp(App).use(store).use(router).use(ElementPlus, { locale: zhCn }).mount("#app");
