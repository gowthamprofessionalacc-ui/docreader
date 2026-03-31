"use client";

import { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "@/lib/api";
import { SearchResult } from "@/lib/types";
import ChatMessageComponent from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Upload } from "lucide-react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SearchResult[] | null;
}

interface Props {
  sessionId: string | null;
  initialMessages?: Message[];
  onSessionCreated: (id: string) => void;
}

export default function ChatWindow({ sessionId, initialMessages, onSessionCreated }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [streaming, setStreaming] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevSessionIdRef = useRef(sessionId);

  useEffect(() => {
    // Only reset messages when the session actually changes (user clicked a different session or New Chat)
    if (sessionId !== prevSessionIdRef.current) {
      setMessages(initialMessages || []);
      setCurrentSessionId(sessionId);
      prevSessionIdRef.current = sessionId;
    }
  }, [sessionId, initialMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (message: string) => {
    const userMsg: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);

    const assistantMsg: Message = { role: "assistant", content: "", sources: null };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const stream = await sendChatMessage(message, currentSessionId);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const dataStr = line.slice(6).trim();
          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);

            if (data.type === "token") {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + data.content,
                };
                return updated;
              });
            } else if (data.type === "sources") {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  sources: data.sources,
                };
                return updated;
              });
            } else if (data.type === "done") {
              if (data.session_id && !currentSessionId) {
                setCurrentSessionId(data.session_id);
                onSessionCreated(data.session_id);
              }
            }
          } catch {
            // skip malformed JSON
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "Sorry, something went wrong. Please try again.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-auto p-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Upload size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-500 mb-4 max-w-md">
              Ask questions about your uploaded documents. DocMind will find relevant
              information and provide cited answers.
            </p>
            <Link
              href="/upload"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Upload a document to get started →
            </Link>
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatMessageComponent
              key={i}
              role={msg.role}
              content={msg.content}
              sources={msg.sources}
              isStreaming={streaming && i === messages.length - 1 && msg.role === "assistant"}
            />
          ))
        )}
      </div>
      <ChatInput onSend={handleSend} disabled={streaming} />
    </div>
  );
}
