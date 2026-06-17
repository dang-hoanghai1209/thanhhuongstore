'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import MiniCart from '@/components/cart/MiniCart';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store';
import { useRouter } from 'next/navigation';

interface DropdownItem {
  name: string;
  href: string;
}

interface FeaturedProduct {
  name: string;
  slug: string;
  image: string;
  price: string;
}

interface NavItem {
  name: string;
  href?: string;
  badge?: string;
  dropdownItems?: DropdownItem[];
  featuredProducts?: FeaturedProduct[];
}

// Navigation Items structure for Main Menu
const navItems: NavItem[] = [
  {
    name: "Trang chủ",
    href: "/"
  },
  {
    name: "Sản phẩm",
    href: "/products"
  },
  {
    name: "Tất / Vớ",
    dropdownItems: [
      { name: "Tất / Vớ", href: "/categories/tat-vo" },
      { name: "Tất nam", href: "/categories/tat-nam" },
      { name: "Tất bông / tất dày", href: "/categories/tat-bong-tat-day" },
      { name: "Sản phẩm nhiều mẫu", href: "/categories/hang-nhieu-mau-gia-si" }
    ],
    featuredProducts: [
      {
        name: "Tất da mịn",
        slug: "tat-da-min",
        image: "/uploads/products/tat-da-min.jpg",
        price: "15.000 đ"
      },
      {
        name: "Tất Nam 5 Đôi",
        slug: "tat-nam-5-doi-co-bao-bi",
        image: "/uploads/products/tat-nam-5-bo-bao-bi.jpg",
        price: "35.000 đ"
      }
    ]
  },
  {
    name: "Bao tay",
    dropdownItems: [
      { name: "Bao tay lao động", href: "/categories/bao-tay-lao-dong" }
    ],
    featuredProducts: [
      {
        name: "Bao tay đen xám",
        slug: "bao-tay-lao-dong-den-xam",
        image: "/uploads/products/bao-tay-lao-dong-den-xam.jpg",
        price: "6.000 đ"
      },
      {
        name: "Bao tay trắng",
        slug: "bao-tay-lao-dong-trang",
        image: "/uploads/products/bao-tay-lao-dong-trang.jpg",
        price: "5.000 đ"
      }
    ]
  },
  {
    name: "Nổi bật",
    href: "/products?featured=true"
  },
  {
    name: "Liên hệ",
    href: "/contact"
  }
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredMenu, setHoveredMenu] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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
          <span>Freeship cho đơn từ 500.000đ</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <span className="material-symbols-outlined text-white/70 text-[14px]">fiber_new</span>
          Xem sản phẩm mới mỗi ngày
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
            <Link href="/" className="flex items-center gap-1.5 text-primary flex-shrink-0">
              <img
                src="/uploads/products/hoang-hai-sneaker-logo.jpg"
                alt="Hoàng Hải Sneaker Logo"
                className="w-9 h-9 md:w-11 md:h-11 object-cover rounded-brand-md shadow-sm border border-gray-100"
              />
              <span className="text-sm sm:text-base font-black uppercase tracking-wider text-on-surface whitespace-nowrap">Hoàng Hải Sneaker</span>
            </Link>

            {/* 3. DESKTOP NAVIGATION MENU */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-5 h-full flex-shrink-0 whitespace-nowrap">
              {navItems.map((item, idx) => {
                if (item.href) {
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      className="text-xs font-bold text-gray-750 hover:text-primary uppercase tracking-wider transition py-8 flex items-center gap-1 group whitespace-nowrap flex-shrink-0"
                    >
                      {item.name}
                      {item.badge && (
                        <span className="bg-primary/10 text-primary text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider transition-all group-hover:bg-primary group-hover:text-white flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="h-full flex items-center relative whitespace-nowrap flex-shrink-0"
                    onMouseEnter={() => setHoveredMenu(idx)}
                    onMouseLeave={() => setHoveredMenu(null)}
                  >
                    <button className="flex items-center gap-1 text-xs font-bold text-gray-750 hover:text-primary uppercase tracking-wider transition py-8 whitespace-nowrap flex-shrink-0">
                      {item.name}
                      <span className="material-symbols-outlined text-gray-400 text-[18px] transition-transform duration-200 flex-shrink-0" style={{ transform: hoveredMenu === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        keyboard_arrow_down
                      </span>
                    </button>

                    {/* Clean Dropdown Box */}
                    {hoveredMenu === idx && item.dropdownItems && (
                      <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[460px] bg-white border border-gray-100 rounded-brand-md shadow-lg py-5 px-6 grid grid-cols-2 gap-6 animate-fadeIn z-50">
                        {/* Left: Category Links */}
                        <div className="space-y-3 text-left">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest pb-1.5 border-b border-gray-100">
                            Danh mục
                          </p>
                          <div className="space-y-2 flex flex-col">
                            {item.dropdownItems.map((sub, sIdx) => (
                              <Link
                                key={sIdx}
                                href={sub.href}
                                className="text-xs font-bold text-gray-700 hover:text-primary transition flex items-center gap-1 group/link"
                              >
                                <span className="material-symbols-outlined text-gray-300 group-hover/link:text-primary text-[16px] transition-transform group-hover/link:translate-x-0.5">
                                  chevron_right
                                </span>
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Right: Featured Products */}
                        {item.featuredProducts && (
                          <div className="border-l border-gray-100 pl-6 space-y-3 text-left">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest pb-1.5 border-b border-gray-100">
                              Bán chạy nổi bật
                            </p>
                            <div className="space-y-3">
                              {item.featuredProducts.map((feat, fIdx) => (
                                <Link
                                  key={fIdx}
                                  href={`/products/${feat.slug}`}
                                  className="flex items-center gap-3 group/prod"
                                >
                                  <img
                                    src={feat.image}
                                    alt={feat.name}
                                    className="w-10 h-10 object-cover rounded-brand-sm border border-gray-100 group-hover/prod:opacity-95 transition-opacity"
                                  />
                                  <div className="min-w-0">
                                    <h5 className="text-[11px] font-bold text-gray-800 group-hover/prod:text-primary line-clamp-1">
                                      {feat.name}
                                    </h5>
                                    <p className="text-[10px] text-gray-450 font-extrabold mt-0.5">{feat.price}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="flex items-center gap-3 xl:gap-4 flex-shrink-0">
              {/* Search bar input (Desktop) */}
              <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative w-32 xl:w-40 flex-shrink-0">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-brand-md text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all bg-gray-50/50"
                />
                <span className="material-symbols-outlined text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 text-[16px]">search</span>
              </form>

              {/* Account icon */}
              {mounted && user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 p-2 rounded-brand-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
                  >
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    <span className="hidden md:inline text-xs font-bold text-gray-700">
                      {user.firstName}
                    </span>
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-brand-md shadow-lg py-2 animate-fadeIn z-[100]">
                      <div className="px-4 py-2 border-b border-gray-50">
                        <p className="text-xs font-bold text-gray-800">{user.lastName} {user.firstName}</p>
                        <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                      </div>
                      {user.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="block px-4 py-2 text-xs font-bold text-primary hover:bg-slate-50 transition"
                        >
                          Quản trị
                        </Link>
                      )}
                      <Link
                        href="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                      >
                        Tài khoản
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                      >
                        Đơn hàng
                      </Link>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition border-t border-gray-50 mt-1"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
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
                <img
                  src="/uploads/products/hoang-hai-sneaker-logo.jpg"
                  alt="Hoàng Hải Sneaker Logo"
                  className="w-9 h-9 object-cover rounded-brand-sm shadow-xs border border-gray-150"
                />
                <span className="text-sm font-black uppercase tracking-widest text-on-surface">Hoàng Hải Sneaker</span>
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
            <div className="flex-1 space-y-4 py-4 text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1">
                Danh mục chính
              </p>
              <div className="flex flex-col space-y-3 pl-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-gray-700 hover:text-primary transition"
                >
                  Trang chủ
                </Link>
                <Link
                  href="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-gray-700 hover:text-primary transition"
                >
                  Sản phẩm
                </Link>
                <Link
                  href="/categories/tat-vo"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-gray-700 hover:text-primary transition"
                >
                  Tất / Vớ
                </Link>
                <Link
                  href="/categories/tat-nam"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-gray-700 hover:text-primary transition"
                >
                  Tất nam
                </Link>
                <Link
                  href="/categories/tat-bong-tat-day"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-gray-700 hover:text-primary transition"
                >
                  Tất bông / tất dày
                </Link>
                <Link
                  href="/categories/bao-tay-lao-dong"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-gray-700 hover:text-primary transition"
                >
                  Bao tay lao động
                </Link>
                <Link
                  href="/categories/hang-nhieu-mau-gia-si"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-gray-700 hover:text-primary transition"
                >
                  Sản phẩm nhiều mẫu
                </Link>
                <Link
                  href="/products?featured=true"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-gray-700 hover:text-primary transition"
                >
                  Nổi bật
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-gray-700 hover:text-primary transition"
                >
                  Liên hệ
                </Link>
              </div>
            </div>

            {/* Mobile Footer Area */}
            <div className="pt-6 border-t border-gray-100 text-xs text-gray-400 space-y-2 font-medium">
              <p className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[16px]">phone</span>
                Hotline: 0987.654.321
              </p>
              <p className="flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[16px]">mail</span>
                hotro@hhsneaker.id.vn
              </p>
              <p className="text-[10px] text-gray-300 pt-2 font-normal">© 2026 Hoàng Hải Sneaker. All rights reserved.</p>
            </div>

          </div>
        </div>
      )}
      <MiniCart />
    </>
  );
}
