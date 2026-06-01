'use client';

import { CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center py-20 px-4">
      {/* Outer Card Container */}
      <div className="max-w-md w-full bg-white border border-gray-100 p-8 sm:p-10 rounded-brand-lg shadow-sm text-center space-y-6">
        
        {/* Animated Checkmark Circle */}
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 animate-pulse" />
        </div>

        {/* Text Title & Confirmation message */}
        <div className="space-y-2">
          <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest block">Thanh Hương Store</span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">Đặt Hàng Thành Công!</h1>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
            Cảm ơn bạn đã tin tưởng lựa chọn sản phẩm từ chúng tôi. Đơn hàng của bạn đã được ghi nhận thành công trên hệ thống.
          </p>
        </div>

        {/* Process Next Info Box */}
        <div className="bg-gray-50 p-4 border border-gray-100 rounded-brand-md text-left text-xs text-gray-500 space-y-2.5">
          <p className="font-bold text-gray-800 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-accent-pink fill-accent-pink" />
            Các bước tiếp theo:
          </p>
          <p className="pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-brand-500 leading-normal">
            Nhân viên hỗ trợ sẽ liên hệ trực tiếp với bạn qua số điện thoại để xác nhận thông tin đơn hàng.
          </p>
          <p className="pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-brand-500 leading-normal">
            Sau khi xác nhận, đơn hàng sẽ được bàn giao cho đơn vị vận chuyển sớm nhất.
          </p>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
          <ShieldCheck className="w-4 h-4 text-brand-500" />
          Mọi thông tin đơn hàng đều được bảo mật an toàn
        </div>

        {/* Action Button Links */}
        <div className="pt-2">
          <Link 
            href="/"
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-850 text-white rounded-brand-md text-xs font-black uppercase tracking-wider transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Tiếp tục mua sắm
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </main>
  );
}
