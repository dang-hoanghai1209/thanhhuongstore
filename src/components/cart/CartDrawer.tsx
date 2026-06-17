'use client';

import { useState, useMemo } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Lock 
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MockCartItem {
  id: string;
  name: string;
  categoryName: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stock: number;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  // Mock data containing 2 premium products to review the UI
  const [items, setItems] = useState<MockCartItem[]>([
    {
      id: "mock1",
      name: "Vớ Cổ Ngắn Cotton Premium Thấm Hút",
      categoryName: "Vớ Thời Trang",
      size: "M",
      color: "Trắng",
      price: 45000,
      quantity: 2,
      imageUrl: "/uploads/products/tat-da-min.jpg",
      stock: 10
    },
    {
      id: "mock2",
      name: "Bikini Thun Ý Hai Mảnh Tropical",
      categoryName: "Bikini Nữ",
      size: "S",
      color: "Hồng Neon",
      price: 290000,
      quantity: 1,
      imageUrl: "/uploads/products/tat-bong-999.jpg",
      stock: 5
    }
  ]);

  // Adjust item quantity
  const handleQtyChange = (id: string, action: 'inc' | 'dec') => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = action === 'inc' ? item.quantity + 1 : item.quantity - 1;
        if (newQty > 0 && newQty <= item.stock) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  // Delete item
  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  // If the drawer is closed, render nothing
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* 1. Backdrop Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
      />

      {/* 2. Slide-over Side Drawer Panel */}
      <div className="relative w-96 max-w-full bg-white h-full shadow-2xl flex flex-col z-10 animate-slideRight">
        
        {/* Header Block */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
              Giỏ hàng của bạn
            </h3>
            <span className="bg-brand-50 text-brand-600 text-[10px] font-black px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition"
            title="Đóng giỏ hàng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LIST ITEM LAYER OR EMPTY STATE */}
        <div className="flex-1 overflow-y-auto px-6 divide-y divide-gray-100">
          {items.length === 0 ? (
            /* Empty State View */
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-10">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 shadow-inner animate-float">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-700">Giỏ hàng đang trống</h4>
                <p className="text-xs text-gray-400 max-w-[200px] mx-auto leading-relaxed">
                  Bạn chưa có sản phẩm nào trong giỏ hàng.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-brand-md text-xs font-bold transition shadow"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            /* Items List View */
            items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 items-center relative group">
                
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-4 right-0 p-1 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                  title="Xóa món"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Product Thumbnail */}
                <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-brand-md overflow-hidden shrink-0">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Product Content Details */}
                <div className="flex-1 min-w-0 pr-6 space-y-1.5">
                  <span className="text-[9px] font-bold text-brand-600 uppercase tracking-wider block">
                    {item.categoryName}
                  </span>
                  <h4 className="text-xs font-bold text-gray-800 line-clamp-1 hover:text-brand-600 transition">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-semibold block">
                    Màu: {item.color} / Size {item.size}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-1.5">
                    {/* Quantity selectors */}
                    <div className="flex items-center border border-gray-100 rounded-brand-md bg-white p-0.5">
                      <button 
                        onClick={() => handleQtyChange(item.id, 'dec')}
                        disabled={item.quantity <= 1}
                        className="p-0.5 hover:bg-gray-50 rounded disabled:opacity-20 transition"
                      >
                        <Minus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="px-2 text-[10px] font-bold text-gray-800 min-w-4 text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => handleQtyChange(item.id, 'inc')}
                        disabled={item.quantity >= item.stock}
                        className="p-0.5 hover:bg-gray-50 rounded disabled:opacity-20 transition"
                      >
                        <Plus className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>

                    {/* Cost of item */}
                    <span className="text-xs font-black text-gray-800">
                      {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer Area */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
            {/* Total display */}
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-500 uppercase tracking-wide">Tạm tính:</span>
              <span className="text-lg font-black text-brand-600">
                {subtotal.toLocaleString('vi-VN')} đ
              </span>
            </div>

            {/* CTAs buttons */}
            <div className="space-y-2.5">
              {/* Checkout Button */}
              <a 
                href="/checkout"
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-brand-md text-xs font-bold transition shadow hover:shadow-md flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                Tiến hành thanh toán
              </a>

              {/* View Cart Page Link */}
              <a 
                href="/cart"
                className="w-full py-3.5 border border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:text-gray-900 rounded-brand-md text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                Xem chi tiết giỏ hàng
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
