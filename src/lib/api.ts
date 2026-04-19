// src/lib/api.ts
import { API_BASE_URL, SIGNALR_MESSAGE_URL, SIGNALR_NEGOTIATE_URL } from "./api-config";
import { getAuthHeaders } from "./sia-auth";

// --- Sia Backend types (from Swagger) ---

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  response_format?: string;
}

export interface ChatResponse {
  message: string;
  audio_base64?: string | null;
}

export interface MessageRequest {
  type: string;
  content: string;
  userId: string;
}

/** Validation error from backend (HTTP 422) */
export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

function parseBackendError(text: string, status: number): string {
  if (!text) return `HTTP ${status}`;
  try {
    const err = JSON.parse(text) as {
      detail?: string | ValidationErrorDetail[] | unknown;
      message?: string;
    };

    if (typeof err.detail === "string" && err.detail.trim()) return err.detail;

    if (Array.isArray(err.detail)) {
      const msgs = err.detail
        .map((d: any) => (typeof d?.msg === "string" ? d.msg : ""))
        .filter(Boolean);
      if (msgs.length) return msgs.join(", ");
    }

    if (typeof err.message === "string" && err.message.trim()) return err.message;

    return text;
  } catch {
    return text;
  }
}

// --- REST Chat (POST /api/v1/chat/) ---

export const chatAPI = {
  async sendMessage(messages: ChatMessage[], responseFormat: string = "text"): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ messages, response_format: responseFormat } as ChatRequest),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(parseBackendError(text, res.status));

    return JSON.parse(text) as ChatResponse;
  },
};

// --- SignalR (negotiate + message) ---

export type SignalRConnectionState = "disconnected" | "connecting" | "connected";

let signalrConnection: import("@microsoft/signalr").HubConnection | null = null;
let signalrUserId = "";

export interface SignalRNegotiateResponse {
  url: string; // can be backend hub URL OR Azure SignalR /client URL
  accessToken?: string;
  userId: string;
}

export async function signalrNegotiate(): Promise<SignalRNegotiateResponse> {
  const res = await fetch(SIGNALR_NEGOTIATE_URL, {
    method: "POST",
    headers: getAuthHeaders(), // include auth if your backend protects negotiate
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || `Negotiate failed: ${res.status}`);

  // backend may return JSON or raw string
  try {
    const data = JSON.parse(text);
    if (typeof data === "string") return { url: data, userId: "" };
    return {
      url: data.url ?? API_BASE_URL,
      accessToken: data.accessToken,
      userId: data.userId ?? "",
    };
  } catch {
    return { url: text || API_BASE_URL, userId: "" };
  }
}

/** Callbacks for SignalR events (transcript, audio, complete) */
export interface SignalRHandlers {
  onTranscript?: (text: string) => void;
  onAudio?: (base64Chunk: string) => void;
  onComplete?: (fullText: string) => void;
}

function isAzureSignalRUrl(httpUrl: string): boolean {
  try {
    const u = new URL(httpUrl);
    return /\.service\.signalr\.net$/i.test(u.hostname);
  } catch {
    return false;
  }
}

function toWsUrl(httpUrl: string): string {
  return httpUrl.replace(/^http/i, "ws");
}

/**
 * Connect SignalR.
 * - Always negotiates via your backend (SIGNALR_NEGOTIATE_URL).
 * - If backend returns Azure SignalR service URL (https://*.service.signalr.net/client),
 *   we connect directly via WebSocket + skipNegotiation to avoid CORS on /negotiate.
 */
export async function connectSignalR(
  handlers: SignalRHandlers,
  onError?: (err: unknown) => void
): Promise<string> {
  const { HubConnectionBuilder, HttpTransportType, HubConnectionState } =
    await import("@microsoft/signalr");

  if (signalrConnection?.state === HubConnectionState.Connected) return signalrUserId;

  const negotiate = await signalrNegotiate();

  // If negotiate.url is empty, fallback to backend hub path
  const rawUrl = (negotiate.url || `${API_BASE_URL}/api/v1/signalr`).replace(/\/$/, "");

  // Build connection differently depending on where the hub lives
  if (isAzureSignalRUrl(rawUrl)) {
    // ✅ Azure SignalR service: must skip negotiation in browser to avoid CORS
    // Expect rawUrl like: https://<name>.service.signalr.net/client
    const azureClientUrl = rawUrl.replace(/\/client\/?$/i, "/client");
    const ws = `${toWsUrl(azureClientUrl)}/?hub=sia`; // hub name must match your server-side hub

    signalrConnection = new HubConnectionBuilder()
      .withUrl(ws, {
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true,
        ...(negotiate.accessToken ? { accessTokenFactory: () => negotiate.accessToken! } : {}),
      })
      .withAutomaticReconnect()
      .build();
  } else {
    // ✅ Backend-hosted hub (or backend reverse-proxy): normal SignalR startup is OK
    signalrConnection = new HubConnectionBuilder()
      .withUrl(rawUrl, {
        transport: HttpTransportType.WebSockets,
        ...(negotiate.accessToken ? { accessTokenFactory: () => negotiate.accessToken! } : {}),
      })
      .withAutomaticReconnect()
      .build();
  }

  signalrConnection.on("transcript", (text: string) => handlers.onTranscript?.(text));
  signalrConnection.on("audio", (base64Chunk: string) => handlers.onAudio?.(base64Chunk));
  signalrConnection.on("complete", (fullText: string) => handlers.onComplete?.(fullText));

  signalrConnection.onclose((err) => {
    if (err) onError?.(err);
  });

  try {
    await signalrConnection.start();
    signalrUserId = negotiate.userId;
    return signalrUserId;
  } catch (err) {
    onError?.(err);
    throw err;
  }
}

export async function disconnectSignalR(): Promise<void> {
  if (signalrConnection) {
    await signalrConnection.stop();
    signalrConnection = null;
  }
  signalrUserId = "";
}

export function getSignalRState(): SignalRConnectionState {
  const s = signalrConnection?.state;
  if (!signalrConnection || s == null) return "disconnected";

  // HubConnectionState is an enum, safe to compare
  // Import lazily isn't required here because state is already on the object.
  // We'll map by string fallback for robustness.
  // @microsoft/signalr sets state to: "Disconnected" | "Connecting" | "Connected" | "Reconnecting" internally.
  const asString = String(s);
  if (asString.includes("Connected")) return "connected";
  if (asString.includes("Connecting") || asString.includes("Reconnecting")) return "connecting";
  return "disconnected";
}

/**
 * Send a message via backend (POST /api/v1/signalr/message).
 */
export async function sendSignalRMessage(
  type: "text" | "audio",
  content: string,
  userId: string
): Promise<{ status: string; response?: string }> {
  const res = await fetch(SIGNALR_MESSAGE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ type, content, userId } as MessageRequest),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || `Send message failed: ${res.status}`);

  try {
    return JSON.parse(text) as { status: string; response?: string };
  } catch {
    return { status: "success" };
  }
}
