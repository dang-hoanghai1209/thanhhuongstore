'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';

type LoginResponse = {
  accessToken?: string;
  user?: {
    id: string;
    email: string;
    phone?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role: 'CUSTOMER' | 'WHOLESALE' | 'ADMIN';
    isActive: boolean;
  };
  message?: string;
  error?: string;
};

function getOAuthErrorMessage(errorCode: string) {
  switch (errorCode) {
    case 'invalid_oauth_state':
      return 'Phiên đăng nhập OAuth không hợp lệ. Vui lòng thử lại.';
    case 'google_oauth_failed':
      return 'Đăng nhập Google thất bại. Vui lòng thử lại.';
    case 'facebook_oauth_failed':
      return 'Đăng nhập Facebook thất bại. Vui lòng thử lại.';
    case 'facebook_email_required':
      return 'Facebook không trả về email. Vui lòng cấp quyền email hoặc dùng email/password.';
    case 'access_denied':
      return 'Bạn đã hủy đăng nhập OAuth.';
    default:
      return 'Đăng nhập OAuth thất bại. Vui lòng thử lại.';
  }
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const oauthError = new URLSearchParams(window.location.search).get('error');
    if (oauthError) {
      setError(getOAuthErrorMessage(oauthError));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const result = (await response.json()) as LoginResponse;

      if (!response.ok || !result.user) {
        throw new Error(result.message || result.error || 'Email hoặc mật khẩu không chính xác.');
      }

      // Verify if cookie is set and working by calling /api/auth/me
      const meResponse = await fetch('/api/auth/me');
      if (!meResponse.ok) {
        throw new Error('Đăng nhập chưa hoàn tất, vui lòng thử lại.');
      }
      
      const meResult = await meResponse.json();
      if (!meResult?.user) {
        throw new Error('Đăng nhập chưa hoàn tất, vui lòng thử lại.');
      }

      setAuth({
        id: meResult.user.id,
        email: meResult.user.email,
        phone: meResult.user.phone ?? null,
        firstName: meResult.user.firstName ?? '',
        lastName: meResult.user.lastName ?? '',
        role: meResult.user.role,
        isActive: meResult.user.isActive,
      });
      setSuccess(true);

      const nextUrl = new URLSearchParams(window.location.search).get('next');
      const redirectTarget = nextUrl?.startsWith('/') ? nextUrl : meResult.user.role === 'ADMIN' ? '/admin' : '/account';

      router.replace(redirectTarget);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] flex animate-fadeIn">
      
      {/* LEFT HALF: LOGIN FORM LAYOUT */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-20 max-w-xl mx-auto w-full z-10">
        
        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-brand-md text-emerald-800 text-xs font-semibold flex items-center gap-3 shadow-sm animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">check_circle</span>
            <div className="space-y-0.5">
              <p className="font-bold text-[13px]">Đăng nhập thành công!</p>
              <p className="text-[11px] text-emerald-600 font-normal">Hệ thống đang chuyển hướng bạn...</p>
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
              Chào mừng trở lại!
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Vui lòng đăng nhập để tiếp tục mua sắm.
            </p>
          </div>

          {/* Form wrapper */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Địa chỉ Email
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

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Mật khẩu
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-[10px] font-bold text-primary hover:text-primary-container transition"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  placeholder="••••••••" 
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                  Đang xác thực...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Social Sign-in Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              Hoặc đăng nhập bằng
            </span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                window.location.href = '/api/auth/google';
              }}
              className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 hover:border-gray-300 rounded-brand-md bg-white text-xs text-gray-700 font-bold transition shadow-xs hover:bg-gray-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/api/auth/facebook';
              }}
              className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 hover:border-gray-300 rounded-brand-md bg-white text-xs text-gray-700 font-bold transition shadow-xs hover:bg-gray-50"
            >
              <svg className="w-4 h-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          {/* Register Link footer */}
          <p className="text-center text-xs text-gray-500 font-medium">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-bold text-primary hover:text-primary-container transition">
              Đăng ký
            </Link>
          </p>

        </div>

      </div>

      {/* RIGHT HALF: PREMIUM BRAND BANNER (Hidden on mobile) */}
      <div className="hidden lg:block lg:flex-1 relative bg-primary-container">
        <img 
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80" 
          alt="Premium Fashion"
          className="absolute inset-0 w-full h-full object-cover opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
        
        {/* Floating brand slogan */}
        <div className="absolute bottom-16 left-16 right-16 space-y-4 text-white z-10 animate-slideUp">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest">
            <span className="material-symbols-outlined text-accent-gold text-[14px]">auto_awesome</span>
            BST MỚI NHẤT 2026
          </div>
          <h3 className="text-3xl font-black tracking-tight leading-tight">
            Tinh tế trong từng đường kim, mũi chỉ.
          </h3>
          <p className="text-sm text-white/80 max-w-md font-normal leading-relaxed">
            Khám phá những thiết kế thời trang đồ bơi, tất vớ và đồ lót nam cao cấp vừa vặn, nâng đỡ cơ thể tuyệt đối.
          </p>
        </div>
      </div>

    </main>
  );
}
