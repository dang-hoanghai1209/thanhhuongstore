import { ShoppingBag, Sparkles, ArrowRight, ShieldCheck, Truck, RotateCcw, Flame } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

// Define TS types for safe mapping
interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

interface ProductVariant {
  retailPrice: any; // Prisma Decimal
  wholesalePrice: any; // Prisma Decimal
  stock: number;
}

interface DBProduct {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  sizeType: string;
  wholesaleTiers: any;
  isFeatured: boolean;
  isActive: boolean;
  category: {
    name: string;
    slug: string;
  };
  images: ProductImage[];
  variants: ProductVariant[];
}

export const revalidate = 60; // Revalidate the page cache every 60 seconds

export default async function HomePage() {
  let products: DBProduct[] = [];
  let categories: { name: string; slug: string; id: string; sizeType: string }[] = [];
  
  try {
    // 1. Fetch 8 active products from PostgreSQL directly
    products = await prisma.product.findMany({
      where: { isActive: true },
      take: 8,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        variants: {
          orderBy: { size: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) as any;

    // 2. Fetch top categories to show in the Category Showcase
    categories = await prisma.category.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { sortOrder: 'asc' }
    }) as any;
  } catch (error) {
    console.error("Failed to fetch homepage data from DB:", error);
  }

  // Categories fallback if DB is empty or fails
  const fallbackCategories = [
    {
      name: "Đồ Lót Cao Cấp",
      slug: "do-lot",
      imageUrl: "https://images.unsplash.com/photo-1594913785162-e6785b423cb1?auto=format&fit=crop&w=400&q=80",
      description: "Thoáng khí, mềm mại"
    },
    {
      name: "Tất Vớ Thời Trang",
      slug: "socks",
      imageUrl: "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=400&q=80",
      description: "Cotton kháng khuẩn"
    },
    {
      name: "Bikini & Đồ Bơi",
      slug: "swimwear",
      imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=400&q=80",
      description: "Tôn dáng quyến rũ"
    },
    {
      name: "Đồ Ngủ & Đồ Mặc Nhà",
      slug: "homewear",
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
      description: "Lụa mềm cao cấp"
    }
  ];

  // Map Unsplash thumbnails dynamically if we have category items from DB
  const mappedCategories = categories.length > 0 ? categories.map((cat, idx) => {
    const fallbacks = [
      "https://images.unsplash.com/photo-1594913785162-e6785b423cb1?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80"
    ];
    const desc = ["Thoáng khí, mềm mại", "Cotton kháng khuẩn", "Tôn dáng quyến rũ", "Lụa mát cao cấp"];
    return {
      name: cat.name,
      slug: cat.slug,
      imageUrl: fallbacks[idx % fallbacks.length],
      description: desc[idx % desc.length]
    };
  }) : fallbackCategories;

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-gray-900 pb-20">
      
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-r from-brand-950 via-brand-900 to-brand-850 text-white py-24 sm:py-32 px-6 sm:px-12 md:px-20 border-b border-white/5">
        {/* Glowing Ambient Backdrops */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-brand-500 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20 animate-float" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-accent-pink rounded-full filter blur-3xl opacity-15 -ml-20 -mb-20" />

        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Hero Content */}
          <div className="flex-1 space-y-7 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-200 text-xs font-black uppercase tracking-widest mx-auto lg:mx-0">
              <Flame className="w-3.5 h-3.5 text-accent-pink animate-pulse" />
              Đại Tiệc Mùa Hè
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-white uppercase">
              Ưu Đãi Trải Nghiệm <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold via-accent-pink to-brand-300">
                Lên Đến 50%
              </span>
            </h1>
            
            <p className="text-sm sm:text-base text-brand-100 max-w-xl font-medium leading-relaxed mx-auto lg:mx-0">
              Thổi bay cái nóng mùa hè bằng bộ sưu tập nội y dệt sợi tre và bikini thun Ý cao cấp của Thanh Hương Store. Mềm mại, thoáng mát và tôn dáng tự nhiên.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              <Link 
                href="/products" 
                className="px-8 py-4 rounded-brand-md bg-white text-gray-950 hover:bg-gray-100 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Săn sale ngay
                <ArrowRight className="w-4 h-4 text-brand-600" />
              </Link>
              <Link 
                href="/wholesale" 
                className="px-8 py-4 rounded-brand-md bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs uppercase tracking-wider transition-all border border-white/20 backdrop-blur-xs flex items-center justify-center"
              >
                Xem chính sách sỉ B2B
              </Link>
            </div>
          </div>

          {/* Quick Marketing Grid */}
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto min-w-[280px] sm:min-w-[400px]">
            {[
              { title: "Nội Y Organic", desc: "Sợi tre tự nhiên" },
              { title: "Bikini Italia", desc: "Thun co giãn 4 chiều" },
              { title: "Tất Vớ Khử Mùi", desc: "Cotton chải kỹ" },
              { title: "Đại Lý Chiết Khấu", desc: "Giảm sỉ sập sàn" }
            ].map((box, idx) => (
              <div key={idx} className="p-6 rounded-brand-lg bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300">
                <span className="w-5 h-5 rounded bg-brand-500/20 text-brand-300 flex items-center justify-center text-[10px] font-black mb-3">
                  0{idx+1}
                </span>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">{box.title}</h4>
                <p className="text-[10px] text-brand-200 mt-1">{box.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. TRUST HIGHLIGHT BAR */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
              <Truck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Miễn Phí Vận Chuyển</h4>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Áp dụng cho mọi đơn hàng từ 500,000đ</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 border-y md:border-y-0 md:border-x border-gray-100 py-4 md:py-0">
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">15 Ngày Đổi Trả</h4>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Hỗ trợ đổi size và kiểu dáng thoải mái</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">Hợp Tác Sỉ Tiện Lợi</h4>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Mức chiết khấu B2B cao, duyệt nhanh</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATEGORY SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight">Danh Mục Nổi Bật</h2>
          <p className="text-xs text-gray-400 font-bold">Khám phá các dòng sản phẩm dệt may thiết kế cao cấp nhất.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mappedCategories.map((cat, idx) => (
            <Link 
              key={idx}
              href={`/products?category=${cat.slug}`}
              className="group relative h-72 rounded-brand-lg overflow-hidden border border-gray-100 shadow-2xs hover:shadow-lg transition-all duration-300"
            >
              {/* Background Image */}
              <img 
                src={cat.imageUrl} 
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent group-hover:opacity-90 transition-opacity" />
              
              {/* Text info bottom */}
              <div className="absolute bottom-6 left-6 text-white space-y-1 z-10">
                <span className="text-[9px] text-accent-gold font-extrabold uppercase tracking-widest block">
                  {cat.description}
                </span>
                <h3 className="text-base font-black uppercase tracking-wide group-hover:text-accent-gold transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS (8 ITEMS FROM DATABASE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-gray-200 gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
              Sản Phẩm Mới Nhất
              <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-pulse" />
            </h2>
            <p className="text-xs text-gray-400 font-bold">Cập nhật xu hướng thời trang mặc nhà mới nhất.</p>
          </div>
          <Link 
            href="/products"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 group shrink-0"
          >
            Xem tất cả sản phẩm
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {products.length === 0 ? (
          /* Empty state fallback */
          <div className="text-center py-20 bg-white rounded-brand-lg border border-gray-100 shadow-sm max-w-md mx-auto space-y-4">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-sm font-bold text-gray-700">Chưa có sản phẩm nào</h3>
            <p className="text-xs text-gray-400 leading-relaxed">CSDL hiện chưa có sản phẩm kích hoạt. Vui lòng quay lại sau.</p>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => {
              // Safe decimal arithmetic
              const firstVariant = product.variants && product.variants[0];
              const price = firstVariant ? Number(firstVariant.retailPrice) : 0;
              const hasWholesaleTiers = product.wholesaleTiers && 
                (Array.isArray(product.wholesaleTiers) ? product.wholesaleTiers.length > 0 : true);

              // Images fallback
              const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
              const imageUrl = primaryImage ? primaryImage.url : 'https://images.unsplash.com/photo-1594913785162-e6785b423cb1?auto=format&fit=crop&w=400&q=80';

              return (
                <div 
                  key={product.id}
                  className="group bg-white rounded-brand-lg border border-gray-100 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col relative"
                >
                  {/* Photo thumbnail container */}
                  <div className="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden border-b border-gray-100">
                    <img 
                      src={imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                    />

                    {/* Badges indicators overlay */}
                    {product.isFeatured && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-brand-600 text-white text-[8px] font-black uppercase tracking-widest shadow-xs">
                        Nổi bật
                      </span>
                    )}

                    {hasWholesaleTiers && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-accent-pink text-white text-[8px] font-black uppercase tracking-widest shadow-xs">
                        Giá sỉ B2B
                      </span>
                    )}
                  </div>

                  {/* Body Text */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-brand-600 uppercase tracking-widest block">
                        {product.category?.name || 'Sản phẩm'}
                      </span>
                      <h3 className="text-xs font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1 leading-tight">
                        {product.name}
                      </h3>
                    </div>

                    {/* Cost block */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Giá bán lẻ</span>
                        <p className="text-sm font-black text-gray-900 mt-0.5">
                          {price > 0 ? `${price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                        </p>
                      </div>
                      
                      {/* View details button link */}
                      <Link 
                        href={`/products/${product.slug}`}
                        className="p-2 rounded-brand-md bg-gray-50 hover:bg-brand-600 text-gray-600 hover:text-white transition-all shadow-3xs"
                        title="Xem chi tiết"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. SECONDARY PROMO BANNERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Banner 1 */}
          <div className="relative rounded-brand-lg overflow-hidden bg-brand-950 p-8 sm:p-12 flex flex-col justify-between min-h-60 text-white shadow-2xs group border border-white/5">
            <img 
              src="https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=600&q=80" 
              alt="Promo 1"
              className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:scale-102 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-900/30 to-transparent" />
            
            <div className="relative z-10 space-y-2">
              <span className="text-[9px] text-accent-gold font-extrabold uppercase tracking-widest block">Ưu Đãi Trọn Bộ</span>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Mua 3 Tặng 1</h3>
              <p className="text-xs text-brand-200 max-w-xs leading-relaxed">
                Áp dụng cho dòng sản phẩm tất vớ Cotton chải kỹ kháng khuẩn. Mua càng nhiều ưu đãi sỉ càng tốt.
              </p>
            </div>
            
            <div className="relative z-10 pt-6">
              <Link 
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-gold hover:text-white transition"
              >
                Nhận ưu đãi ngay
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Banner 2 */}
          <div className="relative rounded-brand-lg overflow-hidden bg-accent-pink/95 p-8 sm:p-12 flex flex-col justify-between min-h-60 text-white shadow-2xs group">
            <img 
              src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80" 
              alt="Promo 2"
              className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-102 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-accent-pink via-accent-pink/50 to-transparent" />
            
            <div className="relative z-10 space-y-2">
              <span className="text-[9px] text-white font-extrabold uppercase tracking-widest block">Xu Hướng Mới</span>
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">BST Lụa Băng Mát Lạnh</h3>
              <p className="text-xs text-white/90 max-w-xs leading-relaxed">
                Dòng sản phẩm đồ lót nam và váy ngủ cao cấp dệt sợi mát lạnh. Giảm nhiệt ngày nóng bức tức thì.
              </p>
            </div>
            
            <div className="relative z-10 pt-6">
              <Link 
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-gray-900 hover:bg-white px-4 py-2 rounded-brand-sm bg-white/10 border border-white/20 transition-all"
              >
                Xem chi tiết
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

    </main>
  );
}