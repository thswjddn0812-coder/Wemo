
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getMemories = async (date?: string) => {
  const params = new URLSearchParams();
  if (date) params.append("date", date);

  const res = await fetch(`${API_BASE_URL}/memory?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch memories");
  return res.json(); // Returns Memory[]
};

export const getMemoryCounts = async (month: string) => {
  const res = await fetch(`${API_BASE_URL}/memory/counts?month=${month}`);
  if (!res.ok) throw new Error("Failed to fetch memory counts");
  return res.json(); // Returns { "YYYY-MM-DD": count }
};

export const createMemory = async (data: { text: string; imageUrl?: string; date: string }) => {
  const res = await fetch(`${API_BASE_URL}/memory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create memory");
  return res.json();
};

export const updateMemory = async (id: number, text: string) => {
  const res = await fetch(`${API_BASE_URL}/memory/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Failed to update memory");
  return res.json();
};

export const deleteMemory = async (id: number) => {
  const res = await fetch(`${API_BASE_URL}/memory/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete memory");
  return res.json();
};
