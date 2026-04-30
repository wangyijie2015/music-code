<template>
  <div class="search">
    <h2 class="search-title">
      <span class="title-bar"></span>
      搜索结果
    </h2>
    <yin-nav :styleList="searchNavList" :activeName="activeName" @click="handleChangeView"></yin-nav>
    <component class="search-list" :is="currentView"></component>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import YinNav from "@/components/layouts/YinNav.vue";
import SearchSong from "./SearchSong.vue";
import SearchSongList from "./SearchSongList.vue";

export default defineComponent({
  components: {
    YinNav,
    SearchSong,
    SearchSongList,
  },
  data() {
    return {
      searchNavList: [
        {
          name: "歌曲",
          value: "SearchSong",
        },
        {
          name: "歌单",
          value: "SearchSongList",
        },
      ],
      activeName: "歌曲",
      currentView: "SearchSong",
    };
  },
  methods: {
    handleChangeView(item) {
      this.activeName = item.name;
      this.currentView = item.value;
    },
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";
@import "@/assets/css/global.scss";

.search {
  max-width: 960px;
  margin: 30px auto;
  padding: 28px 30px;
  background: #fff;
  border-radius: 16px;
  box-shadow: $shadow-sm;
  border: 1px solid $theme-border;

  .search-list {
    min-height: 480px;
    margin-top: 12px;
  }
}

.search-title {
  font-size: 20px;
  font-weight: 600;
  color: $theme-text-primary;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  .title-bar {
    width: 4px;
    height: 22px;
    border-radius: 4px;
    background: $theme-gradient;
  }
}

@media screen and (max-width: $sm) {
  .search {
    margin: 16px;
    padding: 20px 16px;
  }
}
</style>
