import chatSocket from "@/api/chatSocket";
import { HttpManager } from "@/api";

export interface ChatMessage {
  id?: number | string;
  tempId?: string;
  fromUserId: number | string;
  toUserId: number | string;
  content: string;
  msgType?: 0 | 1 | 2; // 0 文本 / 1 图片 / 2 视频
  createTime?: string;
  status?: "sending" | "sent" | "failed";
}

interface ChatState {
  connected: boolean;
  conversations: any[]; // 后端返回的会话伙伴信息
  activePeerId: number | string | null;
  messagesByPeer: Record<string, ChatMessage[]>;
  unreadByPeer: Record<string, number>;
  unreadTotal: number;
  pendingQueue: { tempId: string; peerId: string }[]; // FIFO 等待 ack
  hiddenPeerIds: string[]; // 本地隐藏的会话伙伴 ID（仅前端展示过滤）
  bound: boolean;
}

const HIDDEN_LS_PREFIX = "music_chat_hidden_v1_";

function loadHiddenFromLs(userId: string | number | null | undefined): string[] {
  if (userId === undefined || userId === null || userId === "") return [];
  try {
    const raw = localStorage.getItem(HIDDEN_LS_PREFIX + userId);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map((x) => String(x)) : [];
  } catch {
    return [];
  }
}

function saveHiddenToLs(userId: string | number | null | undefined, ids: string[]) {
  if (userId === undefined || userId === null || userId === "") return;
  try {
    localStorage.setItem(HIDDEN_LS_PREFIX + userId, JSON.stringify(ids));
  } catch { /* ignore */ }
}

let tempIdSeed = 1;

export default {
  state: (): ChatState => ({
    connected: false,
    conversations: [],
    activePeerId: null,
    messagesByPeer: {},
    unreadByPeer: {},
    unreadTotal: 0,
    pendingQueue: [],
    hiddenPeerIds: [],
    bound: false,
  }),
  getters: {
    chatConnected: (s: ChatState) => s.connected,
    chatConversations: (s: ChatState) => s.conversations,
    chatActivePeerId: (s: ChatState) => s.activePeerId,
    chatMessagesByPeer: (s: ChatState) => s.messagesByPeer,
    chatUnreadByPeer: (s: ChatState) => s.unreadByPeer,
    chatUnreadTotal: (s: ChatState) => s.unreadTotal,
    chatActiveMessages: (s: ChatState) =>
      s.activePeerId != null ? s.messagesByPeer[String(s.activePeerId)] || [] : [],
    chatHiddenPeerIds: (s: ChatState) => s.hiddenPeerIds,
  },
  mutations: {
    setChatConnected(s: ChatState, v: boolean) {
      s.connected = v;
    },
    setChatConversations(s: ChatState, list: any[]) {
      s.conversations = list || [];
    },
    setChatActivePeerId(s: ChatState, id: number | string | null) {
      s.activePeerId = id;
    },
    appendChatMessage(s: ChatState, payload: { peerId: number | string; message: ChatMessage }) {
      const key = String(payload.peerId);
      if (!s.messagesByPeer[key]) s.messagesByPeer[key] = [];
      s.messagesByPeer[key].push(payload.message);
    },
    prependChatMessages(s: ChatState, payload: { peerId: number | string; messages: ChatMessage[] }) {
      const key = String(payload.peerId);
      const existing = s.messagesByPeer[key] || [];
      s.messagesByPeer[key] = [...payload.messages, ...existing];
    },
    setChatMessages(s: ChatState, payload: { peerId: number | string; messages: ChatMessage[] }) {
      s.messagesByPeer[String(payload.peerId)] = payload.messages;
    },
    updateChatMessageByTempId(
      s: ChatState,
      payload: { tempId: string; patch: Partial<ChatMessage> }
    ) {
      // 在所有会话中查找该 tempId
      for (const peerId of Object.keys(s.messagesByPeer)) {
        const list = s.messagesByPeer[peerId];
        const idx = list.findIndex((m) => m.tempId === payload.tempId);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...payload.patch };
          break;
        }
      }
      s.pendingQueue = s.pendingQueue.filter((p) => p.tempId !== payload.tempId);
    },
    trackPendingMessage(
      s: ChatState,
      payload: { tempId: string; peerId: number | string }
    ) {
      s.pendingQueue.push({ tempId: payload.tempId, peerId: String(payload.peerId) });
    },
    shiftPendingQueue(s: ChatState) {
      s.pendingQueue.shift();
    },
    setUnreadTotal(s: ChatState, n: number) {
      s.unreadTotal = n || 0;
    },
    incUnread(s: ChatState, peerId: number | string) {
      const key = String(peerId);
      s.unreadByPeer[key] = (s.unreadByPeer[key] || 0) + 1;
      s.unreadTotal += 1;
    },
    clearUnreadOfPeer(s: ChatState, peerId: number | string) {
      const key = String(peerId);
      const cnt = s.unreadByPeer[key] || 0;
      if (cnt > 0) {
        s.unreadTotal = Math.max(0, s.unreadTotal - cnt);
        s.unreadByPeer[key] = 0;
      }
    },
    resetChat(s: ChatState) {
      s.connected = false;
      s.conversations = [];
      s.activePeerId = null;
      s.messagesByPeer = {};
      s.unreadByPeer = {};
      s.unreadTotal = 0;
      s.pendingQueue = [];
      s.hiddenPeerIds = [];
    },
    setChatBound(s: ChatState, v: boolean) {
      s.bound = v;
    },
    setHiddenPeerIds(s: ChatState, ids: string[]) {
      s.hiddenPeerIds = (ids || []).map((x) => String(x));
    },
    addHiddenPeer(s: ChatState, peerId: string | number) {
      const id = String(peerId);
      if (!s.hiddenPeerIds.includes(id)) s.hiddenPeerIds.push(id);
    },
    removeHiddenPeer(s: ChatState, peerId: string | number) {
      const id = String(peerId);
      s.hiddenPeerIds = s.hiddenPeerIds.filter((x) => x !== id);
    },
  },
  actions: {
    bindChatSocket({ commit, state, dispatch, rootGetters }) {
      if (state.bound) return;
      commit("setChatBound", true);
      chatSocket.on((data: any) => {
        if (!data || !data.type) return;
        const myId = rootGetters.userId;
        switch (data.type) {
          case "open":
            commit("setChatConnected", true);
            dispatch("loadHiddenPeers");
            dispatch("refreshUnreadTotal");
            dispatch("loadConversations");
            break;
          case "close":
            commit("setChatConnected", false);
            break;
          case "ack": {
            // 协议未携带 tempId，按 FIFO 匹配最早的待确认消息
            const head = state.pendingQueue[0];
            if (head) {
              commit("updateChatMessageByTempId", {
                tempId: head.tempId,
                patch: { id: data.id, createTime: data.createTime, status: "sent" },
              });
            }
            break;
          }
          case "msg": {
            const peerId =
              String(data.fromUserId) === String(myId) ? data.toUserId : data.fromUserId;
            const incoming: ChatMessage = {
              id: data.id,
              fromUserId: data.fromUserId,
              toUserId: data.toUserId,
              content: data.content,
              msgType: (Number(data.msgType) || 0) as 0 | 1 | 2,
              createTime: data.createTime,
              status: "sent",
            };
            commit("appendChatMessage", { peerId, message: incoming });
            // 收到隐藏会话的新消息：自动取消隐藏，让会话回来
            if (state.hiddenPeerIds.includes(String(peerId))) {
              dispatch("restorePeer", peerId);
            }
            const isFromOther = String(data.fromUserId) !== String(myId);
            const isActive = String(state.activePeerId) === String(peerId);
            if (isFromOther && !isActive) {
              commit("incUnread", peerId);
            } else if (isFromOther && isActive) {
              dispatch("markPeerRead", peerId);
            }
            dispatch("loadConversations");
            break;
          }
          case "error":
            console.warn("[Chat] 服务端错误：", data.message);
            break;
        }
      });
    },
    connectChat({ dispatch, rootGetters }) {
      const token = rootGetters.authToken;
      if (!token) {
        console.warn("[Chat] connectChat 跳过：authToken 为空，请确认已登录");
        return;
      }
      console.log("[Chat] connectChat with token=" + token.slice(0, 6) + "***");
      dispatch("bindChatSocket");
      chatSocket.connect(token);
    },
    disconnectChat({ commit }) {
      chatSocket.disconnect();
      commit("resetChat");
    },
    sendChatMessage(
      { commit, rootGetters },
      {
        peerId,
        content,
        msgType = 0,
      }: { peerId: number | string; content: string; msgType?: 0 | 1 | 2 }
    ) {
      const raw = (content || "").trim();
      if (!raw) return false;
      const myId = rootGetters.userId;
      const tempId = `t_${Date.now()}_${tempIdSeed++}`;
      const msg: ChatMessage = {
        tempId,
        fromUserId: myId,
        toUserId: peerId,
        content: raw,
        msgType,
        status: "sending",
        createTime: new Date().toISOString(),
      };
      commit("appendChatMessage", { peerId, message: msg });
      commit("trackPendingMessage", { tempId, peerId });
      const ok = chatSocket.send(peerId, raw, msgType);
      if (!ok) {
        commit("updateChatMessageByTempId", { tempId, patch: { status: "failed" } });
        return false;
      }
      return true;
    },
    async loadConversations({ commit, rootGetters }) {
      if (!rootGetters.authToken) return;
      try {
        const res = (await HttpManager.getConversations()) as ResponseBody;
        commit("setChatConversations", res?.data || []);
      } catch (e) {
        console.error("[Chat] 加载会话失败", e);
      }
    },
    async loadHistory(
      { commit, rootGetters },
      { peerId, page = 1, size = 20, replace = false }: { peerId: number | string; page?: number; size?: number; replace?: boolean }
    ) {
      if (!rootGetters.authToken || !peerId) return [];
      try {
        const res = (await HttpManager.getMessageHistory({ peerId, page, size })) as ResponseBody;
        const list: ChatMessage[] = (res?.data || [])
          .map((m: any) => ({
            id: m.id,
            fromUserId: m.fromUserId,
            toUserId: m.toUserId,
            content: m.content,
            msgType: (Number(m.msgType ?? m.type) || 0) as 0 | 1 | 2,
            createTime: m.createTime,
            status: "sent" as const,
          }))
          .reverse(); // 后端倒序，反转为正序
        if (replace) {
          commit("setChatMessages", { peerId, messages: list });
        } else {
          commit("prependChatMessages", { peerId, messages: list });
        }
        return list;
      } catch (e) {
        console.error("[Chat] 加载历史失败", e);
        return [];
      }
    },
    async refreshUnreadTotal({ commit, rootGetters }) {
      if (!rootGetters.authToken) return;
      try {
        const res = (await HttpManager.getUnreadCount()) as ResponseBody;
        commit("setUnreadTotal", Number(res?.data) || 0);
      } catch (e) {
        console.error("[Chat] 加载未读失败", e);
      }
    },
    async markPeerRead({ commit, rootGetters }, peerId: number | string) {
      if (!rootGetters.authToken || !peerId) return;
      try {
        await HttpManager.markMessageRead(peerId);
        commit("clearUnreadOfPeer", peerId);
      } catch (e) {
        console.error("[Chat] 标记已读失败", e);
      }
    },
    /** 加载当前用户的本地隐藏会话列表 */
    loadHiddenPeers({ commit, rootGetters }) {
      const ids = loadHiddenFromLs(rootGetters.userId);
      commit("setHiddenPeerIds", ids);
    },
    /** 隐藏指定会话（仅前端，不影响后端数据） */
    hidePeer({ commit, state, rootGetters }, peerId: number | string) {
      if (peerId == null) return;
      commit("addHiddenPeer", peerId);
      saveHiddenToLs(rootGetters.userId, state.hiddenPeerIds);
      // 如果当前正在和该用户聊天，关闭会话面板
      if (String(state.activePeerId) === String(peerId)) {
        commit("setChatActivePeerId", null);
      }
    },
    /** 恢复显示某个被隐藏的会话 */
    restorePeer({ commit, state, rootGetters }, peerId: number | string) {
      if (peerId == null) return;
      commit("removeHiddenPeer", peerId);
      saveHiddenToLs(rootGetters.userId, state.hiddenPeerIds);
    },
    async openConversation({ commit, dispatch }, peerId: number | string) {
      commit("setChatActivePeerId", peerId);
      await dispatch("loadHistory", { peerId, page: 1, replace: true });
      await dispatch("markPeerRead", peerId);
    },
  },
};
