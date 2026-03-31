"use client";

import { useEffect, useState } from "react";
import { getDocuments, getStats, deleteDocument } from "@/lib/api";
import { Document, Stats } from "@/lib/types";
import DocumentCard from "./DocumentCard";
import { FileText, Database, Hash, Upload } from "lucide-react";
import { CardSkeleton } from "./LoadingStates";
import Link from "next/link";

export default function DocumentList() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [d, s] = await Promise.all([getDocuments(), getStats()]);
      setDocs(d);
      setStats(s);
    } catch {
      // handled in Phase 8
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }
    try {
      await deleteDocument(id);
      setDeleteConfirm(null);
      load();
    } catch {
      // handled in Phase 8
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
            <FileText size={20} className="text-indigo-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total_documents}</p>
              <p className="text-sm text-gray-500">Documents</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
            <Database size={20} className="text-indigo-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total_chunks}</p>
              <p className="text-sm text-gray-500">Chunks</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
            <Hash size={20} className="text-indigo-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.total_tokens_approx.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Tokens</p>
            </div>
          </div>
        </div>
      )}

      {docs.length === 0 ? (
        <div className="text-center py-12">
          <Upload size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Upload your first document to get started</p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <Upload size={16} /> Upload Document
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {docs.map((doc) => (
            <div key={doc.id}>
              <DocumentCard document={doc} onDelete={handleDelete} />
              {deleteConfirm === doc.id && (
                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200 text-sm">
                  <p className="text-red-700 mb-2">
                    Delete &quot;{doc.filename}&quot;? This removes {doc.total_chunks} chunks.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
