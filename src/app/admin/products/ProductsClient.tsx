'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Image as ImageIcon, 
  Check, 
  X, 
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Eye
} from 'lucide-react';
import { createProductAction, updateProductAction, toggleProductActiveAction } from './actions';

interface Category {
  id: string;
  name: string;
  sizeType: string;
}

interface ProductImage {
  id?: string;
  url: string;
  isPrimary: boolean;
}

interface ProductVariant {
  id?: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  sizeType: string;
  isActive: boolean;
  category: {
    name: string;
  };
  images: ProductImage[];
  variants: ProductVariant[];
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formDescription, setFormDescription] = useState(''); // Simulated in UI
  const [formVariants, setFormVariants] = useState<ProductVariant[]>([]);

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
    setEditingProduct(null);
    setFormName('');
    setFormCategory(categories[0]?.id || '');
    setFormIsActive(true);
    setFormImageUrl('');
    setFormDescription('');
    setFormVariants([
      { sku: '', size: 'M', color: 'Đen', colorHex: '#000000', retailPrice: 120000, wholesalePrice: 90000, stock: 50 }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.categoryId);
    setFormIsActive(product.isActive);
    setFormImageUrl(product.images.find(img => img.isPrimary)?.url || '');
    setFormDescription(''); // placeholder
    setFormVariants(product.variants.map(v => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      colorHex: v.colorHex,
      retailPrice: Number(v.retailPrice),
      wholesalePrice: Number(v.wholesalePrice),
      stock: v.stock
    })));
    setIsModalOpen(true);
  };

  const handleAddVariantRow = () => {
    setFormVariants((prev) => [
      ...prev,
      { sku: '', size: 'M', color: 'Trắng', colorHex: '#FFFFFF', retailPrice: 120000, wholesalePrice: 90000, stock: 50 }
    ]);
  };

  const handleRemoveVariantRow = (index: number) => {
    setFormVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantFieldChange = (index: number, field: keyof ProductVariant, value: any) => {
    setFormVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await toggleProductActiveAction(productId, !currentStatus);
      if (response.success) {
        setProducts((prev) =>
          prev.map((p) => p.id === productId ? { ...p, isActive: !currentStatus } : p)
        );
        showToast('Cập nhật trạng thái sản phẩm thành công', 'success');
      } else {
        showToast(response.message || 'Cập nhật trạng thái thất bại', 'error');
      }
    } catch (error) {
      showToast('Lỗi mạng khi cập nhật trạng thái', 'error');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Vui lòng nhập tên sản phẩm', 'error');
      return;
    }
    if (formVariants.length === 0) {
      showToast('Sản phẩm phải có ít nhất 1 biến thể', 'error');
      return;
    }

    setSaving(true);
    try {
      // Use fallback image if empty
      const finalImageUrl = formImageUrl.trim() || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&q=80';
      const imagesPayload = [{ url: finalImageUrl, isPrimary: true }];

      if (editingProduct) {
        // Edit Mode
        const res = await updateProductAction(editingProduct.id, {
          name: formName,
          categoryId: formCategory,
          isActive: formIsActive,
          images: imagesPayload,
          variants: formVariants
        });

        if (res.success) {
          showToast('Cập nhật sản phẩm thành công', 'success');
          // Reload / Re-fetch updated product locally (or simple page reload equivalent)
          const catName = categories.find(c => c.id === formCategory)?.name || '';
          setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
            ...p,
            name: formName,
            categoryId: formCategory,
            isActive: formIsActive,
            category: { name: catName },
            images: imagesPayload,
            variants: formVariants
          } : p));
          setIsModalOpen(false);
        } else {
          showToast(res.message || 'Lỗi hệ thống khi lưu sản phẩm', 'error');
        }
      } else {
        // Add Mode
        const res = await createProductAction({
          name: formName,
          categoryId: formCategory,
          isActive: formIsActive,
          images: imagesPayload,
          variants: formVariants
        });

        if (res.success && res.product) {
          showToast('Thêm sản phẩm thành công', 'success');
          const catName = categories.find(c => c.id === formCategory)?.name || '';
          const newProductFull: Product = {
            id: res.product.id,
            name: res.product.name,
            slug: res.product.slug,
            categoryId: res.product.categoryId,
            sizeType: res.product.sizeType,
            isActive: res.product.isActive,
            category: { name: catName },
            images: imagesPayload,
            variants: formVariants
          };
          setProducts(prev => [newProductFull, ...prev]);
          setIsModalOpen(false);
        } else {
          showToast(res.message || 'Lỗi hệ thống khi tạo sản phẩm', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showToast('Đã xảy ra lỗi mạng', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getStockSum = (variants: ProductVariant[]) => {
    return variants.reduce((sum, v) => sum + Number(v.stock), 0);
  };

  const formatVND = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Sản Phẩm</h1>
          <p className="text-sm text-slate-500 mt-1">Cập nhật kho hàng, phân loại biến thể sản phẩm.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          Thêm sản phẩm mới
        </button>
      </div>

      {/* Search Filter utility */}
      <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex items-center">
        <div className="relative flex-grow">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc danh mục..."
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
                <th className="py-4 px-6 w-24 text-center">Ảnh</th>
                <th className="py-4 px-6">Tên sản phẩm</th>
                <th className="py-4 px-6">Danh mục</th>
                <th className="py-4 px-6 text-center">Trạng thái</th>
                <th className="py-4 px-6 text-center">Tồn kho</th>
                <th className="py-4 px-6 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy sản phẩm nào
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const primaryImage = p.images.find(img => img.isPrimary)?.url || p.images[0]?.url;
                  const totalStock = getStockSum(p.variants);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Product Thumbnail */}
                      <td className="py-4 px-6">
                        <div className="w-12 h-12 rounded-lg border border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 mx-auto">
                          {primaryImage ? (
                            <img src={primaryImage} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      </td>

                      {/* Name & link preview */}
                      <td className="py-4 px-6 font-bold text-slate-800">
                        <div>{p.name}</div>
                        <a 
                          href={`/products/${p.slug}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs text-blue-500 font-semibold hover:underline inline-flex items-center gap-1 mt-1 font-normal"
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem ngoài Shop
                        </a>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6 font-medium text-slate-500">
                        {p.category.name}
                      </td>

                      {/* Active Status toggle button */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleToggleActive(p.id, p.isActive)}
                          className="focus:outline-none transition-colors"
                          title={p.isActive ? 'Bấm để ẩn sản phẩm' : 'Bấm để hiển thị sản phẩm'}
                        >
                          {p.isActive ? (
                            <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Đang bán
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Tạm ẩn
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Total Stock */}
                      <td className="py-4 px-6 text-center">
                        <span className={`text-sm font-bold ${totalStock <= 10 ? 'text-amber-600' : 'text-slate-800'}`}>
                          {totalStock} chiếc
                        </span>
                      </td>

                      {/* Edit Row button */}
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-2 border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-xl transition shadow-sm"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit2 className="w-4 h-4" />
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

      {/* Editor Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-slideUp">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Cung cấp thông tin sản phẩm và thiết lập các biến thể chi tiết.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProduct} className="flex-grow overflow-y-auto p-6 space-y-6">
              {/* Core Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left col - General Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tên sản phẩm *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Áo Ngực Bralette Cotton Mộc"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Danh mục sản phẩm</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} ({cat.sizeType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setFormIsActive(!formIsActive)}
                      className="text-slate-600 hover:text-slate-900 focus:outline-none transition shrink-0"
                    >
                      {formIsActive ? (
                        <ToggleRight className="w-10 h-10 text-blue-600" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <span className="text-sm font-semibold text-slate-800">Hiển thị bán hàng (isActive)</span>
                      <p className="text-xs text-slate-400 mt-0.5">Nếu tắt, sản phẩm sẽ tạm ẩn ngoài mặt tiền shop.</p>
                    </div>
                  </div>
                </div>

                {/* Right col - Media and Description */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Đường dẫn ảnh đại diện (URL)</label>
                    <input
                      type="text"
                      placeholder="Nhập link ảnh hoặc để trống để dùng ảnh mặc định"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mô tả sản phẩm (Simulated)</label>
                    <textarea
                      placeholder="Mô tả tóm tắt chất liệu, công năng..."
                      rows={3}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Variants section */}
              <div className="border-t border-slate-100 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Các Biến Thể Sản Phẩm</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Thiết lập chi tiết size, màu, và giá cho từng tổ hợp.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 hover:bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Thêm biến thể
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                          <th className="py-3 px-4 w-28">Màu sắc</th>
                          <th className="py-3 px-4 w-20">Mã màu</th>
                          <th className="py-3 px-4 w-20">Size</th>
                          <th className="py-3 px-4">Giá lẻ (VNĐ)</th>
                          <th className="py-3 px-4">Giá sỉ (VNĐ)</th>
                          <th className="py-3 px-4 w-24">Tồn kho</th>
                          <th className="py-3 px-4">Mã SKU</th>
                          <th className="py-3 px-4 text-center w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {formVariants.map((variant, index) => (
                          <tr key={index} className="hover:bg-slate-50/20">
                            {/* Color Name */}
                            <td className="py-2.5 px-4">
                              <input
                                type="text"
                                required
                                value={variant.color}
                                onChange={(e) => handleVariantFieldChange(index, 'color', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg focus:bg-white focus:outline-none"
                              />
                            </td>

                            {/* Color Hex Picker */}
                            <td className="py-2.5 px-4 text-center">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="color"
                                  value={variant.colorHex}
                                  onChange={(e) => handleVariantFieldChange(index, 'colorHex', e.target.value)}
                                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5 shrink-0"
                                />
                              </div>
                            </td>

                            {/* Size Input */}
                            <td className="py-2.5 px-4">
                              <input
                                type="text"
                                required
                                value={variant.size}
                                onChange={(e) => handleVariantFieldChange(index, 'size', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg focus:bg-white focus:outline-none text-center font-bold"
                              />
                            </td>

                            {/* Retail Price */}
                            <td className="py-2.5 px-4">
                              <input
                                type="number"
                                required
                                min="0"
                                value={variant.retailPrice}
                                onChange={(e) => handleVariantFieldChange(index, 'retailPrice', Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg focus:bg-white focus:outline-none text-right font-semibold"
                              />
                            </td>

                            {/* Wholesale Price */}
                            <td className="py-2.5 px-4">
                              <input
                                type="number"
                                required
                                min="0"
                                value={variant.wholesalePrice}
                                onChange={(e) => handleVariantFieldChange(index, 'wholesalePrice', Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg focus:bg-white focus:outline-none text-right font-semibold text-slate-500"
                              />
                            </td>

                            {/* Stock */}
                            <td className="py-2.5 px-4">
                              <input
                                type="number"
                                required
                                min="0"
                                value={variant.stock}
                                onChange={(e) => handleVariantFieldChange(index, 'stock', Number(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg focus:bg-white focus:outline-none text-center font-bold"
                              />
                            </td>

                            {/* SKU Code */}
                            <td className="py-2.5 px-4">
                              <input
                                type="text"
                                placeholder="Tự sinh nếu trống"
                                value={variant.sku}
                                onChange={(e) => handleVariantFieldChange(index, 'sku', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-lg focus:bg-white focus:outline-none font-mono"
                              />
                            </td>

                            {/* Remove row */}
                            <td className="py-2.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveVariantRow(index)}
                                disabled={formVariants.length <= 1}
                                className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 rounded-lg hover:bg-slate-100 transition"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Form Submission buttons */}
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
                  {saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
