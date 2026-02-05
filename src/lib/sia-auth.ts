/**
 * Sia Backend authentication (JWT).
 * API: POST /api/v1/auth/signup, POST /api/v1/auth/signin
 */

import { API_BASE_URL } from "./api-config";

const TOKEN_KEY = "sia_access_token";
const USER_KEY = "sia_user";

export interface SiaUser {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SigninResponse {
  access_token: string;
  token_type: string;
  user: SiaUser;
}

export interface SignupResponse extends SiaUser {}

/** Standard error from backend: { detail: string } or { detail: ValidationErrorDetail[] } */
function parseErrorResponse(text: string): string {
  try {
    const data = JSON.parse(text) as { detail?: string | { msg: string }[] };
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) return data.detail.map((d) => d.msg).join(", ");
  } catch {
    // ignore
  }
  return text || "Request failed";
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): SiaUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SiaUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: SiaUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Headers for authenticated requests */
export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function signin(email: string, password: string): Promise<SigninResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(parseErrorResponse(text));

  const data = JSON.parse(text) as SigninResponse;

  // ✅ add this
  setAuth(data.access_token, data.user);

  return data;
}


export async function signup(
  email: string,
  password: string,
  fullName?: string | null
): Promise<SignupResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName ?? null,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(parseErrorResponse(text));
  }
  return JSON.parse(text) as SignupResponse;
}
