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

<style scoped>
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
  font-size: 160px;
  font-weight: bolder;
  color: #00a1d6;
  line-height: 1;
  opacity: 0.3;
  margin-bottom: -10px;
}

.error-text {
  font-size: 24px;
  color: #333;
  margin: 0 0 8px;
  font-weight: 600;
}

.error-desc {
  font-size: 14px;
  color: #999;
  margin: 0 0 24px;
}
</style>
