/**
 * Backend API configuration (Sia Backend).
 * Set VITE_API_URL in .env to override. Defaults to Sia backend on Azure.
 */
const raw = import.meta.env.VITE_API_URL ?? "https://siabackend.azurewebsites.net";
const base = raw.replace(/\/$/, ""); // strip trailing slash

export const API_BASE_URL = base;

/** True when using production backend (HTTPS). Use SignalR for real-time in production. */
export const isProductionBackend = (): boolean => base.startsWith("https://");

/** WebSocket base URL derived from API URL (http -> ws, https -> wss) */
export const WS_BASE_URL = base.replace(/^http/, "ws");

/** Single WebSocket endpoint for real-time (text + audio). Option A in Sia guide. */
export function wsUrl(): string {
  return `${WS_BASE_URL}/api/v1/ws`;
}

/** @deprecated Use wsUrl() for Sia backend. Kept for backwards compatibility. */
export function voiceWsUrl(userId: string): string {
  return `${WS_BASE_URL}/api/v1/ws`;
}

/** SignalR negotiate (POST) – returns connection URL and access token */
export const SIGNALR_NEGOTIATE_URL = `${API_BASE_URL}/api/v1/signalr/negotiate`;

/** SignalR send message (POST) – body: { type, content, userId } */
export const SIGNALR_MESSAGE_URL = `${API_BASE_URL}/api/v1/signalr/message`;
