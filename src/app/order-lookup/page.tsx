'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import StatusBadge from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/States';

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

export default function OrderLookupPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !phoneOrEmail) return;

    setLoading(true);
    setOrder(null);
    setError(null);

    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ orderNumber, phoneOrEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Tra cứu đơn hàng không thành công.');
      }

      setOrder(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi.');
    } finally {
      setLoading(false);
    }
  };

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
      <Breadcrumb items={[{ label: 'Tra cứu đơn hàng' }]} />
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Tra Cứu Đơn Hàng</h1>
        <p className="text-xs text-on-surface-variant/70 mt-1">
          Không cần đăng nhập. Nhập Mã Đơn Hàng và Email hoặc Số Điện Thoại để xem trạng thái đơn hàng hiện tại.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Search Panel Card */}
        <div className="bg-white border border-surface-variant/60 rounded-2xl p-6 shadow-xs space-y-5 lg:col-span-1">
          <h3 className="font-bold text-on-surface text-sm border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[20px]">search</span>
            Nhập thông tin tra cứu
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mã đơn hàng</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: ORD-20260605-0001"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="input-standard text-xs font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Số điện thoại hoặc Email</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: 0987654321 hoặc support@email.com"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                className="input-standard text-xs font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !orderNumber || !phoneOrEmail}
              className="w-full py-3 bg-primary hover:bg-primary-container text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[16px]">sync</span>
                  Đang truy vấn...
                </>
              ) : (
                'Tìm kiếm đơn hàng'
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-brand-md text-red-700 text-xs font-semibold flex items-start gap-2.5 shadow-sm animate-fadeIn">
              <span className="material-symbols-outlined text-red-500 text-[18px] shrink-0">error</span>
              <span className="text-[11px] leading-relaxed">{error}</span>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white border border-surface-variant/60 rounded-2xl p-12 text-center shadow-xs">
              <LoadingSpinner message="Đang truy vấn dữ liệu từ hệ thống..." />
            </div>
          ) : order ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Status Header */}
              <div className="bg-white border border-surface-variant/60 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Đã tìm thấy đơn hàng</span>
                  <h3 className="text-lg font-black text-on-surface">{order.orderNumber}</h3>
                  <p className="text-[11px] text-on-surface-variant/70">
                    Thời gian đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="flex flex-col gap-1 sm:items-end">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-on-surface-variant font-medium">Đơn hàng:</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs mt-1">
                    <span className="text-on-surface-variant font-medium">Thanh toán:</span>
                    <StatusBadge status={order.paymentStatus} />
                  </div>
                </div>
              </div>

              {/* Delivery and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-surface-variant/60 p-6 rounded-2xl shadow-xs space-y-3">
                  <h4 className="font-bold text-on-surface text-xs border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
                    Nơi giao nhận
                  </h4>
                  <div className="text-xs text-on-surface-variant space-y-1 font-medium">
                    <p className="font-bold text-on-surface text-xs">{order.shippingAddress.fullName}</p>
                    <p>SĐT: {order.shippingAddress.phone}</p>
                    <p>Địa chỉ: {order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}</p>
                  </div>
                </div>

                <div className="bg-white border border-surface-variant/60 p-6 rounded-2xl shadow-xs space-y-3">
                  <h4 className="font-bold text-on-surface text-xs border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">payments</span>
                    Thanh toán & Ghi chú
                  </h4>
                  <div className="text-xs text-on-surface-variant space-y-2 font-medium">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Hình thức</span>
                      <p className="text-on-surface font-bold text-xs">{getPaymentMethodLabel(order.paymentMethod)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">Ghi chú của bạn</span>
                      <p className="italic text-on-surface-variant/80">{order.notes || 'Không có ghi chú.'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white border border-surface-variant/60 rounded-2xl shadow-xs p-6 space-y-4">
                <h4 className="font-bold text-on-surface text-xs border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">shopping_bag</span>
                  Chi tiết sản phẩm
                </h4>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-surface-variant/30">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 bg-slate-50 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider rounded-l-lg">Sản phẩm</th>
                        <th className="px-4 py-2 bg-slate-50 text-center text-xs font-bold text-on-surface-variant uppercase tracking-wider">Màu & Size</th>
                        <th className="px-4 py-2 bg-slate-50 text-right text-xs font-bold text-on-surface-variant uppercase tracking-wider">Đơn giá</th>
                        <th className="px-4 py-2 bg-slate-50 text-center text-xs font-bold text-on-surface-variant uppercase tracking-wider">SL</th>
                        <th className="px-4 py-2 bg-slate-50 text-right text-xs font-bold text-on-surface-variant uppercase tracking-wider rounded-r-lg">Tạm tính</th>
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
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden border border-slate-200 shrink-0 flex items-center justify-center">
                                  <img src={productImageUrl} alt={item.productName} className="object-cover w-full h-full" />
                                </div>
                                <div className="text-xs font-bold text-on-surface truncate max-w-[180px]">{item.productName}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-xs text-on-surface-variant font-medium">
                              {item.variant ? (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-semibold border border-slate-200">
                                  {item.variant.color} • {item.variant.size}
                                </span>
                              ) : (
                                'N/A'
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-xs text-on-surface-variant font-medium">
                              {unitPrice.toLocaleString('vi-VN')}đ
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-xs text-on-surface font-bold">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-bold text-on-surface">
                              {lineTotal.toLocaleString('vi-VN')}đ
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Calculation breakdown */}
                <div className="flex flex-col sm:items-end pt-3 border-t border-slate-100 space-y-2">
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
          ) : (
            <div className="bg-white border border-surface-variant/60 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-4">
              <span className="material-symbols-outlined text-[48px] text-gray-300">receipt_long</span>
              <p className="text-xs text-on-surface-variant/70 max-w-sm leading-relaxed">
                Vui lòng điền thông tin bên trái để tra cứu tiến độ vận chuyển và thanh toán đơn hàng.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
