<template>
  <div class="play-list">
    <div class="play-header" v-if="title">
      <div class="play-title-block">
        <span class="title-bar"></span>
        <h2 class="play-title">{{ title }}</h2>
      </div>
      <p class="play-subtitle" v-if="subtitle">{{ subtitle }}</p>
    </div>
    <ul class="play-body">
      <li class="card-frame" v-for="(item, index) in playList" :key="index">
        <div class="card" @click="goAlbum(item)">
          <el-image class="card-img" fit="cover" :src="attachImageUrl(item.pic)" />
          <div class="mask" @click="goAlbum(item)">
            <yin-icon class="mask-icon" :icon="BOFANG"></yin-icon>
          </div>
        </div>
        <p class="card-name">{{ item.name || item.title }}</p>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, toRefs } from "vue";

import YinIcon from "@/components/layouts/YinIcon.vue";
import mixin from "@/mixins/mixin";
import { Icon } from "@/enums";
import { HttpManager } from "@/api";

export default defineComponent({
  components: {
    YinIcon,
  },
  props: {
    title: String,
    subtitle: String,
    playList: Array,
    path: String,
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const { routerManager } = mixin();

    const { path } = toRefs(props);

    function goAlbum(item) {
      proxy.$store.commit("setSongDetails", item);
      routerManager(path.value, { path: `/${path.value}/${item.id}` });
    }

    return {
      BOFANG: Icon.BOFANG,
      goAlbum,
      attachImageUrl: HttpManager.attachImageUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";
@import "@/assets/css/global.scss";

.play-list {
  padding: 0 1rem;

  .play-header {
    padding: 24px 8px 16px;
  }

  .play-title-block {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .title-bar {
    width: 4px;
    height: 22px;
    border-radius: 4px;
    background: $theme-gradient;
  }

  .play-title {
    font-size: 22px;
    font-weight: 600;
    color: $theme-text-primary;
    letter-spacing: 0.5px;
  }

  .play-subtitle {
    margin-top: 6px;
    margin-left: 16px;
    font-size: 13px;
    color: $theme-text-secondary;
  }

  .play-body {
    @include layout(flex-start, stretch, row, wrap);
  }
}

.card-frame {
  transition: transform 0.35s ease;

  .card {
    position: relative;
    height: 0;
    padding-bottom: 100%;
    overflow: hidden;
    border-radius: $border-radius-songlist;
    box-shadow: $shadow-sm;
    background: $color-light-grey;
    transition: box-shadow 0.35s ease, transform 0.35s ease;

    .card-img {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      transition: transform 0.6s ease;
    }
  }

  .card-name {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    margin: 0.7rem 0.2rem 0.2rem;
    font-size: 14px;
    color: $theme-text-primary;
    transition: color 0.2s ease;
  }

  &:hover {
    .card {
      box-shadow: $shadow-hover;
      transform: translateY(-4px);
    }
    .card-img {
      transform: scale(1.08);
    }
    .card-name {
      color: $color-blue-active;
    }
  }
}

.mask {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: $border-radius-songlist;
  background: linear-gradient(180deg, rgba(31, 35, 48, 0) 40%, rgba(31, 35, 48, 0.55) 100%);
  @include layout(flex-end, flex-end);
  padding: 14px;
  box-sizing: border-box;
  transition: all 0.3s ease-in-out;
  opacity: 0;

  .mask-icon {
    @include icon(1.6em, #fff);
    width: 44px;
    height: 44px;
    line-height: 44px;
    text-align: center;
    border-radius: 50%;
    background: $theme-gradient;
    box-shadow: 0 6px 16px rgba(108, 141, 255, 0.5);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    opacity: 1;
    cursor: pointer;
  }
}

@media screen and (min-width: $sm) {
  .card-frame {
    width: 18%;
    margin: 0.5rem 1%;
  }
}

@media screen and (max-width: $sm) {
  .card-frame {
    width: 46%;
    margin: 0.5rem 2%;
  }
}
</style>
