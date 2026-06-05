'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  DollarSign,
  ShoppingBag,
  Users,
  Tag,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Download,
  Clock,
  ChevronRight,
  Info
} from 'lucide-react';

interface SummaryData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

interface OrderStatusItem {
  status: string;
  count: number;
}

interface RevenueItem {
  date: string;
  revenue: number;
}

interface LowStockItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  sku: string;
  size: string;
  color: string;
  stock: number;
  retailPrice: number;
}

interface RecentOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  phoneNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  itemCount: number;
}

interface AnalyticsData {
  range: string;
  summary: SummaryData;
  ordersByStatus: OrderStatusItem[];
  revenueByDay: RevenueItem[];
  lowStockProducts: LowStockItem[];
  recentOrders: RecentOrderItem[];
}

export default function AnalyticsClient() {
  const [range, setRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/analytics?range=${range}`);
      if (!res.ok) {
        throw new Error(`Mã lỗi HTTP: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Fetch analytics error:', err);
      setError(err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const formatVND = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString('vi-VN');
  };

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'Chờ xử lý';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'PROCESSING': return 'Đang xử lý';
      case 'SHIPPING': return 'Đang giao';
      case 'DELIVERED':
      case 'COMPLETED': return 'Đã giao';
      case 'CANCELLED': return 'Đã hủy';
      case 'REFUNDED': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMED':
      case 'PROCESSING': return 'bg-primary/5 text-primary border-primary/20';
      case 'SHIPPING': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DELIVERED':
      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleExportCSV = () => {
    if (!data || data.revenueByDay.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'Ngày,Doanh thu (VNĐ)\r\n';

    data.revenueByDay.forEach((item) => {
      csvContent += `${item.date},${item.revenue}\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `thanh_huong_doanh_thu_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Báo Cáo Thống Kê</h1>
          <p className="text-sm text-slate-500 mt-1">Phân tích hiệu suất bán hàng, biểu đồ doanh thu và quản lý hàng tồn kho.</p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex bg-white p-1 border border-slate-200 rounded-xl shadow-2xs">
            {(['7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition select-none ${
                  range === r
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {r === '7d' ? '7 ngày' : r === '30d' ? '30 ngày' : 'Tất cả'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition"
            title="Tải lại báo cáo"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-slate-500">Đang tổng hợp dữ liệu báo cáo...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 bg-red-50/50 border border-red-200 rounded-2xl text-center p-6 space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-500 animate-bounce" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800">Không thể tải báo cáo</h3>
            <p className="text-sm text-slate-600">Đã xảy ra lỗi: {error}</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
          >
            Thử lại
          </button>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doanh thu đạt được</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{formatVND(data.summary.totalRevenue)}</p>
              </div>
            </div>

            {/* Orders */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng đơn hàng</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{formatNumber(data.summary.totalOrders)} đơn</p>
              </div>
            </div>

            {/* Customers */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Khách hàng mới</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{formatNumber(data.summary.totalCustomers)} khách</p>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sản phẩm đang bán</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{formatNumber(data.summary.totalProducts)} mã</p>
              </div>
            </div>
          </div>

          {/* Revenue Chart Section */}
          {data.revenueByDay.length > 0 ? (
            <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-primary" />
                    Biểu đồ Doanh Thu Theo Ngày
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Biểu diễn dòng doanh thu thu được theo chu kỳ đã chọn.</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5" /> Xuất dữ liệu (.csv)
                </button>
              </div>

              {/* Custom SVG Bar Chart */}
              <div className="h-64 flex items-end justify-between gap-1.5 pt-6 px-2 border-b border-slate-100 pb-2 overflow-x-auto min-w-[300px]">
                {(() => {
                  const maxAmt = Math.max(...data.revenueByDay.map((r) => r.revenue), 1);
                  return data.revenueByDay.map((item, idx) => {
                    const heightPct = (item.revenue / maxAmt) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end min-w-[28px] max-w-[50px]">
                        <div className="w-full relative flex justify-center items-end h-[85%]">
                          {/* Hover Tooltip */}
                          <div className="absolute bottom-full mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-md">
                            {formatVND(item.revenue)}
                          </div>
                          {/* Column bar */}
                          <div
                            className="w-full bg-gradient-to-t from-primary to-primary-container rounded-t-md hover:from-blue-600 hover:to-blue-500 transition-all duration-300 shadow-3xs"
                            style={{ height: `${Math.max(heightPct, 4)}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 truncate w-full text-center">
                          {item.date.split('-').slice(1).join('/')}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm text-center text-slate-400 py-16">
              Không có dữ liệu doanh thu trong chu kỳ này.
            </div>
          )}

          {/* Breakdown grids */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT: Order Status breakdown */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Phân Bổ Trạng Thái Đơn Hàng</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tỷ lệ các loại trạng thái đơn hàng trong kỳ.</p>
              </div>

              <div className="space-y-4">
                {data.ordersByStatus.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Không có dữ liệu đơn hàng.</p>
                ) : (
                  (() => {
                    const total = data.ordersByStatus.reduce((acc, curr) => acc + curr.count, 0) || 1;
                    return data.ordersByStatus.map((item) => {
                      const percentage = Math.round((item.count / total) * 100);
                      
                      return (
                        <div key={item.status} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(item.status)}`}>
                              {getStatusLabel(item.status)}
                            </span>
                            <span className="font-bold text-slate-600">
                              {item.count} đơn ({percentage}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor:
                                  item.status === 'PENDING' ? '#f59e0b' :
                                  item.status === 'CONFIRMED' || item.status === 'PROCESSING' ? '#3b82f6' :
                                  item.status === 'SHIPPING' ? '#a855f7' :
                                  item.status === 'DELIVERED' || item.status === 'COMPLETED' ? '#10b981' : '#ef4444'
                              }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()
                )}
              </div>
            </div>

            {/* MIDDLE: Low Stock alerts */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Cảnh Báo Tồn Kho Thấp</h3>
                <p className="text-xs text-slate-400 mt-0.5">Các biến thể sản phẩm sắp hết hàng.</p>
              </div>

              <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                {data.lowStockProducts.length === 0 ? (
                  <p className="text-xs text-green-600 font-semibold text-center py-6 bg-green-50 rounded-xl border border-green-100 flex items-center justify-center gap-1">
                    ✓ Hàng tồn kho đầy đủ.
                  </p>
                ) : (
                  data.lowStockProducts.map((prod) => (
                    <div key={prod.variantId} className="flex justify-between items-center gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate" title={prod.productName}>
                          {prod.productName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          Phân loại: <span className="font-semibold text-slate-600">{prod.color} / {prod.size}</span>
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold shrink-0 ${
                        prod.stock === 0 ? 'bg-red-50 text-red-700 border border-red-150' : 'bg-amber-50 text-amber-700 border border-amber-150'
                      }`}>
                        Còn {prod.stock}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT: Recent Activity shortcuts */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Đơn Hàng Gần Đây</h3>
                <p className="text-xs text-slate-400 mt-0.5">10 đơn hàng vừa phát sinh mới nhất.</p>
              </div>

              <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
                {data.recentOrders.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Không có đơn hàng mới nào.</p>
                ) : (
                  data.recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-start border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800">{order.orderNumber}</span>
                          <span className={`px-2 py-0.25 rounded-full text-[9px] font-bold border ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">{order.customerName}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-900 shrink-0">{formatVND(order.totalAmount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      ) : null}
    </div>
  );
}
