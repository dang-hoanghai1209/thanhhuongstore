'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StatusBadge from '@/components/ui/StatusBadge';
import { LoadingSpinner, ErrorState } from '@/components/ui/States';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  priceAtPurchase: number;
  variant?: {
    id: string;
    size: string;
    color: string;
    sku: string;
    product?: {
      id: string;
      images?: Array<{ url: string; isPrimary: boolean }>;
    };
  } | null;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  notes?: string | null;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  couponCode?: string | null;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
}

export default function AccountOrderDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Đơn hàng không tồn tại hoặc bạn không có quyền xem đơn hàng này.');
        }
        throw new Error('Không thể tải chi tiết đơn hàng.');
      }
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      fetchOrderDetail();
    }
  }, [user, id]);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <LoadingSpinner message="Đang xác minh quyền truy cập tài khoản..." />
      </div>
    );
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'COD':
        return 'Thanh toán COD (Nhận hàng thanh toán)';
      case 'VNPAY':
        return 'Thanh toán trực tuyến VNPAY';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản ngân hàng trực tiếp';
      default:
        return method;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-fadeIn">
      <Breadcrumb
        items={[
          { label: 'Tài khoản', href: '/account' },
          { label: 'Đơn hàng', href: '/account/orders' },
          { label: order ? order.orderNumber : 'Chi tiết đơn hàng' }
        ]}
      />

      {loading ? (
        <LoadingSpinner message="Đang tải chi tiết hóa đơn..." />
      ) : error ? (
        <ErrorState
          title="Không tìm thấy đơn hàng"
          description={error}
          onRetry={fetchOrderDetail}
          homeLabel="Xem lịch sử đơn hàng"
        />
      ) : order ? (
        <div className="space-y-6">
          {/* Main Info Header Card */}
          <div className="bg-white border border-surface-variant/60 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Chi tiết giao dịch</span>
              <h2 className="text-xl sm:text-2xl font-black text-on-surface flex flex-wrap items-center gap-2">
                Đơn hàng {order.orderNumber}
              </h2>
              <p className="text-xs text-on-surface-variant/80">
                Ngày đặt mua: {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-col gap-1 sm:items-end">
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <span>Trạng thái:</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-1">
                  <span>Thanh toán:</span>
                  <StatusBadge status={order.paymentStatus} />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Payment details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery address info card */}
            <div className="bg-white border border-surface-variant/60 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-bold text-on-surface text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
                Thông tin giao nhận hàng
              </h3>
              
              <div className="text-xs text-on-surface-variant space-y-1.5 font-medium">
                <p className="text-on-surface font-bold text-sm">{order.shippingAddress.fullName}</p>
                <p className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-gray-400">phone_iphone</span>
                  {order.shippingAddress.phone}
                </p>
                <p className="flex items-start gap-1.5 pt-1">
                  <span className="material-symbols-outlined text-[15px] text-gray-400 mt-0.5">home_pin</span>
                  <span>
                    {order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                  </span>
                </p>
              </div>
            </div>

            {/* Payment details info card */}
            <div className="bg-white border border-surface-variant/60 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="font-bold text-on-surface text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                Phương thức & Ghi chú
              </h3>
              
              <div className="text-xs text-on-surface-variant space-y-3 font-medium">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Hình thức thanh toán</span>
                  <p className="text-on-surface font-bold">{getPaymentMethodLabel(order.paymentMethod)}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Ghi chú từ khách hàng</span>
                  <p className="italic text-on-surface-variant/90">
                    {order.notes || 'Không có ghi chú đặc biệt cho đơn hàng này.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Order Items list */}
          <div className="bg-white border border-surface-variant/60 rounded-2xl shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-on-surface text-sm flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-primary text-[20px]">shopping_bag</span>
              Danh sách sản phẩm mua
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-surface-variant/30">
                <thead>
                  <tr>
                    <th className="px-4 py-3 bg-surface-container-low text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider rounded-l-lg">Sản phẩm</th>
                    <th className="px-4 py-3 bg-surface-container-low text-center text-xs font-bold text-on-surface-variant uppercase tracking-wider">Phân loại</th>
                    <th className="px-4 py-3 bg-surface-container-low text-right text-xs font-bold text-on-surface-variant uppercase tracking-wider">Đơn giá</th>
                    <th className="px-4 py-3 bg-surface-container-low text-center text-xs font-bold text-on-surface-variant uppercase tracking-wider">Số lượng</th>
                    <th className="px-4 py-3 bg-surface-container-low text-right text-xs font-bold text-on-surface-variant uppercase tracking-wider rounded-r-lg">Tạm tính</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant/20 bg-white">
                  {order.items.map((item) => {
                    const primaryImage = item.variant?.product?.images?.find(img => img.isPrimary) || item.variant?.product?.images?.[0];
                    const productImageUrl = primaryImage?.url || '/uploads/products/tat-da-min.jpg';
                    const unitPrice = item.priceAtPurchase || item.unitPrice || 0;
                    const lineTotal = unitPrice * item.quantity;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                              <img src={productImageUrl} alt={item.productName} className="object-cover w-full h-full" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-on-surface truncate max-w-[240px]">{item.productName}</div>
                              {item.variant?.sku && (
                                <div className="text-[10px] text-gray-400 font-mono">SKU: {item.variant.sku}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-xs text-on-surface-variant font-medium">
                          {item.variant ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-semibold border border-slate-200">
                              Màu: {item.variant.color} • Size: {item.variant.size}
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-xs text-on-surface-variant font-medium">
                          {unitPrice.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-xs text-on-surface font-bold">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-xs font-bold text-on-surface">
                          {lineTotal.toLocaleString('vi-VN')}đ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculations and Breakdown area */}
            <div className="flex flex-col sm:items-end pt-4 border-t border-slate-100 space-y-2.5">
              <div className="w-full sm:max-w-xs text-xs space-y-1.5 font-medium text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Tiền hàng:</span>
                  <span className="text-on-surface font-semibold">{order.subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Giảm giá {order.couponCode ? `(${order.couponCode})` : ''}:</span>
                    <span>-{order.discountAmount.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Phí vận chuyển:</span>
                  <span className="text-on-surface font-semibold">
                    {order.shippingFee === 0 ? 'Miễn phí' : `${order.shippingFee.toLocaleString('vi-VN')}đ`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-black text-on-surface">
                  <span>Thành tiền:</span>
                  <span className="text-primary text-base font-extrabold">{order.totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
