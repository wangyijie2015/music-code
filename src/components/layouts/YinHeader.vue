<template>
  <div class="yin-header">
    <!--图标-->
    <div class="header-logo" @click="goPage()">
      <yin-icon :icon="iconList.ERJI"></yin-icon>
      <span>{{ musicName }}</span>
    </div>
    <yin-header-nav class="yin-header-nav" :styleList="headerNavList" :activeName="activeNavName" @click="goPage"></yin-header-nav>
    <!--搜索框-->
    <div class="header-search">
      <el-input placeholder="搜索" :prefix-icon="Search" v-model="keywords" @keyup.enter="goSearch()" />
    </div>
    <!--设置-->
    <yin-header-nav v-if="!token" :styleList="signList" :activeName="activeNavName" @click="goPage"></yin-header-nav>
    <el-badge v-if="token" class="chat-entry" :value="unreadTotal" :hidden="!unreadTotal" :max="99">
      <span class="chat-icon-btn" title="消息" @click="goChat">
        <yin-icon :icon="iconList.LIEBIAO"></yin-icon>
      </span>
    </el-badge>
    <el-dropdown class="user-wrap" v-if="token" trigger="click">
      <el-image class="user" fit="cover" :src="attachImageUrl(userPic)" />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="(item, index) in menuList" :key="index" @click.stop="goMenuList(item.path)">
            <span class="menu-item-text">{{ item.name }}</span>
            <el-badge v-if="item.path === '/chat' && unreadTotal" class="menu-badge" :value="unreadTotal" :max="99" />
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, getCurrentInstance, computed, reactive } from "vue";
import { Search } from "@element-plus/icons-vue";
import { useStore } from "vuex";
import YinIcon from "./YinIcon.vue";
import YinHeaderNav from "./YinHeaderNav.vue";
import mixin from "@/mixins/mixin";
import { HEADERNAVLIST, SIGNLIST, MENULIST, Icon, MUSICNAME, RouterName, NavName } from "@/enums";
import { HttpManager } from "@/api";

export default defineComponent({
  components: {
    YinIcon,
    YinHeaderNav,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const { changeIndex, routerManager } = mixin();

    const musicName = ref(MUSICNAME);
    const headerNavList = ref(HEADERNAVLIST); // 左侧导航栏
    const signList = ref(SIGNLIST); // 右侧导航栏
    const menuList = ref(MENULIST); // 用户下拉菜单项
    const iconList = reactive({
      ERJI: Icon.ERJI,
      LIEBIAO: Icon.LIEBIAO,
    });
    const keywords = ref("");
    const activeNavName = computed(() => store.getters.activeNavName);
    const userPic = computed(() => store.getters.userPic);
    const token = computed(() => store.getters.token);
    const unreadTotal = computed(() => store.getters.chatUnreadTotal);

    function goChat() {
      routerManager(RouterName.Chat, { path: RouterName.Chat });
    }

    function goPage(path, name) {
      if (!path && !name) {
        changeIndex(NavName.Home);
        routerManager(RouterName.Home, { path: RouterName.Home });
      } else {
        changeIndex(name);
        routerManager(path, { path });
      }
    }

    function goMenuList(path) {
      if (path == RouterName.SignOut) {
        proxy.$store.commit("setToken", false);
        changeIndex(NavName.Home);
        routerManager(RouterName.Home, { path: RouterName.Home });
      } else {
        routerManager(path, { path });
      }
    }
    function goSearch() {
      if (keywords.value !== "") {
        proxy.$store.commit("setSearchWord", keywords.value);
        routerManager(RouterName.Search, { path: RouterName.Search, query: { keywords: keywords.value } });
      } else {
        (proxy as any).$message({
          message: "搜索内容不能为空",
          type: "error",
        });
      }
    }

    return {
      musicName,
      headerNavList,
      signList,
      menuList,
      iconList,
      keywords,
      activeNavName,
      userPic,
      token,
      unreadTotal,
      Search,
      goPage,
      goMenuList,
      goSearch,
      goChat,
      attachImageUrl: HttpManager.attachImageUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";
@import "@/assets/css/global.scss";

@media screen and (min-width: $sm) {
  .header-logo {
    margin: 0 1rem;
  }
}

@media screen and (max-width: $sm) {
  .header-logo {
    margin: 0 1rem;
    span {
      display: none;
    }
  }
  .header-search {
    display: none;
  }
}

.yin-header {
  position: fixed;
  width: 100%;
  height: $header-height;
  line-height: $header-height;
  padding: $header-padding;
  margin: $header-margin;
  background-color: $theme-header-color;
  backdrop-filter: saturate(180%) blur(18px);
  -webkit-backdrop-filter: saturate(180%) blur(18px);
  border-bottom: 1px solid $theme-border;
  box-shadow: 0 1px 0 rgba(31, 35, 48, 0.04);
  box-sizing: border-box;
  z-index: 100;
  display: flex;
  white-space: nowrap;
  flex-wrap: nowrap;
}

/* LOGO */
.header-logo {
  font-size: $font-size-logo;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: $theme-gradient;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: opacity 0.2s ease;

  .icon {
    @include icon(1.9rem, $color-blue-active);
    vertical-align: middle;
    -webkit-text-fill-color: $color-blue-active;
  }
  span {
    margin-left: 0;
  }

  &:hover {
    opacity: 0.85;
  }
}

.yin-header-nav {
  flex: 1;
}

/*搜索输入框*/
.header-search {
  margin: 0 20px;
  width: 100%;
  display: flex;
  align-items: center;
  &:deep(.el-input__wrapper) {
    max-width: $header-search-max-width;
    min-width: $header-search-min-width;
    border-radius: 999px;
    box-shadow: none !important;
    background-color: $color-light-grey;
    border: 1px solid transparent;
    transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
    padding: 0 16px;
  }
  &:deep(.el-input__wrapper.is-focus),
  &:deep(.el-input__wrapper:hover) {
    background-color: #fff;
    border-color: $color-blue-shallow;
    box-shadow: 0 4px 14px rgba(91, 141, 239, 0.15) !important;
  }
  &:deep(.el-input__inner) {
    color: $color-black;
  }
}

/*消息入口*/
.chat-entry {
  display: inline-flex;
  align-items: center;
  margin-right: 14px;
  height: $header-height;

  .chat-icon-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(91, 141, 239, 0.08);
    color: $color-blue-active;
    cursor: pointer;
    transition: all 0.2s ease;

    .icon {
      @include icon(1.1em, $color-blue-active);
    }
  }
  .chat-icon-btn:hover {
    background: rgba(91, 141, 239, 0.16);
    transform: translateY(-1px);
  }
}
.chat-entry:deep(.el-badge__content) {
  background: $theme-gradient;
  border: none;
  font-weight: 500;
}

.menu-item-text {
  flex: 1;
}
.menu-badge {
  margin-left: 8px;
}
.menu-badge:deep(.el-badge__content) {
  background: $theme-gradient;
  border: none;
}

/*用户*/
.user-wrap {
  position: relative;
  display: flex;
  align-items: center;

  .user {
    width: $header-user-width;
    height: $header-user-width;
    border-radius: $header-user-radius;
    margin-right: $header-user-margin;
    cursor: pointer;
    border: 2px solid #fff;
    box-shadow: 0 4px 14px rgba(31, 35, 48, 0.12);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .user:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 18px rgba(91, 141, 239, 0.35);
  }
}
</style>
