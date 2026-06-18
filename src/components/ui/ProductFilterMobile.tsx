'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, SlidersHorizontal } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFilterMobileProps {
  categories: Category[];
  searchParams: {
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    featured?: string;
  };
}

export default function ProductFilterMobile({ categories, searchParams }: ProductFilterMobileProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.search || '');
  const [minPrice, setMinPrice] = useState(searchParams.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice || '');

  const buildUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams();
    
    // Base params from current searchParams
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });

    // Apply updates
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    return `/products?${params.toString()}`;
  };

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Record<string, string | null> = {
      search: search.trim() ? search : null,
      minPrice: minPrice ? minPrice : null,
      maxPrice: maxPrice ? maxPrice : null,
      page: null, // Reset page on filter change
    };
    router.push(buildUrl(updates));
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    router.push('/products');
    setIsOpen(false);
  };

  const activeCategorySlug = searchParams.category;

  return (
    <div className="lg:hidden w-full mb-6">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-brand-lg py-3 px-4 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition shadow-xs"
      >
        <SlidersHorizontal className="w-4 h-4 text-gray-500" />
        Bộ lọc & Tìm kiếm
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex animate-fadeIn">
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer container */}
          <div className="relative ml-auto w-80 max-w-full bg-white h-full shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto animate-slideLeft">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Bộ lọc</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Tìm kiếm</h4>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-brand-md text-xs font-bold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Danh mục</h4>
              <div className="space-y-2 flex flex-col">
                <button
                  onClick={() => {
                    router.push(buildUrl({ category: null, page: null }));
                    setIsOpen(false);
                  }}
                  className={`text-left text-xs font-bold transition-all py-2 px-3 rounded-brand-sm border ${
                    !activeCategorySlug
                      ? 'border-brand-600 bg-brand-50 text-brand-700 font-extrabold shadow-sm'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Tất cả sản phẩm
                </button>
                {categories.map((cat) => {
                  const isActive = activeCategorySlug === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        router.push(buildUrl({ category: cat.slug, page: null }));
                        setIsOpen(false);
                      }}
                      className={`text-left text-xs font-bold transition-all py-2 px-3 rounded-brand-sm border ${
                        isActive
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-extrabold shadow-sm'
                          : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2.5 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Khoảng giá (VNĐ)</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Từ</label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-brand-md px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-brand-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Đến</label>
                  <input
                    type="number"
                    placeholder="Giá tối đa"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full border border-gray-200 rounded-brand-md px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-brand-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-6 border-t border-gray-100">
              <button
                onClick={handleApplyFilters}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-3 rounded-brand-md transition shadow-xs text-center"
              >
                Áp dụng
              </button>
              <button
                onClick={handleClearFilters}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-3 rounded-brand-md transition text-center"
              >
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
