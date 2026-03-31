"use client";

import { useEffect, useState, useCallback } from "react";
import { getChatSessions, getChatHistory, deleteChatSession } from "@/lib/api";
import { ChatSession, SearchResult } from "@/lib/types";
import ChatWindow from "@/components/ChatWindow";
import { Plus, MessageSquare, Trash2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SearchResult[] | null;
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const loadSessions = async () => {
    try {
      const s = await getChatSessions();
      setSessions(s);
    } catch {
      // handled in Phase 8
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSession = async (id: string) => {
    try {
      const data = await getChatHistory(id);
      setActiveSessionId(id);
      setMessages(
        data.messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
          sources: m.sources,
        }))
      );
    } catch {
      // handled in Phase 8
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const handleSessionCreated = useCallback((id: string) => {
    setActiveSessionId(id);
    // Reload session list without resetting messages
    getChatSessions().then(setSessions).catch(() => {});
  }, []);

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteChatSession(id);
      if (activeSessionId === id) {
        handleNewChat();
      }
      loadSessions();
    } catch {
      // handled in Phase 8
    }
  };

  return (
    <div className="flex h-full">
      {/* Session sidebar */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-auto p-3 pt-0 space-y-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => loadSession(s.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors group ${
                activeSessionId === s.id
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <MessageSquare size={14} className="shrink-0" />
              <span className="flex-1 truncate">{s.title}</span>
              <Trash2
                size={14}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                onClick={(e) => handleDeleteSession(e, s.id)}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1">
        <ChatWindow
          sessionId={activeSessionId}
          initialMessages={messages}
          onSessionCreated={handleSessionCreated}
        />
      </div>
    </div>
  );
}
