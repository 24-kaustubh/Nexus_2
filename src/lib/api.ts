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

    // Common FastAPI-style: { detail: "..." } or { detail: [{ msg: "..." }, ...] }
    if (typeof err.detail === "string") return err.detail;

    if (Array.isArray(err.detail)) {
      const msgs = err.detail
        .map((d) => (typeof (d as any)?.msg === "string" ? (d as any).msg : ""))
        .filter(Boolean);
      if (msgs.length) return msgs.join(", ");
    }

    // Some APIs use { message: "..." }
    if (typeof err.message === "string" && err.message.trim()) return err.message;

    return text;
  } catch {
    return text; // not JSON
  }
}

// --- REST Chat (POST /api/v1/chat/) ---

export const chatAPI = {
  /**
   * Send chat request to Sia backend.
   * Request: { messages: [{ role, content }], response_format }.
   * Response: { message, audio_base64? }.
   */
  async sendMessage(messages: ChatMessage[], responseFormat: string = "text"): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE_URL}/api/v1/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ messages, response_format: responseFormat } as ChatRequest),
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(parseBackendError(text, res.status));
    }

    return JSON.parse(text) as ChatResponse;
  },
};

// --- SignalR (negotiate + message) ---

export type SignalRConnectionState = "disconnected" | "connecting" | "connected";

let signalrConnection: import("@microsoft/signalr").HubConnection | null = null;
let signalrUserId = "";

export interface SignalRNegotiateResponse {
  url: string;
  accessToken?: string;
  userId: string;
}

export async function signalrNegotiate(): Promise<SignalRNegotiateResponse> {
  const res = await fetch(SIGNALR_NEGOTIATE_URL, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Negotiate failed: ${res.status}`);
  }

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

export async function connectSignalR(
  handlers: SignalRHandlers,
  onError?: (err: unknown) => void
): Promise<string> {
  const { HubConnectionBuilder, HttpTransportType, HubConnectionState } =
    await import("@microsoft/signalr");

  if (signalrConnection?.state === HubConnectionState.Connected) {
    return signalrUserId;
  }

  const negotiate = await signalrNegotiate();

  // SignalR URL should be HTTP(S); SignalR itself upgrades transport.
  const url = negotiate.url || `${API_BASE_URL}/api/v1/signalr`;

  const builder = new HubConnectionBuilder()
    .withUrl(url, {
      transport: HttpTransportType.WebSockets,
      ...(negotiate.accessToken
        ? { accessTokenFactory: () => negotiate.accessToken! }
        : {}),
    })
    .withAutomaticReconnect();

  signalrConnection = builder.build();

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

/**
 * Perfect TS-safe state mapping WITHOUT numeric compares.
 * We dynamically import HubConnectionState ONCE and cache it.
 */
let _HubConnectionState:
  | (typeof import("@microsoft/signalr") extends infer M
      ? M extends { HubConnectionState: infer H }
        ? H
        : never
      : never)
  | null = null;

async function ensureHubConnectionState() {
  if (_HubConnectionState) return _HubConnectionState;
  const mod = await import("@microsoft/signalr");
  _HubConnectionState = mod.HubConnectionState as any;
  return _HubConnectionState;
}

/**
 * Synchronous-ish public API: returns last-known state if enum not loaded yet.
 * For accurate state, call `await getSignalRStateAsync()`.
 */
export function getSignalRState(): SignalRConnectionState {
  const s = signalrConnection?.state;
  if (!signalrConnection || s === undefined || s === null) return "disconnected";

  // If we haven't loaded the enum yet, we can still be safe:
  // if connection object exists, assume "connecting" until proven connected.
  // (This avoids TS errors and avoids lying "connected".)
  if (!_HubConnectionState) return "connecting";

  const H = _HubConnectionState as any;
  if (s === H.Connected) return "connected";
  if (s === H.Connecting || s === H.Reconnecting) return "connecting";
  return "disconnected";
}

/** Accurate async state getter (use this in UI if you want exact state). */
export async function getSignalRStateAsync(): Promise<SignalRConnectionState> {
  const s = signalrConnection?.state;
  if (!signalrConnection || s === undefined || s === null) return "disconnected";

  const H = (await ensureHubConnectionState()) as any;
  if (s === H.Connected) return "connected";
  if (s === H.Connecting || s === H.Reconnecting) return "connecting";
  return "disconnected";
}

/**
 * Send a message via SignalR (POST /api/v1/signalr/message).
 * Backend handles the message and sends responses via SignalR (transcript, audio, complete).
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
  if (!res.ok) {
    throw new Error(text || `Send message failed: ${res.status}`);
  }

  try {
    return JSON.parse(text) as { status: string; response?: string };
  } catch {
    return { status: "success" };
  }
}

export async function disconnectSignalR(): Promise<void> {
  if (signalrConnection) {
    await signalrConnection.stop();
    signalrConnection = null;
  }
  signalrUserId = "";
}
