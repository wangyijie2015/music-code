<template>
  <div class="chat-page">
    <div class="chat-shell">
      <!-- 左侧：会话列表 -->
      <aside class="chat-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-title">
            <span class="title-bar"></span>
            <h2>消息</h2>
          </div>
          <div class="conn-tag" :class="{ on: connected, off: !connected }">
            <span class="dot"></span>{{ connected ? "已连接" : "未连接" }}
          </div>
        </div>
        <div class="sidebar-actions">
          <el-button class="new-chat-btn" type="primary" round size="small" @click="openNewChat">
            发起新会话
          </el-button>
        </div>
        <ul class="conv-list">
          <li
            v-for="conv in convDisplayList"
            :key="conv.peerId"
            class="conv-item"
            :class="{ active: String(conv.peerId) === String(activePeerId) }"
            @click="onSelectPeer(conv.peerId)"
          >
            <el-image class="conv-avatar" fit="cover" :src="attachImageUrl(conv.avatar)" />
            <div class="conv-meta">
              <div class="conv-top">
                <span class="conv-name">{{ conv.username || `用户 ${conv.peerId}` }}</span>
                <span class="conv-time" v-if="conv.lastTime">{{ formatTime(conv.lastTime) }}</span>
              </div>
              <div class="conv-bottom">
                <span class="conv-last">{{ conv.lastContent || "点击开始聊天" }}</span>
                <el-badge
                  v-if="unreadByPeer[String(conv.peerId)]"
                  :value="unreadByPeer[String(conv.peerId)]"
                  :max="99"
                  class="conv-badge"
                />
              </div>
            </div>
          </li>
          <li v-if="!convDisplayList.length" class="conv-empty">暂无会话，点击上方按钮发起聊天</li>
        </ul>
      </aside>

      <!-- 右侧：聊天面板 -->
      <section class="chat-panel">
        <template v-if="activePeerId != null">
          <header class="panel-header">
            <el-image class="peer-avatar" fit="cover" :src="attachImageUrl(activePeerInfo.avatar)" />
            <div class="peer-meta">
              <div class="peer-name">{{ activePeerInfo.username || `用户 ${activePeerId}` }}</div>
              <div class="peer-sub">ID：{{ activePeerId }}</div>
            </div>
          </header>
          <div ref="messageBoxRef" class="message-box" @scroll="onScroll">
            <div v-if="loadingMore" class="load-tip">加载中...</div>
            <div v-else-if="!noMore && messages.length" class="load-more" @click="loadMore">查看更早的消息</div>
            <div v-else-if="noMore && messages.length" class="load-tip muted">已经是最早的消息</div>

            <div
              v-for="(msg, index) in messages"
              :key="msg.id || msg.tempId || index"
              class="msg-row"
              :class="{ self: isSelf(msg) }"
            >
              <el-image class="msg-avatar" fit="cover" :src="attachImageUrl(isSelf(msg) ? userPic : activePeerInfo.avatar)" />
              <div class="msg-bubble-wrap">
                <!-- 文本 -->
                <div
                  v-if="!msg.msgType"
                  class="msg-bubble"
                  :class="{ failed: msg.status === 'failed' }"
                >{{ msg.content }}</div>

                <!-- 图片 -->
                <div
                  v-else-if="msg.msgType === 1"
                  class="msg-bubble msg-bubble-media"
                  :class="{ failed: msg.status === 'failed' }"
                >
                  <el-image
                    class="msg-image"
                    fit="cover"
                    :src="attachImageUrl(msg.content)"
                    :preview-src-list="[attachImageUrl(msg.content)]"
                    :preview-teleported="true"
                    hide-on-click-modal
                  />
                </div>

                <!-- 视频 -->
                <div
                  v-else-if="msg.msgType === 2"
                  class="msg-bubble msg-bubble-media"
                  :class="{ failed: msg.status === 'failed' }"
                >
                  <video
                    class="msg-video"
                    :src="attachImageUrl(msg.content)"
                    controls
                    preload="metadata"
                  ></video>
                </div>

                <div class="msg-status">
                  <span>{{ formatTime(msg.createTime) }}</span>
                  <span v-if="isSelf(msg) && msg.status === 'sending'">· 发送中</span>
                  <span v-else-if="isSelf(msg) && msg.status === 'failed'" class="err">· 发送失败</span>
                </div>
              </div>
            </div>

            <div v-if="!messages.length" class="empty-tip">还没有消息，先打个招呼吧</div>
          </div>
          <footer class="panel-input">
            <div class="input-toolbar">
              <button
                class="tool-btn"
                title="发送图片"
                :disabled="!connected || uploading"
                @click="triggerPickImage"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"/></svg>
              </button>
              <button
                class="tool-btn"
                title="发送视频"
                :disabled="!connected || uploading"
                @click="triggerPickVideo"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17 10.5V6c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-4.5l4 4v-11l-4 4z"/></svg>
              </button>
              <span v-if="uploading" class="upload-tip">
                <span class="mini-spinner"></span>上传中 {{ uploadProgress }}%
              </span>
            </div>
            <input
              ref="imageInputRef"
              class="hidden-file"
              type="file"
              :accept="IMAGE_ACCEPT"
              @change="onPickImage"
            />
            <input
              ref="videoInputRef"
              class="hidden-file"
              type="file"
              :accept="VIDEO_ACCEPT"
              @change="onPickVideo"
            />
            <div class="input-row">
              <el-input
                v-model="inputText"
                type="textarea"
                :rows="2"
                :maxlength="500"
                show-word-limit
                resize="none"
                placeholder="输入消息（Enter 发送，Shift+Enter 换行）"
                @keydown.enter.exact.prevent="onSend"
              />
              <el-button class="send-btn" type="primary" :disabled="!canSend" @click="onSend">发送</el-button>
            </div>
          </footer>
        </template>
        <div v-else class="panel-placeholder">
          <div class="ph-icon">💬</div>
          <div class="ph-title">选择左侧会话开始聊天</div>
          <div class="ph-sub">或点击「发起新会话」搜索用户开始聊天</div>
        </div>
      </section>
    </div>

    <!-- 新会话对话框 -->
    <el-dialog v-model="newChatDialog" title="发起新会话" width="420px">
      <el-input
        v-model="searchKeyword"
        placeholder="输入用户 ID 或用户名搜索"
        clearable
        :prefix-icon="SearchIcon"
        @input="onSearchInput"
        @keyup.enter="doSearchNow"
      />
      <div class="search-result-area">
        <div v-if="searching" class="search-state">
          <span class="mini-spinner"></span>搜索中...
        </div>
        <div v-else-if="!searchKeyword.trim()" class="search-state muted">
          请输入用户 ID 或用户名开始搜索
        </div>
        <div v-else-if="!searchResults.length" class="search-state muted">
          没有找到匹配的用户
        </div>
        <ul v-else class="result-list">
          <li
            v-for="u in searchResults"
            :key="u.id"
            class="result-item"
            :class="{ self: String(u.id) === String(userId) }"
            @click="pickUser(u)"
          >
            <el-image class="result-avatar" fit="cover" :src="attachImageUrl(u.avator)" />
            <div class="result-meta">
              <div class="result-name">{{ u.username }}</div>
              <div class="result-id">ID：{{ u.id }}</div>
            </div>
            <span v-if="String(u.id) === String(userId)" class="self-tag">自己</span>
          </li>
        </ul>
      </div>
      <template #footer>
        <el-button @click="newChatDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch, nextTick, reactive, shallowRef } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { Search as SearchIcon } from "@element-plus/icons-vue";

import mixin from "@/mixins/mixin";
import { HttpManager } from "@/api";
import { NavName } from "@/enums";

const store = useStore();
const { changeIndex } = mixin();

const userId = computed(() => store.getters.userId);
const userPic = computed(() => store.getters.userPic);
const connected = computed(() => store.getters.chatConnected);
const conversations = computed<any[]>(() => store.getters.chatConversations);
const activePeerId = computed(() => store.getters.chatActivePeerId);
const messages = computed(() => store.getters.chatActiveMessages);
const unreadByPeer = computed(() => store.getters.chatUnreadByPeer);

const inputText = ref("");
const messageBoxRef = ref<HTMLDivElement | null>(null);
const loadingMore = ref(false);
const noMore = ref(false);
const currentPage = ref(1);
const pageSize = 20;

const newChatDialog = ref(false);
const searchKeyword = ref("");
const searchResults = shallowRef<any[]>([]);
const searching = ref(false);
let searchTimer: ReturnType<typeof setTimeout> | null = null;
let searchSeq = 0;

// 上传相关
const imageInputRef = ref<HTMLInputElement | null>(null);
const videoInputRef = ref<HTMLInputElement | null>(null);
const uploading = ref(false);
const uploadProgress = ref(0);
const IMAGE_EXT = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
const VIDEO_EXT = ["mp4", "webm", "mov", "m4v"];
const IMAGE_ACCEPT = "image/jpeg,image/png,image/gif,image/webp,image/bmp";
const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,video/x-m4v";
const IMAGE_MAX = 10 * 1024 * 1024; // 10MB
const VIDEO_MAX = 50 * 1024 * 1024; // 50MB

// 缓存对端用户信息
const peerInfoMap = reactive<Record<string, { username: string; avatar: string }>>({});

const activePeerInfo = computed(() => {
  if (activePeerId.value == null) return { username: "", avatar: "" };
  return peerInfoMap[String(activePeerId.value)] || { username: "", avatar: "" };
});

// 会话列表展示数据：把会话伙伴 ID 列表附加上用户名/头像/最近消息
const convDisplayList = computed(() => {
  return (conversations.value || []).map((c: any) => {
    const peerId = typeof c === "object" ? (c.peerId ?? c.userId ?? c.id) : c;
    const info = peerInfoMap[String(peerId)] || {};
    const lastMsg = (() => {
      const arr = store.getters.chatMessagesByPeer[String(peerId)];
      if (arr && arr.length) return arr[arr.length - 1];
      return null;
    })();
    return {
      peerId,
      username: info.username,
      avatar: info.avatar,
      lastContent: lastMsg?.content || (typeof c === "object" ? c.lastContent : ""),
      lastTime: lastMsg?.createTime || (typeof c === "object" ? c.lastTime : ""),
    };
  });
});

const canSend = computed(() => connected.value && inputText.value.trim().length > 0 && activePeerId.value != null);

function isSelf(msg: any) {
  return String(msg.fromUserId) === String(userId.value);
}

async function ensurePeerInfo(peerId: number | string) {
  const key = String(peerId);
  if (peerInfoMap[key]) return;
  try {
    const res = (await HttpManager.getUserOfId(peerId)) as ResponseBody;
    const u = res?.data?.[0];
    if (u) {
      peerInfoMap[key] = { username: u.username, avatar: u.avator };
    } else {
      peerInfoMap[key] = { username: `用户 ${peerId}`, avatar: "" };
    }
  } catch {
    peerInfoMap[key] = { username: `用户 ${peerId}`, avatar: "" };
  }
}

async function onSelectPeer(peerId: number | string) {
  if (peerId == null) return;
  await ensurePeerInfo(peerId);
  currentPage.value = 1;
  noMore.value = false;
  await store.dispatch("openConversation", peerId);
  await scrollToBottom();
}

async function loadMore() {
  if (loadingMore.value || noMore.value || activePeerId.value == null) return;
  loadingMore.value = true;
  const nextPage = currentPage.value + 1;
  const box = messageBoxRef.value;
  const prevHeight = box ? box.scrollHeight : 0;
  const list = await store.dispatch("loadHistory", { peerId: activePeerId.value, page: nextPage, size: pageSize });
  if (!list.length) {
    noMore.value = true;
  } else {
    currentPage.value = nextPage;
    if (list.length < pageSize) noMore.value = true;
    await nextTick();
    if (box) box.scrollTop = box.scrollHeight - prevHeight;
  }
  loadingMore.value = false;
}

function onScroll() {
  const box = messageBoxRef.value;
  if (!box) return;
  if (box.scrollTop < 30) loadMore();
}

async function onSend() {
  const text = inputText.value.trim();
  if (!text || activePeerId.value == null) return;
  if (!connected.value) {
    ElMessage.warning("聊天未连接，请稍候");
    return;
  }
  const ok = store.dispatch("sendChatMessage", { peerId: activePeerId.value, content: text, msgType: 0 });
  if (ok !== false) {
    inputText.value = "";
    await scrollToBottom();
  }
}

function triggerPickImage() {
  if (!preCheckUpload()) return;
  imageInputRef.value?.click();
}
function triggerPickVideo() {
  if (!preCheckUpload()) return;
  videoInputRef.value?.click();
}

function preCheckUpload(): boolean {
  if (activePeerId.value == null) {
    ElMessage.warning("请先选择会话");
    return false;
  }
  if (!connected.value) {
    ElMessage.warning("聊天未连接，请稍候");
    return false;
  }
  if (uploading.value) {
    ElMessage.warning("正在上传，请稍候");
    return false;
  }
  return true;
}

function getExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i < 0 ? "" : name.slice(i + 1).toLowerCase();
}

async function onPickImage(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = ""; // 允许重复选择同名文件
  if (!file) return;
  await uploadAndSend(file, "image");
}

async function onPickVideo(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  await uploadAndSend(file, "video");
}

async function uploadAndSend(file: File, type: "image" | "video") {
  // 扩展名校验
  const ext = getExt(file.name);
  const allowed = type === "image" ? IMAGE_EXT : VIDEO_EXT;
  if (!allowed.includes(ext)) {
    ElMessage.error(`不支持的格式，仅允许 ${allowed.join("、")}`);
    return;
  }
  // 大小校验
  const maxSize = type === "image" ? IMAGE_MAX : VIDEO_MAX;
  if (file.size > maxSize) {
    const limitMB = maxSize / 1024 / 1024;
    ElMessage.error(`文件超过 ${limitMB}MB 上限`);
    return;
  }

  uploading.value = true;
  uploadProgress.value = 0;
  try {
    const res = (await HttpManager.uploadChatMedia(file, type, (p) => {
      uploadProgress.value = p;
    })) as ResponseBody;
    if (!res?.success || !res.data?.url) {
      ElMessage.error(res?.message || "上传失败");
      return;
    }
    const url: string = res.data.url;
    const msgType: 1 | 2 = type === "image" ? 1 : 2;
    const ok = store.dispatch("sendChatMessage", {
      peerId: activePeerId.value,
      content: url,
      msgType,
    });
    if (ok !== false) await scrollToBottom();
  } catch (e) {
    console.error("[Chat] 上传失败", e);
    const status = (e as any)?.status;
    if (status === 413) {
      ElMessage.error("文件过大被服务器拒绝");
    } else {
      ElMessage.error("上传失败");
    }
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
}

async function scrollToBottom() {
  await nextTick();
  const box = messageBoxRef.value;
  if (box) box.scrollTop = box.scrollHeight;
}

function openNewChat() {
  searchKeyword.value = "";
  searchResults.value = [];
  searching.value = false;
  newChatDialog.value = true;
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  const kw = searchKeyword.value.trim();
  if (!kw) {
    searchResults.value = [];
    searching.value = false;
    return;
  }
  searchTimer = setTimeout(() => doSearchNow(), 300);
}

async function doSearchNow() {
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  const kw = searchKeyword.value.trim();
  if (!kw) {
    searchResults.value = [];
    searching.value = false;
    return;
  }
  const seq = ++searchSeq;
  searching.value = true;
  try {
    const res = (await HttpManager.searchUser(kw)) as ResponseBody;
    if (seq !== searchSeq) return; // 丢弃过期请求
    const list = Array.isArray(res?.data) ? res.data : [];
    searchResults.value = list;
  } catch (e) {
    if (seq === searchSeq) {
      searchResults.value = [];
      ElMessage.error("搜索失败");
    }
  } finally {
    if (seq === searchSeq) searching.value = false;
  }
}

async function pickUser(u: any) {
  if (!u || u.id == null) return;
  if (String(u.id) === String(userId.value)) {
    ElMessage.warning("不能和自己聊天");
    return;
  }
  const id = u.id;
  // 写入本地用户信息缓存（避免再 ensurePeerInfo 多发一次请求）
  peerInfoMap[String(id)] = { username: u.username, avatar: u.avator };
  newChatDialog.value = false;
  // 并入会话列表（若不在）
  const exists = (conversations.value || []).some((c: any) => {
    const pid = typeof c === "object" ? (c.peerId ?? c.userId ?? c.id) : c;
    return String(pid) === String(id);
  });
  if (!exists) {
    store.commit("setChatConversations", [...(conversations.value || []), { peerId: id }]);
  }
  await onSelectPeer(id);
}

function formatTime(t?: string) {
  if (!t) return "";
  try {
    const d = new Date(t);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    if (sameDay) return `${hh}:${mm}`;
    const M = String(d.getMonth() + 1).padStart(2, "0");
    const D = String(d.getDate()).padStart(2, "0");
    return `${M}-${D} ${hh}:${mm}`;
  } catch {
    return "";
  }
}

// 新消息到达时若在当前会话，自动滚到底
watch(
  () => messages.value.length,
  () => {
    nextTick(() => scrollToBottom());
  }
);

// 会话列表变化时预拉对端用户信息
watch(
  conversations,
  (list) => {
    (list || []).forEach((c: any) => {
      const peerId = typeof c === "object" ? (c.peerId ?? c.userId ?? c.id) : c;
      if (peerId != null) ensurePeerInfo(peerId);
    });
  },
  { immediate: true }
);

const attachImageUrl = HttpManager.attachImageUrl;

onMounted(() => {
  changeIndex(NavName.Chat);
  if (!connected.value && userId.value) {
    store.dispatch("connectChat");
  }
  store.dispatch("loadConversations");
  store.dispatch("refreshUnreadTotal");
});

onUnmounted(() => {
  store.commit("setChatActivePeerId", null);
});
</script>

<style lang="scss" scoped>
@import "@/assets/css/var.scss";

.chat-page {
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
}

.chat-shell {
  display: flex;
  height: calc(100vh - 200px);
  min-height: 540px;
  background: #fff;
  border-radius: 18px;
  box-shadow: $shadow-md;
  border: 1px solid $theme-border;
  overflow: hidden;
}

/* ============ 侧边栏 ============ */
.chat-sidebar {
  width: 300px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid $theme-border;
  background: linear-gradient(180deg, #fafbfd 0%, #fff 100%);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 18px 10px;

  .sidebar-title {
    display: flex;
    align-items: center;
    gap: 10px;
    .title-bar {
      width: 4px;
      height: 20px;
      border-radius: 4px;
      background: $theme-gradient;
    }
    h2 {
      font-size: 18px;
      font-weight: 600;
      color: $theme-text-primary;
    }
  }
}

.conn-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &.on {
    background: rgba(0, 200, 100, 0.1);
    color: #0a8a4a;
    .dot { background: #0a8a4a; }
  }
  &.off {
    background: rgba(31, 35, 48, 0.06);
    color: $theme-text-secondary;
    .dot { background: $theme-text-secondary; }
  }
}

.sidebar-actions {
  padding: 4px 18px 14px;
}
.new-chat-btn {
  width: 100%;
  background: $theme-gradient !important;
  border: none !important;
  color: #fff !important;
  box-shadow: 0 6px 16px rgba(91, 141, 239, 0.28);
}

.conv-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
}

.conv-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.18s ease;

  &:hover {
    background: rgba(91, 141, 239, 0.06);
  }
  &.active {
    background: rgba(91, 141, 239, 0.12);
  }
}

.conv-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex-shrink: 0;
  background: $color-light-grey;
}

.conv-meta {
  flex: 1;
  min-width: 0;

  .conv-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .conv-name {
      font-weight: 500;
      color: $theme-text-primary;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 130px;
    }
    .conv-time {
      font-size: 11px;
      color: $theme-text-secondary;
      flex-shrink: 0;
      margin-left: 8px;
    }
  }

  .conv-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2px;
    .conv-last {
      font-size: 12px;
      color: $theme-text-secondary;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
  }
}

.conv-badge:deep(.el-badge__content) {
  background: $theme-gradient;
  border: none;
}

.conv-empty {
  text-align: center;
  color: $theme-text-secondary;
  padding: 30px 16px;
  font-size: 13px;
  display: block;
}

/* ============ 聊天面板 ============ */
.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid $theme-border;

  .peer-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: $color-light-grey;
  }

  .peer-meta {
    .peer-name {
      font-size: 15px;
      font-weight: 600;
      color: $theme-text-primary;
    }
    .peer-sub {
      font-size: 12px;
      color: $theme-text-secondary;
      margin-top: 2px;
    }
  }
}

.message-box {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background:
    radial-gradient(800px 400px at 100% 0%, rgba(197, 108, 255, 0.04), transparent 60%),
    radial-gradient(700px 360px at 0% 100%, rgba(108, 141, 255, 0.04), transparent 60%);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.load-more {
  align-self: center;
  font-size: 12px;
  color: $color-blue-active;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(91, 141, 239, 0.08);
  &:hover { background: rgba(91, 141, 239, 0.16); }
}

.load-tip {
  align-self: center;
  font-size: 12px;
  color: $theme-text-secondary;
  &.muted { opacity: 0.7; }
}

.msg-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  max-width: 75%;

  &.self {
    align-self: flex-end;
    flex-direction: row-reverse;
    text-align: right;
  }
}

.msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  background: $color-light-grey;
}

.msg-bubble-wrap {
  min-width: 0;
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 14px;
  background: #fff;
  color: $theme-text-primary;
  font-size: 14px;
  line-height: 1.55;
  box-shadow: 0 2px 8px rgba(31, 35, 48, 0.06);
  border: 1px solid $theme-border;
  word-break: break-word;
  white-space: pre-wrap;

  &.failed { border-color: rgba(255, 92, 122, 0.5); background: rgba(255, 92, 122, 0.06); }
}

.msg-row.self .msg-bubble {
  background: $theme-gradient;
  color: #fff;
  border: none;
  box-shadow: 0 6px 18px rgba(91, 141, 239, 0.25);
}

.msg-status {
  font-size: 11px;
  color: $theme-text-secondary;
  margin-top: 4px;
  .err { color: $color-red; }
}

.empty-tip {
  align-self: center;
  margin-top: 60px;
  color: $theme-text-secondary;
  font-size: 13px;
}

.panel-input {
  border-top: 1px solid $theme-border;
  padding: 8px 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &:deep(.el-textarea__inner) {
    border-radius: 10px;
    background: $color-light-grey;
    border: 1px solid transparent;
    box-shadow: none;
    transition: border-color 0.2s ease, background 0.2s ease;
    &:hover, &:focus {
      background: #fff;
      border-color: $color-blue-shallow;
    }
  }
}

.input-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 2px;
}

.tool-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: $theme-text-secondary;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s ease, color 0.18s ease;

  &:hover:not(:disabled) {
    background: rgba(91, 141, 239, 0.1);
    color: $color-blue-active;
  }
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
}

.upload-tip {
  font-size: 12px;
  color: $color-blue-active;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 6px;
}

.hidden-file {
  display: none;
}

.input-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;

  .send-btn {
    background: $theme-gradient;
    border: none;
    color: #fff;
    border-radius: 999px;
    padding: 10px 22px;
    font-weight: 500;
    height: 40px;
  }
}

/* 媒体气泡（图片/视频） */
.msg-bubble-media {
  padding: 4px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(31, 35, 48, 0.06);
  border: 1px solid $theme-border;
  overflow: hidden;
  line-height: 0;

  &.failed { border-color: rgba(255, 92, 122, 0.5); }
}
.msg-row.self .msg-bubble-media {
  background: rgba(255, 255, 255, 0.95);
  border: none;
  box-shadow: 0 6px 18px rgba(91, 141, 239, 0.18);
}

.msg-image {
  max-width: 240px;
  max-height: 320px;
  border-radius: 10px;
  display: block;
  cursor: zoom-in;
}
.msg-image:deep(img) {
  border-radius: 10px;
  display: block;
}

.msg-video {
  max-width: 280px;
  max-height: 320px;
  border-radius: 10px;
  display: block;
  background: #000;
}

.panel-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: $theme-text-secondary;

  .ph-icon {
    font-size: 56px;
    margin-bottom: 10px;
    opacity: 0.6;
  }
  .ph-title {
    font-size: 16px;
    color: $theme-text-primary;
    font-weight: 500;
  }
  .ph-sub {
    font-size: 13px;
    margin-top: 6px;
  }
}

@media screen and (max-width: $sm) {
  .chat-shell {
    flex-direction: column;
    height: auto;
    min-height: 70vh;
  }
  .chat-sidebar {
    width: 100%;
    max-height: 240px;
  }
}

/* ============ 搜索对话框 ============ */
.search-result-area {
  margin-top: 14px;
  min-height: 80px;
  max-height: 320px;
  overflow-y: auto;
}

.search-state {
  text-align: center;
  padding: 26px 0;
  font-size: 13px;
  color: $theme-text-secondary;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &.muted { opacity: 0.85; }
}

.mini-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(91, 141, 239, 0.2);
  border-top-color: $color-blue-active;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.result-list {
  display: block;
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.18s ease;

  &:hover {
    background: rgba(91, 141, 239, 0.08);
  }
  &.self {
    cursor: not-allowed;
    opacity: 0.55;
    &:hover { background: transparent; }
  }
}

.result-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  background: $color-light-grey;
}

.result-meta {
  flex: 1;
  min-width: 0;
  .result-name {
    font-size: 14px;
    font-weight: 500;
    color: $theme-text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .result-id {
    font-size: 12px;
    color: $theme-text-secondary;
    margin-top: 2px;
  }
}

.self-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: $color-light-grey;
  color: $theme-text-secondary;
  flex-shrink: 0;
}
</style>
