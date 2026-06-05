'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Check,
  X,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Building,
  UserCheck,
  Calendar,
  FileText
} from 'lucide-react';

interface WholesaleProfile {
  id: string;
  userId: string;
  companyName: string;
  taxCode: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    role: string;
    isActive: boolean;
  };
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function WholesaleClient() {
  const [profiles, setProfiles] = useState<WholesaleProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    profile: WholesaleProfile | null;
    actionType: 'APPROVED' | 'REJECTED';
  }>({
    isOpen: false,
    profile: null,
    actionType: 'APPROVED',
  });

  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/wholesale');
      if (!res.ok) {
        throw new Error(`Mã lỗi HTTP: ${res.status}`);
      }
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch (err: any) {
      console.error('Fetch wholesale profiles error:', err);
      setError(err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ.');
      showToast('Lỗi khi tải danh sách đăng ký sỉ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleOpenConfirmModal = (profile: WholesaleProfile, actionType: 'APPROVED' | 'REJECTED') => {
    setConfirmModal({
      isOpen: true,
      profile,
      actionType,
    });
  };

  const handleCloseConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      profile: null,
      actionType: 'APPROVED',
    });
  };

  const handleUpdateStatus = async () => {
    const { profile, actionType } = confirmModal;
    if (!profile) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/wholesale', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          status: actionType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi hệ thống khi cập nhật hồ sơ');
      }

      showToast(
        actionType === 'APPROVED'
          ? 'Đã duyệt yêu cầu mua sỉ và nâng cấp tài khoản thành công!'
          : 'Đã từ chối yêu cầu mua sỉ thành công!',
        'success'
      );
      
      // Update local state
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profile.id
            ? { ...p, status: actionType, user: { ...p.user, role: actionType === 'APPROVED' ? 'WHOLESALE' : 'CUSTOMER' } }
            : p
        )
      );
      handleCloseConfirmModal();
    } catch (err: any) {
      console.error('Update wholesale error:', err);
      showToast(err.message || 'Đã xảy ra lỗi mạng', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Chờ duyệt
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Đã duyệt (Đại lý sỉ)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-slate-600 bg-slate-50 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const getFullName = (p: WholesaleProfile) => {
    const fullName = `${p.user.lastName || ''} ${p.user.firstName || ''}`.trim();
    return fullName || p.user.name || 'Thành viên mới';
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.taxCode.includes(searchTerm) ||
      getFullName(p).toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.user.phone && p.user.phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert overlay */}
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Duyệt Tài Khoản Sỉ (B2B)</h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý các hồ sơ đăng ký đại lý, công ty có nhu cầu mua sỉ và áp dụng giá chiết khấu đặc biệt.
        </p>
      </div>

      {/* Filters row */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-grow md:max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo Tên công ty, Mã số thuế, tên KH, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
          />
        </div>

        {/* Status buttons */}
        <div className="flex items-center gap-3 overflow-x-auto">
          <div className="flex bg-white p-1 border border-slate-200 rounded-xl">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition select-none ${
                  statusFilter === st
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {st === 'ALL' ? 'Tất cả' : st === 'PENDING' ? 'Chờ duyệt' : st === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchProfiles}
            disabled={loading}
            className="inline-flex items-center justify-center p-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loader & States handler */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 animate-pulse">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-slate-500">Đang tải danh sách hồ sơ mua sỉ...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 bg-red-50/50 border border-red-200 rounded-2xl text-center p-6 space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-500 animate-bounce" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800">Không thể kết nối máy chủ</h3>
            <p className="text-sm text-slate-600">Chi tiết lỗi: {error}</p>
          </div>
          <button
            onClick={fetchProfiles}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
          >
            Tải lại
          </button>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl text-center p-6 space-y-3">
          <Building className="w-12 h-12 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Không tìm thấy yêu cầu đăng ký sỉ nào.</p>
        </div>
      ) : (
        /* Profiles grid/table */
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Tên Doanh Nghiệp</th>
                  <th className="py-4 px-6">Mã Số Thuế</th>
                  <th className="py-4 px-6">Đại diện Đăng ký</th>
                  <th className="py-4 px-6">Số điện thoại / Email</th>
                  <th className="py-4 px-6">Ngày Đăng ký</th>
                  <th className="py-4 px-6 text-center">Trạng thái</th>
                  <th className="py-4 px-6 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProfiles.map((p) => {
                  const representative = getFullName(p);
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      {/* Company Name */}
                      <td className="py-4 px-6 font-bold text-slate-900">
                        {p.companyName}
                      </td>

                      {/* Tax Code */}
                      <td className="py-4 px-6 font-mono text-xs font-bold text-slate-500">
                        {p.taxCode}
                      </td>

                      {/* User Info */}
                      <td className="py-4 px-6 font-semibold text-slate-800">
                        {representative}
                      </td>

                      {/* Contacts */}
                      <td className="py-4 px-6 text-xs text-slate-500 space-y-1">
                        <p className="font-medium">{p.user.phone || 'N/A'}</p>
                        <p className="font-medium text-slate-400">{p.user.email}</p>
                      </td>

                      {/* Registration Date */}
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        {getStatusBadge(p.status)}
                      </td>

                      {/* Admin Actions */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {p.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleOpenConfirmModal(p, 'APPROVED')}
                              className="px-3 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 shadow-xs"
                              title="Duyệt nâng sỉ"
                            >
                              <Check className="w-3.5 h-3.5" /> Duyệt sỉ
                            </button>
                          )}
                          {p.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleOpenConfirmModal(p, 'REJECTED')}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 shadow-xs"
                              title="Từ chối/Hạ sỉ"
                            >
                              <X className="w-3.5 h-3.5" /> Từ chối
                            </button>
                          )}
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

      {/* Confirmation Dialog Modal */}
      {confirmModal.isOpen && confirmModal.profile && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-slideUp">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                confirmModal.actionType === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {confirmModal.actionType === 'APPROVED' ? (
                  <UserCheck className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {confirmModal.actionType === 'APPROVED' ? 'Xác Nhận Duyệt Tài Khoản Sỉ' : 'Xác Nhận Từ Chối Hồ Sơ'}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Bạn có chắc chắn muốn {confirmModal.actionType === 'APPROVED' ? 'DUYỆT' : 'TỪ CHỐI'} hồ sơ đăng ký sỉ của doanh nghiệp{' '}
                <strong className="text-slate-900">{confirmModal.profile.companyName}</strong> (MST: {confirmModal.profile.taxCode})?
              </p>
              
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl text-xs space-y-1.5 text-slate-500">
                <p><strong className="text-slate-700">Đại diện:</strong> {getFullName(confirmModal.profile)}</p>
                <p><strong className="text-slate-700">Email:</strong> {confirmModal.profile.user.email}</p>
                <p>
                  <strong className="text-slate-700">Ảnh hưởng:</strong>{' '}
                  {confirmModal.actionType === 'APPROVED' 
                    ? 'Tài khoản người dùng sẽ được nâng cấp vai trò thành WHOLESALE để hưởng các ưu đãi sỉ.'
                    : 'Tài khoản người dùng sẽ được đưa về vai trò CUSTOMER thường.'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseConfirmModal}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={saving}
                className={`px-5 py-2 text-white text-sm font-semibold rounded-xl shadow-sm transition disabled:opacity-50 inline-flex items-center gap-1.5 ${
                  confirmModal.actionType === 'APPROVED' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
                  </>
                ) : confirmModal.actionType === 'APPROVED' ? (
                  'Xác nhận Duyệt'
                ) : (
                  'Xác nhận Từ chối'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
