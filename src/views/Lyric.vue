<template>
  <div class="lyric-page">
    <div class="lyric-bg" :style="{ backgroundImage: `url(${attachImageUrl(songPic)})` }"></div>
    <div class="song-container">
      <div class="song-pic-wrap">
        <el-image class="song-pic" fit="cover" :src="attachImageUrl(songPic)" />
      </div>
      <ul class="song-info">
        <li class="song-name">{{ songTitle }}</li>
        <li class="song-artist">歌手：{{ singerName }}</li>
      </ul>
    </div>
    <div class="container">
      <div class="lyric-container">
        <div class="song-lyric">
          <transition-group name="lyric-fade">
            <!--有歌词-->
            <ul :style="{ top: lrcTop }" class="has-lyric" v-if="lyricArr.length" key="has-lyric">
              <li v-for="(item, index) in lyricArr" :key="index">
                {{ item[1] }}
              </li>
            </ul>
            <!--没歌词-->
            <div v-else class="no-lyric" key="no-lyric">
              <span>暂无歌词</span>
            </div>
          </transition-group>
        </div>
        <comment :playId="songId" :type="0"></comment>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";
import Comment from "@/components/Comment.vue";
import { parseLyric } from "@/utils";
import { HttpManager } from "@/api";

export default defineComponent({
  components: {
    Comment,
  },
  setup() {
    const store = useStore();

    const lrcTop = ref("80px"); // 歌词滑动
    const lyricArr = ref([]); // 当前歌曲的歌词
    const songId = computed(() => store.getters.songId); // 歌曲ID
    const lyric = computed(() => store.getters.lyric); // 歌词
    const currentPlayList = computed(() => store.getters.currentPlayList); // 存放的音乐
    const currentPlayIndex = computed(() => store.getters.currentPlayIndex); // 当前歌曲在歌曲列表的位置
    const curTime = computed(() => store.getters.curTime);
    const songTitle = computed(() => store.getters.songTitle); // 歌名
    const singerName = computed(() => store.getters.singerName); // 歌手名
    const songPic = computed(() => store.getters.songPic); // 歌曲图片
    watch(songId, async () => {
      const cur = currentPlayList.value?.[currentPlayIndex.value];
      if (cur?.lyric) {
        lyricArr.value = parseLyric(cur.lyric);
      } else {
        const res = await HttpManager.getSongOfId(songId.value) as any;
        const raw = res?.data?.[0]?.lyric;
        lyricArr.value = raw ? parseLyric(raw) : [];
        if (raw) store.commit("setLyric", lyricArr.value);
      }
    });
    // 处理歌词位置及颜色
    let lastActiveIndex = -1;
    watch(curTime, () => {
      if (!lyricArr.value.length) return;

      // 二分查找当前时间对应的歌词索引
      let activeIndex = 0;
      let low = 0;
      let high = lyricArr.value.length - 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (lyricArr.value[mid][0] <= curTime.value) {
          activeIndex = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      if (activeIndex !== lastActiveIndex) {
        const items = document.querySelectorAll(".has-lyric li") as NodeListOf<HTMLElement>;

        // 重置上一行
        if (lastActiveIndex >= 0 && items[lastActiveIndex]) {
          items[lastActiveIndex].style.color = "#000";
          items[lastActiveIndex].style.fontSize = "14px";
        }

        // 高亮当前行
        if (items[activeIndex]) {
          items[activeIndex].style.color = "#3b6bff";
          items[activeIndex].style.fontWeight = "600";
          items[activeIndex].style.fontSize = "18px";
        }
        if (lastActiveIndex >= 0 && items[lastActiveIndex]) {
          items[lastActiveIndex].style.fontWeight = "400";
        }

        lrcTop.value = -activeIndex * 30 + 50 + "px";
        lastActiveIndex = activeIndex;
      }
    });

    lyricArr.value = lyric.value ? parseLyric(lyric.value) : [];

    return {
      songPic,
      singerName,
      songTitle,
      lrcTop,
      lyricArr,
      songId,
      attachImageUrl: HttpManager.attachImageUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.lyric-page {
  position: relative;
  min-height: 80vh;
  padding-top: 30px;
}

.lyric-bg {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-position: center;
  background-size: cover;
  filter: blur(60px) saturate(140%);
  opacity: 0.35;
  z-index: -1;
  transform: scale(1.2);
}

.song-container {
  position: fixed;
  top: 130px;
  left: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .song-pic-wrap {
    width: 300px;
    height: 300px;
    border-radius: 16px;
    padding: 8px;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: $shadow-lg;
    animation: spin 22s linear infinite;
  }

  .song-pic {
    height: 100%;
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
  }

  .song-info {
    width: 300px;
    margin-top: 24px;
    text-align: center;
    li {
      width: 100%;
      line-height: 30px;
      padding: 0;
    }
    .song-name {
      font-size: 22px;
      font-weight: 600;
      color: $theme-text-primary;
      margin-bottom: 4px;
    }
    .song-artist {
      font-size: 14px;
      color: $theme-text-secondary;
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.lyric-container {
  font-family: $font-family;
  .song-lyric {
    position: relative;
    min-height: 360px;
    padding: 40px 0;
    overflow: hidden;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.78);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid $theme-border;
    box-shadow: $shadow-md;

    &::before, &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      height: 60px;
      pointer-events: none;
      z-index: 1;
    }
    &::before {
      top: 0;
      background: linear-gradient(180deg, rgba(255,255,255,0.95), transparent);
    }
    &::after {
      bottom: 0;
      background: linear-gradient(0deg, rgba(255,255,255,0.95), transparent);
    }

    .has-lyric {
      position: absolute;
      width: 100%;
      transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
      li {
        width: 100%;
        height: 40px;
        text-align: center;
        font-size: 14px;
        line-height: 40px;
        color: $theme-text-secondary;
        transition: color 0.3s ease, font-size 0.3s ease, font-weight 0.3s ease;
      }
    }
    .no-lyric {
      position: absolute;
      width: 100%;
      top: 50%;
      transform: translateY(-50%);
      text-align: center;

      span {
        font-size: 18px;
        color: $theme-text-secondary;
      }
    }
  }
}

.lyric-fade-enter,
.lyric-fade-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

.lyric-fade-enter-active,
.lyric-fade-leave-active {
  transition: all 0.3s ease;
}

@media screen and (min-width: $sm) {
  .container {
    padding-top: 30px;
  }
  .lyric-container {
    margin: 0 150px 0 400px;
  }
}

@media screen and (max-width: $sm) {
  .container {
    padding: 20px;
  }
  .song-container {
    display: none;
  }
}
</style>
