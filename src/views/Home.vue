<template>
  <div class="home-hero">
    <!--轮播图-->
    <el-carousel v-if="swiperList.length" class="swiper-container" type="card" height="22vw" :interval="4000" indicator-position="outside">
      <el-carousel-item v-for="(item, index) in swiperList" :key="index">
        <img :src="HttpManager.attachImageUrl(item.pic)" />
      </el-carousel-item>
    </el-carousel>
  </div>
  <!--热门歌单-->
  <play-list class="play-list-container" title="精选歌单" subtitle="为你推荐的热门歌单" path="song-sheet-detail" :playList="songList"></play-list>
  <!--热门歌手-->
  <play-list class="play-list-container" title="热门歌手" subtitle="发现你喜欢的音乐人" path="singer-detail" :playList="singerList"></play-list>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";

import PlayList from "@/components/PlayList.vue";
import {  NavName } from "@/enums";
import { HttpManager } from "@/api";
import mixin from "@/mixins/mixin";

const songList = ref([]); // 歌单列表
const singerList = ref([]); // 歌手列表
const swiperList = ref([]);// 轮播图 每次都在进行查询
const { changeIndex } = mixin();

onMounted(() => {
  changeIndex(NavName.Home);

  HttpManager.getBannerList().then((res) => {
    swiperList.value = (res as ResponseBody).data.sort();
  });

  HttpManager.getSongList().then((res) => {
    songList.value = (res as ResponseBody).data.sort().slice(0, 10);
  });

  HttpManager.getAllSinger().then((res) => {
    singerList.value = (res as ResponseBody).data.sort().slice(0, 10);
  });
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.home-hero {
  position: relative;
  padding: 30px 0 10px;
}

/*轮播图*/
.swiper-container {
  width: 90%;
  margin: auto;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 18px;
  }
}

.swiper-container:deep(.el-carousel__item) {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: $shadow-md;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.swiper-container:deep(.el-carousel__item.is-active) {
  box-shadow: $shadow-lg;
}

.swiper-container:deep(.el-carousel__indicators--outside) {
  margin-top: 14px;
}

.swiper-container:deep(.el-carousel__indicator--horizontal .el-carousel__button) {
  width: 22px;
  height: 4px;
  border-radius: 4px;
  background-color: rgba(31, 35, 48, 0.2);
  opacity: 1;
}

.swiper-container:deep(.el-carousel__indicator.is-active .el-carousel__button) {
  width: 32px;
  background: $theme-gradient;
}

.el-slider__runway {
  background-color: $color-blue;
}
</style>
