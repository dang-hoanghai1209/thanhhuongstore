'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles, 
  Chrome, 
  Facebook 
} from 'lucide-react';
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
    <main className="min-h-screen bg-[#FAF9F6] flex">
      
      {/* LEFT HALF: LOGIN FORM LAYOUT */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-20 max-w-xl mx-auto w-full z-10">
        
        {/* Success Alert Toast-like banner */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-brand-md text-emerald-800 text-xs font-semibold flex items-center gap-3 shadow-sm animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="space-y-0.5">
              <p className="font-bold">Đăng nhập thành công!</p>
              <p className="text-[10px] text-emerald-600 font-normal">Hệ thống đang chuyển hướng bạn về Trang chủ...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-brand-md text-red-700 text-xs font-semibold flex items-center gap-3 shadow-sm animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-8 bg-white p-8 sm:p-10 rounded-brand-lg border border-gray-100 shadow-sm">
          
          {/* Logo & Headings */}
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 text-brand-600">
              <div className="w-8 h-8 rounded-brand-sm bg-brand-600 flex items-center justify-center text-white font-black text-sm shadow">
                V
              </div>
              <span className="text-sm font-black uppercase tracking-widest">Thanh Hương Store</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Chào mừng trở lại!
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Vui lòng nhập tài khoản để tiếp tục trải nghiệm mua sắm sỉ & lẻ.
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-brand-md text-xs font-bold focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                  className="text-[10px] font-bold text-brand-600 hover:text-brand-700 transition"
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
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-brand-md text-xs font-bold focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/10 transition"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-brand-md text-xs font-bold transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:hover:bg-brand-600 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
              className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 hover:border-gray-300 rounded-brand-md bg-white text-xs text-gray-700 font-bold transition shadow-xs"
            >
              <Chrome className="w-4 h-4 text-red-500" />
              Google
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/api/auth/facebook';
              }}
              className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 hover:border-gray-300 rounded-brand-md bg-white text-xs text-gray-700 font-bold transition shadow-xs"
            >
              <Facebook className="w-4 h-4 text-blue-600" />
              Facebook
            </button>
          </div>

          {/* Register Link footer */}
          <p className="text-center text-xs text-gray-500 font-medium">
            Bạn chưa có tài khoản? Hãy{' '}
            <Link href="/register" className="font-bold text-brand-600 hover:text-brand-700 transition">
              Đăng ký
            </Link>
          </p>

        </div>

      </div>

      {/* RIGHT HALF: PREMIUM BRAND BANNER (Hidden on mobile) */}
      <div className="hidden lg:block lg:flex-1 relative bg-brand-950">
        <img 
          src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80" 
          alt="Premium Fashion"
          className="absolute inset-0 w-full h-full object-cover opacity-85" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/30 to-brand-950/40" />
        
        {/* Floating brand slogan */}
        <div className="absolute bottom-16 left-16 right-16 space-y-4 text-white z-10 animate-slideUp">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 backdrop-blur-md text-brand-200 text-[10px] font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
            BST MỚI NHẤT 2026
          </div>
          <h3 className="text-3xl font-black tracking-tight leading-tight">
            Tinh tế trong từng đường kim, mũi chỉ.
          </h3>
          <p className="text-sm text-brand-100 max-w-md font-normal leading-relaxed">
            Khám phá những thiết kế thời trang đồ bơi, tất vớ và đồ lót nam cao cấp vừa vặn, nâng đỡ cơ thể tuyệt đối.
          </p>
        </div>
      </div>

    </main>
  );
}
