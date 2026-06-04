'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ChevronDown, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  Truck 
} from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  priceAtPurchase: number;
  productName: string;
  variant: {
    id: string;
    size: string;
    color: string;
    colorHex: string;
  } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phoneNumber: string;
  address: string;
  notes: string | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: any;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  couponCode: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Detail Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Toast notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Mounting state
  const [mounted, setMounted] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        showToast('Không thể lấy danh sách đơn hàng', 'error');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Đã xảy ra lỗi khi kết nối máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchOrders();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Map UI completed/delivered fields
        const mappedStatus = newStatus === 'COMPLETED' ? 'DELIVERED' : newStatus;
        
        // Update local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: mappedStatus } : order
          )
        );

        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, status: mappedStatus } : null);
        }

        showToast('Cập nhật trạng thái đơn hàng thành công', 'success');
      } else {
        showToast(result.message || 'Cập nhật trạng thái thất bại', 'error');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      showToast('Lỗi mạng khi cập nhật đơn hàng', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatVND = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  const formatDate = (dateStr: string) => {
    if (!mounted) return '';
    return new Date(dateStr).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phoneNumber.includes(searchTerm) ||
      order.address.toLowerCase().includes(searchTerm.toLowerCase());

    const mappedStatus = order.status === 'DELIVERED' ? 'COMPLETED' : order.status;
    const matchesStatus = statusFilter === 'ALL' || mappedStatus === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || order.paymentMethod === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate statistics
  const totalOrdersCount = orders.length;
  const completedOrders = orders.filter(o => o.status === 'DELIVERED');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'PENDING').length;
  const shippingOrdersCount = orders.filter(o => o.status === 'SHIPPING').length;

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'bg-primary/5 text-blue-700 border-primary/20';
      case 'SHIPPING':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'COD':
        return 'COD';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản';
      case 'VNPAY':
        return 'VNPay';
      default:
        return method;
    }
  };

  // Skeleton Loader for initial client hydration/fetch
  if (!mounted || loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Title skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-10 w-24 bg-slate-200 rounded-lg"></div>
        </div>

        {/* Stats Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl border border-slate-100"></div>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="h-14 bg-slate-200 rounded-xl"></div>

        {/* Table skeleton */}
        <div className="space-y-4">
          <div className="h-12 bg-slate-200 rounded-lg"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Toast Notifications Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl border shadow-lg flex items-center gap-3 transition-all duration-300 transform translate-y-0 scale-100 pointer-events-auto bg-white ${
              toast.type === 'success' 
                ? 'border-green-200 text-green-800' 
                : 'border-red-200 text-red-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            )}
            <p className="text-sm font-semibold flex-grow">{toast.message}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 focus:outline-none transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Đơn Hàng</h1>
          <p className="text-sm text-slate-500 mt-1">Theo dõi, kiểm tra và cập nhật trạng thái đơn đặt hàng.</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Tải lại danh sách
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doanh thu (Thực thu)</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatVND(totalRevenue)}</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tổng đơn hàng</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{totalOrdersCount} đơn</p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chờ xác nhận</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{pendingOrdersCount} đơn</p>
          </div>
        </div>

        {/* Shipping Orders */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đang giao hàng</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{shippingOrdersCount} đơn</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Utility Row */}
      <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        {/* Search */}
        <div className="relative flex-grow min-w-[280px]">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo Mã đơn, tên KH, SĐT hoặc địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10/20 focus:border-primary transition-shadow placeholder:text-slate-400"
          />
        </div>

        {/* Filter dropboxes */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm bg-transparent font-medium text-slate-700 outline-none cursor-pointer pr-1"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="SHIPPING">Đang giao hàng</option>
              <option value="COMPLETED">Đã hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          {/* Payment Method filter */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl shrink-0">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="text-sm bg-transparent font-medium text-slate-700 outline-none cursor-pointer pr-1"
            >
              <option value="ALL">Tất cả thanh toán</option>
              <option value="COD">Thanh toán COD</option>
              <option value="BANK_TRANSFER">Chuyển khoản</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Mã đơn</th>
                <th className="py-4 px-6">Khách hàng</th>
                <th className="py-4 px-6">Địa chỉ giao hàng</th>
                <th className="py-4 px-6 text-center">Thanh toán</th>
                <th className="py-4 px-6 text-right">Tổng tiền</th>
                <th className="py-4 px-6">Ngày đặt</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy đơn hàng phù hợp
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const dbStatus = order.status;
                  const displayStatus = dbStatus === 'DELIVERED' ? 'COMPLETED' : dbStatus;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Order number */}
                      <td className="py-4 px-6 font-bold text-primary shrink-0">
                        {order.orderNumber}
                      </td>
                      
                      {/* Customer details */}
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800">{order.customerName}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{order.phoneNumber}</div>
                      </td>

                      {/* Shipping Address */}
                      <td className="py-4 px-6 max-w-xs truncate">
                        <div className="truncate font-medium text-slate-600" title={order.address}>
                          {order.address}
                        </div>
                        {order.notes && (
                          <div className="text-xs text-amber-600 truncate mt-0.5 italic" title={order.notes}>
                            Lưu ý: {order.notes}
                          </div>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-6 text-center font-semibold text-xs">
                        <span className={`px-2.5 py-1 rounded-full ${
                          order.paymentMethod === 'BANK_TRANSFER' 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {getPaymentLabel(order.paymentMethod)}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        {formatVND(Number(order.totalAmount))}
                      </td>

                      {/* Order Date */}
                      <td className="py-4 px-6 text-slate-500 text-xs">
                        {formatDate(order.createdAt)}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-block relative">
                          <select
                            value={displayStatus}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                            className={`text-xs font-bold rounded-full px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-primary/10/20 cursor-pointer transition-colors disabled:opacity-50 appearance-none pr-8 ${getStatusStyles(dbStatus)}`}
                          >
                            <option value="PENDING">Chờ xử lý</option>
                            <option value="CONFIRMED">Đã xác nhận</option>
                            <option value="SHIPPING">Đang giao hàng</option>
                            <option value="COMPLETED">Đã hoàn thành</option>
                            <option value="CANCELLED">Đã hủy</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 border border-slate-200 hover:border-primary/20 hover:bg-primary/5 text-slate-500 hover:text-primary rounded-xl transition shadow-sm"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-slideUp">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Chi Tiết Đơn Hàng:</span>
                  <span className="text-primary">{selectedOrder.orderNumber}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">Ngày đặt: {formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              {/* Customer and Delivery Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thông tin khách hàng</h4>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-800">{selectedOrder.customerName}</p>
                    <p className="text-sm text-slate-600">SĐT: {selectedOrder.phoneNumber}</p>
                    <p className="text-sm text-slate-600">Thanh toán: <span className="font-semibold">{selectedOrder.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản ngân hàng' : 'Nhận hàng trả tiền (COD)'}</span></p>
                  </div>
                </div>

                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Thông tin giao nhận</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 leading-relaxed"><span className="font-semibold text-slate-700">Địa chỉ:</span> {selectedOrder.address}</p>
                    {selectedOrder.notes && (
                      <p className="text-xs text-amber-600 bg-amber-50 p-2 border border-amber-100 rounded-lg mt-1 italic">
                        <span className="font-semibold">Lưu ý của khách:</span> {selectedOrder.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Danh sách sản phẩm ({selectedOrder.items.length})</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                        <th className="py-3 px-4">Tên sản phẩm</th>
                        <th className="py-3 px-4 text-center">Phân loại</th>
                        <th className="py-3 px-4 text-center">Số lượng</th>
                        <th className="py-3 px-4 text-right">Đơn giá</th>
                        <th className="py-3 px-4 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/20">
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {item.productName}
                          </td>
                          <td className="py-3 px-4 text-center text-xs">
                            {item.variant ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 text-slate-600 font-semibold">
                                <span 
                                  className="w-2.5 h-2.5 rounded-full border border-slate-300"
                                  style={{ backgroundColor: item.variant.colorHex }}
                                />
                                {item.variant.color} / {item.variant.size}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Mặc định</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-slate-900">
                            x{item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-500 font-medium">
                            {formatVND(Number(item.unitPrice))}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            {formatVND(Number(item.unitPrice) * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order total sum block */}
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-sm text-slate-500 font-medium">
                    <span>Tạm tính:</span>
                    <span>{formatVND(Number(selectedOrder.subtotal))}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500 font-medium">
                    <span>Phí vận chuyển:</span>
                    <span>{formatVND(Number(selectedOrder.shippingFee))}</span>
                  </div>
                  {Number(selectedOrder.discountAmount) > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Khấu trừ giảm giá:</span>
                      <span>-{formatVND(Number(selectedOrder.discountAmount))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">{formatVND(Number(selectedOrder.totalAmount))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thay đổi nhanh trạng thái:</span>
                <div className="inline-block relative">
                  <select
                    value={selectedOrder.status === 'DELIVERED' ? 'COMPLETED' : selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    disabled={updatingId === selectedOrder.id}
                    className={`text-xs font-bold rounded-full px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-primary/10/20 cursor-pointer disabled:opacity-50 appearance-none pr-8 ${getStatusStyles(selectedOrder.status)}`}
                  >
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="SHIPPING">Đang giao hàng</option>
                    <option value="COMPLETED">Đã hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                  <ChevronDown className="w-3 h-3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition shadow-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
