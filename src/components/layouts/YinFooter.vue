<template>
  <div class="yin-footer">
    <p v-for="(item, index) in footerList" :key="index">
      {{ item }}
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, readonly } from "vue";

export default defineComponent({
  setup() {
    const footerList = readonly([
      "关于 | 帮助 | 条款 | 反馈",
      "Copyright © 2019 Yin-Hongwei",
    ]);

    return { footerList };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";
@import "@/assets/css/global.scss";

.yin-footer {
  width: 100%;
  height: $footer-height;
  padding: 20px 0;
  box-sizing: border-box;
  font-size: 13px;
  color: $theme-text-secondary;
  border-top: 1px solid $theme-border;
  background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.6) 100%);
  @include layout(center, center, column);
}

p {
  height: 26px;
  letter-spacing: 0.4px;
}

p:first-child {
  color: $theme-text-primary;
  font-weight: 500;
}
</style>
