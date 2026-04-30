const LS_TOKEN = "music_authToken";
const LS_USER_ID = "music_userId";
const LS_USERNAME = "music_username";
const LS_USER_PIC = "music_userPic";

function readLs(key: string) {
  try { return localStorage.getItem(key) || ""; } catch { return ""; }
}
function writeLs(key: string, value: string | number | null | undefined) {
  try {
    if (value === null || value === undefined || value === "") {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, String(value));
    }
  } catch { /* ignore quota / privacy errors */ }
}

export default {
  state: {
    userId: readLs(LS_USER_ID), // ID
    username: readLs(LS_USERNAME), // 名字
    userPic: readLs(LS_USER_PIC), // 图片
    authToken: readLs(LS_TOKEN), // 后端签发的 token
  },
  getters: {
    userId: (state) => state.userId,
    username: (state) => state.username,
    userPic: (state) => state.userPic,
    authToken: (state) => state.authToken,
  },
  mutations: {
    setUserId: (state, userId) => {
      state.userId = userId ?? "";
      writeLs(LS_USER_ID, state.userId);
    },
    setUsername: (state, username) => {
      state.username = username ?? "";
      writeLs(LS_USERNAME, state.username);
    },
    setUserPic: (state, userPic) => {
      state.userPic = userPic ?? "";
      writeLs(LS_USER_PIC, state.userPic);
    },
    setAuthToken: (state, token) => {
      state.authToken = token ?? "";
      writeLs(LS_TOKEN, state.authToken);
    },
    clearUserState: (state) => {
      state.userId = "";
      state.username = "";
      state.userPic = "";
      state.authToken = "";
      writeLs(LS_USER_ID, "");
      writeLs(LS_USERNAME, "");
      writeLs(LS_USER_PIC, "");
      writeLs(LS_TOKEN, "");
    },
  },
  actions: {
    // 客户端登出：清 user 状态、设 token=false、断开 chat
    userLogout({ commit, dispatch }) {
      try { dispatch("disconnectChat"); } catch { /* chat 模块可能未初始化 */ }
      commit("clearUserState");
      commit("setToken", false);
    },
  },
};
