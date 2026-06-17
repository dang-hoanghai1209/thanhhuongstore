'use client';

import React, { useState } from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    setSuccess(false);
    setError(null);

    // Mock API call to submit inquiry
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-fadeIn">
      <Breadcrumb items={[{ label: 'Liên hệ' }]} />

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Liên Hệ Với Chúng Tôi</h1>
        <p className="text-xs text-on-surface-variant/70 mt-1">
          Chúng tôi luôn sẵn sàng tiếp nhận ý kiến đóng góp, giải đáp thắc mắc và hỗ trợ chính sách sỉ/lẻ từ bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info details panel */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Card: Support channels */}
          <div className="bg-white border border-surface-variant/60 rounded-2xl p-6 shadow-xs space-y-5">
            <h3 className="font-bold text-on-surface text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[20px]">contact_support</span>
              Kênh hỗ trợ nhanh
            </h3>
            
            <div className="space-y-4">
              {/* Phone info */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">phone</span>
                </div>
                <div className="text-xs font-medium text-on-surface-variant">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Hotline hỗ trợ</span>
                  <p className="text-on-surface font-bold">0987.654.321</p>
                  <p>Hỗ trợ khẩn cấp từ 08:00 - 21:00</p>
                </div>
              </div>

              {/* Email info */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                </div>
                <div className="text-xs font-medium text-on-surface-variant">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Hộp thư điện tử</span>
                  <p className="text-on-surface font-bold">hotro@hhsneaker.id.vn</p>
                  <p>Phản hồi trong vòng 24 giờ làm việc</p>
                </div>
              </div>

              {/* Address info */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">home_pin</span>
                </div>
                <div className="text-xs font-medium text-on-surface-variant">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Địa chỉ kho hàng</span>
                  <p className="text-on-surface font-bold">123 Đường Ba Tháng Hai</p>
                  <p>Phường 11, Quận 10, TP. Hồ Chí Minh</p>
                </div>
              </div>

              {/* Hours info */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </div>
                <div className="text-xs font-medium text-on-surface-variant">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Thời gian làm việc</span>
                  <p className="text-on-surface font-bold">08:00 - 21:30</p>
                  <p>Thứ 2 - Chủ Nhật (Kể cả ngày lễ)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form card panel */}
        <div className="bg-white border border-surface-variant/60 rounded-2xl p-6 sm:p-8 shadow-xs lg:col-span-2 space-y-5">
          <h3 className="font-bold text-on-surface text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">chat</span>
            Gửi tin nhắn cho chúng tôi
          </h3>

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-brand-md text-emerald-800 text-xs font-semibold flex items-center gap-3 shadow-xs animate-fadeIn">
              <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">check_circle</span>
              <div className="space-y-0.5">
                <p className="font-bold text-[13px]">Lời nhắn đã gửi thành công!</p>
                <p className="text-[11px] text-emerald-600 font-normal">
                  Cảm ơn bạn đã gửi ý kiến. Nhân viên hỗ trợ của Hoàng Hải Sneaker sẽ phản hồi lại bạn sớm nhất.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Họ và tên *</label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-standard"
                />
              </div>

              {/* Email field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Địa chỉ Email *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-standard"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Số điện thoại</label>
                <input
                  type="tel"
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-standard"
                />
              </div>

              {/* Subject field */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Chủ đề</label>
                <input
                  type="text"
                  placeholder="Hỏi đáp sản phẩm, phản hồi..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="input-standard"
                />
              </div>
            </div>

            {/* Message field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Nội dung liên hệ *</label>
              <textarea
                required
                rows={5}
                placeholder="Vui lòng viết chi tiết câu hỏi hoặc yêu cầu hỗ trợ sỉ..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="textarea-standard"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !name || !email || !message}
                className="px-6 py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                    Đang gửi...
                  </>
                ) : (
                  'Gửi thông tin liên hệ'
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
