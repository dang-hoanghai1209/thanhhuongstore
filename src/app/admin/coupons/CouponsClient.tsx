'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Check,
  X,
  AlertTriangle,
  Percent,
  Calendar,
  Ticket,
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  isActive: boolean;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number | null;
  usageLimit: number;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function CouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  // Form states
  const [formCode, setFormCode] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDiscountType, setFormDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [formDiscountValue, setFormDiscountValue] = useState<number>(10);
  const [formMinOrderValue, setFormMinOrderValue] = useState<number>(0);
  const [formMaxDiscount, setFormMaxDiscount] = useState<string>('');
  const [formUsageLimit, setFormUsageLimit] = useState<number>(0);
  const [formStartsAt, setFormStartsAt] = useState('');
  const [formEndsAt, setFormEndsAt] = useState('');

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [saving, setSaving] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/coupons');
      if (!res.ok) {
        throw new Error(`Mã lỗi HTTP: ${res.status}`);
      }
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (err: any) {
      console.error('Fetch coupons error:', err);
      setError(err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ.');
      showToast('Lỗi khi tải danh sách mã giảm giá', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setFormCode('');
    setFormIsActive(true);
    setFormDiscountType('percent');
    setFormDiscountValue(10);
    setFormMinOrderValue(0);
    setFormMaxDiscount('');
    setFormUsageLimit(0);
    setFormStartsAt('');
    setFormEndsAt('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormCode(coupon.code);
    setFormIsActive(coupon.isActive);
    setFormDiscountType(coupon.discountType);
    setFormDiscountValue(coupon.discountValue);
    setFormMinOrderValue(coupon.minOrderValue);
    setFormMaxDiscount(coupon.maxDiscount !== null ? String(coupon.maxDiscount) : '');
    setFormUsageLimit(coupon.usageLimit);
    setFormStartsAt(coupon.startsAt ? coupon.startsAt.split('T')[0] : '');
    setFormEndsAt(coupon.endsAt ? coupon.endsAt.split('T')[0] : '');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (couponId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: couponId, isActive: !currentStatus }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === couponId ? { ...c, isActive: !currentStatus } : c))
        );
        showToast('Cập nhật trạng thái mã giảm giá thành công', 'success');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Cập nhật thất bại');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: couponId }),
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.id !== couponId));
        showToast('Xóa mã giảm giá thành công', 'success');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Xóa thất bại');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa mã giảm giá', 'error');
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) {
      showToast('Vui lòng nhập mã giảm giá', 'error');
      return;
    }
    if (formDiscountValue <= 0) {
      showToast('Giá trị giảm phải lớn hơn 0', 'error');
      return;
    }
    if (formDiscountType === 'percent' && formDiscountValue > 100) {
      showToast('Tỷ lệ phần trăm giảm không được vượt quá 100%', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        code: formCode.trim().toUpperCase(),
        isActive: formIsActive,
        discountType: formDiscountType,
        discountValue: formDiscountValue,
        minOrderValue: formMinOrderValue,
        usageLimit: formUsageLimit,
        maxDiscount: formMaxDiscount.trim() !== '' ? Number(formMaxDiscount) : null,
        startsAt: formStartsAt ? new Date(formStartsAt).toISOString() : null,
        endsAt: formEndsAt ? new Date(formEndsAt).toISOString() : null,
      };

      if (editingCoupon) {
        payload.id = editingCoupon.id;
      }

      const method = editingCoupon ? 'PATCH' : 'POST';
      const res = await fetch('/api/admin/coupons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi hệ thống khi lưu mã giảm giá');
      }

      showToast(editingCoupon ? 'Cập nhật mã giảm giá thành công' : 'Thêm mã giảm giá thành công', 'success');
      fetchCoupons();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Save coupon error:', err);
      showToast(err.message || 'Đã xảy ra lỗi mạng', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatVND = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Không giới hạn';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toasts list */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-xl border shadow-lg flex items-center gap-3 transition-all duration-300 pointer-events-auto bg-white ${
              t.type === 'success' ? 'border-green-200 text-green-800' : 'border-red-200 text-red-800'
            }`}
          >
            {t.type === 'success' ? (
              <Check className="w-5 h-5 text-green-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            )}
            <p className="text-sm font-semibold flex-grow">{t.message}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="text-slate-400 hover:text-slate-600 focus:outline-none transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Mã Giảm Giá</h1>
          <p className="text-sm text-slate-500 mt-1">Tạo, cập nhật và thiết lập giới hạn áp dụng mã khuyến mãi.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl text-sm font-semibold shadow-sm transition shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          Thêm mã giảm giá mới
        </button>
      </div>

      {/* Searchbar */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã code (ví dụ: UUDAI30)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
          />
        </div>
        <button
          onClick={fetchCoupons}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Tải lại
        </button>
      </div>

      {/* States handler */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-slate-500">Đang tải danh sách mã giảm giá...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 bg-red-50/50 border border-red-200 rounded-2xl text-center p-6 space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-500" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800">Không thể tải dữ liệu</h3>
            <p className="text-sm text-slate-600">Đã xảy ra lỗi: {error}</p>
          </div>
          <button
            onClick={fetchCoupons}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
          >
            Thử lại
          </button>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl text-center p-6 space-y-3">
          <Ticket className="w-12 h-12 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Chưa có mã giảm giá nào được tạo.</p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-container transition"
          >
            Tạo mã đầu tiên
          </button>
        </div>
      ) : (
        /* Coupons List Table */
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Mã Code</th>
                  <th className="py-4 px-6">Loại giảm</th>
                  <th className="py-4 px-6 text-right">Mức giảm</th>
                  <th className="py-4 px-6 text-right">Đơn tối thiểu</th>
                  <th className="py-4 px-6 text-center">Đã dùng</th>
                  <th className="py-4 px-6">Thời hạn áp dụng</th>
                  <th className="py-4 px-6 text-center">Trạng thái</th>
                  <th className="py-4 px-6 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCoupons.map((c) => {
                  const now = new Date();
                  const isExpired = c.endsAt ? new Date(c.endsAt) < now : false;
                  
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      {/* Code */}
                      <td className="py-4 px-6 font-bold text-primary tracking-wide">
                        {c.code}
                      </td>

                      {/* Discount Type */}
                      <td className="py-4 px-6 font-medium text-slate-500">
                        {c.discountType === 'percent' ? 'Giảm theo phần trăm (%)' : 'Giảm số tiền cố định (đ)'}
                      </td>

                      {/* Discount Value */}
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        {c.discountType === 'percent' ? `${c.discountValue}%` : formatVND(c.discountValue)}
                      </td>

                      {/* Minimum Order Value */}
                      <td className="py-4 px-6 text-right font-medium text-slate-600">
                        {c.minOrderValue > 0 ? formatVND(c.minOrderValue) : '0đ'}
                      </td>

                      {/* Usage */}
                      <td className="py-4 px-6 text-center font-bold text-slate-800">
                        {c.usedCount} {c.usageLimit > 0 ? `/ ${c.usageLimit}` : 'lần'}
                      </td>

                      {/* Date Range */}
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium space-y-1">
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Từ: {formatDate(c.startsAt)}</span>
                        </p>
                        <p className={`flex items-center gap-1 ${isExpired ? 'text-red-500 font-bold' : ''}`}>
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Đến: {formatDate(c.endsAt)} {isExpired && '(Hết hạn)'}</span>
                        </p>
                      </td>

                      {/* Active Status toggle */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleToggleActive(c.id, c.isActive)}
                          className="focus:outline-none transition"
                          title={c.isActive ? 'Bấm để tạm dừng mã' : 'Bấm để mở hoạt động mã'}
                        >
                          {c.isActive && !isExpired ? (
                            <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Hoạt động
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Tạm dừng
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            className="p-2 border border-slate-200 hover:border-primary/20 hover:bg-primary/5 text-slate-500 hover:text-primary rounded-xl transition shadow-sm"
                            title="Sửa cấu hình"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition shadow-sm"
                            title="Xóa mã giảm giá"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slideUp">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCoupon ? 'Chỉnh Sửa Mã Giảm Giá' : 'Thêm Mã Giảm Giá Mới'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Thiết lập các điều kiện khấu trừ giảm giá cho khách mua hàng.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveCoupon} className="flex-grow overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Coupon Code */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mã code giảm giá *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: HE2026, UUDAI50"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    disabled={!!editingCoupon}
                    className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary disabled:bg-slate-50 disabled:text-slate-400 font-bold tracking-wide"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Không dấu, tự động viết hoa (ví dụ: UUDAI30).</p>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-5 h-5 text-primary focus:ring-primary border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-slate-800 cursor-pointer select-none">
                    Mở trạng thái hoạt động ngay
                  </label>
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Loại chiết khấu *</label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as 'percent' | 'fixed')}
                    className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary cursor-pointer font-medium"
                  >
                    <option value="percent">Giảm theo tỷ lệ phần trăm (%)</option>
                    <option value="fixed">Giảm số tiền cố định (đ)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Mức giảm * ({formDiscountType === 'percent' ? '%' : 'VNĐ'})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-bold"
                  />
                </div>

                {/* Min Order Value */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Giá trị đơn hàng tối thiểu (đ)</label>
                  <input
                    type="number"
                    min="0"
                    value={formMinOrderValue}
                    onChange={(e) => setFormMinOrderValue(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-medium"
                  />
                </div>

                {/* Max Discount value (only useful for percent type) */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Mức giảm tối đa (đ)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Không giới hạn"
                    value={formMaxDiscount}
                    onChange={(e) => setFormMaxDiscount(e.target.value)}
                    disabled={formDiscountType === 'fixed'}
                    className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary disabled:bg-slate-50 disabled:text-slate-300 font-medium"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Chỉ có hiệu lực khi chọn giảm theo phần trăm.</p>
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tổng giới hạn sử dụng</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ví dụ: 100 (để trống hoặc 0 là không giới hạn)"
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary font-medium"
                  />
                </div>

                {/* Blank space for layout alignment */}
                <div className="hidden sm:block"></div>

                {/* Start Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ngày hiệu lực</label>
                  <input
                    type="date"
                    value={formStartsAt}
                    onChange={(e) => setFormStartsAt(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary cursor-pointer font-medium"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ngày hết hạn</label>
                  <input
                    type="date"
                    value={formEndsAt}
                    onChange={(e) => setFormEndsAt(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary cursor-pointer font-medium"
                  />
                </div>

              </div>

              {/* Form Submission buttons */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3 bg-slate-50 -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-container text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
