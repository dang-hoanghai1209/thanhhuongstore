'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderType: 'VISITOR' | 'ADMIN' | 'SYSTEM';
  senderName: string | null;
  content: string;
  createdAt: string;
}

const VISITOR_ID_KEY = 'hhsneaker_chat_visitor_id';
const CONVERSATION_ID_KEY = 'hhsneaker_chat_conversation_id';

const welcomeMessage: ChatMessage = {
  id: 'welcome-msg',
  senderType: 'ADMIN',
  senderName: 'Hoàng Hải Sneaker',
  content: 'Xin chào! Hoàng Hải Sneaker rất vui được hỗ trợ bạn.',
  createdAt: new Date().toISOString(),
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getOrCreateVisitorId() {
  const existingVisitorId = localStorage.getItem(VISITOR_ID_KEY);

  if (existingVisitorId) {
    return existingVisitorId;
  }

  const visitorId = crypto.randomUUID();
  localStorage.setItem(VISITOR_ID_KEY, visitorId);

  return visitorId;
}

export default function ZaloChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [inputVal, setInputVal] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(true);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const ensureConversation = async () => {
    const storedConversationId = localStorage.getItem(CONVERSATION_ID_KEY);

    if (storedConversationId) {
      setConversationId(storedConversationId);
      return storedConversationId;
    }

    const response = await fetch('/api/chat/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: getOrCreateVisitorId() }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Không thể tạo hội thoại.');
    }

    localStorage.setItem(VISITOR_ID_KEY, result.visitorId);
    localStorage.setItem(CONVERSATION_ID_KEY, result.conversationId);
    setConversationId(result.conversationId);

    return result.conversationId as string;
  };

  const loadMessages = async (targetConversationId?: string) => {
    const activeConversationId = targetConversationId || conversationId;

    if (!activeConversationId) {
      return;
    }

    const response = await fetch(`/api/chat/conversations/${activeConversationId}/messages`, {
      cache: 'no-store',
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Không thể tải tin nhắn.');
    }

    const loadedMessages = result.messages || [];
    setMessages(loadedMessages.length > 0 ? loadedMessages : [welcomeMessage]);
  };

  const openChat = async () => {
    setIsOpen(true);
    setHasUnread(false);
    setError(null);
    setIsLoading(true);

    try {
      const activeConversationId = await ensureConversation();
      await loadMessages(activeConversationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể mở chat. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleOpen = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    openChat();
  };

  const handleSendMessage = async (event?: React.FormEvent) => {
    event?.preventDefault();

    const content = inputVal.trim();

    if (!content || isSending) {
      return;
    }

    setInputVal('');
    setError(null);
    setIsSending(true);

    try {
      const activeConversationId = await ensureConversation();
      const response = await fetch(`/api/chat/conversations/${activeConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Không gửi được tin nhắn. Vui lòng thử lại.');
      }

      await loadMessages(activeConversationId);
    } catch (err) {
      setInputVal(content);
      setError(err instanceof Error ? err.message : 'Không gửi được tin nhắn. Vui lòng thử lại.');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const storedConversationId = localStorage.getItem(CONVERSATION_ID_KEY);

    if (storedConversationId) {
      setConversationId(storedConversationId);
      loadMessages(storedConversationId).catch(() => {
        setMessages([welcomeMessage]);
      });
    }

    if (localStorage.getItem('hhsneaker_chat_unread') === 'false') {
      setHasUnread(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem('hhsneaker_chat_unread', 'false');
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen || !conversationId) {
      return;
    }

    const intervalId = window.setInterval(() => {
      loadMessages(conversationId).catch(() => undefined);
    }, 7000);

    return () => window.clearInterval(intervalId);
  }, [isOpen, conversationId]);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      {!isOpen && (
        <button
          onClick={handleToggleOpen}
          className="relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#0068FF] text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
          title="Chat với Hoàng Hải Sneaker"
        >
          {hasUnread && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">1</span>
            </span>
          )}
          <MessageCircle className="h-7 w-7" />
        </button>
      )}

      {isOpen && (
        <div className="flex h-[calc(100vh-140px)] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl sm:h-[580px] sm:w-[380px]">
          <div className="flex shrink-0 items-center justify-between bg-[#0068FF] p-4 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/80 bg-white text-sm font-black text-[#0068FF]">
                HH
                <span className="absolute bottom-0 right-0 h-3 w-3 animate-pulse rounded-full border-2 border-[#0068FF] bg-green-400" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold leading-tight tracking-tight">Hoàng Hải Sneaker</h4>
                <p className="text-[11px] font-medium text-white/90">Rất vui được hỗ trợ bạn</p>
              </div>
            </div>

            <button
              onClick={handleToggleOpen}
              className="rounded-full p-1.5 text-white/95 transition hover:bg-white/10 hover:text-white"
              title="Thu nhỏ khung chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-grow space-y-4 overflow-y-auto bg-slate-50 p-4">
            {isLoading && (
              <p className="py-4 text-center text-xs font-semibold text-slate-500">Đang tải hội thoại...</p>
            )}

            {messages.map((message) => {
              const isVisitor = message.senderType === 'VISITOR';

              return (
                <div
                  key={message.id}
                  className={`flex max-w-[85%] gap-2 ${isVisitor ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {!isVisitor && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center self-end rounded-full border border-slate-200 bg-white text-[10px] font-black text-[#0068FF] shadow-sm">
                      HH
                    </div>
                  )}

                  <div>
                    <div
                      className={`break-words rounded-2xl p-3 text-sm font-medium leading-relaxed shadow-sm ${
                        isVisitor
                          ? 'rounded-tr-none bg-[#0068FF] text-white'
                          : 'rounded-tl-none border border-slate-100 bg-white text-slate-800'
                      }`}
                    >
                      {message.content}
                    </div>
                    <span className={`mt-1 block text-[9px] font-normal text-slate-400 ${isVisitor ? 'text-right' : 'text-left'}`}>
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>

          {error && (
            <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex shrink-0 items-center gap-2 border-t border-slate-100 bg-white p-3">
            <input
              type="text"
              value={inputVal}
              onChange={(event) => setInputVal(event.target.value)}
              placeholder="Nhập tin nhắn, nhấn Enter để gửi..."
              maxLength={1000}
              className="flex-grow rounded-full border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400 focus:border-[#0068FF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0068FF]/10"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isSending}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-sm transition-all hover:bg-[#0055D0] active:scale-95 disabled:pointer-events-none disabled:opacity-45"
              title="Gửi tin nhắn"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

