'use client';

import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import PageHeader from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/States';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

function readWishlistSlugs() {
  const stored = localStorage.getItem('hhsneaker_wishlist');
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return Array.from(
      new Set(
        parsed
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter((item) => item && !UUID_PATTERN.test(item) && SLUG_PATTERN.test(item)),
      ),
    );
  } catch (error) {
    console.error('Failed to parse wishlist localStorage:', error);
    return [];
  }
}

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadWishlistProducts = async () => {
      setLoading(true);
      setError(null);

      const slugs = readWishlistSlugs();
      setWishlistSlugs(slugs);

      if (slugs.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/products?slugs=${encodeURIComponent(slugs.join(','))}`);
        if (!response.ok) {
          throw new Error('Khong the lay danh sach san pham.');
        }

        const data = await response.json();
        setProducts(data.items || data.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Da co loi xay ra.');
      } finally {
        setLoading(false);
      }
    };

    loadWishlistProducts();
  }, [mounted, refreshKey]);

  useEffect(() => {
    if (!mounted) return;

    const handleStorageChange = () => {
      setRefreshKey((value) => value + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [mounted]);

  const handleRemoveFromWishlist = (productSlug: string) => {
    const updatedSlugs = wishlistSlugs.filter((slug) => slug !== productSlug);
    setWishlistSlugs(updatedSlugs);
    localStorage.setItem('hhsneaker_wishlist', JSON.stringify(updatedSlugs));
    setProducts((prev) => prev.filter((product) => product.slug !== productSlug));
    window.dispatchEvent(new Event('storage'));
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] pb-24">
        <PageHeader
          title="Danh Sách Yêu Thích"
          description="Xem lại các sản phẩm bạn đã lưu và quan tâm tại Hoàng Hải Sneaker."
          badge="Yêu thích"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-xs font-semibold text-gray-500">
          Đang tải...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-gray-900 pb-24">
      <PageHeader
        title="Danh Sách Yêu Thích"
        description="Xem lại các sản phẩm bạn đã lưu và quan tâm tại Hoàng Hải Sneaker."
        badge="Yêu thích"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={[{ label: 'Sản phẩm', href: '/products' }, { label: 'Yêu thích' }]} />

        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-gray-500 animate-pulse">
            Đang tải sản phẩm yêu thích...
          </div>
        ) : error ? (
          <div className="py-16 text-center text-xs font-bold text-red-500 bg-red-50 rounded-brand-lg border border-red-100">
            Có lỗi xảy ra: {error}
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 max-w-lg mx-auto">
            <EmptyState
              title="Chưa có sản phẩm yêu thích"
              description="Hãy lưu những sản phẩm bạn quan tâm bằng cách bấm vào biểu tượng trái tim để xem lại dễ dàng bất cứ lúc nào."
              icon={<Heart className="w-8 h-8 text-gray-300" />}
              actionLabel="Khám phá sản phẩm"
              actionHref="/products"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-xs text-gray-500 font-medium pb-2 border-b border-gray-100">
              Bạn đang lưu <span className="font-bold text-gray-800">{products.length}</span> sản phẩm yêu thích
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {products.map((product) => (
                <div key={product.id} className="relative group/wish">
                  <ProductCard product={product} />

                  <button
                    onClick={() => handleRemoveFromWishlist(product.slug)}
                    className="absolute top-12 right-2 z-10 p-1.5 rounded-full bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-600 shadow-xs border border-gray-100 opacity-0 group-hover/wish:opacity-100 transition-all duration-200"
                    title="Xóa nhanh khỏi yêu thích"
                  >
                    <span className="material-symbols-outlined text-[16px] block">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
