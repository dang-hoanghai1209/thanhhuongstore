'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] flex animate-fadeIn">
      
      {/* LEFT HALF: FORM LAYOUT */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-20 max-w-xl mx-auto w-full z-10">
        
        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-brand-md text-emerald-800 text-xs font-semibold flex items-center gap-3 shadow-sm animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">check_circle</span>
            <div className="space-y-0.5">
              <p className="font-bold text-[13px]">Yêu cầu đã được gửi!</p>
              <p className="text-[11px] text-emerald-600 font-normal">
                Nếu email tồn tại trên hệ thống, một liên kết đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư (và thư rác).
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-brand-md text-red-700 text-xs font-semibold flex items-center gap-3 shadow-sm animate-fadeIn">
            <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0">error</span>
            <span className="text-[12px]">{error}</span>
          </div>
        )}

        <div className="space-y-8 bg-white p-8 sm:p-10 rounded-brand-lg border border-gray-100 shadow-sm">
          
          {/* Logo & Headings */}
          <div className="space-y-3 text-center sm:text-left">
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
              <img
                src="/uploads/products/hoang-hai-sneaker-logo.jpg"
                alt="Hoàng Hải Sneaker Logo"
                className="w-8 h-8 object-cover rounded-brand-sm shadow border border-gray-100"
              />
              <span className="text-sm font-black uppercase tracking-widest text-on-surface">Hoàng Hải Sneaker</span>
            </Link>
            
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Quên mật khẩu?
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Nhập email đăng ký của bạn. Chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu.
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Địa chỉ Email của bạn
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 input-standard"
                  />
                  <span className="material-symbols-outlined text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">mail</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                    Đang gửi yêu cầu...
                  </>
                ) : (
                  'Gửi liên kết khôi phục'
                )}
              </button>
            </form>
          ) : (
            <div className="pt-2">
              <Link 
                href="/login" 
                className="w-full py-3 border-2 border-primary text-primary hover:bg-primary-fixed-dim bg-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Quay lại đăng nhập
              </Link>
            </div>
          )}

          {/* Login Link footer */}
          {!success && (
            <p className="text-center text-xs text-gray-500 font-medium">
              Quớ, bạn nhớ ra mật khẩu?{' '}
              <Link href="/login" className="font-bold text-primary hover:text-primary-container transition">
                Đăng nhập
              </Link>
            </p>
          )}

        </div>

      </div>

      {/* RIGHT HALF: PREMIUM BRAND BANNER */}
      <div className="hidden lg:block lg:flex-1 relative bg-primary-container">
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80" 
          alt="Premium Retail Support"
          className="absolute inset-0 w-full h-full object-cover opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
        
        {/* Floating brand slogan */}
        <div className="absolute bottom-16 left-16 right-16 space-y-4 text-white z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest">
            <span className="material-symbols-outlined text-accent-gold text-[14px]">lock_reset</span>
            BẢO MẬT & AN TOÀN
          </div>
          <h3 className="text-3xl font-black tracking-tight leading-tight">
            Tài khoản của bạn luôn được bảo vệ tối đa.
          </h3>
          <p className="text-sm text-white/80 max-w-md font-normal leading-relaxed">
            Hệ thống bảo mật đa lớp giúp đảm bảo giao dịch mua sắm diễn ra thuận lợi, minh bạch và an toàn tuyệt đối.
          </p>
        </div>
      </div>

    </main>
  );
}
