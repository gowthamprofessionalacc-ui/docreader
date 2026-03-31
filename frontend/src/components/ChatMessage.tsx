"use client";

import ReactMarkdown from "react-markdown";
import { SearchResult } from "@/lib/types";
import SourceCitation from "./SourceCitation";

interface Props {
  role: "user" | "assistant";
  content: string;
  sources?: SearchResult[] | null;
  isStreaming?: boolean;
}

export default function ChatMessage({ role, content, sources, isStreaming }: Props) {
  if (role === "user") {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-br-md">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%]">
        <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-bl-md">
          <div className="text-sm text-gray-800 prose prose-sm max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-indigo-500 animate-pulse ml-0.5" />
            )}
          </div>
        </div>
        {sources && <SourceCitation sources={sources} />}
      </div>
    </div>
  );
}
