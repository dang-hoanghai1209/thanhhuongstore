'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks';
import WishlistButton from '@/components/ui/WishlistButton';

const DEFAULT_PRODUCT_IMAGE = '/uploads/products/tat-da-min.jpg';

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    isFeatured?: boolean;
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
  const imageUrl = primaryImage ? primaryImage.url : DEFAULT_PRODUCT_IMAGE;

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (firstVariant && !isOutOfStock) {
      await addItem(firstVariant.id, 1);
    }
  };

  return (
    <div className="group bg-surface-container-lowest rounded-2xl overflow-hidden product-card-shadow transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full bg-surface-container overflow-hidden">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {product.isFeatured && (
          <span className="absolute top-2 left-2 bg-primary text-on-primary px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            NỔI BẬT
          </span>
        )}

        {/* Wishlist Heart Overlay */}
        <WishlistButton
          productSlug={product.slug}
          productId={product.id}
          className="absolute top-2 right-2 z-10"
        />

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-lg bg-error text-on-error text-xs font-bold uppercase tracking-wider">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex-grow flex flex-col justify-between gap-3">
        <div>
          <p className="text-on-surface-variant text-[11px] font-semibold mb-1 uppercase tracking-wide">
            {product.category?.name || 'Sản phẩm'}
          </p>
          <h4 className="font-headline-sm text-headline-sm mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h4>

          {/* Color Dots */}
          {uniqueColors.length > 0 && (
            <div className="flex gap-1.5 pt-1">
              {uniqueColors.map((colorObj, cIdx) => (
                <span
                  key={cIdx}
                  className="w-3.5 h-3.5 rounded-full border border-outline-variant block shadow-xs"
                  style={{ backgroundColor: colorObj.colorHex }}
                  title={colorObj.color}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-surface-variant/30">
          <span className="font-bold text-primary text-body-lg">
            {price > 0 ? `${price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
          </span>
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock || !firstVariant}
            className={`p-2 rounded-full transition-colors flex items-center justify-center ${
              isOutOfStock
                ? 'bg-surface-variant text-on-surface-variant/40 cursor-not-allowed'
                : 'bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-primary'
            }`}
            title={isOutOfStock ? 'Hết hàng' : 'Thêm nhanh vào giỏ'}
          >
            <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
