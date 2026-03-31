"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, XCircle, Loader2, FileText } from "lucide-react";
import { uploadDocument } from "@/lib/api";
import { Document } from "@/lib/types";
import Link from "next/link";

const ALLOWED_TYPES = ["pdf", "docx", "txt", "csv", "md"];
const MAX_SIZE = 20 * 1024 * 1024;

interface UploadResult {
  file: File;
  status: "uploading" | "processing" | "done" | "error";
  document?: Document;
  error?: string;
}

export default function FileUpload() {
  const [uploads, setUploads] = useState<UploadResult[]>([]);

  const processFile = async (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_TYPES.includes(ext)) {
      setUploads((prev) => [
        ...prev,
        { file, status: "error", error: `Unsupported file type: .${ext}` },
      ]);
      return;
    }
    if (file.size > MAX_SIZE) {
      setUploads((prev) => [
        ...prev,
        { file, status: "error", error: "File too large (max 20MB)" },
      ]);
      return;
    }

    const idx = uploads.length;
    setUploads((prev) => [...prev, { file, status: "uploading" }]);

    try {
      setUploads((prev) =>
        prev.map((u, i) => (i === idx ? { ...u, status: "processing" } : u))
      );
      const doc = await uploadDocument(file);
      setUploads((prev) =>
        prev.map((u, i) =>
          i === idx
            ? {
                ...u,
                status: doc.status === "ready" ? "done" : "error",
                document: doc,
                error: doc.error_message || undefined,
              }
            : u
        )
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setUploads((prev) =>
        prev.map((u, i) => (i === idx ? { ...u, status: "error", error: message } : u))
      );
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        await processFile(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uploads.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const hasSuccess = uploads.some((u) => u.status === "done");

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-indigo-400 bg-indigo-50"
            : "border-gray-300 hover:border-gray-400 bg-white"
        }`}
      >
        <input {...getInputProps()} />
        <Upload
          className={`mx-auto mb-4 ${isDragActive ? "text-indigo-500" : "text-gray-400"}`}
          size={48}
        />
        <p className="text-lg font-medium text-gray-700">
          {isDragActive ? "Drop files here" : "Drop files here or click to browse"}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supports PDF, DOCX, TXT, CSV, MD — Max 20MB
        </p>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-3">
          {uploads.map((u, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <FileText size={24} className="text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{u.file.name}</p>
                <p className="text-sm text-gray-500">{formatSize(u.file.size)}</p>
              </div>
              <div className="shrink-0">
                {u.status === "uploading" && (
                  <span className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 size={16} className="animate-spin" /> Uploading...
                  </span>
                )}
                {u.status === "processing" && (
                  <span className="flex items-center gap-2 text-sm text-indigo-600">
                    <Loader2 size={16} className="animate-spin" /> Processing...
                  </span>
                )}
                {u.status === "done" && (
                  <span className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle size={16} /> {u.document?.total_chunks} chunks
                  </span>
                )}
                {u.status === "error" && (
                  <span className="flex items-center gap-2 text-sm text-red-600">
                    <XCircle size={16} /> {u.error}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {hasSuccess && (
        <div className="text-center">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Chat →
          </Link>
        </div>
      )}
    </div>
  );
}
