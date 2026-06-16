'use client';

import { useEffect, useState, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  CreditCard 
} from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';

interface MiniCartProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function MiniCart({ isOpen: propIsOpen, onClose: propOnClose }: MiniCartProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent Next.js hydration mismatch when reading persisted localStorage store
  useEffect(() => {
    setMounted(true);
  }, []);

  // Retrieve Zustand actions and states
  const storeItems = useCartStore((state) => state.items);
  const storeIsOpen = useCartStore((state) => state.isOpen);
  const storeCloseCart = useCartStore((state) => state.closeCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // Fallback to Zustand state if props are not explicitly provided
  const isOpen = propIsOpen !== undefined ? propIsOpen : storeIsOpen;
  const onClose = propOnClose !== undefined ? propOnClose : storeCloseCart;

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return storeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [storeItems]);

  // Don't render server-side to avoid hydration differences
  if (!mounted) return null;

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
      {/* 1. Backdrop Blur Overlay */}
      <div 
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 2. Slide-over Container Panel */}
      <div 
        className={`absolute top-0 right-0 h-full w-full sm:w-[420px] max-w-full bg-white shadow-2xl flex flex-col z-10 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        
        {/* Header Block */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-700">
              <ShoppingBag className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
                Giỏ hàng của bạn
              </h3>
              <p className="text-[10px] text-gray-400 font-medium">
                Bạn có <span className="text-brand-600 font-bold">{storeItems.length}</span> sản phẩm trong giỏ
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-950 transition-colors"
            aria-label="Đóng giỏ hàng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Cart Items or Empty State */}
        <div className="flex-1 overflow-y-auto px-6 py-2 divide-y divide-gray-100">
          {storeItems.length === 0 ? (
            /* Empty State Container */
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-5">
              <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center text-brand-500 animate-float">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-gray-900">Giỏ hàng đang trống</h4>
                <p className="text-xs text-gray-400 max-w-[260px] mx-auto leading-relaxed">
                  Hãy lấp đầy giỏ hàng của bạn bằng những sản phẩm tất vớ, bao tay và phụ kiện chất lượng từ Hoàng Hải Sneaker.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-brand-md text-xs font-bold transition shadow-xs hover:shadow-md"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            /* Active Items List */
            storeItems.map((item) => (
              <div key={item.id} className="py-5 flex gap-4 relative group">
                
                {/* Delete/Remove button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-5 right-0 p-1.5 rounded-full text-gray-300 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Xóa sản phẩm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Thumbnail Image Container */}
                <div className="w-20 h-24 bg-gray-50 border border-gray-100 rounded-brand-md overflow-hidden shrink-0 shadow-xs relative">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                  />
                </div>

                {/* Product Text & Adjustments Column */}
                <div className="flex-1 flex flex-col justify-between py-0.5 pr-6">
                  <div className="space-y-1">
                    {item.categoryName && (
                      <span className="text-[9px] font-black text-brand-600 uppercase tracking-widest block">
                        {item.categoryName}
                      </span>
                    )}
                    <h4 className="text-xs font-extrabold text-gray-800 line-clamp-2 hover:text-brand-600 transition leading-snug">
                      {item.name}
                    </h4>
                    
                    {/* Selected Variant Attributes */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="inline-flex items-center bg-gray-100 text-gray-600 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                        Màu: {item.color}
                      </span>
                      <span className="inline-flex items-center bg-gray-100 text-gray-600 text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                        Size: {item.size}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Actions & Item Sum Price */}
                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity selectors (+ / -) */}
                    <div className="flex items-center border border-gray-200 rounded-brand-md bg-white p-0.5 shadow-2xs">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1 hover:bg-gray-50 text-gray-500 disabled:text-gray-300 disabled:bg-transparent rounded-brand-sm transition-colors"
                        title="Giảm số lượng"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-black text-gray-800 min-w-5 text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="p-1 hover:bg-gray-50 text-gray-500 disabled:text-gray-300 disabled:bg-transparent rounded-brand-sm transition-colors"
                        title="Tăng số lượng"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price Value in VND */}
                    <div className="text-right">
                      <p className="text-xs font-black text-gray-950">
                        {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[9px] text-gray-400 font-bold">
                          {item.price.toLocaleString('vi-VN')} đ / cái
                        </p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer Area Block */}
        {storeItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/70 space-y-4">
            
            {/* Subtotal Calculation */}
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                  Tổng tiền tạm tính
                </span>
                <span className="text-[10px] text-brand-600 font-semibold mt-0.5 block">
                  Chưa bao gồm phí vận chuyển
                </span>
              </div>
              <span className="text-xl font-black text-brand-600 tracking-tight">
                {subtotal.toLocaleString('vi-VN')} đ
              </span>
            </div>

            {/* CTAs Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* View Cart Page Link */}
              <Link 
                href="/cart"
                onClick={onClose}
                className="py-3.5 px-4 border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 active:bg-gray-100 rounded-brand-md text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                Xem giỏ hàng
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              </Link>

              {/* Checkout Button */}
              <Link 
                href="/checkout"
                onClick={onClose}
                className="py-3.5 px-4 bg-gray-950 hover:bg-gray-900 active:bg-black text-white rounded-brand-md text-xs font-extrabold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <CreditCard className="w-3.5 h-3.5 text-gray-300" />
                Thanh toán
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
