const API = process.env.NEXT_PUBLIC_API_URL;

// REGISTER
export const registerUser = async (data: any) => {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// LOGIN
export const loginUser = async (data: any) => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// TRACK TIME
export const trackTime = async (userId: number, seconds: number) => {
  await fetch(`${API}/auth/track-time?user_id=${userId}&seconds=${seconds}`, {
    method: "POST",
  });
};


export const getStats = async (userId: number) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/stats/${userId}`
  );
  return res.json();
};

// START SESSION
export const startSession = async (userId: number) => {
  const res = await fetch(`${API}/auth/start-session?user_id=${userId}`, {
    method: "POST",
  });

  return res.json();
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

  const res = await fetch(`${API}/documents/upload?user_id=${userId}`, {
    method: "POST",
    body: formData,
  });

  return res.json();
};

export const getDocuments = async (userId: number) => {
  const res = await fetch(`${API}/documents/${userId}`);
  return res.json();
};

export const processDocument = async (docId: number) => {
  const res = await fetch(`${API}/documents/process/${docId}`, {
    method: "POST",
  });
  return res.json();
};


export const getDocumentById = async (docId: string) => {
  const res = await fetch(`${API}/documents/detail/${docId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch document");
  }

  return res.json();
};


export const getQuiz = async (docId: string) => {
  const res = await fetch(`${API}/quiz/${docId}`);
  return res.json();
};

