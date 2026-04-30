import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import store from "@/store";
import { ElMessage } from "element-plus";
const routes: Array<RouteRecordRaw> = [
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
  },
  {
    path: "/404",
    component: () => import("@/views/error/404.vue"),
  },
  {
    path: "/",
    name: "yin-container",
    component: () => import("@/views/YinContainer.vue"),
    children: [
      {
        path: "/",
        name: "home",
        component: () => import("@/views/Home.vue"),
      },
      {
        path: "/sign-in",
        name: "sign-in",
        component: () => import("@/views/SignIn.vue"),
      },
      {
        path: "/sign-up",
        name: "sign-up",
        component: () => import("@/views/SignUp.vue"),
      },
      {
        path: "/personal",
        name: "personal",
        meta: {
          requireAuth: true,
        },
        component: () => import("@/views/personal/Personal.vue"),
      },
      {
        path: "/song-sheet",
        name: "song-sheet",
        component: () => import("@/views/song-sheet/SongSheet.vue"),
      },
      {
        path: "/song-sheet-detail/:id",
        name: "song-sheet-detail",
        component: () => import("@/views/song-sheet/SongSheetDetail.vue"),
      },
      {
        path: "/singer",
        name: "singer",
        component: () => import("@/views/singer/Singer.vue"),
      },
      {
        path: "/singer-detail/:id",
        name: "singer-detail",
        component: () => import("@/views/singer/SingerDetail.vue"),
      },
      {
        path: "/mv",
        name: "mv",
        component: () => import("@/views/mv/Mv.vue"),
      },
      {
        path: "/mv-detail/:id",
        name: "mv-detail",
        component: () => import("@/views/mv/MvDetail.vue"),
      },
      {
        path: "/lyric/:id",
        name: "lyric",
        component: () => import("@/views/Lyric.vue"),
      },
      {
        path: "/search",
        name: "search",
        component: () => import("@/views/search/Search.vue"),
      },
      {
        path: "/chat",
        name: "chat",
        meta: {
          requireAuth: true,
        },
        component: () => import("@/views/chat/Chat.vue"),
      },
      {
        path: "/personal-data",
        name: "personal-data",
        component: () => import("@/views/setting/PersonalData.vue"),
      },
      {
        path: "/setting",
        name: "setting",
        meta: {
          requireAuth: true,
        },
        component: () => import("@/views/setting/Setting.vue"),
        children: [
          {
            path: "/setting/PersonalData",
            name: "personalData",
            meta: {
              requireAuth: true,
            },
            component: () => import("@/views/setting/PersonalData.vue"),
          }
        ]
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// 公开路由白名单（未登录可访问）。其余所有页面默认要求登录。
const PUBLIC_PATHS = new Set<string>(["/sign-in", "/sign-up", "/404"]);

router.beforeEach((to, from, next) => {
  const isPublic = PUBLIC_PATHS.has(to.path);
  const isAuthed = !!store.getters.token;

  if (isAuthed && (to.path === "/sign-in" || to.path === "/sign-up")) {
    // 已登录用户访问登录/注册页 → 直接回首页
    next({ path: "/" });
    return;
  }

  if (isPublic) {
    next();
    return;
  }

  if (isAuthed) {
    next();
    return;
  }

  // 未登录访问受保护页面：保留目标路径，登录后可跳回
  ElMessage.warning("请先登录");
  next({ path: "/sign-in", query: to.fullPath !== "/" ? { redirect: to.fullPath } : undefined });
});

export default router;
