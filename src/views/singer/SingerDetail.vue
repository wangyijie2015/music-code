<template>
  <div class="singer-page">
    <div v-if="loading" class="loading-wrap">
      <span class="loading-spinner"></span>
      <span>加载中...</span>
    </div>

    <template v-if="!loading && songDetails?.id">
    <!-- 歌手头部 -->
    <div class="singer-header">
      <div class="header-bg" :style="{ backgroundImage: `url(${attachImageUrl(songDetails.pic)})` }"></div>
      <div class="header-content">
        <el-image class="singer-avatar" fit="cover" :src="attachImageUrl(songDetails.pic)" />
        <div class="singer-meta">
          <h1>{{ songDetails.name }}</h1>
          <div class="meta-tags">
            <span class="tag" v-if="songDetails.sex !== 2">{{ getUserSex(songDetails.sex) }}</span>
            <span class="tag">{{ getBirth(songDetails.birth) }}</span>
            <span class="tag">{{ songDetails.location }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 简介 -->
    <div class="section" v-if="songDetails.introduction">
      <h2 class="section-title">歌手简介</h2>
      <p class="intro-text">{{ songDetails.introduction }}</p>
    </div>

    <!-- 歌曲列表 -->
    <div class="section">
      <h2 class="section-title">热门歌曲</h2>
      <song-list :songList="currentSongList"></song-list>
    </div>
    </template>

    <div v-if="!loading && !songDetails?.id" class="empty-wrap">
      <span>歌手信息不存在</span>
      <el-button type="primary" @click="routerManager('/singer', { path: '/singer' })">返回歌手</el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";
import mixin from "@/mixins/mixin";
import SongList from "@/components/SongList.vue";
import { HttpManager } from "@/api";
import { getBirth } from "@/utils";

export default defineComponent({
  components: {
    SongList,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const { getUserSex, routerManager } = mixin();

    const loading = ref(true);
    const currentSongList = ref([]);
    const songDetails = computed(() => store.getters.songDetails);

    // 如果刷新页面导致 store 中 songDetails 为空，用路由参数加载
    const singerId = ref(route.params.id || songDetails.value?.id);

    watch(songDetails, (val) => {
      if (val?.id && !singerId.value) {
        singerId.value = val.id;
        loadSongs(val.id);
      }
    });

    async function loadSongs(id) {
      if (!id) return;
      loading.value = true;
      try {
        const result = (await HttpManager.getSongOfSingerId(id)) as ResponseBody;
        currentSongList.value = result.data || [];
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    }

    onMounted(() => {
      if (singerId.value) {
        loadSongs(singerId.value);
      }
    });

    return {
      loading,
      songDetails,
      currentSongList,
      attachImageUrl: HttpManager.attachImageUrl,
      getBirth,
      getUserSex,
    };
  },
});
</script>

<style lang="scss" scoped>
.singer-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* 头部区域 */
.singer-header {
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
  align-items: center;
  gap: 30px;
  padding: 40px 30px;
  z-index: 1;
}

.singer-avatar {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
}

.singer-meta {
  color: #fff;
  h1 {
    font-size: 28px;
    margin: 0 0 12px;
    color: #fff;
  }
}

.meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 13px;
  color: #fff;
  backdrop-filter: blur(4px);
}

/* 通用区块 */
.section {
  margin-top: 28px;
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

.intro-text {
  color: #666;
  font-size: 14px;
  line-height: 1.8;
  margin: 0;
  white-space: pre-line;
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
</style>
