'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // Input fields state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!passwordsMatch || !acceptTerms) return;

    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }

      // Proactively verify cookie/session with /api/auth/me
      const meResponse = await fetch('/api/auth/me');
      if (meResponse.ok) {
        const meResult = await meResponse.json();
        if (meResult?.user) {
          // Auto login
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
          setTimeout(() => {
            router.replace('/account');
            router.refresh();
          }, 1500);
          return;
        }
      }

      // Fallback if me check fails, go to login page
      setSuccess(true);
      setTimeout(() => {
        router.replace('/login?message=' + encodeURIComponent('Đăng ký thành công! Vui lòng đăng nhập lại.'));
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng kiểm tra thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] flex animate-fadeIn">
      
      {/* LEFT HALF: REGISTER FORM LAYOUT */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-20 max-w-2xl mx-auto w-full z-10">
        
        {/* Success registration banner */}
        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-brand-md text-emerald-800 text-xs font-semibold flex items-center gap-3 shadow-sm animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-600 text-[20px] shrink-0">check_circle</span>
            <div className="space-y-0.5">
              <p className="font-bold text-[13px]">Đăng ký tài khoản thành công!</p>
              <p className="text-[11px] text-emerald-600 font-normal">Hệ thống đang chuẩn bị chuyển hướng bạn...</p>
            </div>
          </div>
        )}

        {/* Error registration banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-brand-md text-red-700 text-xs font-semibold flex items-center gap-3 shadow-sm animate-fadeIn">
            <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0">warning</span>
            <span className="text-[12px]">{error}</span>
          </div>
        )}

        <div className="space-y-6 bg-white p-8 sm:p-10 rounded-brand-lg border border-gray-100 shadow-sm">
          
          {/* Logo & Headings */}
          <div className="space-y-2 text-center sm:text-left">
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 rounded-brand-sm bg-primary flex items-center justify-center text-white font-black text-sm shadow">
                TH
              </div>
              <span className="text-sm font-black uppercase tracking-widest text-on-surface">Thanh Hương Store</span>
            </Link>
            
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Tạo tài khoản mới
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Đăng ký ngay để nhận ưu đãi bán lẻ và quyền truy cập mua sỉ bậc thang B2B.
            </p>
          </div>

          {/* Form container */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Grid 1: Last Name & First Name (Row 1) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Họ và tên đệm
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    placeholder="Nguyễn Văn" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-10 input-standard"
                  />
                  <span className="material-symbols-outlined text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">person</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Tên
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    placeholder="An" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10 input-standard"
                  />
                  <span className="material-symbols-outlined text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">person</span>
                </div>
              </div>
            </div>

            {/* Grid 2: Email & Phone Number (Row 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    placeholder="an@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 input-standard"
                  />
                  <span className="material-symbols-outlined text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">mail</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Số điện thoại
                </label>
                <div className="relative">
                  <input 
                    type="tel" 
                    placeholder="0912345678" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 input-standard"
                  />
                  <span className="material-symbols-outlined text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">phone_iphone</span>
                </div>
              </div>
            </div>

            {/* Grid 3: Password & Confirm Password (Row 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Mật khẩu
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

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    required
                    placeholder="Nhập lại mật khẩu" 
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

            {/* Error mismatched password banner */}
            {!passwordsMatch && (
              <p className="text-[10px] text-red-500 font-bold flex items-center gap-1.5 animate-fadeIn">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Mật khẩu xác nhận không khớp. Vui lòng nhập lại.
              </p>
            )}

            {/* Checkbox: Accept Terms */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-gray-500 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="leading-tight select-none">
                  Tôi đồng ý với <Link href="/terms" className="font-bold text-primary hover:underline">Điều khoản dịch vụ</Link> và <Link href="/privacy-policy" className="font-bold text-primary hover:underline">Chính sách bảo mật</Link> của Thanh Hương Store.
                </span>
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit" 
              disabled={loading || !acceptTerms || !passwordsMatch || !lastName || !firstName || !email || !password}
              className="w-full py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 active:scale-95"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                  Đang khởi tạo tài khoản...
                </>
              ) : (
                'Tạo tài khoản'
              )}
            </button>
          </form>

          {/* Login redirection */}
          <p className="text-center text-xs text-gray-500 font-medium pt-2">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-bold text-primary hover:text-primary-container transition">
              Đăng nhập ngay
            </Link>
          </p>

        </div>

      </div>

      {/* RIGHT HALF: PREMIUM BRAND BANNER */}
      <div className="hidden lg:block lg:flex-1 relative bg-primary-container">
        <img 
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1000&q=80" 
          alt="Luxury Swimwear & Socks Showcase"
          className="absolute inset-0 w-full h-full object-cover opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />
        
        {/* Floating brand slogan */}
        <div className="absolute bottom-16 left-16 right-16 space-y-4 text-white z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/10 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest">
            <span className="material-symbols-outlined text-accent-teal text-[14px]">shield</span>
            ĐỒNG HÀNH BỀN VỮNG
          </div>
          <h3 className="text-3xl font-black tracking-tight leading-tight">
            Khơi nguồn tự tin, dẫn lối phong cách.
          </h3>
          <p className="text-sm text-white/80 max-w-md font-normal leading-relaxed">
            Hưởng các đặc quyền chiết khấu tự động sỉ B2B, quản lý đơn hàng thông minh và hỗ trợ trực tuyến 24/7 từ Thanh Hương Store.
          </p>
        </div>
      </div>

    </main>
  );
}