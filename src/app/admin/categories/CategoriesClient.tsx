'use client';

import React, { useState, useEffect } from 'react';
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
  Edit2,
  Filter
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
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [filterSizeType, setFilterSizeType] = useState<'ALL' | SizeType>('ALL');
  
  // Slide-over drawer visibility and editing state
  const [formOpen, setFormOpen] = useState(false);
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

  // Handle Escape key to close the drawer
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && formOpen) {
        handleResetForm();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [formOpen]);

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
    setFormOpen(true);
  };

  const handleResetForm = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSizeType(SizeType.SOCK);
    setFormParentId('');
    setFormSortOrder(0);
    setFormIsActive(true);
    setFormOpen(false);
  };

  const handleOpenCreate = () => {
    handleResetForm();
    setFormOpen(true);
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

  // Filter logic
  const filteredCategories = categories.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sizeType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.parent && c.parent.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesStatus = 
      filterStatus === 'ALL' || 
      (filterStatus === 'ACTIVE' && c.isActive) ||
      (filterStatus === 'INACTIVE' && !c.isActive);

    const matchesSizeType = 
      filterSizeType === 'ALL' || 
      c.sizeType === filterSizeType;

    return matchesSearch && matchesStatus && matchesSizeType;
  });

  // Eligible parent categories options
  const parentCategoryOptions = categories.filter(c => !c.parentId && c.id !== editingCategory?.id);

  return (
    <div className="w-full space-y-6">
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
              className="text-slate-400 hover:text-slate-650 focus:outline-none transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Danh mục sản phẩm</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý nhóm sản phẩm và quy chuẩn kích cỡ hiển thị trên cửa hàng.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-sm font-semibold shadow-xs transition active:scale-98 self-start sm:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          Thêm danh mục
        </button>
      </div>

      {/* Search and Filter Row */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm danh mục theo tên, quy chuẩn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all placeholder:text-slate-400 font-medium text-slate-800"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400 font-bold uppercase whitespace-nowrap">Trạng thái:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả</option>
              <option value="ACTIVE">Mở bán</option>
              <option value="INACTIVE">Đóng</option>
            </select>
          </div>

          {/* SizeType Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400 font-bold uppercase whitespace-nowrap">Quy chuẩn size:</span>
            <select
              value={filterSizeType}
              onChange={(e) => setFilterSizeType(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tất cả</option>
              <option value="UNDERWEAR">Đồ lót</option>
              <option value="SOCK">Tất vớ</option>
              <option value="SWIMWEAR">Đồ bơi</option>
              <option value="SHOE">Giày dép</option>
              <option value="ACCESSORY">Phụ kiện</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Container Card */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4.5 px-6 whitespace-nowrap">Tên Danh Mục</th>
                <th className="py-4.5 px-6 whitespace-nowrap">Quy chuẩn size (SizeType)</th>
                <th className="py-4.5 px-6 whitespace-nowrap">Phân cấp cha</th>
                <th className="py-4.5 px-6 text-center w-28 whitespace-nowrap">Thứ tự</th>
                <th className="py-4.5 px-6 text-center w-36 whitespace-nowrap">Trạng thái</th>
                <th className="py-4.5 px-6 text-right w-32 whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700 font-medium">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-medium">
                    Không tìm thấy danh mục nào thỏa mãn bộ lọc
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => (
                  <tr 
                    key={c.id} 
                    className={`hover:bg-slate-50/40 transition-colors ${
                      editingCategory?.id === c.id ? 'bg-primary/5 hover:bg-primary/10' : ''
                    }`}
                  >
                    {/* Name */}
                    <td className="py-4 px-6 text-slate-800 font-extrabold whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {c.parentId ? (
                          <>
                            <span className="text-slate-300 font-normal select-none pr-1.5">└─</span>
                            <span className="text-slate-650 font-bold">{c.name}</span>
                          </>
                        ) : (
                          <span className="text-slate-900 font-extrabold text-sm">{c.name}</span>
                        )}
                      </div>
                    </td>

                    {/* Size type */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-600">
                        {c.sizeType}
                      </span>
                    </td>

                    {/* Parent category */}
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                      {c.parent ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                          <span className="text-slate-400 font-normal text-xs">Thuộc:</span> {c.parent.name}
                        </span>
                      ) : (
                        <span className="text-slate-300 italic font-normal text-xs">Danh mục gốc</span>
                      )}
                    </td>

                    {/* Sort Order */}
                    <td className="py-4 px-6 text-center font-bold text-slate-600 whitespace-nowrap">
                      {c.sortOrder}
                    </td>

                    {/* Display Active Status */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(c.id, c.isActive)}
                        className="focus:outline-none transition-transform hover:scale-102"
                        title="Click để đổi trạng thái"
                      >
                        {c.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50/75 px-3 py-1 rounded-full text-xs font-black border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Mở bán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-slate-500 bg-slate-50 px-3 py-1 rounded-full text-xs font-black border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Đóng
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Actions (Edit / Delete) */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-2 border border-slate-200 hover:border-primary/20 hover:bg-primary/5 text-slate-500 hover:text-primary rounded-xl transition shadow-3xs"
                          title="Chỉnh sửa danh mục"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-650 rounded-xl transition shadow-3xs"
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

      {/* Slide-over Drawer for Add/Edit Category */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
          {/* Backdrop Blur Overlay */}
          <div 
            onClick={handleResetForm}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300"
          />
          
          {/* Drawer Container Panel */}
          <div className="relative w-md max-w-full bg-white h-full shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto animate-slideRight border-l border-slate-100 z-10">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h3>
              <button 
                onClick={handleResetForm}
                className="p-1.5 rounded-full hover:bg-slate-100 transition flex items-center justify-center text-slate-400 hover:text-slate-650"
                title="Đóng drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSaveCategory} className="space-y-6 flex-grow flex flex-col justify-between">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tên danh mục *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Tất nam công sở"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-shadow font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quy chuẩn size (SizeType) *</label>
                  <select
                    value={formSizeType}
                    onChange={(e) => setFormSizeType(e.target.value as SizeType)}
                    className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-shadow cursor-pointer font-bold text-slate-800"
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
                    className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-shadow cursor-pointer text-slate-700 font-bold"
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
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-shadow font-bold text-slate-800"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trạng thái</span>
                    <div className="flex items-center gap-2 h-[42px]">
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
                      <span className="text-xs font-bold text-slate-650 uppercase tracking-wide">Mở bán</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer footer CTA buttons */}
              <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-auto">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : editingCategory ? 'Lưu thay đổi' : 'Thêm danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
