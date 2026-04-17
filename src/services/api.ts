const API = process.env.NEXT_PUBLIC_API_URL;

type RequestOptions = RequestInit & {
  fallbackMessage?: string;
};

export type AuthPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = AuthPayload & {
  first_name: string;
  last_name: string;
};

export type UserRecord = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
};

export type LoginResponse = {
  access_token: string;
  user: UserRecord;
};

export type StatsResponse = {
  total_quizzes_attempted: number;
  average_score: number;
  current_streak: number;
  longest_streak: number;
  total_documents_completed: number;
  total_time: number;
  total_sessions: number;
};

export type DocumentRecord = {
  id: number;
  title: string;
  status: string;
  summary?: string | null;
  extracted_text?: string | null;
  file_type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type QuizRecord = {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
};

export type WeakAreaRecord = {
  question_id: number;
  question: string;
  selected_answer?: string | null;
  correct_answer: string;
};

export type QuizSubmissionResponse = {
  score: number;
  correct_count: number;
  total_questions: number;
  attempt_number: number;
  performance_level: "weak" | "average" | "strong";
  improvement: number;
  feedback: string;
  weak_areas: WeakAreaRecord[];
};

export type QuizAttemptRecord = {
  score: number;
  correct_count: number;
  total_questions: number;
  attempt_number: number;
  performance_level: "weak" | "average" | "strong";
  created_at?: string | null;
};

function buildHeaders(headers?: HeadersInit) {
  const merged = new Headers(headers);

  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token && !merged.has("Authorization")) {
      merged.set("Authorization", `Bearer ${token}`);
    }
  }

  return merged;
}

async function parseJsonSafely(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function apiRequest<T>(url: string, options?: RequestOptions): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: buildHeaders(options?.headers),
  });
  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const errorMessage =
      typeof payload === "object" && payload && "detail" in payload
        ? String(payload.detail)
        : options?.fallbackMessage || "Request failed";

    throw new Error(errorMessage);
  }

  return payload as T;
}

export const registerUser = async (data: RegisterPayload) =>
  apiRequest<{ id: number; email: string }>(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    fallbackMessage: "Registration failed",
  });

export const loginUser = async (data: AuthPayload) =>
  apiRequest<LoginResponse>(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    fallbackMessage: "Login failed",
  });

// TRACK TIME
export const trackTime = async (userId: number, seconds: number) => {
  await fetch(`${API}/auth/track-time?user_id=${userId}&seconds=${seconds}`, {
    method: "POST",
  });
};


export const getStats = async () => {
  return apiRequest<StatsResponse>(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
    fallbackMessage: "Unable to load study stats",
  });
};

// START SESSION
export const startSession = async (userId: number) => {
  return apiRequest<{ session_id: string }>(`${API}/auth/start-session?user_id=${userId}`, {
    method: "POST",
    fallbackMessage: "Unable to start session",
  });
};

// END SESSION
export const endSession = async (sessionId: string) => {
  await fetch(`${API}/auth/end-session?session_id=${sessionId}`, {
    method: "POST",
    keepalive: true, // important for tab close
  });
};

export const heartbeat = async (userId: number) => {
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/heartbeat?user_id=${userId}`,
    { method: "POST" }
  );
};



export const uploadDocument = async (file: File, userId: number) => {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<{ doc_id: number }>(`${API}/documents/upload?user_id=${userId}`, {
    method: "POST",
    body: formData,
    fallbackMessage: "Upload failed",
  });
};

export const getDocuments = async (userId: number) => {
  return apiRequest<DocumentRecord[] | { documents: DocumentRecord[] }>(`${API}/documents/${userId}`, {
    fallbackMessage: "Unable to load documents",
  });
};

export const processDocument = async (docId: number) => {
  return apiRequest<{ message: string }>(`${API}/documents/process/${docId}`, {
    method: "POST",
    fallbackMessage: "Unable to process document",
  });
};


export const getDocumentById = async (docId: string) => {
  return apiRequest<DocumentRecord>(`${API}/documents/detail/${docId}`, {
    fallbackMessage: "Failed to fetch document",
  });
};


export const getQuiz = async (docId: string) => {
  return apiRequest<QuizRecord[]>(`${API}/quiz/${docId}`, {
    fallbackMessage: "Unable to load quiz",
  });
};


export const submitQuiz = async (docId: string, answers: Record<number, string>) => {
  return apiRequest<QuizSubmissionResponse>(`${API}/quizzes/${docId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
    fallbackMessage: "Failed to submit quiz",
  });
};

export const getQuizAttempts = async (docId: string) => {
  return apiRequest<QuizAttemptRecord[]>(`${API}/quizzes/${docId}/attempts`, {
    fallbackMessage: "Failed to fetch quiz attempts",
  });
};

