'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Image as ImageIcon, 
  Check, 
  X, 
  AlertTriangle,
  ExternalLink,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { createBannerAction, toggleBannerActiveAction, deleteBannerAction } from './actions';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface BannersClientProps {
  initialBanners: Banner[];
}

export default function BannersClient({ initialBanners }: BannersClientProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLinkUrl, setFormLinkUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState(0);

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [saving, setSaving] = useState(false);

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleOpenAddModal = () => {
    setFormTitle('');
    setFormImageUrl('');
    setFormLinkUrl('');
    setFormIsActive(true);
    setFormSortOrder(0);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (bannerId: string, currentStatus: boolean) => {
    try {
      const response = await toggleBannerActiveAction(bannerId, !currentStatus);
      if (response.success) {
        setBanners((prev) =>
          prev.map((b) => b.id === bannerId ? { ...b, isActive: !currentStatus } : b)
        );
        showToast('Cập nhật trạng thái Banner thành công', 'success');
      } else {
        showToast(response.message || 'Cập nhật trạng thái thất bại', 'error');
      }
    } catch (error) {
      showToast('Lỗi mạng khi cập nhật trạng thái', 'error');
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa Banner này?')) return;
    
    try {
      const response = await deleteBannerAction(bannerId);
      if (response.success) {
        setBanners((prev) => prev.filter((b) => b.id !== bannerId));
        showToast('Xóa Banner thành công', 'success');
      } else {
        showToast(response.message || 'Không thể xóa Banner', 'error');
      }
    } catch (error) {
      showToast('Lỗi mạng khi xóa Banner', 'error');
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Vui lòng nhập tiêu đề Banner', 'error');
      return;
    }
    if (!formImageUrl.trim()) {
      showToast('Vui lòng nhập đường dẫn hình ảnh', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await createBannerAction({
        title: formTitle,
        imageUrl: formImageUrl,
        linkUrl: formLinkUrl,
        isActive: formIsActive,
        sortOrder: Number(formSortOrder)
      });

      if (res.success && res.banner) {
        showToast('Thêm Banner thành công', 'success');
        setBanners((prev) => [res.banner as Banner, ...prev]);
        setIsModalOpen(false);
      } else {
        showToast(res.message || 'Lỗi hệ thống khi lưu Banner', 'error');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      showToast('Đã xảy ra lỗi mạng', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredBanners = banners.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.linkUrl && b.linkUrl.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Toast alert system */}
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

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Banner</h1>
          <p className="text-sm text-slate-500 mt-1">Cấu hình Banner quảng cáo trượt hiển thị ngoài Trang chủ.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          Thêm Banner mới
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex items-center">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề hoặc liên kết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Table view */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6 w-36 text-center">Ảnh xem trước</th>
                <th className="py-4 px-6">Tiêu đề Banner</th>
                <th className="py-4 px-6">Đường dẫn liên kết</th>
                <th className="py-4 px-6 text-center w-24">Thứ tự</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-center w-24">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy Banner nào
                  </td>
                </tr>
              ) : (
                filteredBanners.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Thumbnail preview */}
                    <td className="py-4 px-6">
                      <div className="w-24 h-12 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 mx-auto">
                        {b.imageUrl ? (
                          <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {b.title}
                    </td>

                    {/* Link URL */}
                    <td className="py-4 px-6 text-slate-500 font-mono text-xs">
                      {b.linkUrl ? (
                        <a 
                          href={b.linkUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-1 font-semibold"
                        >
                          {b.linkUrl} <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Không có</span>
                      )}
                    </td>

                    {/* Sort Order */}
                    <td className="py-4 px-6 text-center font-bold text-slate-700">
                      {b.sortOrder}
                    </td>

                    {/* Active Toggle */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleActive(b.id, b.isActive)}
                        className="focus:outline-none transition-colors"
                      >
                        {b.isActive ? (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Hiển thị
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Tạm ẩn
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Actions (Delete) */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDeleteBanner(b.id)}
                        className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition shadow-sm"
                        title="Xóa Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-slideUp">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Thêm Banner Mới</h3>
                <p className="text-xs text-slate-500 mt-1">Cung cấp tiêu đề và URL hình ảnh Banner.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSaveBanner} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tiêu đề Banner *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đại tiệc mua sắm hè rực rỡ"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Đường dẫn hình ảnh (URL) *</label>
                <input
                  type="text"
                  required
                  placeholder="Dán link ảnh Figma/Supabase Storage..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Đường dẫn liên kết điều hướng (Link URL)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: /products hoặc /categories/tieu-dung"
                  value={formLinkUrl}
                  onChange={(e) => setFormLinkUrl(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min="0"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <button
                    type="button"
                    onClick={() => setFormIsActive(!formIsActive)}
                    className="text-slate-600 focus:outline-none transition shrink-0"
                  >
                    {formIsActive ? (
                      <ToggleRight className="w-9 h-9 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-9 h-9 text-slate-300" />
                    )}
                  </button>
                  <span className="text-sm font-semibold text-slate-700">Đang hoạt động</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
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
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {saving ? 'Đang lưu...' : 'Lưu Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
