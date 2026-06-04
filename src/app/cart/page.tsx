'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Ticket,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { EmptyState, LoadingSpinner } from '@/components/ui/States';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Quantity Change
  const updateQty = (id: string, action: 'inc' | 'dec') => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;
    const newQty = action === 'inc' ? item.quantity + 1 : item.quantity - 1;
    if (newQty > 0 && newQty <= item.stock) {
      updateQuantity(id, newQty);
    }
  };

  // Delete Item
  const deleteItem = (id: string) => {
    removeItem(id);
  };

  // Calculate Subtotal (Decimal Arithmetic ready)
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  // Apply Coupon Logic
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponCode.trim().toUpperCase();

    if (!code) return;

    if (code === 'STORE10') {
      setAppliedCoupon({ code: 'STORE10', discount: 10 }); // 10% discount
      setCouponCode('');
    } else if (code === 'FREESHIP') {
      setAppliedCoupon({ code: 'FREESHIP', discount: 30000 }); // Fixed 30k discount
      setCouponCode('');
    } else {
      setCouponError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }
  };

  // Calculate discount amount
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.code === 'STORE10') {
      return Math.round(subtotal * 0.1);
    }
    if (appliedCoupon.code === 'FREESHIP') {
      return appliedCoupon.discount;
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  // Total
  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  // LOADING / HYDRATION STATE
  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center py-20 px-4">
        <LoadingSpinner message="Đang tải giỏ hàng..." />
      </main>
    );
  }

  // EMPTY STATE RENDER
  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center py-20 px-4 text-center">
        <EmptyState
          title="Giỏ hàng của bạn đang trống"
          description="Có vẻ như bạn chưa chọn được sản phẩm ưng ý. Hãy quay lại cửa hàng để tiếp tục chọn sắm nhé!"
          icon={<ShoppingBag className="w-8 h-8 text-gray-400" />}
          actionLabel="Tiếp tục mua sắm"
          actionHref="/products"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-gray-900 pb-24 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <Breadcrumb items={[{ label: 'Giỏ hàng' }]} />

        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
          Giỏ Hàng Của Bạn <span className="text-gray-400 text-lg font-normal">({cartItems.length} sản phẩm)</span>
        </h1>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

          {/* LEFT COLUMN: LIST OF PRODUCTS (70% on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-brand-lg border border-gray-100 shadow-xs flex gap-4 items-center relative group"
              >
                {/* Delete button (trash icon) */}
                <button
                  onClick={() => deleteItem(item.id)}
                  className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition duration-200"
                  title="Xóa sản phẩm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Product Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 border border-gray-100 rounded-brand-md overflow-hidden shrink-0">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover object-center" />
                </div>

                {/* Product details */}
                <div className="flex-1 min-w-0 pr-8 space-y-2 sm:space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wide">
                      {item.categoryName}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 hover:text-brand-600 transition">
                      <a href="/products">{item.name}</a>
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-bold">
                      Phân loại: {item.color} / Size {item.size}
                    </p>
                  </div>

                  {/* Quantity and Price alignment */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Plus/Minus Quantity selector */}
                    <div className="flex items-center border border-gray-200 rounded-brand-md bg-white p-0.5">
                      <button
                        onClick={() => updateQty(item.id, 'dec')}
                        disabled={item.quantity <= 1}
                        className="p-1 hover:bg-gray-50 rounded disabled:opacity-20 transition"
                      >
                        <Minus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      <span className="px-3 text-xs font-bold text-gray-800 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 'inc')}
                        disabled={item.quantity >= item.stock}
                        className="p-1 hover:bg-gray-50 rounded disabled:opacity-20 transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-gray-600" />
                      </button>
                    </div>

                    {/* Pricing */}
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-medium">Đơn giá: {item.price.toLocaleString('vi-VN')} đ</p>
                      <p className="text-xs sm:text-sm font-extrabold text-gray-800 mt-0.5">
                        Thành tiền: {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY & CHECKOUT BUTTON (30%) */}
          <div className="space-y-6 lg:sticky lg:top-8">

            {/* Sticky summary box */}
            <div className="bg-white p-6 rounded-brand-lg border border-gray-100 shadow-xs space-y-6">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider pb-3 border-b border-gray-100">
                Tóm tắt đơn hàng
              </h3>

              {/* Price Breakdown */}
              <div className="space-y-3.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Tạm tính</span>
                  <span className="font-bold text-gray-800">{subtotal.toLocaleString('vi-VN')} đ</span>
                </div>

                <div className="flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    Phí vận chuyển
                    <Truck className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                  <span className="font-semibold text-brand-600">Chưa tính</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-xs text-emerald-600 bg-emerald-50 px-2 py-1.5 rounded">
                    <span className="font-semibold">Mã giảm ({appliedCoupon.code})</span>
                    <span className="font-extrabold">-{discountAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
                  <span className="text-xs font-bold text-gray-800">Tổng cộng</span>
                  <span className="text-2xl font-black text-brand-600">
                    {totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2 border-t border-gray-100/60">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Áp dụng mã giảm giá (Bán lẻ)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Mã giảm giá..."
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-brand-md text-xs font-bold focus:outline-none focus:ring-1 focus:ring-brand-500 uppercase placeholder:normal-case"
                    />
                    <Ticket className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-brand-md text-xs font-bold transition shrink-0"
                  >
                    Áp dụng
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-red-500 font-bold mt-1">{couponError}</p>}

                {/* Hints for testing */}
                <div className="text-[9px] text-gray-400 space-y-0.5 leading-relaxed pt-1">
                  <p>💡 Mã thử nghiệm:</p>
                  <p>• <span className="font-bold text-gray-500">Thanh Hương StoreSTORE10</span>: Giảm 10% tổng đơn lẻ</p>
                  <p>• <span className="font-bold text-gray-500">FREESHIP</span>: Giảm 30,000đ vận chuyển</p>
                </div>
              </form>

              {/* Secure badge */}
              <div className="pt-2 border-t border-gray-100/60 flex items-center justify-center gap-2 text-[10px] text-gray-400">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                Thanh toán an toàn, bảo mật thông tin
              </div>

              {/* Checkout Button */}
              <a
                href="/checkout"
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-brand-md text-xs font-bold transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                Tiến hành thanh toán
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Free shipping progress alert */}
            {subtotal < 500000 && (
              <div className="p-4 bg-brand-50 border border-brand-100 rounded-brand-lg text-xs text-brand-700 leading-relaxed">
                <span className="font-bold">Ưu đãi Free Ship:</span> Mua thêm <span className="font-bold">{(500000 - subtotal).toLocaleString('vi-VN')} đ</span> để được miễn phí vận chuyển toàn quốc (Đơn từ 500,000đ).
              </div>
            )}
            {subtotal >= 500000 && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-brand-lg text-xs text-emerald-700 leading-relaxed flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Chúc mừng! Đơn hàng của bạn đủ điều kiện **Miễn phí vận chuyển toàn quốc**.</span>
              </div>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}
