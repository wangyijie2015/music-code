import { getBaseURL } from "./request";

type Listener = (data: any) => void;

class ChatSocket {
  private ws: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private currentToken: string | null = null;
  private intentionalClose = false;
  private retryDelay = 2000;
  private readonly maxRetryDelay = 30000;

  connect(token: string) {
    if (!token) {
      console.warn("[Chat] 拒绝连接：token 为空");
      return;
    }
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      if (this.currentToken === token) {
        console.log("[Chat] 已使用相同 token 连接，跳过");
        return;
      }
      console.log("[Chat] token 变化，先断开旧连接");
      this.disconnect();
    }
    this.currentToken = token;
    this.intentionalClose = false;

    const baseURL = getBaseURL() || `${location.protocol}//${location.host}`;
    const wsBase = baseURL.replace(/^http/i, "ws").replace(/\/$/, "");
    const url = `${wsBase}/ws/chat?token=${encodeURIComponent(token)}`;
    // 不打印完整 token，只显示前 6 位避免日志泄露
    console.log("[Chat] 准备连接：", wsBase + "/ws/chat?token=" + token.slice(0, 6) + "***");

    try {
      this.ws = new WebSocket(url);
    } catch (e) {
      console.error("[Chat] WebSocket 创建失败", e);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.log("[Chat] ✅ 已连接");
      this.retryDelay = 2000;
      this.emit({ type: "open" });
    };
    this.ws.onmessage = (e) => {
      let data: any;
      try {
        data = JSON.parse(e.data);
      } catch {
        console.warn("[Chat] 收到非 JSON 数据：", e.data);
        return;
      }
      console.log("[Chat] ⬇ 收到", data);
      this.emit(data);
    };
    this.ws.onerror = (ev) => {
      console.error("[Chat] ❌ 连接异常（详情请看 Network/WS）", ev);
      this.emit({ type: "error", message: "连接异常" });
    };
    this.ws.onclose = (ev) => {
      console.warn(
        `[Chat] 🔌 连接关闭 code=${ev.code} reason=${ev.reason || "-"} clean=${ev.wasClean} intentional=${this.intentionalClose}`
      );
      this.emit({ type: "close" });
      this.ws = null;
      if (!this.intentionalClose && this.currentToken) {
        console.log(`[Chat] 将在 ${this.retryDelay / 1000}s 后重连`);
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || !this.currentToken) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.currentToken) this.connect(this.currentToken);
    }, this.retryDelay);
    this.retryDelay = Math.min(this.retryDelay * 2, this.maxRetryDelay);
  }

  disconnect() {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try { this.ws.close(); } catch { /* noop */ }
      this.ws = null;
    }
    this.currentToken = null;
    this.retryDelay = 2000;
  }

  send(toUserId: string | number, content: string, msgType: 0 | 1 | 2 = 0): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("[Chat] 发送失败：WebSocket 未连接 readyState=" + (this.ws?.readyState ?? "null"));
      return false;
    }
    try {
      const body: Record<string, unknown> = { toUserId, content };
      if (msgType) body.msgType = msgType;
      const payload = JSON.stringify(body);
      console.log("[Chat] ⬆ 发送", payload);
      this.ws.send(payload);
      return true;
    } catch (e) {
      console.error("[Chat] 发送异常", e);
      return false;
    }
  }

  isOpen(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  on(fn: Listener) { this.listeners.add(fn); }
  off(fn: Listener) { this.listeners.delete(fn); }

  private emit(data: any) {
    this.listeners.forEach((fn) => {
      try { fn(data); } catch (e) { console.error("[Chat] listener error", e); }
    });
  }
}

const chatSocket = new ChatSocket();
export default chatSocket;
