export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const login = async (email: string, pass: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: pass }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
};

export const signup = async (email: string, pass: string, nickname: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: pass, nickname }),
  });
  if (!res.ok) throw new Error("Signup failed");
  return res.json();
};

export const getMemories = async (date: string) => {
  const res = await fetch(`${API_BASE_URL}/memory?date=${date}`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error("Failed to fetch memories");
  return res.json(); // Returns Memory[]
};

export const getMemoryCounts = async (month: string) => {
  const res = await fetch(`${API_BASE_URL}/memory/counts?month=${month}`, {
    headers: getAuthHeaders(),
  });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error("Failed to fetch memory counts");
  return res.json(); // Returns { "YYYY-MM-DD": count }
};

export const createMemory = async (data: { text: string; imageUrl?: string; date: string }) => {
  const res = await fetch(`${API_BASE_URL}/memory`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error("Failed to create memory");
  return res.json();
};

export const updateMemory = async (id: number, data: { text: string; imageUrl?: string }) => {
  const res = await fetch(`${API_BASE_URL}/memory/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error("Failed to update memory");
  return res.json();
};

export const deleteMemory = async (id: number) => {
  const res = await fetch(`${API_BASE_URL}/memory/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error("Failed to delete memory");
  return res.json();
};
