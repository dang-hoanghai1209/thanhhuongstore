'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCheck,
  Circle,
  Lock,
  MessageCircle,
  RefreshCw,
  Search,
  Send,
  Unlock,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  conversationId: string;
  senderType: 'VISITOR' | 'ADMIN' | 'SYSTEM';
  senderName: string | null;
  content: string;
  isReadByAdmin: boolean;
  isReadByVisitor: boolean;
  createdAt: string;
}

interface ConversationListItem {
  id: string;
  visitorId: string;
  visitorName: string | null;
  visitorPhone: string | null;
  visitorEmail: string | null;
  status: 'OPEN' | 'CLOSED';
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: ChatMessage | null;
  unreadCount: number;
}

interface ConversationDetail extends Omit<ConversationListItem, 'lastMessage' | 'unreadCount'> {
  messages: ChatMessage[];
}

const STATUS_OPTIONS = [
  { label: 'Đang mở', value: 'OPEN' },
  { label: 'Đã đóng', value: 'CLOSED' },
  { label: 'Tất cả', value: 'ALL' },
];

function formatTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getVisitorLabel(conversation: Pick<ConversationListItem, 'visitorName' | 'visitorPhone' | 'visitorEmail'>) {
  return conversation.visitorName || conversation.visitorPhone || conversation.visitorEmail || 'Khách truy cập';
}

export default function AdminChatClient() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedListItem = useMemo(() => {
    return conversations.find((conversation) => conversation.id === selectedId) || null;
  }, [conversations, selectedId]);

  const loadConversations = async () => {
    setLoadingList(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('status', statusFilter);

      if (searchTerm.trim()) {
        params.set('q', searchTerm.trim());
      }

      const response = await fetch(`/api/admin/chat/conversations?${params.toString()}`, {
        cache: 'no-store',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Không thể tải danh sách hội thoại.');
      }

      setConversations(result.conversations || []);

      if (selectedId && !result.conversations?.some((conversation: ConversationListItem) => conversation.id === selectedId)) {
        setSelectedId(null);
        setSelectedConversation(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách hội thoại.');
    } finally {
      setLoadingList(false);
    }
  };

  const loadConversationDetail = async (conversationId: string) => {
    setLoadingDetail(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/chat/conversations/${conversationId}`, {
        cache: 'no-store',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Không thể tải hội thoại.');
      }

      setSelectedConversation(result.conversation);

      await fetch(`/api/admin/chat/conversations/${conversationId}/read`, {
        method: 'PATCH',
      });
      await loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải hội thoại.');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [statusFilter]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    loadConversationDetail(selectedId);
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages.length]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const intervalId = window.setInterval(() => {
      loadConversationDetail(selectedId);
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [selectedId, statusFilter]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    loadConversations();
  };

  const handleSendReply = async (event: FormEvent) => {
    event.preventDefault();

    if (!selectedId || !replyContent.trim()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/chat/conversations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Không thể gửi phản hồi.');
      }

      setReplyContent('');
      await loadConversationDetail(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi phản hồi.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: 'OPEN' | 'CLOSED') => {
    if (!selectedId) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/chat/conversations/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Không thể cập nhật trạng thái.');
      }

      await loadConversationDetail(selectedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-950">Tin nhắn</h1>
          <p className="mt-1 text-sm text-slate-500">Quản lý hội thoại từ chatbox nội bộ trên website.</p>
        </div>
        <button
          onClick={loadConversations}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid min-h-[640px] grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid-cols-[360px_1fr]">
        <aside className="border-b border-slate-200 bg-slate-50/70 lg:border-b-0 lg:border-r">
          <div className="space-y-3 border-b border-slate-200 bg-white p-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm tên, SĐT, email, nội dung..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </form>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                    statusFilter === option.value
                      ? 'border-primary bg-primary text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[560px] overflow-y-auto">
            {loadingList && (
              <div className="p-5 text-sm font-semibold text-slate-500">Đang tải hội thoại...</div>
            )}

            {!loadingList && conversations.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">
                <MessageCircle className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                Chưa có hội thoại phù hợp.
              </div>
            )}

            {conversations.map((conversation) => {
              const isActive = conversation.id === selectedId;
              return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedId(conversation.id)}
                  className={`w-full border-b border-slate-100 p-4 text-left transition ${
                    isActive ? 'bg-primary/10' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-black text-slate-900">
                          {getVisitorLabel(conversation)}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {[conversation.visitorPhone, conversation.visitorEmail].filter(Boolean).join(' · ') || conversation.visitorId}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold text-slate-400">
                      {formatTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs font-medium leading-relaxed text-slate-500">
                    {conversation.lastMessage?.content || 'Chưa có tin nhắn'}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black ${
                      conversation.status === 'OPEN'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Circle className="h-2 w-2 fill-current" />
                      {conversation.status}
                    </span>
                    {conversation.unreadCount === 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <CheckCheck className="h-3 w-3" />
                        Đã đọc
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-h-[640px] flex-col bg-white">
          {!selectedId && (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <MessageCircle className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="text-sm font-bold text-slate-600">Chọn một hội thoại để xem tin nhắn.</p>
              </div>
            </div>
          )}

          {selectedId && (
            <>
              <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-black text-slate-950">
                    {selectedConversation ? getVisitorLabel(selectedConversation) : selectedListItem ? getVisitorLabel(selectedListItem) : 'Khách truy cập'}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {selectedConversation
                      ? [selectedConversation.visitorPhone, selectedConversation.visitorEmail].filter(Boolean).join(' · ') || selectedConversation.visitorId
                      : 'Đang tải thông tin...'}
                  </p>
                </div>
                {selectedConversation && (
                  <button
                    onClick={() => handleStatusChange(selectedConversation.status === 'OPEN' ? 'CLOSED' : 'OPEN')}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    {selectedConversation.status === 'OPEN' ? (
                      <>
                        <Lock className="h-4 w-4" />
                        Đóng hội thoại
                      </>
                    ) : (
                      <>
                        <Unlock className="h-4 w-4" />
                        Mở lại hội thoại
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
                {loadingDetail && (
                  <p className="py-6 text-center text-sm font-semibold text-slate-500">Đang tải tin nhắn...</p>
                )}

                {!loadingDetail && selectedConversation && (
                  <div className="space-y-4">
                    {selectedConversation.messages.map((message) => {
                      const isAdmin = message.senderType === 'ADMIN';
                      return (
                        <div key={message.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                            isAdmin
                              ? 'rounded-tr-sm bg-primary text-white'
                              : 'rounded-tl-sm border border-slate-200 bg-white text-slate-800'
                          }`}>
                            <p className="whitespace-pre-wrap break-words text-sm font-medium leading-relaxed">
                              {message.content}
                            </p>
                            <p className={`mt-1 text-[10px] font-semibold ${
                              isAdmin ? 'text-white/70' : 'text-slate-400'
                            }`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <form onSubmit={handleSendReply} className="border-t border-slate-200 bg-white p-4">
                <div className="flex items-end gap-3">
                  <textarea
                    value={replyContent}
                    onChange={(event) => setReplyContent(event.target.value)}
                    placeholder="Nhập phản hồi cho khách..."
                    rows={2}
                    maxLength={1000}
                    disabled={saving || selectedConversation?.status === 'CLOSED'}
                    className="min-h-12 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:bg-slate-100"
                  />
                  <button
                    type="submit"
                    disabled={saving || !replyContent.trim() || selectedConversation?.status === 'CLOSED'}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-black text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Gửi
                  </button>
                </div>
                {selectedConversation?.status === 'CLOSED' && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">Hội thoại đã đóng. Mở lại để phản hồi khách.</p>
                )}
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

