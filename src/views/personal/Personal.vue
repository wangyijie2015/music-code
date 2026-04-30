<template>
  <div class="personal">
    <div class="personal-banner">
      <div class="banner-bubble bubble-1"></div>
      <div class="banner-bubble bubble-2"></div>
    </div>
    <div class="personal-info">
      <el-image class="personal-img" fit="cover" :src="attachImageUrl(userPic)" @click="dialogTableVisible = true" />
      <div class="personal-msg">
        <div class="username">{{ personalInfo.username }}</div>
        <div class="introduction">{{ personalInfo.introduction || "这个人很懒，没有写签名~" }}</div>
      </div>
      <el-button class="edit-info" round :icon="Edit" @click="goPage()">修改个人信息</el-button>
    </div>
    <div class="personal-body">
      <h2 class="section-title">我的收藏</h2>
      <song-list :songList="collectSongList" :show="true" @changeData="changeData"></song-list>
    </div>
    <el-dialog v-model="dialogTableVisible" title="修改头像">
      <upload></upload>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, computed, watch, reactive } from "vue";
import { useStore } from "vuex";
import { Edit } from "@element-plus/icons-vue";
import SongList from "@/components/SongList.vue";
import Upload from "../setting/Upload.vue";
import mixin from "@/mixins/mixin";
import { HttpManager } from "@/api";
import { RouterName } from "@/enums";

export default defineComponent({
  components: {
    SongList,
    Upload,
  },
  setup() {
    const store = useStore();

    const { routerManager } = mixin();

    const dialogTableVisible = ref(false);
    const collectSongList = ref([]); // 收藏的歌曲
    const personalInfo = reactive({
      username: "",
      userSex: "",
      birth: "",
      location: "",
      introduction: "",
    });
    const userId = computed(() => store.getters.userId);
    const userPic = computed(() => store.getters.userPic);
    watch(userPic, () => {
      dialogTableVisible.value = false;
    });

    function goPage() {
      routerManager(RouterName.Setting, { path: RouterName.Setting });
    }
    async function getUserInfo(id) {
      const result = (await HttpManager.getUserOfId(id)) as ResponseBody;
      personalInfo.username = result.data[0].username;
      personalInfo.userSex = result.data[0].sex;
      personalInfo.birth = result.data[0].birth;
      personalInfo.introduction = result.data[0].introduction;
      personalInfo.location = result.data[0].location;
    }
    // 获取收藏的歌曲
    async function getCollection(userId) {
      collectSongList.value = []
      const result = (await HttpManager.getCollectionOfUser(userId)) as ResponseBody;
      const collectIDList = result.data || []; // 存放收藏的歌曲ID
      // 通过歌曲ID并行获取歌曲信息
      const songPromises = collectIDList
        .filter(item => item.songId)
        .map(item => HttpManager.getSongOfId(item.songId));
      const songs = await Promise.all(songPromises);
      collectSongList.value = songs.map(s => (s as ResponseBody).data?.[0]).filter(Boolean);
    }

    function changeData() {
      getCollection(userId.value);
    }

    onMounted(() => {
      getUserInfo(userId.value);
      getCollection(userId.value);
    });

    return {
      Edit,
      userPic,
      dialogTableVisible,
      collectSongList,
      personalInfo,
      attachImageUrl: HttpManager.attachImageUrl,
      goPage,
      changeData,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.personal {
  position: relative;
  padding-top: 220px;
}

.personal-banner {
  position: absolute;
  top: -10px;
  left: 0;
  right: 0;
  height: 280px;
  background: $theme-gradient;
  overflow: hidden;
  z-index: 0;

  .banner-bubble {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
  }
  .bubble-1 {
    width: 320px;
    height: 320px;
    top: -120px;
    right: 6%;
  }
  .bubble-2 {
    width: 200px;
    height: 200px;
    bottom: -100px;
    left: 12%;
    background: rgba(255, 255, 255, 0.08);
  }
}

.personal-info {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  gap: 32px;
  padding: 0 8% 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;

  .personal-img {
    height: 180px;
    width: 180px;
    border-radius: 50%;
    border: 6px solid #fff;
    cursor: pointer;
    box-shadow: $shadow-lg;
    transition: transform 0.3s ease;
    flex-shrink: 0;
  }
  .personal-img:hover {
    transform: scale(1.04);
  }

  .personal-msg {
    flex: 1;
    min-width: 0;
    padding-bottom: 16px;
    color: #fff;

    .username {
      font-size: 40px;
      font-weight: 700;
      line-height: 1.1;
      text-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
      margin-bottom: 8px;
    }

    .introduction {
      font-size: 15px;
      font-weight: 400;
      opacity: 0.9;
      line-height: 1.5;
    }
  }

  .edit-info {
    margin-bottom: 16px;
    background: rgba(255, 255, 255, 0.95);
    border: none;
    color: $theme-text-primary;
    font-weight: 500;
    box-shadow: $shadow-sm;
  }
  .edit-info:hover {
    background: #fff;
    color: $color-blue-active;
  }
}

.personal-body {
  position: relative;
  z-index: 1;
  background: #fff;
  border-radius: 16px;
  margin: 0 8%;
  padding: 24px;
  box-shadow: $shadow-sm;
  border: 1px solid $theme-border;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: $theme-text-primary;
  margin: 0 0 18px;
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

@media screen and (max-width: $sm) {
  .personal-info {
    padding: 0 6% 20px;
    .personal-img {
      width: 140px;
      height: 140px;
    }
    .personal-msg .username {
      font-size: 28px;
    }
  }
  .personal-body {
    margin: 0 4%;
  }
  .edit-info {
    display: none;
  }
}
</style>
