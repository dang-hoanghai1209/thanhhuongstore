'use client';

import { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  CreditCard, 
  Plus, 
  Minus, 
  Tag, 
  Info, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  ChevronRight, 
  HelpCircle 
} from 'lucide-react';

// ==========================================
// STATIC MOCK DATA (Schema-aligned)
// ==========================================
const mockProduct = {
  id: "9cc832a5-1845-41ae-8388-e79e5a9f6641",
  name: "Vớ Cổ Ngắn Cotton Premium Thấm Hút",
  slug: "vo-co-ngan-cotton-premium",
  categoryId: "1239ea4d-3fa1-4cc7-b131-33dcb98fc291",
  sizeType: "SOCK",
  description: "Dòng tất cao cấp được dệt từ 100% sợi Cotton Combed mềm mịn, dẻo dai. Thiết kế đệm xù gót và mũi tất êm ái chống phồng rộp chân khi vận động thể thao hoặc mang giày cả ngày. Công nghệ dệt kháng khuẩn khử mùi tiên tiến giữ chân luôn khô thoáng.",
  wholesaleTiers: [
    { minQty: 10, discount: 5 },
    { minQty: 50, discount: 10 },
    { minQty: 100, discount: 15 }
  ],
  isFeatured: true,
  isActive: true,
  category: {
    name: "Vớ Thời Trang"
  },
  images: [
    {
      id: "img1",
      url: "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=800&q=80",
      isPrimary: true
    },
    {
      id: "img2",
      url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80",
      isPrimary: false
    },
    {
      id: "img3",
      url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      isPrimary: false
    }
  ],
  variants: [
    { id: "v1", size: "S", color: "Trắng", colorHex: "#FFFFFF", retailPrice: 45000, wholesalePrice: 35000, stock: 150 },
    { id: "v2", size: "M", color: "Đen", colorHex: "#1A1A1A", retailPrice: 45000, wholesalePrice: 35000, stock: 120 },
    { id: "v3", size: "L", color: "Xám", colorHex: "#808080", retailPrice: 48000, wholesalePrice: 38000, stock: 80 },
    { id: "v4", size: "XL", color: "Đen", colorHex: "#1A1A1A", retailPrice: 48000, wholesalePrice: 38000, stock: 0 }, // Out of stock mock
  ]
};

export default function ProductDetailPage() {
  const [activeImage, setActiveImage] = useState(mockProduct.images[0].url);
  const [selectedColor, setSelectedColor] = useState(mockProduct.variants[0].color);
  const [selectedSize, setSelectedSize] = useState(mockProduct.variants[0].size);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'b2b' | 'guide'>('desc');

  // Extract unique colors and sizes from variants
  const colors = useMemo(() => {
    const unique: { name: string; hex: string }[] = [];
    mockProduct.variants.forEach(v => {
      if (!unique.some(u => u.name === v.color)) {
        unique.push({ name: v.color, hex: v.colorHex });
      }
    });
    return unique;
  }, []);

  const sizes = useMemo(() => {
    const unique: string[] = [];
    mockProduct.variants.forEach(v => {
      if (!unique.includes(v.size)) {
        unique.push(v.size);
      }
    });
    return unique;
  }, []);

  // Find currently active variant based on user selection
  const activeVariant = useMemo(() => {
    return mockProduct.variants.find(
      v => v.color === selectedColor && v.size === selectedSize
    ) || mockProduct.variants[0]; // fallback
  }, [selectedColor, selectedSize]);

  // Handle quantity modification
  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (type === 'inc') {
      if (quantity < activeVariant.stock) {
        setQuantity(prev => prev + 1);
      }
    } else {
      if (quantity > 1) {
        setQuantity(prev => prev - 1);
      }
    }
  };

  // Safe decimal helper
  const retailPrice = Number(activeVariant.retailPrice);
  const wholesalePrice = Number(activeVariant.wholesalePrice);

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-gray-900 pb-24 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8 font-medium">
          <a href="/" className="hover:text-brand-600 transition">Trang chủ</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <a href="/products" className="hover:text-brand-600 transition">Sản phẩm</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-800 line-clamp-1">{mockProduct.name}</span>
        </nav>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-8 rounded-brand-lg border border-gray-100 shadow-sm">
          
          {/* LEFT COLUMN: IMAGE GALLERY */}
          <div className="space-y-6">
            {/* Main Image View */}
            <div className="relative w-full aspect-square bg-gray-50 rounded-brand-lg overflow-hidden border border-gray-100 group">
              <img 
                src={activeImage} 
                alt={mockProduct.name} 
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              {mockProduct.isFeatured && (
                <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-brand-600 text-white text-xs font-bold uppercase tracking-wider shadow">
                  Nổi bật
                </span>
              )}
            </div>

            {/* Thumbnail Row */}
            <div className="grid grid-cols-3 gap-4">
              {mockProduct.images.map((img) => {
                const isActive = activeImage === img.url;
                return (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.url)}
                    className={`relative aspect-square rounded-brand-md overflow-hidden bg-gray-50 border transition ${
                      isActive 
                        ? 'border-brand-500 ring-2 ring-brand-500/20' 
                        : 'border-gray-200 hover:border-brand-400'
                    }`}
                  >
                    <img src={img.url} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: DISPATCH & ORDER DETAILS */}
          <div className="flex flex-col justify-between space-y-8">
            
            {/* Title & Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <span className="px-3 py-1.5 rounded-brand-sm bg-brand-50 text-brand-600 text-xs font-extrabold uppercase tracking-wide">
                  {mockProduct.category.name}
                </span>
                
                {/* Stock Status Badge */}
                {activeVariant.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Còn hàng ({activeVariant.stock})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Hết hàng
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                {mockProduct.name}
              </h1>
            </div>

            {/* Price Box */}
            <div className="p-5 rounded-brand-md bg-gradient-to-br from-[#f8f7ff] to-gray-50 border border-brand-100 space-y-4">
              <div className="flex items-baseline gap-3">
                <span className="text-xs text-gray-400 font-medium">Giá bán lẻ:</span>
                <span className="text-3xl font-black text-brand-600">
                  {retailPrice.toLocaleString('vi-VN')} đ
                </span>
              </div>

              {/* B2B Wholesale Pricing Tiers Banner */}
              {mockProduct.wholesaleTiers && (
                <div className="border-t border-brand-100/60 pt-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-accent-pink uppercase tracking-wide">
                    <Sparkles className="w-4 h-4" />
                    Bảng giá sỉ B2B (Mua số lượng lớn)
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2.5">
                    {mockProduct.wholesaleTiers.map((tier, idx) => {
                      const tierPrice = Math.round(wholesalePrice * (1 - tier.discount / 100));
                      return (
                        <div key={idx} className="p-3 bg-white border border-gray-100 rounded-brand-sm text-center shadow-xs">
                          <p className="text-[10px] text-gray-400 font-bold">Từ {tier.minQty} sp</p>
                          <p className="text-xs font-extrabold text-gray-800 mt-1">{tierPrice.toLocaleString('vi-VN')}đ</p>
                          <span className="inline-block text-[9px] text-emerald-600 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded mt-1.5">
                            -{tier.discount}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Colors Selection */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-600 tracking-wide block">
                MÀU SẮC: <span className="text-gray-800 font-extrabold">{selectedColor}</span>
              </span>
              <div className="flex flex-wrap gap-3">
                {colors.map((c) => {
                  const isActive = selectedColor === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-brand-md text-xs font-bold transition-all ${
                        isActive 
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-extrabold shadow-sm'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-xs" 
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sizes Selection */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-600 tracking-wide block">
                KÍCH THƯỚC: <span className="text-gray-800 font-extrabold">{selectedSize}</span>
              </span>
              <div className="flex flex-wrap gap-2.5">
                {sizes.map((s) => {
                  const isActive = selectedSize === s;
                  
                  // Check if this variant is out of stock to style differently
                  const variantObj = mockProduct.variants.find(
                    v => v.color === selectedColor && v.size === s
                  );
                  const isOutOfStock = variantObj && variantObj.stock === 0;

                  return (
                    <button
                      key={s}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(s)}
                      className={`px-5 py-2.5 border rounded-brand-md text-xs font-bold transition-all ${
                        isActive 
                          ? 'border-brand-600 bg-brand-600 text-white font-extrabold shadow'
                          : isOutOfStock
                            ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Call To Actions */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                {/* Quantity Adjustment */}
                <div className="flex items-center border border-gray-200 rounded-brand-md bg-white p-1">
                  <button 
                    onClick={() => handleQuantityChange('dec')}
                    disabled={quantity <= 1 || activeVariant.stock === 0}
                    className="p-2 rounded hover:bg-gray-50 disabled:opacity-30 transition"
                  >
                    <Minus className="w-4 h-4 text-gray-600" />
                  </button>
                  <span className="px-4 text-sm font-bold text-gray-800 w-10 text-center">
                    {activeVariant.stock === 0 ? 0 : quantity}
                  </span>
                  <button 
                    onClick={() => handleQuantityChange('inc')}
                    disabled={quantity >= activeVariant.stock || activeVariant.stock === 0}
                    className="p-2 rounded hover:bg-gray-50 disabled:opacity-30 transition"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="flex-1 text-xs text-gray-400 font-medium">
                  {activeVariant.stock > 0 && `Chỉ còn ${activeVariant.stock} sản phẩm có sẵn`}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  disabled={activeVariant.stock === 0}
                  className="px-6 py-4 rounded-brand-md border border-brand-600 text-brand-600 hover:bg-brand-50/80 font-bold transition-all disabled:opacity-40 disabled:hover:bg-transparent flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Thêm giỏ hàng
                </button>
                <button
                  disabled={activeVariant.stock === 0}
                  className="px-6 py-4 rounded-brand-md bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:bg-brand-600 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Mua sắm ngay
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Tab Sections (Details, Policies, Guides) */}
        <div className="mt-12 bg-white border border-gray-100 rounded-brand-lg overflow-hidden shadow-sm">
          {/* Tab Headings */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            {[
              { id: 'desc', label: 'Mô tả chi tiết', icon: Info },
              { id: 'b2b', label: 'Chính sách B2B', icon: Tag },
              { id: 'guide', label: 'Hướng dẫn chọn size', icon: HelpCircle }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-xs font-bold tracking-wide uppercase transition border-b-2 ${
                    isActive 
                      ? 'border-brand-600 text-brand-600 bg-white' 
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <div className="p-6 sm:p-8">
            {activeTab === 'desc' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">{mockProduct.description}</p>
                <h4 className="text-sm font-bold text-gray-800 pt-4">Thông tin kỹ thuật:</h4>
                <ul className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-xs text-gray-500">
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium">Chất liệu</span>
                    <span className="font-bold text-gray-700">100% Cotton Combed</span>
                  </li>
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium">Phân loại size</span>
                    <span className="font-bold text-gray-700">{mockProduct.sizeType}</span>
                  </li>
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium">Xuất xứ</span>
                    <span className="font-bold text-gray-700">Việt Nam</span>
                  </li>
                  <li className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium">Chỉ số co giãn</span>
                    <span className="font-bold text-gray-700">Co giãn 4 chiều tốt</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 'b2b' && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-brand-md text-emerald-800 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold">Chính sách bán sỉ bậc thang tự động:</p>
                    <p className="text-xs leading-relaxed text-emerald-700">Hệ thống của chúng tôi tự động tính mức chiết khấu tốt nhất trực tiếp tại giỏ hàng khi đạt số lượng yêu cầu. Thích hợp cho các đại lý thời trang nhỏ và vừa.</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-sm text-gray-600">
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Lợi thế khi đăng ký tài khoản Wholesale:</h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" /> Được áp dụng giá sỉ độc quyền thấp hơn tới 25% so với giá bán lẻ.
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" /> Miễn phí vận chuyển toàn quốc cho đơn sỉ có trị giá trên 2,000,000đ.
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" /> Được ưu tiên phân phối trước các lô hàng mới nhất trước khi mở bán lẻ.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'guide' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-500">Bảng quy đổi kích cỡ chuẩn cho dòng sản phẩm **{mockProduct.sizeType}**:</p>
                <div className="overflow-x-auto border border-gray-100 rounded-brand-md">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-700">
                        <th className="p-3">Kích Cỡ</th>
                        <th className="p-3">Thông Số Giày Tương Ứng</th>
                        <th className="p-3">Mô Tả Tiêu Chuẩn</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-brand-600">Size S</td>
                        <td className="p-3">35 - 37</td>
                        <td className="p-3">Thích hợp cho chân kích thước nhỏ hoặc nữ giới</td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-brand-600">Size M</td>
                        <td className="p-3">38 - 40</td>
                        <td className="p-3">Thích hợp cho nam chân vừa hoặc nữ chân to</td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-brand-600">Size L</td>
                        <td className="p-3">41 - 43</td>
                        <td className="p-3">Kích thước tiêu chuẩn phổ thông cho nam giới</td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-brand-600">Size XL</td>
                        <td className="p-3">44 - 46</td>
                        <td className="p-3">Thích hợp cho bàn chân ngoại cỡ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
