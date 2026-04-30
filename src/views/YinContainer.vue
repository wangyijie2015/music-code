<template>
  <el-container>
    <el-header>
      <yin-header></yin-header>
    </el-header>
    <el-main>
      <router-view />
      <yin-current-play></yin-current-play>
      <yin-play-bar v-if="!isMvPage"></yin-play-bar>
      <yin-scroll-top></yin-scroll-top>
      <yin-audio v-if="!isMvPage"></yin-audio>
    </el-main>
    <el-footer>
      <yin-footer></yin-footer>
    </el-footer>
  </el-container>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import YinHeader from "@/components/layouts/YinHeader.vue";
import YinCurrentPlay from "@/components/layouts/YinCurrentPlay.vue";
import YinPlayBar from "@/components/layouts/YinPlayBar.vue";
import YinScrollTop from "@/components/layouts/YinScrollTop.vue";
import YinFooter from "@/components/layouts/YinFooter.vue";
import YinAudio from "@/components/layouts/YinAudio.vue";

const route = useRoute();
const isMvPage = computed(() => route.path.startsWith("/mv"));

const { proxy } = getCurrentInstance();
const store = useStore();
const token = computed(() => store.getters.token);

try {
  const saved = sessionStorage.getItem("dataStore");
  if (saved) {
    proxy.$store.replaceState(Object.assign({}, proxy.$store.state, JSON.parse(saved)));
  }
} catch (e) {
  console.warn("恢复播放状态失败", e);
  sessionStorage.removeItem("dataStore");
}

// 防止旧版 sessionStorage（无 authToken 字段）覆盖掉刚从 localStorage 初始化的 token
try {
  const lsToken = localStorage.getItem("music_authToken");
  if (lsToken && !proxy.$store.getters.authToken) {
    proxy.$store.commit("setAuthToken", lsToken);
  }
  if (proxy.$store.getters.authToken && !proxy.$store.getters.token) {
    proxy.$store.commit("setToken", true);
  }
} catch { /* ignore */ }

window.addEventListener("beforeunload", () => {
  try {
    const snapshot = { ...proxy.$store.state };
    delete (snapshot as any).chat; // chat 状态不持久化，登录后重新拉取
    sessionStorage.setItem("dataStore", JSON.stringify(snapshot));
  } catch (e) {
    console.warn("保存播放状态失败", e);
  }
});

onMounted(() => {
  if (token.value) {
    store.dispatch("connectChat");
  }
});

watch(token, (val) => {
  if (val) {
    store.dispatch("connectChat");
  } else {
    store.dispatch("disconnectChat");
  }
});

// 401: request.ts 触发的全局事件 → 清 store
function onAuthExpired() {
  store.dispatch("userLogout");
}
window.addEventListener("auth:expired", onAuthExpired);
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";
@import "@/assets/css/global.scss";

.el-container {
  min-height: calc(100% - 60px);
}
.el-header {
  padding: 0;
}
.el-main {
  padding-top: $header-height + 10px;
  padding-left: 0;
  padding-right: 0;
  background: transparent;
}
.el-footer {
  padding: 0;
  height: auto;
}
</style>
