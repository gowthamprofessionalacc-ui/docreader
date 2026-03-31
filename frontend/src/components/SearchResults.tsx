"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import { SearchResult } from "@/lib/types";

interface Props {
  results: SearchResult[];
}

export default function SearchResults({ results }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No matching documents found. Try a different query.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((r, i) => {
        const pct = Math.round(r.similarity_score * 100);
        const isExpanded = expanded === i;
        return (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow"
          >
            <button
              onClick={() => setExpanded(isExpanded ? null : i)}
              className="w-full text-left p-4 flex items-center gap-3"
            >
              {isExpanded ? (
                <ChevronDown size={18} className="text-gray-400 shrink-0" />
              ) : (
                <ChevronRight size={18} className="text-gray-400 shrink-0" />
              )}
              <FileText size={18} className="text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {r.document_name}
                </p>
                {!isExpanded && (
                  <p className="text-sm text-gray-500 truncate">{r.chunk_text}</p>
                )}
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-10 text-right">{pct}%</span>
              </div>
            </button>
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100">
                <p className="text-sm text-gray-700 whitespace-pre-wrap mt-3">
                  {r.chunk_text}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
