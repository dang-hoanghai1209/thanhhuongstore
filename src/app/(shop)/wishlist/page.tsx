'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import Breadcrumb from '@/components/ui/Breadcrumb';
import PageHeader from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/States';

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync mounted status
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load wishlist IDs and fetch products from API
  useEffect(() => {
    if (!mounted) return;

    const loadWishlistAndProducts = async () => {
      setLoading(true);
      setError(null);

      // 1. Get wishlist IDs from localStorage
      const stored = localStorage.getItem('hhsneaker_wishlist');
      let ids: string[] = [];
      if (stored) {
        try {
          ids = JSON.parse(stored) as string[];
        } catch (e) {
          console.error('Failed to parse wishlist localStorage:', e);
        }
      }
      setWishlistIds(ids);

      if (ids.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // 2. Fetch products from API
      try {
        const response = await fetch('/api/products?limit=100');
        if (!response.ok) {
          throw new Error('Không thể lấy danh sách sản phẩm.');
        }
        const data = await response.json();
        const allProducts = data.items || data.products || [];

        // 3. Filter wishlisted items
        const wishlisted = allProducts.filter((p: any) => ids.includes(p.id));
        setProducts(wishlisted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra.');
      } finally {
        setLoading(false);
      }
    };

    loadWishlistAndProducts();

    // Listen to storage events to update wishlist if changed on other tabs/modals
    const handleStorageChange = () => {
      const stored = localStorage.getItem('hhsneaker_wishlist');
      if (stored) {
        try {
          const ids = JSON.parse(stored) as string[];
          setWishlistIds(ids);
        } catch (e) {
          console.error(e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [mounted]);

  // Handle local storage removal and state update
  const handleRemoveFromWishlist = (productId: string) => {
    const updatedIds = wishlistIds.filter((id) => id !== productId);
    setWishlistIds(updatedIds);
    localStorage.setItem('hhsneaker_wishlist', JSON.stringify(updatedIds));
    setProducts((prev) => prev.filter((p) => p.id !== productId));
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
            ⚠️ Có lỗi xảy ra: {error}
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
                  
                  {/* Remove overlay quick shortcut */}
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
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
