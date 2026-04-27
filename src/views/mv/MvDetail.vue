<template>
  <div class="mv-page">
    <div v-if="loading" class="loading-wrap">
      <span class="loading-spinner"></span>
      <span>加载中...</span>
    </div>

    <template v-if="!loading">
    <div class="mv-layout">
      <div class="mv-info">
        <MvPlayer v-if="mvUrl" :src="mvUrl" />
        <div class="mv-meta">
          <div class="meta-row">
            <span class="meta-icon singer-icon"></span>
            <span class="meta-label">歌手</span>
            <span class="meta-value">{{ mvDetail.singerName }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-icon date-icon"></span>
            <span class="meta-label">发布</span>
            <span class="meta-value">{{ formatDate(mvDetail.createTime) }}</span>
          </div>
          <div class="meta-row" v-if="mvDetail.introduction">
            <span class="meta-icon intro-icon"></span>
            <span class="meta-label">简介</span>
            <span class="meta-value intro-text">{{ mvDetail.introduction }}</span>
          </div>
        </div>
      </div>

      <div class="mv-side">
        <el-image class="mv-cover" fit="contain" :src="attachImageUrl(mvDetail.pic)" />
        <div class="mv-actions">
          <button class="action-btn" :class="{ active: liked }" @click="toggleLike">
            <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span>{{ liked ? '已赞' : '点赞' }}</span>
            <span class="count" v-if="likeCount > 0">{{ likeCount }}</span>
          </button>
          <button class="action-btn" :class="{ active: collected }" @click="toggleCollect">
            <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            <span>{{ collected ? '已收藏' : '收藏' }}</span>
            <span class="count" v-if="collectCount > 0">{{ collectCount }}</span>
          </button>
          <button class="action-btn" @click="shareMv">
            <svg class="btn-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>
            <span>分享</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 评论 -->
    <div class="section" v-if="mvDetail.id">
      <comment :playId="mvDetail.id" :type="0"></comment>
    </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { HttpManager } from "@/api";
import MvPlayer from "@/components/MvPlayer.vue";
import Comment from "@/components/Comment.vue";

export default defineComponent({
  components: { MvPlayer, Comment },
  setup() {
    const route = useRoute();
    const store = useStore();
    const loading = ref(true);
    const mvDetail = ref({} as any);
    const mvUrl = ref("");
    const liked = ref(false);
    const likeCount = ref(0);
    const collected = ref(false);
    const collectCount = ref(0);
    const userId = computed(() => store.getters.userId);

    onMounted(async () => {
      try {
        const id = Number(route.params.id);
        const result = (await HttpManager.getMvOfId(id)) as ResponseBody;
        mvDetail.value = result.data;
        mvUrl.value = HttpManager.getMvUrl(result.data.url);

        if (userId.value) {
          loadStatus(id);
        }
        loadCounts(id);
      } catch (error) {
        console.error(error);
        ElMessage.error("MV 加载失败");
      } finally {
        loading.value = false;
      }
    });

    async function loadStatus(id: number) {
      const [likeRes, collectRes] = await Promise.all([
        HttpManager.getMvLikeStatus(id, userId.value),
        HttpManager.getMvCollectStatus(id, userId.value),
      ]);
      liked.value = (likeRes as ResponseBody).data;
      collected.value = (collectRes as ResponseBody).data;
    }

    async function loadCounts(id: number) {
      const [likeRes, collectRes] = await Promise.all([
        HttpManager.getMvLikeCount(id),
        HttpManager.getMvCollectCount(id),
      ]);
      likeCount.value = (likeRes as ResponseBody).data;
      collectCount.value = (collectRes as ResponseBody).data;
    }

    async function toggleLike() {
      const id = Number(route.params.id);
      if (!userId.value) {
        ElMessage.warning("请先登录");
        return;
      }
      const res = (await HttpManager.toggleMvLike(id, userId.value)) as ResponseBody;
      liked.value = res.data;
      likeCount.value += liked.value ? 1 : -1;
    }

    async function toggleCollect() {
      const id = Number(route.params.id);
      if (!userId.value) {
        ElMessage.warning("请先登录");
        return;
      }
      const res = (await HttpManager.toggleMvCollect(id, userId.value)) as ResponseBody;
      collected.value = res.data;
      collectCount.value += collected.value ? 1 : -1;
    }

    function shareMv() {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({ title: mvDetail.value.mvName, url });
      } else {
        navigator.clipboard.writeText(url).then(() => {
          ElMessage.success("链接已复制");
        });
      }
    }

    function formatDate(date: string) {
      if (!date) return "未知";
      const d = new Date(date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    return {
      loading,
      mvDetail,
      mvUrl,
      liked, likeCount, collected, collectCount,
      toggleLike, toggleCollect, shareMv,
      attachImageUrl: HttpManager.attachImageUrl,
      formatDate,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.mv-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 16px 40px;
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #999;
  gap: 16px;
  font-size: 14px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e0e0e0;
  border-top-color: #00a1d6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.mv-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-top: 16px;
}

.mv-info {
  flex: 1;
  min-width: 0;
}

.meta-row {
  display: flex;
  align-items: baseline;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
}

.meta-label {
  color: #999;
  width: 40px;
  flex-shrink: 0;
}

.meta-value {
  color: #333;
  word-break: break-all;
}

.meta-value.intro-text {
  color: #666;
  font-size: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mv-side {
  width: 160px;
  flex-shrink: 0;

  .mv-cover {
    width: 100%;
    border-radius: 8px;
    aspect-ratio: 16/9;
    object-fit: cover;
  }
}

.mv-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: #fff;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.action-btn.active {
  background: #f0f9ff;
  border-color: #00a1d6;
  color: #00a1d6;
}

.action-btn .count {
  font-size: 12px;
  opacity: 0.7;
  margin-left: 2px;
}

.btn-icon {
  flex-shrink: 0;
}

/* 评论区域 */
.section {
  margin-top: 24px;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

@media screen and (max-width: $sm) {
  .mv-layout {
    flex-direction: column-reverse;
  }
  .mv-side {
    width: 100%;
    display: flex;
    gap: 16px;
    align-items: flex-start;
    .mv-cover {
      width: 120px;
      flex-shrink: 0;
    }
    .mv-actions {
      flex: 1;
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
}
</style>
