'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StatusBadge from '@/components/ui/StatusBadge';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/ui/States';

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
  }>;
}

export default function AccountOrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) {
        throw new Error('Không thể tải lịch sử đơn hàng từ máy chủ.');
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <LoadingSpinner message="Đang xác minh phiên đăng nhập..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-fadeIn">
      <Breadcrumb items={[{ label: 'Tài khoản', href: '/account' }, { label: 'Đơn hàng' }]} />
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Đơn Hàng Của Bạn</h1>
        <p className="text-xs text-on-surface-variant/70 mt-1">
          Theo dõi trạng thái giao hàng, kiểm tra chi tiết thanh toán và xem lại lịch sử hóa đơn mua sắm.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Đang tải lịch sử giao dịch..." />
      ) : error ? (
        <ErrorState 
          description={error} 
          onRetry={fetchOrders}
          homeLabel="Quay lại Hồ sơ"
        />
      ) : orders.length > 0 ? (
        <div className="bg-white border border-surface-variant/60 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-variant/40">
              <thead>
                <tr>
                  <th className="px-6 py-4 bg-surface-container-low text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">Mã đơn hàng</th>
                  <th className="px-6 py-4 bg-surface-container-low text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-4 bg-surface-container-low text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-4 bg-surface-container-low text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 bg-surface-container-low text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider">Thanh toán</th>
                  <th className="px-6 py-4 bg-surface-container-low text-right text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tổng cộng</th>
                  <th className="px-6 py-4 bg-surface-container-low text-center text-xs font-bold text-on-surface-variant uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant/25 bg-white">
                {orders.map((order) => {
                  // Generate an items summary
                  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const firstItemName = order.items[0]?.productName || 'Sản phẩm';
                  const itemsSummary = order.items.length > 1 
                    ? `${firstItemName} và ${order.items.length - 1} sản phẩm khác (${itemsCount} món)`
                    : `${firstItemName} (${itemsCount} món)`;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-on-surface">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-on-surface-variant">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-xs text-on-surface-variant max-w-[220px] truncate">
                        {itemsSummary}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-black text-on-surface text-right">
                        {order.totalAmount.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="inline-flex items-center justify-center px-4 py-2 border border-primary text-primary hover:bg-primary/5 text-xs font-bold rounded-xl transition"
                        >
                          Xem chi tiết
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="Chưa có lịch sử mua sắm"
          description="Bạn chưa thực hiện bất kỳ giao dịch nào tại Hoàng Hải Sneaker."
          icon="receipt_long"
          actionLabel="Bắt đầu mua sắm"
          actionHref="/products"
        />
      )}
    </div>
  );
}
