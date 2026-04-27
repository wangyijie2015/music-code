<template>
  <div class="song-container">
    <el-image class="song-pic" fit="contain" :src="attachImageUrl(songPic)" />
    <ul class="song-info">
      <li>歌手：{{ singerName }}</li>
      <li>歌曲：{{ songTitle }}</li>
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
    watch(songId, () => {
      lyricArr.value = parseLyric(currentPlayList.value[currentPlayIndex.value].lyric);
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
          items[activeIndex].style.color = "#95d2f6";
          items[activeIndex].style.fontSize = "18px";
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

.song-container {
  position: fixed;
  top: 120px;
  left: 50px;
  display: flex;
  flex-direction: column;

  .song-pic {
    height: 300px;
    width: 300px;
    border: 4px solid white;
    border-radius: 12px;
  }

  .song-info {
    width: 300px;
    li {
      width: 100%;
      line-height: 40px;
      font-size: 18px;
      padding-left: 10%;
    }
  }
}

.lyric-container {
  font-family: $font-family;
  .song-lyric {
    position: relative;
    min-height: 300px;
    padding: 30px 0;
    overflow: auto;
    border-radius: 12px;
    background-color: $color-light-grey;
    .has-lyric {
      position: absolute;
      transition: all 1s;
      li {
        width: 100%;
        height: 40px;
        text-align: center;
        font-size: 14px;
        line-height: 40px;
      }
    }
    .no-lyric {
      position: absolute;
      margin: 100px 0;

      span {
        font-size: 18px;
        text-align: center;
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
    margin: 0 150px 0px 400px;
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
