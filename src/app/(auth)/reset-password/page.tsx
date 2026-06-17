'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) {
      setToken(t);
    } else {
      setError('Mã xác thực (token) đặt lại mật khẩu không hợp lệ hoặc thiếu. Vui lòng kiểm tra lại liên kết trong email của bạn.');
    }
  }, [searchParams]);

  // Password matching check
  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return true;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // Password Strength Indicator Logic
  const passwordStrength = useMemo(() => {
    if (!password) return { label: '', score: 0, color: 'bg-gray-200' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { label: 'Yếu', score: 25, color: 'bg-red-500' };
    if (score === 2) return { label: 'Trung bình', score: 50, color: 'bg-yellow-500' };
    if (score === 3) return { label: 'Mạnh', score: 75, color: 'bg-primary' };
    return { label: 'Rất mạnh', score: 100, color: 'bg-emerald-500' };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch || !token || password.length < 8) return;

    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Đặt lại mật khẩu thất bại. Token có thể đã hết hạn hoặc không hợp lệ.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
          Đặt lại mật khẩu mới
        </h2>
        <p className="text-xs text-gray-400 font-medium">
          Tạo một mật khẩu mới cho tài khoản của bạn để đăng nhập mua sắm.
        </p>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-brand-md text-emerald-800 text-xs font-semibold flex items-center gap-3 shadow-sm animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">check_circle</span>
          <div className="space-y-0.5">
            <p className="font-bold text-[13px]">Đặt lại mật khẩu thành công!</p>
            <p className="text-[11px] text-emerald-600 font-normal">
              Mật khẩu mới của bạn đã hoạt động. Vui lòng tiến hành đăng nhập lại.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-brand-md text-red-700 text-xs font-semibold flex items-center gap-3 shadow-sm animate-fadeIn">
          <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0">error</span>
          <span className="text-[12px]">{error}</span>
        </div>
      )}

      {!success && token && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                required
                placeholder="Tối thiểu 8 ký tự" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 input-standard"
              />
              <span className="material-symbols-outlined text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">lock</span>
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                required
                placeholder="Nhập lại mật khẩu mới" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`pl-10 pr-10 input-standard ${
                  passwordsMatch ? '' : 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                }`}
              />
              <span className="material-symbols-outlined text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">lock</span>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Password strength indicator */}
          {password && (
            <div className="space-y-1.5 animate-fadeIn">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-gray-400 uppercase">Độ mạnh mật khẩu:</span>
                <span className="text-gray-700">{passwordStrength.label}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${passwordStrength.color}`} 
                  style={{ width: `${passwordStrength.score}%` }}
                />
              </div>
            </div>
          )}

          {/* Mismatched password warning */}
          {!passwordsMatch && (
            <p className="text-[10px] text-red-500 font-bold flex items-center gap-1.5 animate-fadeIn">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              Mật khẩu xác nhận không khớp. Vui lòng nhập lại.
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !token || !passwordsMatch || password.length < 8}
            className="w-full py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                Đang cập nhật mật khẩu...
              </>
            ) : (
              'Cập nhật mật khẩu'
            )}
          </button>
        </form>
      )}

      {(success || !token) && (
        <div className="pt-2">
          <Link 
            href="/login" 
            className="w-full py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95 shadow-md"
          >
            Đăng nhập ngay
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F6] flex animate-fadeIn">
      
      {/* LEFT HALF: RESET FORM LAYOUT */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-20 max-w-xl mx-auto w-full z-10">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20 bg-white p-8 sm:p-10 rounded-brand-lg border border-gray-100 shadow-sm space-y-3">
            <span className="material-symbols-outlined text-[32px] text-primary animate-spin">sync</span>
            <span className="text-xs font-semibold text-gray-500">Đang chuẩn bị form...</span>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
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
            Hệ thống bảo mật đa lớp giúp đảm bảo giao dịch mua bán sỉ/lẻ diễn ra thuận lợi, minh bạch và an toàn tuyệt đối.
          </p>
        </div>
      </div>

    </main>
  );
}