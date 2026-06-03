'use client';

import React from 'react';
import { User, ClipboardList, MapPin, Heart } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Hồ Sơ Của Bạn</h1>
        <p className="text-xs text-gray-500 mt-1">Quản lý thông tin tài khoản cá nhân, địa chỉ và lịch sử giao dịch.</p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white border border-gray-100 p-6 rounded-brand-lg shadow-xs flex flex-col sm:flex-row items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
          <User className="w-8 h-8" />
        </div>
        <div className="text-center sm:text-left space-y-1">
          <h3 className="font-bold text-gray-800 text-lg">Khách Hàng</h3>
          <p className="text-xs text-gray-400">Tài khoản mua lẻ (B2C) • Thành viên thân thiết</p>
        </div>
      </div>

      {/* Navigation Sub-sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          href="/account/orders" 
          className="bg-white p-5 rounded-brand-lg border border-gray-100 hover:border-brand-100 hover:bg-brand-50/10 transition shadow-2xs group space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 group-hover:text-brand-600 transition">Đơn Hàng Của Bạn</h4>
            <p className="text-[11px] text-gray-400 mt-1">Theo dõi đơn hàng đang vận chuyển & lịch sử mua sắm.</p>
          </div>
        </Link>

        <Link 
          href="/account/addresses" 
          className="bg-white p-5 rounded-brand-lg border border-gray-100 hover:border-brand-100 hover:bg-brand-50/10 transition shadow-2xs group space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 group-hover:text-brand-600 transition">Sổ Địa Chỉ</h4>
            <p className="text-[11px] text-gray-400 mt-1">Cấu hình địa chỉ nhận hàng mặc định cho thanh toán nhanh.</p>
          </div>
        </Link>

        <Link 
          href="/account/wishlist" 
          className="bg-white p-5 rounded-brand-lg border border-gray-100 hover:border-brand-100 hover:bg-brand-50/10 transition shadow-2xs group space-y-3"
        >
          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800 group-hover:text-brand-600 transition">Yêu Thích</h4>
            <p className="text-[11px] text-gray-400 mt-1">Danh sách lưu trữ các sản phẩm bạn đang quan tâm.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}