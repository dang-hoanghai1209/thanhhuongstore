'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StatusBadge from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/States';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingAddress, setLoadingAddress] = useState(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          // Take the last 3 orders
          setOrders(Array.isArray(data) ? data.slice(0, 3) : []);
        }
      } catch (err) {
        console.error('Failed to fetch recent orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    const fetchDefaultAddress = async () => {
      try {
        const res = await fetch('/api/account/addresses');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const def = data.find((a: Address) => a.isDefault) || data[0] || null;
            setAddress(def);
          }
        }
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      } finally {
        setLoadingAddress(false);
      }
    };

    if (user) {
      fetchRecentOrders();
      fetchDefaultAddress();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        clearAuth();
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <LoadingSpinner message="Đang xác minh quyền truy cập tài khoản..." />
      </div>
    );
  }

  const userFullName = `${user.lastName || ''} ${user.firstName || ''}`.trim() || 'Thành viên mới';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fadeIn">
      <Breadcrumb items={[{ label: 'Tài khoản' }]} />
      
      {/* Header Info with Sign out */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Hồ Sơ Của Bạn</h1>
          <p className="text-xs text-on-surface-variant/70 mt-1">Quản lý thông tin tài khoản cá nhân, địa chỉ mặc định và xem lịch sử giao dịch.</p>
        </div>
        <button
          onClick={handleLogout}
          className="self-start sm:self-auto px-4 py-2 text-xs font-bold text-red-600 border border-red-200 bg-red-50/50 hover:bg-red-50 rounded-xl transition flex items-center gap-1.5 active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          Đăng xuất tài khoản
        </button>
      </div>

      {/* Account Info Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Overview Card */}
        <div className="bg-white border border-surface-variant/60 p-6 rounded-2xl shadow-xs flex items-center gap-5 md:col-span-2">
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
            <span className="material-symbols-outlined text-[32px]">person</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              {user.role === 'WHOLESALE' ? 'Tài khoản Thành viên' : user.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
            </span>
            <h3 className="font-bold text-on-surface text-lg leading-tight">{userFullName}</h3>
            <p className="text-xs text-on-surface-variant/80 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">mail</span>
              {user.email}
            </p>
            {user.phone && (
              <p className="text-xs text-on-surface-variant/80 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">phone_iphone</span>
                {user.phone}
              </p>
            )}
          </div>
        </div>

        {/* Address Card Info */}
        <div className="bg-white border border-surface-variant/60 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Địa chỉ giao hàng mặc định</h4>
              <span className="material-symbols-outlined text-primary text-[20px]">home_pin</span>
            </div>
            
            {loadingAddress ? (
              <div className="py-2 text-[11px] text-on-surface-variant/70">Đang tải địa chỉ...</div>
            ) : address ? (
              <div className="text-xs text-on-surface-variant space-y-1 font-medium pt-1">
                <p className="text-on-surface font-bold">{address.fullName} - {address.phone}</p>
                <p>{address.street}</p>
                <p>{address.ward}, {address.district}, {address.province}</p>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant/60 italic pt-1">Bạn chưa thiết lập địa chỉ giao nhận nào.</p>
            )}
          </div>
          
          <div className="pt-4 border-t border-slate-100 mt-2">
            <Link
              href="/account/addresses"
              className="text-xs font-bold text-primary hover:text-primary-container inline-flex items-center gap-1"
            >
              <span>{address ? 'Quản lý sổ địa chỉ' : 'Thiết lập địa chỉ ngay'}</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Navigation Sub-sections Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/account/orders"
          className="bg-white p-5 rounded-2xl border border-surface-variant/60 hover:border-primary/30 hover:bg-primary/5/10 transition shadow-2xs group space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">local_shipping</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition">Đơn Hàng Của Bạn</h4>
            <p className="text-[11px] text-on-surface-variant/70 mt-1">Theo dõi đơn hàng đang vận chuyển & lịch sử mua sắm.</p>
          </div>
        </Link>

        <Link
          href="/account/addresses"
          className="bg-white p-5 rounded-2xl border border-surface-variant/60 hover:border-primary/30 hover:bg-primary/5/10 transition shadow-2xs group space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">home_pin</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition">Sổ Địa Chỉ</h4>
            <p className="text-[11px] text-on-surface-variant/70 mt-1">Cấu hình địa chỉ nhận hàng mặc định cho thanh toán nhanh.</p>
          </div>
        </Link>

        <Link
          href="/account/wishlist"
          className="bg-white p-5 rounded-2xl border border-surface-variant/60 hover:border-primary/30 hover:bg-primary/5/10 transition shadow-2xs group space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">favorite</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition">Yêu Thích</h4>
            <p className="text-[11px] text-on-surface-variant/70 mt-1">Danh sách lưu trữ các sản phẩm bạn đang quan tâm.</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-surface-variant/60 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-bold text-on-surface text-base flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
            Đơn Hàng Gần Đây
          </h3>
          <Link
            href="/account/orders"
            className="text-xs font-bold text-primary hover:text-primary-container flex items-center gap-1"
          >
            <span>Tất cả đơn hàng</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </Link>
        </div>

        {loadingOrders ? (
          <div className="py-8">
            <LoadingSpinner message="Đang tải danh sách đơn hàng..." />
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-variant/40">
              <thead>
                <tr>
                  <th className="px-4 py-3 bg-surface-container-low text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider rounded-l-lg">Mã đơn hàng</th>
                  <th className="px-4 py-3 bg-surface-container-low text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-4 py-3 bg-surface-container-low text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 bg-surface-container-low text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">Thanh toán</th>
                  <th className="px-4 py-3 bg-surface-container-low text-right text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-4 py-3 bg-surface-container-low text-right text-xs font-bold text-on-surface-variant uppercase tracking-wider rounded-r-lg">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant/20 bg-white">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-on-surface">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-on-surface-variant">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-on-surface text-right">
                      {order.totalAmount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-xs">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="inline-flex items-center justify-center px-3 py-1.5 border border-primary text-primary hover:bg-primary/5 text-[10px] font-bold rounded-lg transition"
                      >
                        Xem
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-on-surface-variant/60 italic">
            Bạn chưa thực hiện giao dịch mua sắm nào.
          </div>
        )}
      </div>
    </div>
  );
}
