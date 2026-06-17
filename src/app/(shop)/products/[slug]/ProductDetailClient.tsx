'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import Breadcrumb from '@/components/ui/Breadcrumb';

const DEFAULT_PRODUCT_IMAGE = '/uploads/products/tat-da-min.jpg';

interface Variant {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  retailPrice: number;
  wholesalePrice: number;
  stock: number;
}

interface Image {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  images: Image[];
  variants: Variant[];
  wholesaleTiers?: any;
}

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { name, category, images, variants } = product;

  // 1. Gallery State
  const defaultImage = images.find(img => img.isPrimary)?.url || images[0]?.url || DEFAULT_PRODUCT_IMAGE;
  const [activeImage, setActiveImage] = useState<string>(defaultImage);

  // 2. Zustand Store Actions
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  // 3. Variant Option Filtering
  const colors = useMemo(() => {
    const uniqueColors: { name: string; hex: string }[] = [];
    variants.forEach(v => {
      if (!uniqueColors.some(c => c.name === v.color)) {
        uniqueColors.push({ name: v.color, hex: v.colorHex });
      }
    });
    return uniqueColors;
  }, [variants]);

  const sizes = useMemo(() => {
    const uniqueSizes: string[] = [];
    variants.forEach(v => {
      if (!uniqueSizes.includes(v.size)) {
        uniqueSizes.push(v.size);
      }
    });
    return uniqueSizes;
  }, [variants]);

  // 4. Selection States
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedStatus, setAddedStatus] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'b2b' | 'size'>('desc');

  // 5. Match selection to exact variant
  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return variants.find(v => v.color === selectedColor && v.size === selectedSize) || null;
  }, [selectedColor, selectedSize, variants]);

  // Determine available sizes for the currently selected color
  const availableSizesForColor = useMemo(() => {
    if (!selectedColor) return sizes;
    return variants
      .filter(v => v.color === selectedColor && v.stock > 0)
      .map(v => v.size);
  }, [selectedColor, variants, sizes]);

  // Determine price text range
  const priceDisplay = useMemo(() => {
    if (selectedVariant) {
      return `${selectedVariant.retailPrice.toLocaleString('vi-VN')} đ`;
    }

    if (variants.length === 0) return 'Liên hệ';

    const prices = variants.map(v => v.retailPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    if (minPrice === maxPrice) {
      return `${minPrice.toLocaleString('vi-VN')} đ`;
    }

    return `Từ ${minPrice.toLocaleString('vi-VN')} đ - ${maxPrice.toLocaleString('vi-VN')} đ`;
  }, [selectedVariant, variants]);

  // Handle Quantity adjustments safely
  const handleQtyChange = (action: 'inc' | 'dec') => {
    const maxStock = selectedVariant ? selectedVariant.stock : 10;
    if (action === 'inc') {
      setQuantity(prev => Math.min(prev + 1, maxStock));
    } else {
      setQuantity(prev => Math.max(prev - 1, 1));
    }
  };

  // Dispatch variant details to Zustand
  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addItem({
      id: selectedVariant.id,
      name: name,
      categoryName: category.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: selectedVariant.retailPrice,
      imageUrl: activeImage,
      stock: selectedVariant.stock,
      quantity: quantity
    });

    // Animate Button checkmark feedback
    setAddedStatus(true);
    setTimeout(() => setAddedStatus(false), 2000);

    // Dynamic feed forward to slide open the MiniCart right away
    openCart();
  };

  // Wholesale tiered values parsing
  const tiers = useMemo(() => {
    if (!product.wholesaleTiers) return [];
    try {
      return typeof product.wholesaleTiers === 'string'
        ? JSON.parse(product.wholesaleTiers)
        : product.wholesaleTiers;
    } catch (e) {
      return [];
    }
  }, [product.wholesaleTiers]);

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-gray-900 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumbs Navigation */}
        <Breadcrumb
          items={[
            { label: 'Sản phẩm', href: '/products' },
            ...(category ? [{ label: category.name, href: `/categories/${category.slug}` }] : []),
            { label: name }
          ]}
        />

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start bg-white p-6 sm:p-8 rounded-brand-lg border border-gray-100 shadow-xs">

          {/* LEFT COLUMN: Gallery Panel (5 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Primary Large Image Container */}
            <div className="aspect-[4/5] bg-gray-50 border border-gray-100 rounded-brand-lg overflow-hidden relative shadow-2xs">
              <img
                src={activeImage}
                alt={name}
                className="w-full h-full object-cover object-center transition duration-500 hover:scale-102"
              />

              {/* Featured Badge */}
              {variants.some(v => v.stock > 0) ? (
                <span className="absolute top-4 left-4 bg-brand-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-brand-sm shadow-sm">
                  Mới Về
                </span>
              ) : (
                <span className="absolute top-4 left-4 bg-gray-800 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-brand-sm shadow-sm">
                  Cháy Hàng
                </span>
              )}
            </div>

            {/* Thumbnails Row Grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(img.url)}
                    className={`aspect-[4/5] bg-gray-50 rounded-brand-md overflow-hidden border transition-all ${
                      activeImage === img.url
                        ? 'border-brand-600 ring-2 ring-brand-500/10'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={img.url} alt="thumbnail" className="w-full h-full object-cover object-center" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Detail Options Panel (6 cols) */}
          <div className="lg:col-span-6 space-y-6">

            {/* Category and Title */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                <Sparkles className="w-3 h-3" />
                {category.name}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-gray-950 leading-tight tracking-tight">
                {name}
              </h1>
            </div>

            {/* Display Retail Price */}
            <div className="bg-gray-50/50 p-4 border border-gray-100 rounded-brand-md flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Giá Bán Lẻ</span>
                <span className="text-2xl font-black text-brand-600 mt-1 block">
                  {priceDisplay}
                </span>
              </div>

              {/* Optional stock message */}
              {selectedVariant && (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Tình Trạng</span>
                  <span className={`text-xs font-extrabold mt-1 block ${
                    selectedVariant.stock > 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {selectedVariant.stock > 0 ? `Còn ${selectedVariant.stock} sản phẩm` : 'Tạm hết hàng'}
                  </span>
                </div>
              )}
            </div>

            {/* 1. Selection Options: Colors */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                Màu sắc: <span className="text-gray-900 font-extrabold">{selectedColor || 'Chưa chọn'}</span>
              </span>
              <div className="flex flex-wrap gap-2.5">
                {colors.map((colorObj) => {
                  const isSelected = selectedColor === colorObj.name;
                  return (
                    <button
                      key={colorObj.name}
                      onClick={() => {
                        setSelectedColor(colorObj.name);
                        // Reset size selection if not available in new color
                        setSelectedSize(null);
                      }}
                      className={`relative flex items-center justify-center p-0.5 rounded-full border transition-all ${
                        isSelected
                          ? 'border-brand-600 ring-2 ring-brand-500/20 scale-105'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      title={colorObj.name}
                    >
                      <span
                        className="w-7 h-7 rounded-full border border-black/5"
                        style={{ backgroundColor: colorObj.hex }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Selection Options: Sizes */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                Kích thước: <span className="text-gray-900 font-extrabold">{selectedSize || 'Chưa chọn'}</span>
              </span>
              <div className="flex flex-wrap gap-2.5">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  const isAvailable = availableSizesForColor.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`min-w-10 h-10 px-3 border rounded-brand-sm text-xs font-bold transition flex items-center justify-center ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/50 text-brand-600 font-black ring-1 ring-brand-500/10'
                          : isAvailable
                            ? 'border-gray-200 text-gray-800 hover:border-gray-400 hover:bg-gray-50'
                            : 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50 line-through'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity adjust & Add actions */}
            <div className="space-y-4 pt-4 border-t border-gray-100/60">
              <div className="flex items-center gap-4">

                {/* Quantity modifier */}
                <div className="flex items-center border border-gray-200 rounded-brand-md bg-white p-1 shadow-2xs">
                  <button
                    onClick={() => handleQtyChange('dec')}
                    disabled={quantity <= 1 || !selectedVariant}
                    className="p-1.5 hover:bg-gray-50 text-gray-500 disabled:text-gray-300 disabled:bg-transparent rounded-brand-sm transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-black text-gray-800 min-w-6 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQtyChange('inc')}
                    disabled={!selectedVariant || quantity >= selectedVariant.stock}
                    className="p-1.5 hover:bg-gray-50 text-gray-500 disabled:text-gray-300 disabled:bg-transparent rounded-brand-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to cart CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock === 0}
                  className={`flex-1 py-3.5 rounded-brand-md text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 border shadow-xs ${
                    !selectedVariant
                      ? 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed'
                      : selectedVariant.stock === 0
                        ? 'bg-gray-800 text-white border-transparent cursor-not-allowed'
                        : addedStatus
                          ? 'bg-emerald-600 text-white border-transparent'
                          : 'bg-gray-950 text-white border-transparent hover:bg-gray-900 active:bg-black'
                  }`}
                >
                  {addedStatus ? (
                    <>
                      <Check className="w-4 h-4" />
                      Đã thêm vào giỏ!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      {!selectedVariant
                        ? 'Vui lòng chọn phân loại'
                        : selectedVariant.stock === 0
                          ? 'Hết hàng'
                          : 'Thêm vào giỏ hàng'}
                    </>
                  )}
                </button>

              </div>
            </div>

            {/* Wholesale Info Banner for B2B */}
            {tiers.length > 0 && (
              <div className="bg-brand-50/60 p-4 border border-brand-100/50 rounded-brand-lg space-y-2">
                <span className="text-[10px] font-black text-brand-700 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-accent-pink animate-pulse" />
                  Chiết Khấu Đại Lý B2B (Đại Lý Sỉ)
                </span>
                <p className="text-[11px] text-brand-900 leading-relaxed">
                  Đại lý sỉ sẽ được áp dụng bảng giá sỉ chiết khấu tự động khi số lượng đạt mốc:
                </p>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] text-center font-bold">
                  {tiers.map((tier: any, index: number) => (
                    <div key={index} className="bg-white px-2.5 py-1.5 rounded border border-brand-200/50 shadow-3xs">
                      <p className="text-gray-500">Mua từ {tier.minQty} cái</p>
                      <p className="text-brand-600 font-extrabold mt-0.5">Giảm {tier.discount}% / cái</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs details specifications */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex border-b border-gray-100 text-xs font-bold text-gray-400">
                <button
                  onClick={() => setActiveTab('desc')}
                  className={`pb-2.5 pr-4 border-b-2 transition ${
                    activeTab === 'desc' ? 'border-brand-600 text-brand-600 font-extrabold' : 'border-transparent hover:text-gray-800'
                  }`}
                >
                  Mô tả sản phẩm
                </button>
                <button
                  onClick={() => setActiveTab('b2b')}
                  className={`pb-2.5 px-4 border-b-2 transition ${
                    activeTab === 'b2b' ? 'border-brand-600 text-brand-600 font-extrabold' : 'border-transparent hover:text-gray-800'
                  }`}
                >
                  Bán Sỉ / B2B
                </button>
                <button
                  onClick={() => setActiveTab('size')}
                  className={`pb-2.5 px-4 border-b-2 transition ${
                    activeTab === 'size' ? 'border-brand-600 text-brand-600 font-extrabold' : 'border-transparent hover:text-gray-800'
                  }`}
                >
                  Bảng size
                </button>
              </div>

              {/* Tab Contents */}
              <div className="text-[11px] sm:text-xs text-gray-500 leading-relaxed space-y-2">
                {activeTab === 'desc' && (
                  <div className="space-y-3">
                    <p>
                      Sản phẩm được gia công dệt sợi tỉ mỉ trên chất liệu thun cotton organic và thun Ý mềm mại dẻo dai. Dáng thiết kế thoải mái nâng niu cơ thể, thấm hút mồ hôi và cực kỳ thoáng khí, thích hợp mặc hàng ngày.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 font-medium pl-1">
                      <li>Kháng khuẩn, khử mùi tự nhiên tối đa.</li>
                      <li>Co giãn co giãn đa chiều, không nhão xù sau giặt máy.</li>
                      <li>Sợi vải cao cấp an toàn và thân thiện tuyệt đối với làn da nhạy cảm.</li>
                    </ul>
                  </div>
                )}

                {activeTab === 'b2b' && (
                  <div className="space-y-2.5 p-3 bg-gray-50 rounded border border-gray-100">
                    <p className="font-bold text-gray-800">💼 Quyền lợi đại lý hợp tác sỉ với Hoàng Hải Sneaker:</p>
                    <p>• Chiết khấu sỉ tự động tính trực tiếp tại màn hình Giỏ Hàng khi bạn đạt đủ mốc số lượng sỉ.</p>
                    <p>• Hỗ trợ đổi trả trong vòng 15 ngày đối với hàng lỗi do nhà sản xuất.</p>
                    <p>• Đơn sỉ tối thiểu chỉ từ 500,000đ. Đăng ký tài khoản đại lý ngay để duyệt mức giá sỉ sập sàn!</p>
                  </div>
                )}

                {activeTab === 'size' && (
                  <div className="space-y-2">
                    <p>Bảng gợi ý lựa chọn kích thước phù hợp tiêu chuẩn vóc dáng Việt Nam:</p>
                    <table className="w-full text-center border-collapse border border-gray-200 font-medium">
                      <thead>
                        <tr className="bg-gray-50 text-gray-700 font-bold">
                          <th className="border border-gray-200 py-1.5">Size</th>
                          <th className="border border-gray-200 py-1.5">Vòng ngực / eo</th>
                          <th className="border border-gray-200 py-1.5">Cân nặng</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-200 py-1.5">S / 34</td>
                          <td className="border border-gray-200 py-1.5">78 - 84 cm</td>
                          <td className="border border-gray-200 py-1.5">40 - 48 kg</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 py-1.5">M / 36</td>
                          <td className="border border-gray-200 py-1.5">85 - 90 cm</td>
                          <td className="border border-gray-200 py-1.5">49 - 55 kg</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 py-1.5">L / 38</td>
                          <td className="border border-gray-200 py-1.5">91 - 96 cm</td>
                          <td className="border border-gray-200 py-1.5">56 - 62 kg</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-200 py-1.5">XL / 40</td>
                          <td className="border border-gray-200 py-1.5">97 - 103 cm</td>
                          <td className="border border-gray-200 py-1.5">63 - 70 kg</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery & return highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 text-[10px] text-center font-bold text-gray-400">
              <div className="flex flex-col items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-600" />
                <span>Ship COD Toàn Quốc</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-brand-600" />
                <span>Đổi Hàng Dễ Dàng</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Hàng Chính Hãng</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
