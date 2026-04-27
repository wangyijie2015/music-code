<template>
  <div class="sheet-page">
    <div v-if="loading" class="loading-wrap">
      <span class="loading-spinner"></span>
      <span>加载中...</span>
    </div>

    <template v-if="!loading && songDetails?.id">
    <!-- 歌单头部 -->
    <div class="sheet-header">
      <div class="header-bg" :style="{ backgroundImage: `url(${attachImageUrl(songDetails.pic)})` }"></div>
      <div class="header-content">
        <el-image class="sheet-cover" fit="cover" :src="attachImageUrl(songDetails.pic)" />
        <div class="sheet-meta">
          <h1>{{ songDetails.title }}</h1>
          <div class="rating-summary">
            <el-rate v-model="rank" allow-half disabled></el-rate>
            <span class="rating-score">{{ rank * 2 }}</span>
          </div>
          <p class="sheet-intro">{{ songDetails.introduction }}</p>
        </div>
      </div>
    </div>

    <!-- 评分 -->
    <div class="section">
      <h2 class="section-title">我的评分</h2>
      <div class="rating-area">
        <div class="rating-left">
          <span class="score-num">{{ score * 2 }}</span>
          <span class="score-label">分</span>
        </div>
        <div class="rating-right">
          <el-rate allow-half v-model="score" :disabled="disabledRank" @click="pushValue()"></el-rate>
          <span class="rating-text">{{ assistText }}</span>
        </div>
      </div>
    </div>

    <!-- 歌曲列表 -->
    <div class="section">
      <h2 class="section-title">歌曲列表</h2>
      <song-list :songList="currentSongList"></song-list>
    </div>

    <!-- 评论 -->
    <div class="section">
      <comment :playId="songListId" :type="1"></comment>
    </div>
    </template>
    <div v-if="!loading && !songDetails?.id" class="empty-wrap">
      <span>歌单信息不存在</span>
      <el-button type="primary" @click="routerManager('/song-sheet', { path: '/song-sheet' })">返回歌单</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, getCurrentInstance, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import mixin from "@/mixins/mixin";
import SongList from "@/components/SongList.vue";
import Comment from "@/components/Comment.vue";
import { HttpManager } from "@/api";

export default defineComponent({
  components: {
    SongList,
    Comment,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const route = useRoute();
    const { checkStatus, routerManager } = mixin();

    const loading = ref(true);
    const currentSongList = ref([]);
    const nowSongListId = ref(route.params.id || "");
    const nowScore = ref(0);
    const nowRank = ref(0);
    const disabledRank = ref(false);
    const assistText = ref("评价");
    const songDetails = computed(() => store.getters.songDetails);
    const nowUserId = computed(() => store.getters.userId);

    // 优先使用路由参数，其次从 store 获取
    if (!nowSongListId.value && songDetails.value?.id) {
      nowSongListId.value = songDetails.value.id;
    }

    // 当 store 中的歌单信息更新时同步
    watch(songDetails, (val) => {
      if (val?.id && !nowSongListId.value) {
        nowSongListId.value = val.id;
        loadData(val.id);
      }
    });

    async function loadData(id) {
      if (!id) return;
      loading.value = true;
      try {
        await Promise.all([
          getUserRank(nowUserId.value, id),
          getRank(id),
          getSongId(id),
        ]);
      } catch {
        /* 单个接口失败不影响其他加载 */
      } finally {
        loading.value = false;
      }
    }

    async function getSongId(id) {
      try {
        const result = (await HttpManager.getListSongOfSongId(id)) as ResponseBody;
        if (!result.data?.length) {
          currentSongList.value = [];
          return;
        }
        const songIds = result.data.map((item) => item.songId).filter(Boolean);
        if (!songIds.length) {
          currentSongList.value = [];
          return;
        }
        const songs = (await HttpManager.getSongOfIds(songIds)) as ResponseBody;
        currentSongList.value = songs.data || [];
      } catch (error) {
        console.error("[获取歌曲列表失败]", error);
      }
    }

    async function getRank(id) {
      try {
        const result = (await HttpManager.getRankOfSongListId(id)) as ResponseBody;
        nowRank.value = (result.data || 0) / 2;
      } catch (error) {
        console.error(error);
      }
    }

    async function getUserRank(userId, songListId) {
      if (!userId) return;
      try {
        const result = (await HttpManager.getUserRank(userId, songListId)) as ResponseBody;
        nowScore.value = (result.data || 0) / 2;
        disabledRank.value = true;
        assistText.value = "已评价";
      } catch (error) {
        console.error(error);
      }
    }

    async function pushValue() {
      if (disabledRank.value || !checkStatus()) return;

      const songListId = nowSongListId.value;
      const consumerId = nowUserId.value;
      const score = nowScore.value * 2;

      try {
        const result = (await HttpManager.setRank({songListId, consumerId, score})) as ResponseBody;
        (proxy as any).$message({
          message: result.message,
          type: result.type,
        });

        if (result.success) {
          getRank(nowSongListId.value);
          disabledRank.value = true;
          assistText.value = "已评价";
        }
      } catch (error) {
        console.error(error);
      }
    }

    onMounted(() => {
      if (nowSongListId.value) {
        loadData(nowSongListId.value);
      }
    });

    return {
      loading,
      songDetails,
      rank: nowRank,
      score: nowScore,
      disabledRank,
      assistText,
      currentSongList,
      songListId: nowSongListId,
      attachImageUrl: HttpManager.attachImageUrl,
      pushValue,
    };
  },
});
</script>

<style lang="scss" scoped>
.sheet-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* 头部 */
.sheet-header {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin-top: 20px;
}

.header-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(40px) brightness(0.6);
  transform: scale(1.2);
}

.header-content {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 30px;
  padding: 40px 30px;
  z-index: 1;
}

.sheet-cover {
  width: 160px;
  height: 160px;
  border-radius: 12px;
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.sheet-meta {
  color: #fff;
  min-width: 0;

  h1 {
    font-size: 24px;
    margin: 0 0 10px;
    color: #fff;
  }
}

.rating-summary {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.rating-score {
  font-size: 20px;
  font-weight: 600;
  color: #ffd700;
}

.sheet-intro {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 通用区块 */
.section {
  margin-top: 24px;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 16px;
  padding-left: 12px;
  border-left: 3px solid #00a1d6;
}

/* 评分区 */
.rating-area {
  display: flex;
  align-items: center;
  gap: 24px;
}

.rating-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.score-num {
  font-size: 48px;
  font-weight: 700;
  color: #ffa500;
  line-height: 1;
}

.score-label {
  font-size: 16px;
  color: #999;
}

.rating-right {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rating-text {
  font-size: 13px;
  color: #999;
}

.loading-wrap, .empty-wrap {
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media screen and (max-width: 600px) {
  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .rating-summary {
    justify-content: center;
  }
}
</style>
