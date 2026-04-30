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
@import "@/assets/css/var.scss";

.singer-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

/* 头部区域 */
.singer-header {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  margin-top: 20px;
  box-shadow: $shadow-md;
}

.header-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(40px) brightness(0.55);
  transform: scale(1.2);
}

.header-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(108, 141, 255, 0.55), rgba(197, 108, 255, 0.45));
}

.header-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 44px 30px;
  z-index: 1;
}

.singer-avatar {
  width: 170px;
  height: 170px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
  flex-shrink: 0;
  transition: transform 0.4s ease;
}
.singer-avatar:hover {
  transform: scale(1.04);
}

.singer-meta {
  color: #fff;
  h1 {
    font-size: 30px;
    font-weight: 700;
    margin: 0 0 14px;
    color: #fff;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
  }
}

.meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-block;
  padding: 5px 14px;
  background: rgba(255, 255, 255, 0.22);
  border-radius: 20px;
  font-size: 13px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* 通用区块 */
.section {
  margin-top: 24px;
  background: #fff;
  border-radius: 14px;
  padding: 24px;
  box-shadow: $shadow-sm;
  border: 1px solid $theme-border;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: $theme-text-primary;
  margin: 0 0 16px;
  padding-left: 12px;
  position: relative;
}

.section-title::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 4px;
  border-radius: 4px;
  background: $theme-gradient;
}

.intro-text {
  color: $theme-text-secondary;
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
