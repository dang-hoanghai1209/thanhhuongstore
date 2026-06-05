'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  Check, 
  X, 
  AlertTriangle,
  FolderOpen,
  ToggleLeft,
  ToggleRight,
  Edit2
} from 'lucide-react';
import { 
  createCategoryAction, 
  toggleCategoryActiveAction, 
  deleteCategoryAction,
  updateCategoryAction 
} from './actions';
import { SizeType } from '@prisma/client';

interface Category {
  id: string;
  name: string;
  slug: string;
  sizeType: string; // From SizeType enum
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  parent: {
    name: string;
  } | null;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface CategoriesClientProps {
  initialCategories: Category[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editing State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Quick Form State
  const [formName, setFormName] = useState('');
  const [formSizeType, setFormSizeType] = useState<SizeType>(SizeType.SOCK);
  const [formParentId, setFormParentId] = useState('');
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);

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

  const handleToggleActive = async (categoryId: string, currentStatus: boolean) => {
    try {
      const response = await toggleCategoryActiveAction(categoryId, !currentStatus);
      if (response.success) {
        setCategories((prev) =>
          prev.map((c) => c.id === categoryId ? { ...c, isActive: !currentStatus } : c)
        );
        showToast('Cập nhật trạng thái Danh mục thành công', 'success');
      } else {
        showToast(response.message || 'Cập nhật trạng thái thất bại', 'error');
      }
    } catch (error) {
      showToast('Lỗi mạng khi cập nhật trạng thái', 'error');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa Danh mục này?')) return;
    
    try {
      const response = await deleteCategoryAction(categoryId);
      if (response.success) {
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));
        showToast('Xóa Danh mục thành công', 'success');
        if (editingCategory?.id === categoryId) {
          handleResetForm();
        }
      } else {
        showToast(response.message || 'Không thể xóa Danh mục', 'error');
      }
    } catch (error) {
      showToast('Lỗi mạng khi xóa Danh mục', 'error');
    }
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setFormName(c.name);
    setFormSizeType(c.sizeType as SizeType);
    setFormParentId(c.parentId || '');
    setFormSortOrder(c.sortOrder);
    setFormIsActive(c.isActive);
  };

  const handleResetForm = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSizeType(SizeType.SOCK);
    setFormParentId('');
    setFormSortOrder(0);
    setFormIsActive(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Vui lòng nhập tên danh mục', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        // Edit Mode
        const res = await updateCategoryAction(editingCategory.id, {
          name: formName,
          sizeType: formSizeType,
          parentId: formParentId || null,
          sortOrder: Number(formSortOrder),
          isActive: formIsActive
        });

        if (res.success && res.category) {
          showToast('Cập nhật danh mục thành công', 'success');
          // Cast returned category row
          const updatedCatFull: Category = {
            id: res.category.id,
            name: res.category.name,
            slug: res.category.slug,
            sizeType: res.category.sizeType,
            parentId: res.category.parentId,
            sortOrder: res.category.sortOrder,
            isActive: res.category.isActive,
            parent: res.category.parent ? { name: res.category.parent.name } : null
          };

          setCategories((prev) =>
            prev.map((c) => (c.id === editingCategory.id ? updatedCatFull : c))
          );
          handleResetForm();
        } else {
          showToast(res.message || 'Lỗi hệ thống khi cập nhật Danh mục', 'error');
        }
      } else {
        // Add Mode
        const res = await createCategoryAction({
          name: formName,
          sizeType: formSizeType,
          parentId: formParentId,
          sortOrder: Number(formSortOrder),
          isActive: formIsActive
        });

        if (res.success && res.category) {
          showToast('Tạo danh mục mới thành công', 'success');
          // Cast returned category row
          const newCatFull: Category = {
            id: res.category.id,
            name: res.category.name,
            slug: res.category.slug,
            sizeType: res.category.sizeType,
            parentId: res.category.parentId,
            sortOrder: res.category.sortOrder,
            isActive: res.category.isActive,
            parent: res.category.parent ? { name: res.category.parent.name } : null
          };
          setCategories((prev) => [newCatFull, ...prev]);
          handleResetForm();
        } else {
          showToast(res.message || 'Lỗi hệ thống khi tạo Danh mục', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('Đã xảy ra lỗi mạng', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getSizeTypeLabel = (type: string) => {
    switch (type) {
      case 'SOCK':
        return 'Tất vớ (SOCK)';
      case 'SWIMWEAR':
        return 'Đồ bơi (SWIMWEAR)';
      case 'UNDERWEAR':
        return 'Đồ lót (UNDERWEAR)';
      case 'SHOE':
        return 'Giày dép (SHOE)';
      case 'ACCESSORY':
        return 'Phụ kiện (ACCESSORY)';
      default:
        return type;
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.sizeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.parent && c.parent.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Eligible parent categories (exclude category self links to prevent hierarchy loop)
  const parentCategoryOptions = categories.filter(c => !c.parentId && c.id !== editingCategory?.id);

  return (
    <div className="space-y-6">
      {/* Toast alert overlays */}
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

      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Danh Mục</h1>
        <p className="text-sm text-slate-500 mt-1">Cấu hình danh mục gốc và phân cấp sản phẩm.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Col - Add/Edit category form */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 lg:sticky lg:top-6">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
          </h3>
          <p className="text-xs text-slate-400">
            {editingCategory 
              ? 'Cập nhật lại thông tin và quy chuẩn kích thước danh mục.' 
              : 'Tạo nhanh danh mục để gán kích thước quy chuẩn cho sản phẩm.'}
          </p>

          <form onSubmit={handleSaveCategory} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tên danh mục *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Đồ lót nam"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-shadow"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quy chuẩn size (SizeType) *</label>
              <select
                value={formSizeType}
                onChange={(e) => setFormSizeType(e.target.value as SizeType)}
                className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-shadow cursor-pointer font-semibold"
              >
                <option value="UNDERWEAR">Đồ lót (UNDERWEAR)</option>
                <option value="SOCK">Tất vớ (SOCK)</option>
                <option value="SWIMWEAR">Đồ bơi (SWIMWEAR)</option>
                <option value="SHOE">Giày dép (SHOE)</option>
                <option value="ACCESSORY">Phụ kiện (ACCESSORY)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Danh mục cha (Phân cấp)</label>
              <select
                value={formParentId}
                onChange={(e) => setFormParentId(e.target.value)}
                className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-shadow cursor-pointer text-slate-600 font-semibold"
              >
                <option value="">Không có (Danh mục gốc)</option>
                {parentCategoryOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name} ({opt.sizeType})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Thứ tự ưu tiên</label>
                <input
                  type="number"
                  min="0"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-shadow"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className="text-slate-600 focus:outline-none transition shrink-0"
                >
                  {formIsActive ? (
                    <ToggleRight className="w-9 h-9 text-primary" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-300" />
                  )}
                </button>
                <span className="text-sm font-semibold text-slate-700">Mở bán</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {editingCategory && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  Hủy sửa
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex-grow inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
              >
                {!editingCategory && <Plus className="w-4 h-4" />}
                {saving ? 'Đang lưu...' : editingCategory ? 'Lưu cập nhật' : 'Tạo danh mục mới'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col - Categories table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Table filter */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm danh mục theo tên, quy chuẩn, danh mục cha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-shadow placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Table Container */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Tên Danh Mục</th>
                    <th className="py-4 px-6">Quy chuẩn size (SizeType)</th>
                    <th className="py-4 px-6">Phân cấp cha</th>
                    <th className="py-4 px-6 text-center w-24">Thứ tự</th>
                    <th className="py-4 px-6 text-center">Trạng thái</th>
                    <th className="py-4 px-6 text-center w-32">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredCategories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        Không tìm thấy danh mục nào
                      </td>
                    </tr>
                  ) : (
                    filteredCategories.map((c) => (
                      <tr 
                        key={c.id} 
                        className={`hover:bg-slate-50/50 transition-colors ${
                          editingCategory?.id === c.id ? 'bg-primary/5 hover:bg-primary/10' : ''
                        }`}
                      >
                        {/* Name */}
                        <td className="py-4 px-6 font-bold text-slate-800">
                          {c.parentId && <span className="text-slate-400 font-normal mr-1.5">└─</span>}
                          {c.name}
                        </td>

                        {/* Size type */}
                        <td className="py-4 px-6 font-semibold text-xs text-slate-500">
                          <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
                            {getSizeTypeLabel(c.sizeType)}
                          </span>
                        </td>

                        {/* Parent category */}
                        <td className="py-4 px-6 font-medium text-slate-500">
                          {c.parent ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="text-slate-400 font-normal">Thuộc:</span> {c.parent.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic font-normal">Danh mục gốc</span>
                          )}
                        </td>

                        {/* Sort Order */}
                        <td className="py-4 px-6 text-center font-bold text-slate-600">
                          {c.sortOrder}
                        </td>

                        {/* Display Active Status */}
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleToggleActive(c.id, c.isActive)}
                            className="focus:outline-none transition-colors"
                          >
                            {c.isActive ? (
                              <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Mở bán
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Đóng
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Actions (Edit / Delete) */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="p-2 border border-slate-200 hover:border-primary/20 hover:bg-primary/5 text-slate-500 hover:text-primary rounded-xl transition shadow-sm"
                              title="Chỉnh sửa danh mục"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c.id)}
                              className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition shadow-sm"
                              title="Xóa danh mục"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
