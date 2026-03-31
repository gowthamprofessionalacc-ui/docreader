"use client";

import { FileText, FileType, Trash2, MessageSquare } from "lucide-react";
import { Document } from "@/lib/types";
import Link from "next/link";

interface Props {
  document: Document;
  onDelete: (id: string) => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const typeIcons: Record<string, typeof FileText> = {
  pdf: FileType,
  docx: FileType,
  txt: FileText,
  md: FileText,
  csv: FileText,
};

export default function DocumentCard({ document: doc, onDelete }: Props) {
  const Icon = typeIcons[doc.file_type] || FileText;
  const statusColors = {
    ready: "bg-green-100 text-green-700",
    processing: "bg-yellow-100 text-yellow-700",
    error: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <Icon size={24} className="text-gray-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{doc.filename}</h3>
          <p className="text-sm text-gray-500">
            {formatSize(doc.file_size_bytes)} · {formatDate(doc.created_at)}
          </p>
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[doc.status]}`}
        >
          {doc.status}
        </span>
      </div>

      <div className="text-sm text-gray-500 mb-4">
        {doc.total_chunks} chunks · ~{doc.total_tokens.toLocaleString()} tokens
      </div>

      {doc.error_message && (
        <p className="text-sm text-red-600 mb-3">{doc.error_message}</p>
      )}

      <div className="flex gap-2">
        <Link
          href="/chat"
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <MessageSquare size={14} /> Chat
        </Link>
        <button
          onClick={() => onDelete(doc.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors ml-auto"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </div>
  );
}
