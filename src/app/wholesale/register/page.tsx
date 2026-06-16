'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StatusBadge from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/States';
import { Sparkles, Building, FileText, CheckCircle, AlertCircle, Info, Phone } from 'lucide-react';

interface WholesaleProfile {
  id: string;
  companyName: string;
  taxCode: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function WholesaleRegisterPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<WholesaleProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form input states
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWholesaleProfile = async () => {
      try {
        const res = await fetch('/api/wholesale/register');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(data.profile);
          }
        }
      } catch (err) {
        console.error('Failed to fetch wholesale profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWholesaleProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !taxCode.trim()) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/wholesale/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          companyName,
          taxCode,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Đăng ký bán sỉ thất bại. Vui lòng thử lại.');
      }

      setSuccess(true);
      setProfile(result);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi mạng.');
    } finally {
      setSubmitting(false);
    }
  };

  // If loading session/profile
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <LoadingSpinner message="Đang kiểm tra hồ sơ sỉ B2B..." />
      </div>
    );
  }

  // Case 1: Guest User (not logged in)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] pb-20 pt-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: 'Đăng ký đại lý B2B' }]} />
          
          <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 text-center shadow-sm mt-8 space-y-6">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mx-auto border border-primary/10">
              <Building className="w-8 h-8" />
            </div>
            
            <div className="space-y-2 max-w-lg mx-auto">
              <h1 className="text-2xl font-black text-gray-950 tracking-tight">Đăng Ký Khách Hàng Sỉ (B2B)</h1>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                Để tham gia chương trình khách hàng bán sỉ và nhận mức chiết khấu bậc thang hấp dẫn từ Hoàng Hải Sneaker, bạn cần đăng nhập tài khoản trước.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 max-w-sm mx-auto">
              <Link
                href="/login?next=/wholesale/register"
                className="w-full py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5"
              >
                Đăng nhập ngay
              </Link>
              <Link
                href="/register"
                className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition flex items-center justify-center"
              >
                Tạo tài khoản mới
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: User has an active/pending/rejected profile
  if (profile) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] pb-20 pt-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Breadcrumb items={[{ label: 'Hồ sơ đại lý B2B' }]} />

          <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-sm mt-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shrink-0">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-gray-950 tracking-tight">Hồ Sơ Đăng Ký Đại Lý</h1>
                  <p className="text-xs text-gray-400 font-medium">Mã hồ sơ: {profile.id.substring(0, 8).toUpperCase()}</p>
                </div>
              </div>
              <div className="self-start sm:self-auto flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">Trạng thái:</span>
                <StatusBadge status={profile.status} />
              </div>
            </div>

            {/* Success, Info or Alert Banners based on status */}
            {profile.status === 'APPROVED' && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-medium flex items-start gap-3 shadow-3xs">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-[13px] text-emerald-950">Chúc mừng! Bạn đã là Đại lý của Hoàng Hải Sneaker</p>
                  <p className="text-emerald-700 leading-relaxed font-normal">
                    Tài khoản của bạn đã được nâng cấp lên phân hệ **WHOLESALE**. Bảng chiết khấu sỉ tự động theo số lượng sẽ được hiển thị và tính toán tự động mỗi khi bạn thêm sản phẩm vào giỏ hàng.
                  </p>
                </div>
              </div>
            )}

            {profile.status === 'PENDING' && (
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800 text-xs font-medium flex items-start gap-3 shadow-3xs">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-[13px] text-amber-950">Đang chờ xét duyệt hồ sơ</p>
                  <p className="text-amber-700 leading-relaxed font-normal">
                    Hệ thống đã ghi nhận hồ sơ đăng ký của bạn. Ban quản lý Hoàng Hải Sneaker sẽ tiến hành xác minh thông tin doanh nghiệp/cửa hàng của bạn trong vòng 24 giờ làm việc. Chúng tôi sẽ phản hồi trực tiếp qua số điện thoại hoặc email đăng ký.
                  </p>
                </div>
              </div>
            )}

            {profile.status === 'REJECTED' && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-800 text-xs font-medium flex items-start gap-3 shadow-3xs">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-[13px] text-red-950">Hồ sơ không được phê duyệt</p>
                  <p className="text-red-700 leading-relaxed font-normal">
                    Tiếc rằng hồ sơ của bạn chưa đủ điều kiện xét duyệt làm đại lý bán sỉ cấp cao. Vui lòng kiểm tra lại thông tin mã số thuế/tên doanh nghiệp hoặc liên hệ bộ phận chăm sóc đại lý qua số điện thoại hỗ trợ.
                  </p>
                </div>
              </div>
            )}

            {/* Profile Detail List */}
            <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100/50">Thông tin đăng ký đại lý</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Tên công ty / Cửa hàng:</span>
                  <span className="font-bold text-gray-800 mt-1 block">{profile.companyName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Mã số thuế / Giấy phép ĐKKD:</span>
                  <span className="font-bold text-gray-800 mt-1 block">{profile.taxCode}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Người liên hệ đại diện:</span>
                  <span className="font-bold text-gray-800 mt-1 block">
                    {user.lastName} {user.firstName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Số điện thoại liên hệ:</span>
                  <span className="font-bold text-gray-800 mt-1 block">{user.phone || 'Chưa cung cấp'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Địa chỉ email:</span>
                  <span className="font-bold text-gray-800 mt-1 block">{user.email}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Ngày nộp hồ sơ:</span>
                  <span className="font-bold text-gray-800 mt-1 block">
                    {new Date(profile.createdAt).toLocaleDateString('vi-VN')} {new Date(profile.createdAt).toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Link
                href="/account"
                className="px-5 py-2.5 bg-gray-950 hover:bg-gray-900 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Quay lại hồ sơ cá nhân
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Logged-in user who hasn't applied yet (Show application form)
  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-20 pt-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Breadcrumb items={[{ label: 'Đăng ký đại lý B2B' }]} />

        <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-sm mt-8 space-y-6">
          <div className="space-y-2 border-b border-gray-50 pb-5">
            <h1 className="text-2xl font-black text-gray-950 tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[28px]">handshake</span>
              Đăng Ký Khách Hàng Sỉ (B2B)
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Hoàn tất biểu mẫu thông tin dưới đây để gửi yêu cầu nâng cấp tài khoản đại lý bán sỉ. Chúng tôi sẽ liên hệ sớm nhất.
            </p>
          </div>

          {/* Success banner */}
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-medium flex items-center gap-3 shadow-3xs animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="space-y-0.5">
                <p className="font-bold text-[13px] text-emerald-950">Gửi hồ sơ đăng ký thành công!</p>
                <p className="text-emerald-700 font-normal">Vui lòng chờ ban quản trị Hoàng Hải Sneaker phê duyệt.</p>
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-800 text-xs font-medium flex items-center gap-3 shadow-3xs animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="text-[12px]">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Company Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Tên công ty / Hộ kinh doanh / Tên cửa hàng *
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Hộ kinh doanh Hoàng Hải Sneaker" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="pl-10 input-standard"
                />
                <Building className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Row 2: Tax Code */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Mã số thuế / Số giấy đăng ký kinh doanh *
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="Nhập mã số thuế doanh nghiệp của bạn" 
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  className="pl-10 input-standard"
                />
                <FileText className="w-4.5 h-4.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Prefilled readonly info for validation */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-3.5 text-xs text-gray-500">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Thông tin liên hệ tài khoản</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <span className="font-semibold block text-[11px] text-gray-400">Đại diện liên hệ:</span>
                  <span className="font-bold text-gray-800 mt-0.5 block">{user.lastName} {user.firstName}</span>
                </div>
                <div>
                  <span className="font-semibold block text-[11px] text-gray-400">Số điện thoại liên hệ:</span>
                  <span className="font-bold text-gray-800 mt-0.5 block">{user.phone || 'Chưa cập nhật (Vui lòng bổ sung tại hồ sơ)'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-semibold block text-[11px] text-gray-400">Địa chỉ email:</span>
                  <span className="font-bold text-gray-800 mt-0.5 block">{user.email}</span>
                </div>
              </div>
              
              {!user.phone && (
                <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1 pt-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Khuyến nghị: Cập nhật số điện thoại tại <Link href="/account" className="underline hover:text-primary">Hồ sơ cá nhân</Link> để hỗ trợ xác thực nhanh hơn.
                </p>
              )}
            </div>

            {/* Submit CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-50">
              <Link
                href="/account"
                className="w-full sm:w-auto px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition text-center"
              >
                Hủy bỏ
              </Link>
              <button
                type="submit" 
                disabled={submitting || !companyName.trim() || !taxCode.trim()}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
              >
                {submitting ? 'Đang gửi thông tin...' : 'Gửi yêu cầu đại lý B2B'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

