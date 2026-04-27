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
import { computed, getCurrentInstance } from "vue";
import { useRoute } from "vue-router";
import YinHeader from "@/components/layouts/YinHeader.vue";
import YinCurrentPlay from "@/components/layouts/YinCurrentPlay.vue";
import YinPlayBar from "@/components/layouts/YinPlayBar.vue";
import YinScrollTop from "@/components/layouts/YinScrollTop.vue";
import YinFooter from "@/components/layouts/YinFooter.vue";
import YinAudio from "@/components/layouts/YinAudio.vue";

const route = useRoute();
const isMvPage = computed(() => route.path.startsWith("/mv"));

const { proxy } = getCurrentInstance();

try {
  const saved = sessionStorage.getItem("dataStore");
  if (saved) {
    proxy.$store.replaceState(Object.assign({}, proxy.$store.state, JSON.parse(saved)));
  }
} catch (e) {
  console.warn("恢复播放状态失败", e);
  sessionStorage.removeItem("dataStore");
}

window.addEventListener("beforeunload", () => {
  try {
    sessionStorage.setItem("dataStore", JSON.stringify(proxy.$store.state));
  } catch (e) {
    console.warn("保存播放状态失败", e);
  }
});
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
  padding-left: 0;
  padding-right: 0;
}
</style>
