"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { SearchResult } from "@/lib/types";

interface Props {
  sources: SearchResult[];
}

export default function SourceCitation({ sources }: Props) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 space-y-1">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
        Sources
      </p>
      {sources.map((s, i) => {
        const pct = Math.round(s.similarity_score * 100);
        const isOpen = expandedIdx === i;
        return (
          <div key={i} className="rounded-lg border border-gray-100 overflow-hidden">
            <button
              onClick={() => setExpandedIdx(isOpen ? null : i)}
              className="w-full text-left px-3 py-2 flex items-center gap-2 text-sm hover:bg-gray-50 transition-colors"
            >
              {isOpen ? (
                <ChevronDown size={14} className="text-gray-400 shrink-0" />
              ) : (
                <ChevronRight size={14} className="text-gray-400 shrink-0" />
              )}
              <FileText size={14} className="text-gray-400 shrink-0" />
              <span className="text-gray-700 truncate flex-1">
                [{i + 1}] {s.document_name}
              </span>
              <span className="text-xs text-gray-400 shrink-0">{pct}%</span>
            </button>
            {isOpen && (
              <div className="px-3 pb-3 border-t border-gray-100">
                <p className="text-xs text-gray-600 whitespace-pre-wrap mt-2">
                  {s.chunk_text}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
