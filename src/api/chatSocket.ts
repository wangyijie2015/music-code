import { getBaseURL } from "./request";

type Listener = (data: any) => void;

class ChatSocket {
  private ws: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private currentUserId: string | number | null = null;
  private intentionalClose = false;
  private retryDelay = 2000;
  private readonly maxRetryDelay = 30000;

  connect(userId: string | number) {
    if (!userId) return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      if (this.currentUserId === userId) return;
      this.disconnect();
    }
    this.currentUserId = userId;
    this.intentionalClose = false;

    const baseURL = getBaseURL() || `${location.protocol}//${location.host}`;
    const wsBase = baseURL.replace(/^http/i, "ws").replace(/\/$/, "");
    const url = `${wsBase}/ws/chat?userId=${encodeURIComponent(String(userId))}`;

    try {
      this.ws = new WebSocket(url);
    } catch (e) {
      console.error("[Chat] WebSocket 创建失败", e);
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.retryDelay = 2000;
      this.emit({ type: "open" });
    };
    this.ws.onmessage = (e) => {
      let data: any;
      try {
        data = JSON.parse(e.data);
      } catch {
        return;
      }
      this.emit(data);
    };
    this.ws.onerror = () => {
      this.emit({ type: "error", message: "连接异常" });
    };
    this.ws.onclose = () => {
      this.emit({ type: "close" });
      this.ws = null;
      if (!this.intentionalClose && this.currentUserId) {
        this.scheduleReconnect();
      }
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer || !this.currentUserId) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.currentUserId) this.connect(this.currentUserId);
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
    this.currentUserId = null;
    this.retryDelay = 2000;
  }

  send(toUserId: string | number, content: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    try {
      this.ws.send(JSON.stringify({ toUserId, content }));
      return true;
    } catch {
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
