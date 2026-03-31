import { Document, SearchResult, ChatSession, ChatMessage, Stats } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/api/documents/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getDocuments(): Promise<Document[]> {
  return fetchJSON("/api/documents");
}

export async function getDocument(id: string): Promise<Document & { chunks_preview: { chunk_text: string; chunk_index: number }[] }> {
  return fetchJSON(`/api/documents/${id}`);
}

export async function deleteDocument(id: string): Promise<void> {
  await fetchJSON(`/api/documents/${id}`, { method: "DELETE" });
}

export async function search(query: string, topK = 5, documentIds?: string[]): Promise<{ query: string; results: SearchResult[] }> {
  return fetchJSON("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, top_k: topK, document_ids: documentIds || null }),
  });
}

export async function sendChatMessage(
  message: string,
  sessionId?: string | null,
  documentIds?: string[] | null
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      session_id: sessionId || null,
      document_ids: documentIds || null,
    }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.body!;
}

export async function getChatSessions(): Promise<ChatSession[]> {
  return fetchJSON("/api/chat/sessions");
}

export async function getChatHistory(sessionId: string): Promise<{ session: ChatSession; messages: ChatMessage[] }> {
  return fetchJSON(`/api/chat/sessions/${sessionId}`);
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  await fetchJSON(`/api/chat/sessions/${sessionId}`, { method: "DELETE" });
}

export async function getStats(): Promise<Stats> {
  return fetchJSON("/api/stats");
}
