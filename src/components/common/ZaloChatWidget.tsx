'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'shop' | 'user';
  text: string;
  timestamp: string;
}

export default function ZaloChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [hasSentFirstMsg, setHasSentFirstMsg] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const messageEndRef = useRef<HTMLDivElement>(null);

  // Load chat state from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('hhsneaker_chat_messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Error loading chat messages:', e);
      }
    } else {
      // Default shop welcome message
      const defaultMsg: Message = {
        id: 'welcome-msg',
        sender: 'shop',
        text: 'Xin chào! Hoàng Hải Sneaker rất vui được hỗ trợ bạn.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([defaultMsg]);
    }

    const firstSent = localStorage.getItem('hhsneaker_chat_first_sent');
    if (firstSent === 'true') {
      setHasSentFirstMsg(true);
    }

    const unread = localStorage.getItem('hhsneaker_chat_unread');
    if (unread === 'false') {
      setHasUnread(false);
    }
  }, []);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  // Toggle chat widget opening
  const handleToggleOpen = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      setHasUnread(false);
      localStorage.setItem('hhsneaker_chat_unread', 'false');
    }
  };

  // Send message handler
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsgText = inputVal.trim();
    setInputVal('');

    const newMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMsgs = [...messages, newMsg];
    setMessages(updatedMsgs);
    localStorage.setItem('hhsneaker_chat_messages', JSON.stringify(updatedMsgs));

    // Handle auto-reply
    if (!hasSentFirstMsg) {
      setHasSentFirstMsg(true);
      localStorage.setItem('hhsneaker_chat_first_sent', 'true');

      // Trigger automatic response after 800ms
      setTimeout(() => {
        const replyMsg: Message = {
          id: Math.random().toString(),
          sender: 'shop',
          text: 'Cảm ơn bạn đã nhắn tin. Hoàng Hải Sneaker sẽ phản hồi sớm nhất có thể.',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => {
          const latestMsgs = [...prev, replyMsg];
          localStorage.setItem('hhsneaker_chat_messages', JSON.stringify(latestMsgs));
          return latestMsgs;
        });
      }, 800);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none">
      {/* Floating Zalo trigger button */}
      {!isOpen && (
        <button
          onClick={handleToggleOpen}
          className="relative w-14 h-14 bg-[#0068FF] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-108 hover:shadow-2xl active:scale-95 transition-all duration-300 group cursor-pointer"
          title="Chat với Hoàng Hải Sneaker"
        >
          {/* Notification Badge */}
          {hasUnread && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] text-white items-center justify-center font-bold">1</span>
            </span>
          )}
          
          {/* Custom Zalo icon representation using clean vector paths */}
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 fill-current transition-transform group-hover:rotate-12 duration-300"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.48 2 2 6.03 2 11c0 2.9 1.58 5.48 4.05 7.1L5.15 21.6c-.32.43-.02 1 .53.94l4.54-.53c.59.13 1.19.2 1.78.2 5.52 0 10-4.03 10-9s-4.48-9-10-9zm1.48 12.3c-.22.12-.49.03-.61-.19l-1.92-3.32-2.12 2.12c-.2.2-.51.2-.71 0s-.2-.51 0-.71l2.47-2.47c.2-.2.51-.2.71 0l1.92 3.32 1.66-1.66c.2-.2.51-.2.71 0s.2.51 0 .71l-2.11 2.2z" />
          </svg>
        </button>
      )}

      {/* Chatbox Window Container */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-[380px] h-[calc(100vh-140px)] sm:h-[580px] bg-white rounded-2xl border border-slate-100 shadow-2xl flex flex-col overflow-hidden animate-fadeIn duration-200">
          
          {/* Chatbox Header */}
          <div className="bg-[#0068FF] text-white p-4 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              {/* Shop Avatar Wrapper */}
              <div className="relative">
                <img
                  src="/uploads/products/hoang-hai-sneaker-logo.jpg"
                  alt="Hoàng Hải Sneaker"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/80 bg-white"
                  onError={(e) => {
                    // Fallback if logo not found
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                  }}
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#0068FF] rounded-full animate-pulse" />
              </div>
              
              <div>
                <h4 className="font-extrabold text-sm tracking-tight leading-tight">Hoàng Hải Sneaker</h4>
                <p className="text-[11px] text-white/90 font-medium">Rất vui được hỗ trợ bạn</p>
              </div>
            </div>

            {/* Header Controls */}
            <button
              onClick={handleToggleOpen}
              className="p-1.5 hover:bg-white/10 rounded-full transition text-white/95 hover:text-white"
              title="Thu nhỏ khung chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chatbox Messages Body */}
          <div className="flex-grow overflow-y-auto bg-slate-50 p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Show avatar for shop messages */}
                {msg.sender === 'shop' && (
                  <img
                    src="/uploads/products/hoang-hai-sneaker-logo.jpg"
                    alt="Hoàng Hải Sneaker"
                    className="w-7 h-7 rounded-full object-cover bg-white self-end shrink-0 border border-slate-200 shadow-3xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/28';
                    }}
                  />
                )}
                
                <div>
                  <div
                    className={`p-3 rounded-2xl text-sm leading-relaxed shadow-3xs break-words font-medium ${
                      msg.sender === 'user'
                        ? 'bg-[#0068FF] text-white rounded-tr-none'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span
                    className={`text-[9px] text-slate-400 mt-1 block font-normal ${
                      msg.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          {/* Chatbox Footer Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Nhập tin nhắn, nhấn Enter để gửi..."
              className="flex-grow bg-slate-50 border border-slate-200/80 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0068FF]/10 focus:border-[#0068FF] focus:bg-white transition-all placeholder:text-slate-400 font-medium text-slate-800"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="w-9 h-9 flex items-center justify-center bg-[#0068FF] text-white rounded-full hover:bg-[#0055D0] disabled:opacity-45 disabled:pointer-events-none active:scale-95 transition-all shrink-0 shadow-sm"
              title="Gửi tin nhắn"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
