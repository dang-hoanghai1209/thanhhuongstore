'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Tag, 
  TrendingUp, 
  ArrowRight,
  ClipboardList,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  Loader2,
  BarChart2,
  AlertCircle,
  RefreshCw,
  Users
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

interface NewOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  sku: string;
}

interface RevenueItem {
  date: string;
  amount: number;
}

interface AnalyticsData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
  };
  recentOrders: NewOrder[];
  lowStockProducts: LowStockProduct[];
  ordersByStatus: Array<{ status: string; count: number }>;
  orderStatusBreakdown: Record<string, number>;
  revenueByDay: RevenueItem[];
}

interface AdminDashboardClientProps {
  stats: DashboardStats;
  topSellers: TopSellerProduct[];
}

const toSafeNumber = (value: unknown) => {
  const numberValue = Number(value ?? 0);

  return Number.isFinite(numberValue) ? numberValue : 0;
};

const toSafeText = (value: unknown, fallback = '') => {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
};

const createFallbackId = (prefix: string, index: number) => `${prefix}-${index}`;

const normalizeAnalyticsData = (payload: any): AnalyticsData => {
  const summarySource = payload?.summary ?? payload?.overview ?? payload ?? {};
  const rawRevenue = Array.isArray(payload?.revenueByDay)
    ? payload.revenueByDay
    : Array.isArray(payload?.revenueByDate)
      ? payload.revenueByDate
      : Array.isArray(payload?.recentRevenue)
        ? payload.recentRevenue
        : [];
  const rawOrders = Array.isArray(payload?.recentOrders)
    ? payload.recentOrders
    : Array.isArray(payload?.newOrders)
      ? payload.newOrders
      : [];
  const rawLowStock = Array.isArray(payload?.lowStockProducts) ? payload.lowStockProducts : [];
  const rawOrdersByStatus = payload?.ordersByStatus;
  const ordersByStatus = Array.isArray(rawOrdersByStatus)
    ? rawOrdersByStatus.map((item: any) => ({
        status: toSafeText(item?.status, 'UNKNOWN'),
        count: toSafeNumber(item?.count ?? item?._count),
      }))
    : Object.entries(
        rawOrdersByStatus && typeof rawOrdersByStatus === 'object'
          ? rawOrdersByStatus
          : payload?.orderStatusBreakdown && typeof payload.orderStatusBreakdown === 'object'
            ? payload.orderStatusBreakdown
            : {},
      ).map(([status, count]) => ({
        status,
        count: toSafeNumber(count),
      }));

  return {
    summary: {
      totalRevenue: toSafeNumber(summarySource.totalRevenue),
      totalOrders: toSafeNumber(summarySource.totalOrders),
      totalCustomers: toSafeNumber(summarySource.totalCustomers),
      totalProducts: toSafeNumber(summarySource.totalProducts),
    },
    recentOrders: rawOrders.map((order: any, index: number) => ({
      id: toSafeText(order?.id, createFallbackId('order', index)),
      orderNumber: toSafeText(order?.orderNumber, order?.id ?? ''),
      customerName: toSafeText(order?.customerName, 'Khach hang'),
      totalAmount: toSafeNumber(order?.totalAmount),
      status: toSafeText(order?.status, 'PENDING'),
      createdAt: toSafeText(order?.createdAt),
    })),
    lowStockProducts: rawLowStock.map((product: any, index: number) => ({
      id: toSafeText(product?.id ?? product?.variantId ?? product?.productId, createFallbackId('stock', index)),
      name: toSafeText(product?.name ?? product?.productName, 'San pham'),
      stock: toSafeNumber(product?.stock),
      sku: toSafeText(product?.sku, 'N/A'),
    })),
    ordersByStatus,
    orderStatusBreakdown: Object.fromEntries(
      ordersByStatus.map((item) => [item.status, item.count]),
    ),
    revenueByDay: rawRevenue.map((item: any) => ({
      date: toSafeText(item?.date),
      amount: toSafeNumber(item?.amount ?? item?.revenue),
    })),
  };
};

export default function AdminDashboardClient({ stats, topSellers }: AdminDashboardClientProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatVND = (value: unknown) => {
    return toSafeNumber(value).toLocaleString('vi-VN') + ' đ';
  };

  const formatNumber = (value: unknown) => {
    return toSafeNumber(value).toLocaleString('vi-VN');
  };

  const getStatusLabel = (status: string) => {
    const normalizedStatus = toSafeText(status, 'UNKNOWN').toUpperCase();

    switch (normalizedStatus) {
      case 'PENDING': return 'Chờ xử lý';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'SHIPPING': return 'Đang giao';
      case 'DELIVERED':
      case 'COMPLETED': return 'Đã giao';
      case 'CANCELLED': return 'Đã hủy';
      default: return normalizedStatus;
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = toSafeText(status, 'UNKNOWN').toUpperCase();

    switch (normalizedStatus) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SHIPPING': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DELIVERED':
      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/analytics');
      if (!res.ok) {
        const errText = await res.json().catch(() => ({}));
        throw new Error(errText.error || `Mã lỗi HTTP: ${res.status}`);
      }
      const json = await res.json();
      setData(normalizeAnalyticsData(json));
    } catch (err: any) {
      console.error('Fetch analytics error:', err);
      setError(err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const safeStats = {
    totalRevenue: toSafeNumber(stats?.totalRevenue),
    totalOrders: toSafeNumber(stats?.totalOrders),
    pendingOrders: toSafeNumber(stats?.pendingOrders),
    totalProducts: toSafeNumber(stats?.totalProducts),
  };
  const safeTopSellers = Array.isArray(topSellers)
    ? topSellers.map((seller, index) => ({
        productId: toSafeText(seller?.productId, createFallbackId('seller', index)),
        name: toSafeText(seller?.name, 'San pham'),
        quantitySold: toSafeNumber(seller?.quantitySold),
        imageUrl: seller?.imageUrl ?? null,
      }))
    : [];
  const maxQty = Math.max(...safeTopSellers.map((seller) => seller.quantitySold), 1);

  // Render Loading Skeletal State
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Welcome Banner Skeleton */}
        <div className="bg-slate-100 rounded-3xl h-36" />

        {/* Stats Summary Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 p-6 rounded-2xl h-24" />
          ))}
        </div>

        {/* Main splits Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl h-64" />
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl h-64" />
          </div>
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl h-80" />
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl h-80" />
          </div>
        </div>
      </div>
    );
  }

  // Determine actual metrics to display
  // Use loaded API data if successful, otherwise fallback to server-side queried stats props
  const displayRevenue = data ? data.summary.totalRevenue : safeStats.totalRevenue;
  const displayOrders = data ? data.summary.totalOrders : safeStats.totalOrders;
  const displayProducts = data ? data.summary.totalProducts : safeStats.totalProducts;
  const displayCustomers = data ? data.summary.totalCustomers : null; // null triggers fallback on API error

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 translate-y-12 w-48 h-48 bg-white/5 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Xin chào, Quản trị viên!</h2>
          <p className="text-white/80 text-sm max-w-lg">
            Chào mừng quay lại Thanh Hương Store Admin. Dưới đây là báo cáo hiệu suất bán hàng tổng quan hôm nay.
          </p>
        </div>
      </div>

      {/* Error Alert Box - Graceful and non-crashing */}
      {error && (
        <div className="bg-red-50 border border-red-200/80 rounded-2xl p-5 flex items-start gap-4 text-red-800 shadow-sm animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-grow">
            <h4 className="font-bold text-sm">Không thể kết nối API Báo cáo Phân tích</h4>
            <p className="text-xs text-red-700">
              Chi tiết: {error}. Tính năng nâng cao như biểu đồ doanh thu, thống kê tồn kho thấp và đơn hàng mới hiện không khả dụng. Bạn vẫn có thể theo dõi số liệu cơ bản dưới đây.
            </p>
            <button
              onClick={fetchAnalytics}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-xl transition mt-1"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-pulse" /> Thử lại
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doanh thu thực nhận</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatVND(displayRevenue)}</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng đơn hàng</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatNumber(displayOrders)} đơn</p>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Khách hàng</p>
            <p className="text-xl font-bold text-slate-800 mt-1">
              {displayCustomers !== null ? `${formatNumber(displayCustomers)} khách` : 'Chờ API...'}
            </p>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng sản phẩm</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatNumber(displayProducts)} mã</p>
          </div>
        </div>
      </div>

      {/* Main dashboard content splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Data Analytics Panels */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 1. Recent Revenue Chart (if success and has data) */}
          {data && data.revenueByDay.length > 0 && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-blue-500" />
                  Doanh Thu Gần Đây
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Biểu đồ tổng hợp doanh thu theo ngày gần nhất.</p>
              </div>

              {/* Bar Chart Representation */}
              <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
                {(() => {
                  const maxAmt = Math.max(...data.revenueByDay.map(r => r.amount), 1);
                  return data.revenueByDay.map((item, idx) => {
                    const pct = (item.amount / maxAmt) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <div className="w-full relative flex justify-center items-end h-full">
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-sm">
                            {formatVND(item.amount)}
                          </div>
                          {/* Chart Bar */}
                          <div 
                            className="w-full sm:w-2/3 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t-md hover:from-blue-600 hover:to-indigo-600 transition-all duration-300"
                            style={{ height: `${Math.max(pct, 4)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 truncate w-full text-center">
                          {item.date}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* 2. Order Status Breakdown (if success) */}
          {data && Object.keys(data.orderStatusBreakdown).length > 0 && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Phân Bổ Trạng Thái Đơn Hàng
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Thống kê tỷ lệ phân bổ các đơn hàng trong hệ thống.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(() => {
                  const breakdown = data.orderStatusBreakdown;
                  const total = Object.values(breakdown).reduce((a, b) => a + toSafeNumber(b), 0) || 1;
                  return Object.entries(breakdown).map(([status, count]) => {
                    const safeCount = toSafeNumber(count);
                    const pct = Math.round((safeCount / total) * 100);
                    return (
                      <div key={status} className="border border-slate-105 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
                            {getStatusLabel(status)}
                          </span>
                          <span className="text-xs font-bold text-slate-500">{formatNumber(safeCount)} đơn ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${pct}%`,
                              backgroundColor: status === 'PENDING' ? '#f59e0b' : 
                                              status === 'CONFIRMED' ? '#3b82f6' :
                                              status === 'SHIPPING' ? '#a855f7' :
                                              status === 'DELIVERED' || status === 'COMPLETED' ? '#22c55e' : '#ef4444'
                            }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* 3. Fallback View: Render Best Sellers if API is in fallback/error state */}
          {(!data || error) && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Xu Hướng & Top 5 Bán Chạy (Số liệu Cơ bản)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Xếp hạng theo số lượng bán ra tổng hợp từ database.</p>
                </div>
                <Link 
                  href="/admin/products" 
                  className="text-xs text-blue-600 font-semibold hover:underline inline-flex items-center gap-1 transition"
                >
                  Quản lý kho <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-5">
                {safeTopSellers.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">Chưa có số liệu xu hướng bán hàng.</p>
                ) : (
                  safeTopSellers.map((item, index) => {
                    const percentage = maxQty > 0 ? (item.quantitySold / maxQty) * 100 : 0;
                    
                    return (
                      <div key={item.productId} className="flex items-center gap-4">
                        <span className={`w-6 text-center font-bold text-sm shrink-0 ${
                          index === 0 ? 'text-blue-600 text-base' : 'text-slate-400'
                        }`}>
                          #{index + 1}
                        </span>

                        <div className="w-12 h-12 rounded-lg border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-slate-300" />
                          )}
                        </div>

                        <div className="flex-grow min-w-0 space-y-1.5">
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="text-sm font-bold text-slate-800 truncate" title={item.name}>
                              {item.name}
                            </span>
                            <span className="text-xs font-bold text-slate-500 shrink-0">
                              {formatNumber(item.quantitySold)} sản phẩm
                            </span>
                          </div>
                          
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
          )}

        </div>

        {/* RIGHT COLUMN: Action & List Widgets */}
        <div className="space-y-8">
          
          {/* 1. New Orders (if success) */}
          {data && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Đơn Hàng Mới
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Danh sách các đơn hàng vừa tạo trong hệ thống.</p>
              </div>

              <div className="space-y-4">
                {data.recentOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Không có đơn hàng mới nào.</p>
                ) : (
                  data.recentOrders.map(order => (
                    <div key={order.id} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{order.orderNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{order.customerName}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-800 shrink-0">{formatVND(order.totalAmount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 2. Low Stock Products (if success) */}
          {data && (
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Tồn Kho Thấp
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Cảnh báo các mặt hàng sắp hết tồn kho.</p>
              </div>

              <div className="space-y-4">
                {data.lowStockProducts.length === 0 ? (
                  <p className="text-xs text-green-600 font-medium text-center py-4 bg-green-50 rounded-xl">
                    ✓ Tất cả sản phẩm đều đủ hàng tồn kho.
                  </p>
                ) : (
                  data.lowStockProducts.map(prod => (
                    <div key={prod.id} className="flex justify-between items-center gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate" title={prod.name}>{prod.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{prod.sku}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
                        prod.stock === 0 ? 'bg-red-100 text-red-800' :
                        prod.stock <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Còn {formatNumber(prod.stock)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 3. Lối Tắt Vận Hành (Always visible) */}
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
                    <p className="text-xs text-slate-400 mt-0.5">{formatNumber(safeStats.pendingOrders)} đơn hàng chờ</p>
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
                    <p className="text-xs text-slate-400 mt-0.5">{formatNumber(safeStats.totalProducts)} phân loại hàng</p>
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
    </div>
  );
}
