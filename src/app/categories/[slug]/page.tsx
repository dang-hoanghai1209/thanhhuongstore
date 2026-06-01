'use client';

import { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  Check, 
  Sparkles 
} from 'lucide-react';

// ==========================================
// STATIC MOCK DATA (Category & 6 Products)
// ==========================================
const mockCategory = {
  name: "Tất Vớ Cao Cấp",
  description: "Bộ sưu tập tất vớ cao cấp mềm mịn, thoáng khí, kháng khuẩn khử mùi vượt trội. Được thiết kế tối ưu hỗ trợ bảo vệ gót chân và mang lại cảm giác dễ chịu suốt ngày dài."
};

const mockProducts = [
  {
    id: "p1",
    name: "Vớ Cổ Ngắn Thể Thao Cushioning",
    slug: "vo-co-ngan-the-thao-cushioning",
    categoryId: "c1",
    sizeType: "SOCK",
    isFeatured: true,
    isActive: true,
    createdAt: "2026-05-25T08:00:00.000Z",
    category: { name: "Tất Vớ Cao Cấp" },
    images: [{ url: "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=400&q=80", isPrimary: true }],
    variants: [{ retailPrice: 35000, wholesalePrice: 28000, size: "M", color: "Trắng", colorHex: "#FFFFFF", stock: 150 }]
  },
  {
    id: "p2",
    name: "Tất Dệt Lông Cừu Merino Giữ Ấm",
    slug: "tat-det-long-cuu-merino-giu-am",
    categoryId: "c1",
    sizeType: "SOCK",
    isFeatured: true,
    isActive: true,
    createdAt: "2026-05-28T09:30:00.000Z",
    category: { name: "Tất Vớ Cao Cấp" },
    images: [{ url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=400&q=80", isPrimary: true }],
    variants: [{ retailPrice: 120000, wholesalePrice: 95000, size: "L", color: "Xám", colorHex: "#808080", stock: 80 }]
  },
  {
    id: "p3",
    name: "Vớ Lười Silicon Chống Tuột Gót",
    slug: "vo-luoi-silicon-chong-tuot-got",
    categoryId: "c1",
    sizeType: "SOCK",
    isFeatured: false,
    isActive: true,
    createdAt: "2026-05-20T10:15:00.000Z",
    category: { name: "Tất Vớ Cao Cấp" },
    images: [{ url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80", isPrimary: true }],
    variants: [{ retailPrice: 28000, wholesalePrice: 22000, size: "S", color: "Beige", colorHex: "#F5F5DC", stock: 200 }]
  },
  {
    id: "p4",
    name: "Tất Dài Đá Bóng Chuyên Nghiệp",
    slug: "tat-dai-da-bong-chuyen-nghiep",
    categoryId: "c1",
    sizeType: "SOCK",
    isFeatured: false,
    isActive: true,
    createdAt: "2026-05-29T14:20:00.000Z",
    category: { name: "Tất Vớ Cao Cấp" },
    images: [{ url: "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=400&q=80", isPrimary: true }],
    variants: [{ retailPrice: 85000, wholesalePrice: 68000, size: "XL", color: "Đen", colorHex: "#1A1A1A", stock: 60 }]
  },
  {
    id: "p5",
    name: "Tất Cổ Cao Họa Tiết Vintage Thụy Điển",
    slug: "tat-co-cao-hoa-tiet-vintage-thuy-dien",
    categoryId: "c1",
    sizeType: "SOCK",
    isFeatured: false,
    isActive: true,
    createdAt: "2026-05-22T11:00:00.000Z",
    category: { name: "Tất Vớ Cao Cấp" },
    images: [{ url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=400&q=80", isPrimary: true }],
    variants: [{ retailPrice: 55000, wholesalePrice: 44000, size: "M", color: "Trắng", colorHex: "#FFFFFF", stock: 110 }]
  },
  {
    id: "p6",
    name: "Vớ Xỏ Ngón Yoga Kháng Khuẩn",
    slug: "vo-xo-ngon-yoga-khang-khuan",
    categoryId: "c1",
    sizeType: "SOCK",
    isFeatured: false,
    isActive: true,
    createdAt: "2026-05-27T16:45:00.000Z",
    category: { name: "Tất Vớ Cao Cấp" },
    images: [{ url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80", isPrimary: true }],
    variants: [{ retailPrice: 65000, wholesalePrice: 50000, size: "S", color: "Xám", colorHex: "#808080", stock: 90 }]
  }
];

export default function CategoryPage() {
  // Filters & Sorting state
  const [selectedPrice, setSelectedPrice] = useState<string>('all');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Available options
  const filterSizes = ['S', 'M', 'L', 'XL'];
  const filterColors = [
    { name: 'Trắng', hex: '#FFFFFF' },
    { name: 'Đen', hex: '#1A1A1A' },
    { name: 'Xám', hex: '#808080' },
    { name: 'Beige', hex: '#F5F5DC' }
  ];

  // Handle Multi-select sizes
  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Handle Multi-select colors
  const handleColorToggle = (colorName: string) => {
    setSelectedColors(prev => 
      prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedPrice('all');
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  // Filter and Sort implementation
  const filteredProducts = useMemo(() => {
    let result = [...mockProducts];

    // 1. Price Filter
    if (selectedPrice !== 'all') {
      result = result.filter(p => {
        const price = Number(p.variants[0].retailPrice);
        if (selectedPrice === 'under-50') return price < 50000;
        if (selectedPrice === '50-100') return price >= 50000 && price <= 100000;
        if (selectedPrice === 'above-100') return price > 100000;
        return true;
      });
    }

    // 2. Size Filter
    if (selectedSizes.length > 0) {
      result = result.filter(p => 
        p.variants.some(v => selectedSizes.includes(v.size))
      );
    }

    // 3. Color Filter
    if (selectedColors.length > 0) {
      result = result.filter(p => 
        p.variants.some(v => selectedColors.includes(v.color))
      );
    }

    // 4. Sorting
    result.sort((a, b) => {
      const priceA = Number(a.variants[0].retailPrice);
      const priceB = Number(b.variants[0].retailPrice);
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      return dateB - dateA; // default: newest
    });

    return result;
  }, [selectedPrice, selectedSizes, selectedColors, sortBy]);

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-gray-900 pb-24">
      
      {/* Category Hero Header Banner */}
      <section className="bg-gradient-to-r from-brand-950 to-brand-800 text-white py-16 px-6 sm:px-12 md:px-20 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500 rounded-full filter blur-3xl opacity-15 -mr-16 -mt-16" />
        <div className="relative max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 text-brand-200 text-[10px] font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Danh mục cửa hàng
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{mockCategory.name}</h1>
          <p className="text-sm sm:text-base text-brand-100 max-w-2xl leading-relaxed">{mockCategory.description}</p>
          <p className="text-xs text-brand-300 font-medium">Tìm thấy {filteredProducts.length} sản phẩm phù hợp</p>
        </div>
      </section>

      {/* Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          
          {/* DESKTOP SIDEBAR FILTER */}
          <aside className="hidden lg:block space-y-8 bg-white p-6 rounded-brand-lg border border-gray-100 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Bộ lọc sản phẩm</h3>
              <button 
                onClick={resetFilters} 
                className="text-xs font-bold text-brand-600 hover:text-brand-700 transition"
              >
                Đặt lại
              </button>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Khoảng giá</h4>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'Tất cả giá' },
                  { value: 'under-50', label: 'Dưới 50,000đ' },
                  { value: '50-100', label: '50,000đ - 100,000đ' },
                  { value: 'above-100', label: 'Trên 100,000đ' }
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer hover:text-gray-800">
                    <input 
                      type="radio" 
                      name="price-filter" 
                      value={opt.value}
                      checked={selectedPrice === opt.value}
                      onChange={(e) => setSelectedPrice(e.target.value)}
                      className="w-3.5 h-3.5 text-brand-600 focus:ring-brand-500 border-gray-300"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Kích thước</h4>
              <div className="flex flex-wrap gap-2">
                {filterSizes.map(size => {
                  const isChecked = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`px-3 py-1.5 border rounded-brand-md text-xs font-bold transition ${
                        isChecked 
                          ? 'border-brand-600 bg-brand-600 text-white' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Màu sắc</h4>
              <div className="grid grid-cols-2 gap-2">
                {filterColors.map(color => {
                  const isChecked = selectedColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      onClick={() => handleColorToggle(color.name)}
                      className={`flex items-center gap-2 p-2 border rounded-brand-md text-[11px] font-bold transition text-left ${
                        isChecked 
                          ? 'border-brand-600 bg-brand-50 text-brand-700' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" 
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="truncate">{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* MAIN PRODUCT LIST LAYER */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Sorting Header Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-brand-lg border border-gray-100 shadow-xs flex-wrap gap-4">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-brand-md bg-white text-xs font-bold hover:bg-gray-50 transition"
              >
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                Bộ lọc
              </button>

              <div className="hidden lg:block text-xs text-gray-500 font-medium">
                Hiển thị <span className="font-bold text-gray-800">{filteredProducts.length}</span> sản phẩm
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-gray-400 font-medium">Sắp xếp:</span>
                <div className="relative inline-block text-left">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pr-8 pl-3 py-2 border border-gray-200 rounded-brand-md bg-white text-xs font-bold hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="price-asc">Giá: Thấp đến Cao</option>
                    <option value="price-desc">Giá: Cao đến Thấp</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                </div>
              </div>
            </div>

            {/* EMPTY PRODUCTS FILTER STATE */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-24 bg-white rounded-brand-lg border border-gray-100 shadow-xs">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-700 font-heading">Không tìm thấy sản phẩm</h3>
                <p className="text-xs text-gray-500 mt-2">Vui lòng điều chỉnh lại bộ lọc để tìm sản phẩm phù hợp.</p>
                <button 
                  onClick={resetFilters} 
                  className="mt-5 px-6 py-2 rounded-brand-md bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}

            {/* PRODUCT CARDS GRID */}
            {filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {filteredProducts.map((product) => {
                  const firstVariant = product.variants[0];
                  const price = firstVariant ? firstVariant.retailPrice : 0;
                  const primaryImage = product.images[0]?.url || '/placeholder.jpg';

                  return (
                    <div 
                      key={product.id}
                      className="group bg-white rounded-brand-lg border border-gray-100 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                    >
                      {/* Image container */}
                      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden border-b border-gray-100">
                        <img 
                          src={primaryImage} 
                          alt={product.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.isFeatured && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-brand-600/90 text-white text-[9px] font-extrabold uppercase tracking-wide shadow-xs">
                            Nổi bật
                          </span>
                        )}
                      </div>

                      {/* Info body */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wide block">
                            {product.category.name}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                        </div>

                        <div className="flex items-end justify-between pt-1">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-gray-400 font-medium block">Giá bán lẻ:</span>
                            <p className="text-xs sm:text-sm font-black text-brand-600">
                              {price > 0 ? `${price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                            </p>
                          </div>
                          
                          <a 
                            href={`/products/${product.slug}`}
                            className="p-2 rounded-brand-md bg-brand-50 group-hover:bg-brand-500 text-brand-600 group-hover:text-white transition-all duration-300 shrink-0"
                            title="Xem chi tiết"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* MOBILE DRAWER FILTER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Overlay backdrop */}
          <div 
            onClick={() => setIsMobileFilterOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
          />

          {/* Drawer Panel */}
          <div className="relative w-80 max-w-full bg-white h-full shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto animate-slideRight">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                Bộ lọc nâng cao
              </h3>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Khoảng giá</h4>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'Tất cả giá' },
                  { value: 'under-50', label: 'Dưới 50,000đ' },
                  { value: '50-100', label: '50,000đ - 100,000đ' },
                  { value: 'above-100', label: 'Trên 100,000đ' }
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer">
                    <input 
                      type="radio" 
                      name="price-filter-mobile" 
                      value={opt.value}
                      checked={selectedPrice === opt.value}
                      onChange={(e) => setSelectedPrice(e.target.value)}
                      className="w-3.5 h-3.5 text-brand-600 focus:ring-brand-500 border-gray-300"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Kích thước</h4>
              <div className="flex flex-wrap gap-2">
                {filterSizes.map(size => {
                  const isChecked = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`px-3 py-1.5 border rounded-brand-md text-xs font-bold transition ${
                        isChecked 
                          ? 'border-brand-600 bg-brand-600 text-white' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Màu sắc</h4>
              <div className="grid grid-cols-2 gap-2">
                {filterColors.map(color => {
                  const isChecked = selectedColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      onClick={() => handleColorToggle(color.name)}
                      className={`flex items-center gap-2 p-2 border rounded-brand-md text-[11px] font-bold transition ${
                        isChecked 
                          ? 'border-brand-600 bg-brand-50 text-brand-700' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" 
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="truncate">{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apply & Reset Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
              <button
                onClick={resetFilters}
                className="w-full py-3 border border-gray-200 rounded-brand-md text-xs font-bold hover:bg-gray-50 transition text-center"
              >
                Đặt lại
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-brand-md text-xs font-bold transition text-center"
              >
                Áp dụng
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
