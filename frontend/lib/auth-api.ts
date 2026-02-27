import Cookies from "js-cookie";

export type AuthUser = {
  id: string;
  role: string;
  userType?: "anon" | "hr";
  anon_alias?: string;
  name?: string;
  email?: string;
  credibility_score?: number;
  trust_flag?: boolean;
  created_at?: string;
  last_login?: string | null;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

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

export type AuthResponse = {
  success: boolean;
  message?: string;
  data?: {
    requiresOtp?: boolean;
    challengeId?: string;
    expiresAt?: number;
    otpPreview?: string;
    email?: string;
    user?: AuthUser;
    tokens?: AuthTokens;
  };
};

type RegisterPayload = {
  alias: string;
  password: string;
};

type LoginPayload = {
  alias: string;
  password: string;
};

type HrLoginPayload = {
  email: string;
  password: string;
};

export type ComplaintRecord = {
  id: string;
  complaint_code: string;
  anon_user_id: string;
  accused_employee_hash: string;
  incident_date: string | null;
  location: string | null;
  description: string;
  status: "submitted" | "under_review" | "resolved" | "rejected";
  severity_score: number;
  created_at: string;
  updated_at: string;
};

export type HrComplaintRecord = Omit<ComplaintRecord, "anon_user_id">;

export type VerdictRecord = {
  id: string;
  complaint_id: string;
  verdict: "guilty" | "not_guilty" | "insufficient_evidence";
  notes: string | null;
  decided_by: string;
  decided_at: string;
};

export type AccusedPatternRecord = {
  accused_employee_hash: string;
  guilty_count: number;
  credibility_score: number;
  risk_level: "low" | "medium" | "high";
  updated_at: string;
};

export type PatternAlertRecord = {
  type: string;
  label: string;
  count: number;
};

export type PatternMatrixCell = {
  severity_bucket: "low" | "medium" | "high";
  risk_level: "low" | "medium" | "high" | "unknown";
  count: number;
};

export type PatternConversionRecord = {
  accused_employee_hash: string;
  total_complaints: number;
  complaints_with_verdict: number;
  guilty_verdicts: number;
  guilty_rate: number | null;
};

export type PatternWatchlistRecord = {
  id: string;
  complaint_code: string;
  accused_employee_hash: string;
  severity_score: number;
  status: ComplaintRecord["status"];
  created_at: string;
  risk_level: "low" | "medium" | "high";
  total_complaints: number;
  guilty_count: number;
};

export type PatternInsightsRecord = {
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
  status_funnel: {
    submitted: number;
    under_review: number;
    resolved: number;
    rejected: number;
  };
  severity_risk_matrix: PatternMatrixCell[];
  accused_conversion: PatternConversionRecord[];
  median_verdict_hours: number | null;
  watchlist: PatternWatchlistRecord[];
  alerts: PatternAlertRecord[];
};

export type ChatThreadSummary = {
  thread_id: string;
  complaint_id: string;
  complaint_code: string;
  complaint_status: "submitted" | "under_review" | "resolved" | "rejected";
  chat_state: "not_requested" | "pending_acceptance" | "active";
  request_message: string | null;
  requested_at: string | null;
  accepted_at: string | null;
  seen?: {
    user_last_seen_message_id: string | null;
    hr_last_seen_message_id: string | null;
  };
  last_message_preview: string | null;
  last_message_at: string | null;
};

export type ChatMessageRecord = {
  id: string;
  sender_type: "user" | "hr";
  message: string;
  created_at: string;
};

export type ChatThreadDetails = {
  complaint_id: string;
  complaint_code: string;
  complaint_status: "submitted" | "under_review" | "resolved" | "rejected";
  chat_state: "not_requested" | "pending_acceptance" | "active";
  request_message: string | null;
  requested_at: string | null;
  accepted_at: string | null;
  seen?: {
    user_last_seen_message_id: string | null;
    hr_last_seen_message_id: string | null;
  };
};

type CreateComplaintPayload = {
  accused_employee_hash: string;
  description: string;
  incident_date?: string;
  location?: string;
  evidence_count?: number;
  has_witness?: boolean;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:5000/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = Cookies.get("accessToken");

  const headers = new Headers(init?.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const isFormDataBody = init?.body instanceof FormData;
  if (!headers.has("Content-Type") && !isFormDataBody) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  // Handle 401 Unauthorized - attempt to refresh token
  if (response.status === 401 && path !== "/auth/login" && path !== "/auth/refresh") {
    const refreshToken = Cookies.get("refreshToken");
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          const newAccessToken = refreshData.data.tokens.accessToken;
          Cookies.set("accessToken", newAccessToken, { expires: 7 });

          // Retry the original request
          headers.set("Authorization", `Bearer ${newAccessToken}`);
          const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
            ...init,
            headers,
            cache: "no-store",
          });
          return (await retryResponse.json()) as T;
        }
      } catch (e) {
        console.error("Token refresh failed", e);
      }
    }

    // If refresh fails or no refresh token, logout (handled by AuthContext or middleware)
    // For now just throw error
  }

  const data = (await response.json()) as T & {
    success?: boolean;
    message?: string;
    details?: unknown;
  };

  if (!response.ok || !data.success) {
    throw new ApiRequestError(data.message || "Request failed.", response.status, data.details);
  }

  return data as T;
}

export async function registerAnonUser(payload: RegisterPayload) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginAnonUser(payload: LoginPayload) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginHrUser(payload: HrLoginPayload) {
  return request<AuthResponse>("/auth/hr/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyHrOtp(payload: { challengeId: string; otp: string }) {
  return request<AuthResponse>("/auth/hr/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAliasSuggestions() {
  const result = await request<{ success: boolean; aliases: string[] }>("/auth/alias-suggestions");
  return result.aliases;
}

export async function fetchRecoveryPhrase() {
  const result = await request<{ success: boolean; phrase: string }>("/auth/recovery-phrase");
  return result.phrase;
}

type SupportHistoryItem = {
  role: "user" | "bot";
  content: string;
};

export async function sendSupportChatMessage(
  message: string,
  history?: SupportHistoryItem[]
) {
  return request<{
    success: boolean;
    data: {
      reply: string;
      source: string;
      citations: string[];
    };
  }>("/support-chat", {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}

export async function listMyComplaints() {
  const result = await request<{ success: boolean; data: ComplaintRecord[] }>("/complaints");
  return result.data;
}

export async function createComplaint(payload: CreateComplaintPayload) {
  const result = await request<{ success: boolean; data: ComplaintRecord }>("/complaints", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return result.data;
}

export type EvidenceRecord = {
  id: string;
  complaint_id: string;
  file_url: string;
  signed_url?: string | null;
  file_hash_sha256: string;
  metadata: {
    originalName?: string;
    mimeType?: string;
    sizeBytes?: number;
    uploadedBy?: string;
    storageBucket?: string;
    storagePath?: string;
    notes?: string;
  } | null;
  uploaded_at: string;
};

export async function uploadEvidence(complaintReference: string, file: File, notes?: string) {
  const form = new FormData();
  form.append("file", file);
  if (notes?.trim()) {
    form.append("notes", notes.trim());
  }

  const result = await request<{ success: boolean; data: EvidenceRecord }>(
    `/evidence/${encodeURIComponent(complaintReference)}`,
    {
      method: "POST",
      body: form,
    }
  );

  return result.data;
}

export async function listEvidenceForComplaint(complaintReference: string) {
  const result = await request<{ success: boolean; data: EvidenceRecord[] }>(
    `/evidence/${encodeURIComponent(complaintReference)}`
  );
  return result.data;
}

export async function fetchMyProfile() {
  const result = await request<{ success: boolean; data: AuthUser }>("/auth/me");
  return result.data;
}

export async function changeAnonPassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  return request<{ success: boolean; message?: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listChatThreads() {
  const result = await request<{ success: boolean; data: ChatThreadSummary[] }>("/chat/threads");
  return result.data;
}

export async function getChatMessages(complaintReference: string) {
  const result = await request<{
    success: boolean;
    data: {
      thread: ChatThreadDetails;
      messages: ChatMessageRecord[];
    };
  }>(`/chat/${encodeURIComponent(complaintReference)}/messages`);

  return result.data;
}

export async function sendChatMessage(complaintReference: string, message: string) {
  const result = await request<{ success: boolean; data: ChatMessageRecord }>(
    `/chat/${encodeURIComponent(complaintReference)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ message }),
    }
  );
  return result.data;
}

export async function acceptChatRequest(complaintReference: string) {
  return request<{ success: boolean; data: { complaint_code: string; chat_state: string } }>(
    `/chat/${encodeURIComponent(complaintReference)}/accept`,
    {
      method: "POST",
    }
  );
}

export async function initiateChatRequest(complaintReference: string, message: string) {
  return request<{ success: boolean; data: { complaint_code: string; chat_state: string } }>(
    `/chat/${encodeURIComponent(complaintReference)}/request`,
    {
      method: "POST",
      body: JSON.stringify({ message }),
    }
  );
}

export async function fetchHrQueue() {
  const result = await request<{ success: boolean; data: HrComplaintRecord[] }>("/hr/queue");
  return result.data;
}

export async function fetchAccusedPatterns() {
  const result = await request<{ success: boolean; data: AccusedPatternRecord[] }>(
    "/hr/accused-patterns"
  );
  return result.data;
}

export async function fetchPatternInsights() {
  const result = await request<{ success: boolean; data: PatternInsightsRecord }>(
    "/hr/pattern-insights"
  );
  return result.data;
}

export async function updateHrComplaintStatus(
  complaintReference: string,
  status: ComplaintRecord["status"]
) {
  const result = await request<{ success: boolean; data: HrComplaintRecord }>(
    `/complaints/${encodeURIComponent(complaintReference)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
  return result.data;
}

export async function fetchVerdict(complaintReference: string) {
  const result = await request<{ success: boolean; data: VerdictRecord }>(
    `/hr/verdict/${encodeURIComponent(complaintReference)}`
  );
  return result.data;
}

export async function saveVerdict(
  complaintReference: string,
  payload: { verdict: VerdictRecord["verdict"]; notes?: string }
) {
  const result = await request<{ success: boolean; data: VerdictRecord }>(
    `/hr/verdict/${encodeURIComponent(complaintReference)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
  return result.data;
}
