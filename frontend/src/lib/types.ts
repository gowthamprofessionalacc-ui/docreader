export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size_bytes: number;
  total_chunks: number;
  total_tokens: number;
  status: "processing" | "ready" | "error";
  error_message: string | null;
  created_at: string;
}

export interface SearchResult {
  chunk_text: string;
  document_name: string;
  document_id: string;
  chunk_index: number;
  similarity_score: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: SearchResult[] | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Stats {
  total_documents: number;
  total_chunks: number;
  total_tokens_approx: number;
  avg_chunks_per_document: number;
  last_upload: string | null;
}
