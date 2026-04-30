<template>
  <div class="play-list-container">
    <div v-if="loading" class="loading-wrap">
      <span class="loading-spinner"></span>
      <span>加载中...</span>
    </div>
    <template v-if="!loading">
    <play-list :playList="data" path="mv-detail"></play-list>
    <el-pagination
      class="pagination"
      background
      layout="total, prev, pager, next"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="allMvList.length"
      @current-change="handleCurrentChange"
    >
    </el-pagination>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import PlayList from "@/components/PlayList.vue";
import { HttpManager } from "@/api";

const loading = ref(true);
const pageSize = ref(15);
const currentPage = ref(1);
const allMvList = ref([]);

const data = computed(() => {
  return allMvList.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value);
});

async function getAllMv() {
  try {
    const result = (await HttpManager.getMvList()) as ResponseBody;
    currentPage.value = 1;
    allMvList.value = result.data?.map?.(item => ({ ...item, name: item.mvName })) || [];
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

function handleCurrentChange(val) {
  currentPage.value = val;
}

onMounted(() => {
  getAllMv();
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: $theme-text-secondary;
  gap: 16px;
  font-size: 14px;
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(91, 141, 239, 0.2);
  border-top-color: $color-blue-active;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
