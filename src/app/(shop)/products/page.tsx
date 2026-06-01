import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ShoppingBag, SlidersHorizontal, ArrowRight, X, Sparkles } from 'lucide-react';

interface ProductsPageProps {
  searchParams: {
    category?: string;
    price?: string;
    sort?: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function ProductsCatalogPage({ searchParams }: ProductsPageProps) {
  const categorySlug = searchParams.category;
  const priceRange = searchParams.price;
  const sortBy = searchParams.sort || 'newest';

  // 1. Fetch active categories for the sidebar
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

  // 2. Build database filter query
  const where: any = { isActive: true };
  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  // 3. Fetch products matching filters
  let products = await prisma.product.findMany({
    where,
    include: {
      category: { select: { name: true } },
      images: true,
      variants: true,
    },
  });

  // 4. Apply price range filter at JavaScript level (Decimal parsing safety)
  if (priceRange) {
    products = products.filter((product) => {
      const firstPrice = product.variants.length > 0 ? Number(product.variants[0].retailPrice) : 0;
      if (priceRange === 'under-100k') return firstPrice < 100000;
      if (priceRange === '100k-300k') return firstPrice >= 100000 && firstPrice <= 300000;
      if (priceRange === 'above-300k') return firstPrice > 300000;
      return true;
    });
  }

  // 5. Apply sorting logic at JavaScript level
  products.sort((a, b) => {
    const priceA = a.variants.length > 0 ? Number(a.variants[0].retailPrice) : 0;
    const priceB = b.variants.length > 0 ? Number(b.variants[0].retailPrice) : 0;
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    return dateB - dateA; // newest first
  });

  // 6. Helper function to generate modified filter URLs for Server-side routing
  const getFilterUrl = (params: { category?: string | null; price?: string | null; sort?: string | null }) => {
    const query = new URLSearchParams();
    
    // Category mapping
    const catVal = params.category !== undefined ? params.category : categorySlug;
    if (catVal) query.set('category', catVal);

    // Price mapping
    const priceVal = params.price !== undefined ? params.price : priceRange;
    if (priceVal) query.set('price', priceVal);

    // Sort mapping
    const sortVal = params.sort !== undefined ? params.sort : sortBy;
    if (sortVal) query.set('sort', sortVal);

    return `/products?${query.toString()}`;
  };

  // Determine current active category name
  const activeCategory = categories.find(c => c.slug === categorySlug);

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-gray-900 pb-24">
      {/* Category Hero Header Banner */}
      <section className="bg-gradient-to-r from-brand-950 to-brand-900 text-white py-14 px-6 sm:px-12 md:px-20 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500 rounded-full filter blur-3xl opacity-15 -mr-16 -mt-16 animate-float" />
        <div className="relative max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 text-brand-200 text-[10px] font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Danh mục sản phẩm
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {activeCategory ? activeCategory.name : 'Tất Cả Sản Phẩm'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 max-w-2xl leading-relaxed">
            {activeCategory 
              ? `Bộ sưu tập các mẫu mã mới nhất thuộc danh mục ${activeCategory.name} cao cấp.`
              : 'Trải nghiệm mua sắm đẳng cấp với các dòng tất vớ, bikini nữ và đồ lót nam dệt sợi tự nhiên, kháng khuẩn vượt trội.'
            }
          </p>
        </div>
      </section>

      {/* Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          
          {/* DESKTOP SIDEBAR FILTER (1/4 columns) */}
          <aside className="hidden lg:block space-y-8 bg-white p-6 rounded-brand-lg border border-gray-100/60 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Bộ lọc</h3>
              {(categorySlug || priceRange) && (
                <Link 
                  href="/products"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 transition flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Đặt lại
                </Link>
              )}
            </div>

            {/* Categories Checklist links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Danh mục</h4>
              <div className="space-y-2 flex flex-col">
                <Link
                  href={getFilterUrl({ category: null })}
                  className={`text-xs font-bold transition-all py-1.5 px-2.5 rounded-brand-sm border ${
                    !categorySlug
                      ? 'border-brand-600 bg-brand-50 text-brand-700 font-extrabold shadow-sm'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Tất cả sản phẩm
                </Link>
                {categories.map((cat) => {
                  const isActive = categorySlug === cat.slug;
                  return (
                    <Link
                      key={cat.id}
                      href={getFilterUrl({ category: cat.slug })}
                      className={`text-xs font-bold transition-all py-1.5 px-2.5 rounded-brand-sm border ${
                        isActive
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-extrabold shadow-sm'
                          : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Price Ranges Radio links */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Khoảng giá</h4>
              <div className="space-y-2 flex flex-col">
                {[
                  { value: null, label: 'Tất cả giá' },
                  { value: 'under-100k', label: 'Dưới 100,000đ' },
                  { value: '100k-300k', label: '100,000đ - 300,000đ' },
                  { value: 'above-300k', label: 'Trên 300,000đ' },
                ].map((opt, idx) => {
                  const isActive = priceRange === opt.value || (opt.value === null && !priceRange);
                  return (
                    <Link
                      key={idx}
                      href={getFilterUrl({ price: opt.value })}
                      className={`text-xs font-bold transition-all py-1.5 px-2.5 rounded-brand-sm border ${
                        isActive
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-extrabold shadow-sm'
                          : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* MAIN CATALOG GRID (3/4 columns) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Sorting Header Bar (pure HTML links to avoid client component complexity) */}
            <div className="flex items-center justify-between bg-white p-4 rounded-brand-lg border border-gray-100/60 shadow-xs flex-wrap gap-4">
              <div className="text-xs text-gray-500 font-medium">
                Tìm thấy <span className="font-bold text-gray-800">{products.length}</span> sản phẩm
              </div>

              {/* Sorting triggers */}
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-400 font-medium">Sắp xếp theo:</span>
                <div className="flex gap-2">
                  {[
                    { value: 'newest', label: 'Mới nhất' },
                    { value: 'price-asc', label: 'Giá tăng' },
                    { value: 'price-desc', label: 'Giá giảm' },
                  ].map((opt) => {
                    const isActive = sortBy === opt.value;
                    return (
                      <Link
                        key={opt.value}
                        href={getFilterUrl({ sort: opt.value })}
                        className={`px-3 py-1.5 border rounded-brand-md text-[11px] font-bold tracking-wide uppercase transition ${
                          isActive
                            ? 'border-brand-600 bg-brand-600 text-white shadow-xs'
                            : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        {opt.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* EMPTY PRODUCTS FILTER STATE */}
            {products.length === 0 && (
              <div className="text-center py-24 bg-white rounded-brand-lg border border-gray-100/60 shadow-xs max-w-lg mx-auto">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base font-bold text-gray-700">Không tìm thấy sản phẩm</h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Không có sản phẩm nào khớp với bộ lọc hiện tại của bạn. Vui lòng thử lại với các tiêu chí khác.
                </p>
                <Link 
                  href="/products" 
                  className="mt-6 inline-block px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-brand-md transition"
                >
                  Xóa bộ lọc
                </Link>
              </div>
            )}

            {/* PRODUCT GRID */}
            {products.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {products.map((product) => {
                  const firstVariant = product.variants[0];
                  const price = firstVariant ? Number(firstVariant.retailPrice) : 0;
                  
                  // Extract unique colors to render swatches
                  const uniqueColors: { color: string; colorHex: string }[] = [];
                  product.variants.forEach(v => {
                    if (!uniqueColors.some(uc => uc.color === v.color)) {
                      uniqueColors.push({ color: v.color, colorHex: v.colorHex });
                    }
                  });

                  // Primary image URL fallback
                  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
                  const imageUrl = primaryImage ? primaryImage.url : 'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=400&q=80';

                  return (
                    <div 
                      key={product.id}
                      className="group bg-white rounded-brand-lg border border-gray-100/60 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                    >
                      {/* Image container */}
                      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden border-b border-gray-100/60">
                        <img 
                          src={imageUrl} 
                          alt={product.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Featured Sticker */}
                        {product.isFeatured && (
                          <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-brand-600/90 text-white text-[9px] font-extrabold uppercase tracking-wide shadow-xs">
                            Nổi bật
                          </span>
                        )}

                        {/* Wholesale Tier Sticker */}
                        {product.wholesaleTiers && (
                          <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-accent-pink/90 text-white text-[9px] font-extrabold uppercase tracking-wide shadow-xs">
                            Giá sỉ tốt
                          </span>
                        )}
                      </div>

                      {/* Info body */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wide block">
                            {product.category?.name || 'Sản phẩm'}
                          </span>
                          <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                            {product.name}
                          </h3>

                          {/* Color Swatches */}
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

                        {/* Pricing details */}
                        <div className="flex items-end justify-between pt-2">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-gray-400 font-medium block">Giá bán lẻ:</span>
                            <p className="text-xs sm:text-sm font-black text-brand-600">
                              {price > 0 ? `${price.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                            </p>
                          </div>
                          
                          <Link 
                            href={`/products/${product.slug}`}
                            className="p-2 rounded-brand-md bg-brand-50 group-hover:bg-brand-500 text-brand-600 group-hover:text-white transition-all duration-300 shrink-0 shadow-xs"
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

          </div>
        </div>
      </div>
    </main>
  );
}
