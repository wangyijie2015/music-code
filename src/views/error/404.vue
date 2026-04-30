<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-code">404</div>
      <p class="error-text">页面未找到</p>
      <p class="error-desc">您访问的页面不存在或已被移除</p>
      <el-button type="primary" size="large" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance } from "vue";

export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance();
    function goHome() {
      proxy.$router.push("/");
    }
    return { goHome };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 70vh;
  padding: 2rem;
  box-sizing: border-box;
}

.error-content {
  text-align: center;
}

.error-code {
  font-size: 200px;
  font-weight: 800;
  background: $theme-gradient;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  margin-bottom: 0;
  letter-spacing: -8px;
  filter: drop-shadow(0 12px 30px rgba(108, 141, 255, 0.25));
}

.error-text {
  font-size: 26px;
  color: $theme-text-primary;
  margin: 12px 0 8px;
  font-weight: 600;
}

.error-desc {
  font-size: 14px;
  color: $theme-text-secondary;
  margin: 0 0 28px;
}

.error-content:deep(.el-button--primary) {
  background: $theme-gradient;
  border: none;
  padding: 12px 28px;
  font-size: 15px;
  border-radius: 999px;
  box-shadow: 0 8px 22px rgba(91, 141, 239, 0.3);
  transition: transform 0.2s ease;
}
.error-content:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
}
</style>
