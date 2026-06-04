'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MiniCart from '@/components/cart/MiniCart';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';

// Navigation Items structure for Mega Menu
const navItems = [
  {
    name: "Tất Vớ Cao Cấp",
    slug: "vo-co-ngan-cotton-premium", // maps to a sample category
    type: "SOCK",
    featured: "Tất kháng khuẩn, khử mùi vượt trội dệt sợi cotton cao cấp.",
    subcategories: [
      { name: "Tất Cổ Ngắn Cushioning", href: "/products/vo-co-ngan-cotton-premium" },
      { name: "Tất Dệt Lông Cừu Merino", href: "/categories/vo-thoi-trang" },
      { name: "Vớ Lười Silicon Chống Tuột", href: "/categories/vo-thoi-trang" },
      { name: "Tất Dài Thể Thao", href: "/categories/vo-thoi-trang" }
    ]
  },
  {
    name: "Bikini & Đồ Bơi Nữ",
    slug: "ao-boi-nu-ocean",
    type: "SWIMWEAR",
    featured: "BST Áo bơi nữ Ocean thun Ý co giãn tuyệt vời tôn dáng thon thả.",
    subcategories: [
      { name: "Bikini Hai Mảnh Sexy", href: "/categories/do-boi" },
      { name: "Bikini Một Mảnh Cut-out", href: "/categories/do-boi" },
      { name: "Đồ Bơi Dài Tay Chống Nắng", href: "/categories/do-boi" },
      { name: "Váy Đi Biển Nữ Tính", href: "/categories/do-boi" }
    ]
  },
  {
    name: "Đồ Lót Nam Premium",
    slug: "quan-boi-nam-active",
    type: "UNDERWEAR",
    featured: "Dòng sịp nam trunk và quần bơi mát mẻ co giãn vượt trội.",
    subcategories: [
      { name: "Quần Lót Boxer Co Giãn", href: "/categories/do-boi" },
      { name: "Quần Lót Brief Gọn Gàng", href: "/categories/do-boi" },
      { name: "Quần Lót Trunk Mát Mẻ", href: "/categories/do-boi" },
      { name: "Áo Ba Lỗ Ôm Sát Nam", href: "/categories/do-boi" }
    ]
  }
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredMenu, setHoveredMenu] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  // Zustand states and actions
  const cartItems = useCartStore((state) => state.items);
  const openCart = useCartStore((state) => state.openCart);

  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout failed:', e);
    }
    clearAuth();
    router.replace('/');
    router.refresh();
  };

  useEffect(() => {
    setMounted(true);

    const checkSession = async () => {
      const cachedUser = useAuthStore.getState().user;

      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          if (cachedUser) {
            clearAuth();
            router.refresh();
          }
        } else {
          const data = await res.json();
          useAuthStore.setState({ user: data.user });
        }
      } catch (e) {
        console.error('Session verify failed on app mount:', e);
        if (cachedUser) {
          clearAuth();
          router.refresh();
        }
      }
    };

    checkSession();
  }, [clearAuth, router]);

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <>
      {/* Top Banner Message */}
      <div className="bg-primary-container text-white py-2 px-4 text-center text-[10px] font-extrabold uppercase tracking-widest border-b border-white/5 flex justify-between items-center max-w-7xl mx-auto sm:px-8 lg:px-12 rounded-t-lg">
        <div className="hidden sm:flex items-center gap-1">
          <span className="material-symbols-outlined text-accent-gold text-[14px]">phone</span>
          Hotline: 0987.654.321
        </div>
        <div className="mx-auto sm:mx-0 flex items-center gap-1.5 justify-center">
          <span className="material-symbols-outlined text-accent-pink text-[14px] animate-pulse">auto_awesome</span>
          <span>Freeship cho mọi đơn lẻ bán lẻ từ 500,000đ</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <span className="material-symbols-outlined text-white/70 text-[14px]">help</span>
          Hỗ trợ đại lý B2B sỉ
        </div>
      </div>

      {/* Main Header Wrapper */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">

            {/* 1. Mobile Menu Toggle Icon */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-brand-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition flex items-center justify-center"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            {/* 2. Brand Logo */}
            <Link href="/" className="flex items-center gap-2 text-primary shrink-0">
              <div className="w-9 h-9 rounded-brand-md bg-primary flex items-center justify-center text-white font-black text-base shadow-sm">
                TH
              </div>
              <span className="text-base sm:text-lg font-black uppercase tracking-widest text-on-surface">Thanh Hương Store</span>
            </Link>

            {/* 3. DESKTOP NAVIGATION MEGA MENU */}
            <nav className="hidden lg:flex items-center gap-8 h-full">
              {navItems.map((item, idx) => (
                <div
                  key={idx}
                  className="h-full flex items-center"
                  onMouseEnter={() => setHoveredMenu(idx)}
                  onMouseLeave={() => setHoveredMenu(null)}
                >
                  <button className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-primary uppercase tracking-wider transition py-8">
                    {item.name}
                    <span className="material-symbols-outlined text-gray-400 text-[18px] transition-transform duration-200" style={{ transform: hoveredMenu === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      keyboard_arrow_down
                    </span>
                  </button>

                  {/* Mega Menu Dropdown Box */}
                  {hoveredMenu === idx && (
                    <div className="absolute top-20 left-0 w-full bg-white border-b border-gray-200 shadow-xl animate-fadeIn z-50">
                      <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-4 gap-8">
                        {/* Subcategory List (Cols 1 & 2) */}
                        <div className="col-span-2 grid grid-cols-2 gap-x-8 gap-y-3">
                          <h4 className="col-span-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pb-2 border-b border-gray-100 mb-2">
                            Dòng sản phẩm
                          </h4>
                          {item.subcategories.map((sub, sIdx) => (
                            <Link
                              key={sIdx}
                              href={sub.href}
                              className="text-xs font-bold text-gray-700 hover:text-primary transition flex items-center gap-1 group"
                            >
                              <span className="material-symbols-outlined text-gray-300 group-hover:text-primary text-[16px] transition-transform group-hover:translate-x-0.5">
                                arrow_right_alt
                              </span>
                              {sub.name}
                            </Link>
                          ))}
                        </div>

                        {/* Middle Category Intro Column */}
                        <div className="p-5 bg-gray-50 border border-gray-100 rounded-brand-md flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className="text-[9px] font-extrabold text-white bg-primary px-2 py-0.5 rounded uppercase tracking-wider">
                              Nổi bật
                            </span>
                            <h4 className="text-xs font-extrabold text-gray-900 mt-1">{item.name}</h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed mt-2 font-medium">
                              {item.featured}
                            </p>
                          </div>

                          <Link
                            href={`/products/${item.slug}`}
                            className="text-xs font-bold text-primary hover:text-primary-container mt-4 flex items-center gap-1 group"
                          >
                            Xem sản phẩm bán chạy nhất
                            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                          </Link>
                        </div>

                        {/* Marketing Promo Card Banner */}
                        <div className="relative rounded-brand-md overflow-hidden bg-primary-container flex flex-col justify-end p-5 text-white">
                          <img
                            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80"
                            alt="Collection Promo"
                            className="absolute inset-0 w-full h-full object-cover opacity-35"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          <div className="relative z-10 space-y-1">
                            <p className="text-[9px] text-accent-gold font-extrabold uppercase tracking-widest">Đặc quyền B2B</p>
                            <p className="text-xs font-extrabold">Chiết khấu sỉ tự động</p>
                            <p className="text-[10px] text-white/70 font-medium">Mua nhiều giảm lớn tại giỏ hàng</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* 4. SEARCH BAR (Desktop) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative flex-1 max-w-sm mx-4">
              <input
                type="text"
                placeholder="Tìm sản phẩm, danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-standard"
              />
              <span className="material-symbols-outlined text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">search</span>
            </form>

            {/* 5. RIGHT ICONS (User & Cart) */}
            <div className="flex items-center gap-4 shrink-0">

              {/* Account icon */}
              {mounted && user ? (
                <div className="relative group">
                  <button className="flex items-center gap-1.5 p-2 rounded-brand-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    <span className="hidden md:inline text-xs font-bold text-gray-700">
                      {user.firstName}
                    </span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-brand-md shadow-lg py-2 hidden group-hover:block animate-fadeIn z-50">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs font-bold text-gray-800">{user.lastName} {user.firstName}</p>
                      <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                    </div>
                    {user.role === 'ADMIN' && (
                      <Link href="/admin" className="block px-4 py-2 text-xs font-bold text-primary hover:bg-slate-50 transition">
                        Quản trị
                      </Link>
                    )}
                    <Link href="/account" className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition">
                      Tài khoản
                    </Link>
                    <Link href="/account/orders" className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition">
                      Đơn hàng
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition border-t border-gray-50 mt-1"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-700">
                  <Link href="/login" className="hover:text-primary transition">
                    Đăng nhập
                  </Link>
                  <span className="text-gray-300">/</span>
                  <Link href="/register" className="hover:text-primary transition">
                    Đăng ký
                  </Link>
                </div>
              )}

              {/* Account icon (Mobile fallback trigger or guest fallback) */}
              {(!mounted || !user) && (
                <Link
                  href="/login"
                  className="sm:hidden p-2.5 rounded-brand-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition flex items-center justify-center"
                  title="Tài khoản"
                >
                  <span className="material-symbols-outlined text-[20px]">person</span>
                </Link>
              )}

              {/* Cart Icon */}
              <button
                onClick={openCart}
                className="p-2.5 rounded-brand-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition relative animate-pulseSubtle flex items-center justify-center"
                title="Giỏ hàng"
              >
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>

                {/* Dynamic count badge indicating item exists */}
                {mounted && totalItemsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-primary rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                    {totalItemsCount}
                  </span>
                )}
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* MOBILE HAMBURGER MENU (Slide-in Drawer) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex animate-fadeIn">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer panel */}
          <div className="relative w-80 max-w-full bg-white h-full shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto animate-slideRight">

            {/* Header: Logo and Close */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-primary">
                <div className="w-8 h-8 rounded-brand-sm bg-primary flex items-center justify-center text-white font-black text-sm shadow-xs">
                  TH
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-on-surface">Thanh Hương Store</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-gray-500 text-[20px]">close</span>
              </button>
            </div>

            {/* Mobile Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-standard"
              />
              <span className="material-symbols-outlined text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-[18px]">search</span>
            </form>

            {/* Mobile User Section */}
            <div className="pb-4 border-b border-gray-100">
              {mounted && user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                      <span className="material-symbols-outlined text-[18px]">person</span>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-gray-800">{user.lastName} {user.firstName}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{user.role}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 pt-2">
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xs font-bold text-primary hover:text-primary-container py-1 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">security</span>
                        Trang quản trị
                      </Link>
                    )}
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-bold text-gray-700 hover:text-primary py-1 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">person</span>
                      Tài khoản
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-bold text-gray-700 hover:text-primary py-1 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                      Đơn hàng
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-xs font-bold text-red-600 hover:text-red-700 text-left py-1 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-xs font-bold text-gray-700 border border-gray-200 rounded-brand-md bg-white hover:bg-gray-50 transition"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-xs font-bold text-white bg-primary rounded-brand-md hover:bg-primary-container transition"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Nav Links list */}
            <div className="flex-1 space-y-6">
              {navItems.map((item, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5">
                    {item.name}
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5 pl-2">
                    {item.subcategories.map((sub, sIdx) => (
                      <Link
                        key={sIdx}
                        href={sub.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xs font-bold text-gray-700 hover:text-primary transition flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-gray-300 text-[16px]">keyboard_arrow_right</span>
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Footer Area */}
            <div className="pt-6 border-t border-gray-100 text-xs text-gray-400 space-y-2 font-medium">
              <p className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[16px]">phone</span>
                Hotline: 0987.654.321
              </p>
              <p className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[16px]">mail</span>
                hotro@thanhhuongstore.vn
              </p>
              <p className="text-[10px] text-gray-300 pt-2 font-normal">© 2026 Thanh Hương Store. All rights reserved.</p>
            </div>

          </div>
        </div>
      )}
      <MiniCart />
    </>
  );
}
