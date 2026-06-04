'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    isFeatured?: boolean;
    wholesaleTiers?: any;
    category?: {
      name: string;
    } | null;
    images: {
      url: string;
      isPrimary?: boolean;
    }[];
    variants: {
      id: string;
      retailPrice: number | string;
      color: string;
      colorHex: string;
      stock: number;
    }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  const firstVariant = product.variants?.[0];
  const price = firstVariant ? Number(firstVariant.retailPrice) : 0;

  const uniqueColors: { color: string; colorHex: string }[] = [];
  product.variants?.forEach(v => {
    if (!uniqueColors.some(uc => uc.color === v.color)) {
      uniqueColors.push({ color: v.color, colorHex: v.colorHex });
    }
  });

  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 0;
  const isOutOfStock = totalStock === 0;

  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const imageUrl = primaryImage ? primaryImage.url : 'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=400&q=80';

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (firstVariant && !isOutOfStock) {
      await addItem(firstVariant.id, 1);
    }
  };

  return (
    <div className="group bg-white rounded-brand-lg border border-gray-100/60 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden border-b border-gray-100/60">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {product.isFeatured && (
          <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-brand-600/90 text-white text-[9px] font-extrabold uppercase tracking-wide shadow-xs">
            Nổi bật
          </span>
        )}

        {product.wholesaleTiers && (
          <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-accent-pink/90 text-white text-[9px] font-extrabold uppercase tracking-wide shadow-xs">
            Giá sỉ tốt
          </span>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-3 py-1.5 rounded bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wide block font-mono">
            {product.category?.name || 'Sản phẩm'}
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-tight">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>

          {uniqueColors.length > 0 && (
            <div className="flex gap-1.5 pt-1.5">
              {uniqueColors.map((colorObj, cIdx) => (
                <span
                  key={cIdx}
                  className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-xs block"
                  style={{ backgroundColor: colorObj.colorHex }}
                  title={colorObj.color}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between pt-2">
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 font-medium block">Giá bán lẻ:</span>
            <p className="text-xs sm:text-sm font-black text-brand-600">
              {price > 0 ? `${price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
            </p>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock || !firstVariant}
            className={`p-2 rounded-brand-md transition-all duration-300 shrink-0 shadow-xs ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-brand-50 hover:bg-brand-600 text-brand-600 hover:text-white'
            }`}
            title={isOutOfStock ? 'Hết hàng' : 'Thêm nhanh vào giỏ'}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
