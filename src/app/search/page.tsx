import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ShoppingBag, X, Sparkles, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from '@/components/ui/States';
import ProductCard from '@/components/ui/ProductCard';
import Breadcrumb from '@/components/ui/Breadcrumb';

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const searchQuery = searchParams.q || '';
  const categorySlug = searchParams.category;
  const minPriceVal = searchParams.minPrice !== undefined && searchParams.minPrice !== '' ? Number(searchParams.minPrice) : undefined;
  const maxPriceVal = searchParams.maxPrice !== undefined && searchParams.maxPrice !== '' ? Number(searchParams.maxPrice) : undefined;
  const sortBy = searchParams.sort || 'newest';
  const page = searchParams.page ? Math.max(1, Number(searchParams.page)) : 1;
  const pageSize = 9;

  let validationError: string | null = null;
  let minPrice = minPriceVal;
  let maxPrice = maxPriceVal;

  if (minPriceVal !== undefined && maxPriceVal !== undefined && minPriceVal > maxPriceVal) {
    validationError = 'Giá tối thiểu không được lớn hơn giá tối đa.';
    minPrice = maxPriceVal;
    maxPrice = minPriceVal;
  }

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
  if (searchQuery) {
    where.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { slug: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.variants = {
      some: {
        retailPrice: {
          ...(minPrice !== undefined ? { gte: minPrice } : {}),
          ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
        }
      }
    };
  }

  // 3. Fetch products matching filters
  const rawProducts = await prisma.product.findMany({
    where,
    include: {
      category: { select: { name: true } },
      images: true,
      variants: true,
    },
  });
  const products = rawProducts.map((product) => ({
    ...product,
    variants: product.variants.map((variant) => ({
      ...variant,
      retailPrice: Number(variant.retailPrice),
      wholesalePrice: Number(variant.wholesalePrice),
    })),
  }));

  // 4. Apply sorting logic at JavaScript level (Decimal parsing safety)
  products.sort((a, b) => {
    const priceA = a.variants.length > 0 ? Number(a.variants[0].retailPrice) : 0;
    const priceB = b.variants.length > 0 ? Number(b.variants[0].retailPrice) : 0;
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    return dateB - dateA; // newest first
  });

  // 5. Apply Pagination
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentPage = Math.min(page, Math.max(1, totalPages));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = products.slice(startIndex, startIndex + pageSize);

  // 6. Helper function to generate modified filter URLs for Server-side routing
  const getFilterUrl = (params: {
    category?: string | null;
    minPrice?: number | null;
    maxPrice?: number | null;
    sort?: string | null;
    page?: number | null;
    q?: string | null;
  }) => {
    const query = new URLSearchParams();

    const catVal = params.category !== undefined ? params.category : categorySlug;
    if (catVal) query.set('category', catVal);

    const searchVal = params.q !== undefined ? params.q : searchQuery;
    if (searchVal) query.set('q', searchVal);

    const minVal = params.minPrice !== undefined ? params.minPrice : (minPrice !== undefined ? minPrice : null);
    if (minVal !== null && minVal !== undefined) query.set('minPrice', String(minVal));

    const maxVal = params.maxPrice !== undefined ? params.maxPrice : (maxPrice !== undefined ? maxPrice : null);
    if (maxVal !== null && maxVal !== undefined) query.set('maxPrice', String(maxVal));

    const sortVal = params.sort !== undefined ? params.sort : sortBy;
    if (sortVal) query.set('sort', sortVal);

    const pageVal = params.page !== undefined ? params.page : 1;
    if (pageVal && pageVal > 1) query.set('page', String(pageVal));

    return `/search?${query.toString()}`;
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
            <Search className="w-3.5 h-3.5" /> Tìm kiếm sản phẩm
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {searchQuery ? `Kết quả cho: "${searchQuery}"` : 'Tìm kiếm sản phẩm'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 max-w-2xl leading-relaxed">
            Tìm thấy {totalItems} sản phẩm phù hợp với yêu cầu tìm kiếm của bạn.
          </p>
        </div>
      </section>

      {/* Grid Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Dynamic Breadcrumbs */}
        {(() => {
          const bItems: Array<{ label: string; href?: string }> = [{ label: 'Tìm kiếm', href: '/search' }];
          if (searchQuery) {
            bItems.push({ label: `"${searchQuery}"` });
          } else {
            bItems[0].href = undefined;
          }
          return <Breadcrumb items={bItems} />;
        })()}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">

          {/* DESKTOP SIDEBAR FILTER (1/4 columns) */}
          <aside className="hidden lg:block space-y-8 bg-white p-6 rounded-brand-lg border border-gray-100/60 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Bộ lọc</h3>
              {(categorySlug || searchQuery || minPrice !== undefined || maxPrice !== undefined) && (
                <Link
                  href="/search"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 transition flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Đặt lại
                </Link>
              )}
            </div>

            {/* Keyword Search Form */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Từ khóa</h4>
              <form action="/search" method="GET" className="relative">
                {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                {minPrice !== undefined && <input type="hidden" name="minPrice" value={minPrice} />}
                {maxPrice !== undefined && <input type="hidden" name="maxPrice" value={maxPrice} />}
                {sortBy && <input type="hidden" name="sort" value={sortBy} />}
                <input
                  type="text"
                  name="q"
                  placeholder="Tìm kiếm sản phẩm..."
                  defaultValue={searchQuery || ''}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-brand-md text-xs font-bold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </form>
            </div>

            {/* Categories Checklist links */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
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
                  Tất cả danh mục
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

            {/* Numeric Custom Price Filters */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Khoảng giá (VNĐ)</h4>
              {validationError && (
                <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-brand-md border border-red-100/50">
                  ⚠️ {validationError}
                </p>
              )}
              <form action="/search" method="GET" className="space-y-3">
                {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                {searchQuery && <input type="hidden" name="q" value={searchQuery} />}
                {sortBy && <input type="hidden" name="sort" value={sortBy} />}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Từ</label>
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="0"
                      min="0"
                      defaultValue={minPriceVal !== undefined ? minPriceVal : ''}
                      className="w-full border border-gray-200 rounded-brand-md px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Đến</label>
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Giá tối đa"
                      min="0"
                      defaultValue={maxPriceVal !== undefined ? maxPriceVal : ''}
                      className="w-full border border-gray-200 rounded-brand-md px-2.5 py-2 text-xs font-bold focus:outline-none focus:border-brand-500 transition"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold py-2 rounded-brand-md transition shadow-xs text-center"
                  >
                    Áp dụng
                  </button>
                  {(minPriceVal !== undefined || maxPriceVal !== undefined) && (
                    <Link
                      href={getFilterUrl({ minPrice: null, maxPrice: null })}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold py-2 rounded-brand-md transition text-center"
                    >
                      Xóa lọc
                    </Link>
                  )}
                </div>
              </form>
            </div>
          </aside>

          {/* MAIN CATALOG GRID (3/4 columns) */}
          <div className="lg:col-span-3 space-y-6">

            {/* Sorting Header Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-brand-lg border border-gray-100/60 shadow-xs flex-wrap gap-4">
              <div className="text-xs text-gray-500 font-medium">
                Tìm thấy <span className="font-bold text-gray-800">{totalItems}</span> sản phẩm {searchQuery && `cho "${searchQuery}"`}
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
            {paginatedProducts.length === 0 && (
              <EmptyState
                title="Không tìm thấy sản phẩm"
                description="Không có sản phẩm nào khớp với bộ lọc hoặc từ khóa tìm kiếm của bạn. Vui lòng thử lại với tiêu chí khác."
                icon={<ShoppingBag className="w-8 h-8 text-gray-400" />}
                actionLabel="Xóa bộ lọc"
                actionHref="/search"
                className="py-16 max-w-lg mx-auto"
              />
            )}

            {/* PRODUCT GRID */}
            {paginatedProducts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* PAGINATION UI */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1.5 pt-12 border-t border-gray-100 flex-wrap">
                {/* Prev Button */}
                <Link
                  href={getFilterUrl({ page: Math.max(1, currentPage - 1) })}
                  className={`px-3 py-2 border rounded-brand-md text-xs font-bold transition flex items-center gap-1 ${
                    currentPage === 1
                      ? 'pointer-events-none opacity-50 bg-gray-50 text-gray-400 border-gray-200'
                      : 'bg-white hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trước
                </Link>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <Link
                    key={pNum}
                    href={getFilterUrl({ page: pNum })}
                    className={`w-9 h-9 flex items-center justify-center border rounded-brand-md text-xs font-bold transition ${
                      currentPage === pNum
                        ? 'border-brand-600 bg-brand-600 text-white shadow-xs'
                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {pNum}
                  </Link>
                ))}

                {/* Next Button */}
                <Link
                  href={getFilterUrl({ page: Math.min(totalPages, currentPage + 1) })}
                  className={`px-3 py-2 border rounded-brand-md text-xs font-bold transition flex items-center gap-1 ${
                    currentPage === totalPages
                      ? 'pointer-events-none opacity-50 bg-gray-50 text-gray-400 border-gray-200'
                      : 'bg-white hover:border-gray-300 text-gray-600'
                  }`}
                >
                  Sau
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
