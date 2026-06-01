'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  Search, 
  ShoppingBag, 
  User, 
  ChevronDown, 
  ArrowRight,
  Sparkles,
  Phone,
  HelpCircle
} from 'lucide-react';
import MiniCart from '@/components/cart/MiniCart';
import { useCartStore } from '@/store/useCartStore';

// Navigation Items structure for Mega Menu
const navItems = [
  {
    name: "Tất Vớ Cao Cấp",
    slug: "vo-co-ngan-cotton-premium", // maps to a sample category
    type: "SOCK",
    featured: "Tất kháng khuẩn, khử mùi vượt trội dệt sợi cotton cao cấp.",
    subcategories: [
      { name: "Tất Cổ Ngắn Cushioning", href: "/products/vo-co-ngan-cotton-premium" },
      { name: "Tất Dệt Lông Cừu Merino", href: "/categories/socks" },
      { name: "Vớ Lười Silicon Chống Tuột", href: "/categories/socks" },
      { name: "Tất Dài Thể Thao", href: "/categories/socks" }
    ]
  },
  {
    name: "Bikini & Đồ Bơi Nữ",
    slug: "bikini-thun-y-hai-manh-tropical",
    type: "SWIMWEAR",
    featured: "BST Bikini thun Ý 2 mảnh co giãn tuyệt vời tôn dáng thon thả.",
    subcategories: [
      { name: "Bikini Hai Mảnh Sexy", href: "/categories/swimwear" },
      { name: "Bikini Một Mảnh Cut-out", href: "/categories/swimwear" },
      { name: "Đồ Bơi Dài Tay Chống Nắng", href: "/categories/swimwear" },
      { name: "Váy Đi Biển Nữ Tính", href: "/categories/swimwear" }
    ]
  },
  {
    name: "Đồ Lót Nam Premium",
    slug: "quan-lot-nam-trunk-modal-tre",
    type: "UNDERWEAR",
    featured: "Dòng sịp nam Trunk và Boxer dệt sợi Modal tre siêu thoáng khí.",
    subcategories: [
      { name: "Quần Lót Boxer Co Giãn", href: "/categories/underwear" },
      { name: "Quần Lót Brief Gọn Gàng", href: "/categories/underwear" },
      { name: "Quần Lót Trunk Mát Mẻ", href: "/categories/underwear" },
      { name: "Áo Ba Lỗ Ôm Sát Nam", href: "/categories/underwear" }
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <>
      {/* Top Banner Message */}
      <div className="bg-brand-950 text-white py-2 px-4 text-center text-[10px] font-extrabold uppercase tracking-widest border-b border-white/5 flex justify-between items-center max-w-7xl mx-auto sm:px-8 lg:px-12">
        <div className="hidden sm:flex items-center gap-1">
          <Phone className="w-3.5 h-3.5 text-accent-gold" />
          Hotline: 0912.345.678
        </div>
        <div className="mx-auto sm:mx-0 flex items-center gap-1.5 justify-center">
          <Sparkles className="w-3.5 h-3.5 text-accent-pink animate-pulse" />
          <span>Freeship cho mọi đơn lẻ bán lẻ từ 500,000đ</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-brand-300" />
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
              className="lg:hidden p-2 rounded-brand-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* 2. Brand Logo */}
            <Link href="/" className="flex items-center gap-2 text-brand-600 shrink-0">
              <div className="w-9 h-9 rounded-brand-md bg-brand-600 flex items-center justify-center text-white font-black text-base shadow-sm">
                V
              </div>
              <span className="text-base sm:text-lg font-black uppercase tracking-widest">Thanh Hương Store</span>
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
                  <button className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-brand-600 uppercase tracking-wider transition py-8">
                    {item.name}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      hoveredMenu === idx ? 'rotate-180 text-brand-600' : 'text-gray-400'
                    }`} />
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
                              className="text-xs font-bold text-gray-700 hover:text-brand-600 transition flex items-center gap-1.5 group"
                            >
                              <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-brand-500 transition-transform group-hover:translate-x-0.5" />
                              {sub.name}
                            </Link>
                          ))}
                        </div>

                        {/* Middle Category Intro Column */}
                        <div className="p-5 bg-gray-50 border border-gray-100 rounded-brand-md flex flex-col justify-between">
                          <div className="space-y-2">
                            <span className="text-[9px] font-extrabold text-accent-pink uppercase tracking-widest bg-accent-pink/10 px-2 py-0.5 rounded">
                              Nổi bật
                            </span>
                            <h4 className="text-xs font-extrabold text-gray-900 mt-1">{item.name}</h4>
                            <p className="text-[11px] text-gray-500 leading-relaxed mt-2">
                              {item.featured}
                            </p>
                          </div>
                          
                          <Link 
                            href={`/products/${item.slug}`}
                            className="text-xs font-bold text-brand-600 hover:text-brand-700 mt-4 flex items-center gap-1.5 group"
                          >
                            Xem sản phẩm bán chạy nhất
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>

                        {/* Marketing Promo Card Banner */}
                        <div className="relative rounded-brand-md overflow-hidden bg-brand-950 flex flex-col justify-end p-5 text-white">
                          <img 
                            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80" 
                            alt="Collection Promo"
                            className="absolute inset-0 w-full h-full object-cover opacity-35"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/20 to-transparent" />
                          <div className="relative z-10 space-y-1">
                            <p className="text-[9px] text-accent-gold font-extrabold uppercase tracking-widest">Đặc quyền B2B</p>
                            <p className="text-xs font-extrabold">Chiết khấu sỉ tự động</p>
                            <p className="text-[10px] text-brand-200">Mua nhiều giảm lớn tại giỏ hàng</p>
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
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-brand-md text-xs font-bold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            {/* 5. RIGHT ICONS (User & Cart) */}
            <div className="flex items-center gap-4 shrink-0">
              
              {/* Account icon */}
              <Link
                href="/login"
                className="p-2.5 rounded-brand-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
                title="Tài khoản"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart Icon */}
              <button
                onClick={openCart}
                className="p-2.5 rounded-brand-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition relative animate-pulseSubtle"
                title="Giỏ hàng"
              >
                <ShoppingBag className="w-5 h-5" />
                
                {/* Dynamic count badge indicating item exists */}
                {mounted && totalItemsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-brand-600 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
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
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer panel */}
          <div className="relative w-80 max-w-full bg-white h-full shadow-2xl flex flex-col p-6 space-y-6 overflow-y-auto animate-slideRight">
            
            {/* Header: Logo and Close */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-brand-600">
                <div className="w-8 h-8 rounded-brand-sm bg-brand-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
                  V
                </div>
                <span className="text-sm font-black uppercase tracking-widest">Viva Store</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Mobile Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Tìm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-brand-md text-xs font-bold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

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
                        className="text-xs font-bold text-gray-700 hover:text-brand-600 transition flex items-center gap-1.5"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Footer Area */}
            <div className="pt-6 border-t border-gray-100 text-xs text-gray-400 space-y-2">
              <p>📍 Hotline: 0912.345.678</p>
              <p>✉️ Email: support@vivastore.vn</p>
              <p className="text-[10px] text-gray-300 pt-2">© 2026 Viva Store. All rights reserved.</p>
            </div>

          </div>
        </div>
      )}
      <MiniCart />
    </>
  );
}
