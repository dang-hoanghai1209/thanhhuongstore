'use client';

import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Tag, 
  TrendingUp, 
  ArrowRight,
  ClipboardList,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

interface TopSellerProduct {
  productId: string;
  name: string;
  quantitySold: number;
  imageUrl: string | null;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
}

interface AdminDashboardClientProps {
  stats: DashboardStats;
  topSellers: TopSellerProduct[];
}

export default function AdminDashboardClient({ stats, topSellers }: AdminDashboardClientProps) {
  const formatVND = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  // Find max quantity to compute percentage bar lengths
  const maxQty = topSellers.length > 0 ? Math.max(...topSellers.map(s => s.quantitySold)) : 100;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 translate-y-12 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Xin chào, Quản trị viên!</h2>
          <p className="text-white/80 text-sm max-w-lg">
            Chào mừng quay lại Thanh Hương Store Admin. Hệ thống đang vận hành kinh doanh thực tế ổn định. Dưới đây là báo cáo hiệu suất bán hàng tổng quan hôm nay.
          </p>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doanh thu thực nhận</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatVND(stats.totalRevenue)}</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng đơn hàng</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{stats.totalOrders} đơn</p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đơn hàng chờ xử lý</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{stats.pendingOrders} đơn</p>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng sản phẩm</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{stats.totalProducts} mã</p>
          </div>
        </div>
      </div>

      {/* Main dashboard splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Top Selling Products */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Xu Hướng & Top 5 Bán Chạy
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Xếp hạng theo tổng số lượng sản phẩm bán ra.</p>
            </div>
            <Link 
              href="/admin/products" 
              className="text-xs text-blue-600 font-semibold hover:underline inline-flex items-center gap-1 transition"
            >
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-5">
            {topSellers.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Chưa có số liệu xu hướng bán hàng.</p>
            ) : (
              topSellers.map((item, index) => {
                const percentage = maxQty > 0 ? (item.quantitySold / maxQty) * 100 : 0;
                
                return (
                  <div key={item.productId} className="flex items-center gap-4">
                    {/* Position Label */}
                    <span className={`w-6 text-center font-bold text-sm shrink-0 ${
                      index === 0 ? 'text-blue-600 text-base' : 'text-slate-400'
                    }`}>
                      #{index + 1}
                    </span>

                    {/* Image Preview */}
                    <div className="w-12 h-12 rounded-lg border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-slate-300" />
                      )}
                    </div>

                    {/* Name and Progress bar */}
                    <div className="flex-grow min-w-0 space-y-1.5">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-sm font-bold text-slate-800 truncate" title={item.name}>
                          {item.name}
                        </span>
                        <span className="text-xs font-bold text-slate-500 shrink-0">
                          {item.quantitySold} sản phẩm
                        </span>
                      </div>
                      
                      {/* Percent progress indicator */}
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Quick Navigation and Operational Shortcuts */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              Lối Tắt Vận Hành
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Truy cập nhanh các phân hệ admin quan trọng.</p>
          </div>

          <div className="space-y-3">
            <Link 
              href="/admin/orders" 
              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition">Quản lý Đơn hàng</span>
                  <p className="text-xs text-slate-400 mt-0.5">{stats.pendingOrders} đơn hàng chờ</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
            </Link>

            <Link 
              href="/admin/products" 
              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition">Kho Sản phẩm</span>
                  <p className="text-xs text-slate-400 mt-0.5">{stats.totalProducts} phân loại hàng</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
            </Link>

            <Link 
              href="/admin/customers" 
              className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition">Khách hàng</span>
                  <p className="text-xs text-slate-400 mt-0.5">Hồ sơ sỉ & lẻ đại lý</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
