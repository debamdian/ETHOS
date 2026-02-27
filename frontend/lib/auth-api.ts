export type UserType = "user" | "hr";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  userType: UserType;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  userType?: UserType;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface SupportChatHistoryItem {
  role: "user" | "bot";
  content: string;
}

export interface SupportChatResponse {
  data: {
    reply: string;
    source?: string;
    citations?: string[];
  };
}

export class ApiRequestError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    let details: unknown;
    let message = `Request failed with status ${response.status}`;

    try {
      const body = await response.json();
      details = body;
      if (body && typeof body === "object" && "message" in body) {
        const candidate = (body as { message?: unknown }).message;
        if (typeof candidate === "string" && candidate.trim()) {
          message = candidate;
        }
      }
    } catch {
      const text = await response.text();
      if (text.trim()) {
        message = text;
      }
    }

    throw new ApiRequestError(message, response.status, details);
  }

  return (await response.json()) as T;
}

export function login(payload: LoginRequest): Promise<AuthResponse> {
  return requestJson<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterRequest): Promise<AuthResponse> {
  return requestJson<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  return requestJson<AuthTokens>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export function sendSupportChatMessage(
  message: string,
  history: SupportChatHistoryItem[] = []
): Promise<SupportChatResponse> {
  return requestJson<SupportChatResponse>("/support/chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}
