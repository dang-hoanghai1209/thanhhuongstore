import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 animate-fadeIn">
      <Breadcrumb items={[{ label: 'Giới thiệu' }]} />

      {/* Hero Intro */}
      <div className="relative rounded-3xl overflow-hidden bg-primary-container text-white p-8 sm:p-12 lg:p-16 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/20 z-0" />
        <img 
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80" 
          alt="Hoàng Hải Sneaker Warehouse"
          className="absolute inset-0 w-full h-full object-cover -z-10 opacity-70"
        />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-widest">
            Chào mừng đến với Hoàng Hải Sneaker
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Thương hiệu tất, vớ, bao tay chất lượng hàng đầu
          </h1>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed font-medium">
            Chúng tôi tự hào là đơn vị cung cấp tất, vớ thời trang nam nữ, trẻ em và bao tay bảo hộ lao động chất lượng cao, mang lại trải nghiệm mua sắm tối ưu và sản phẩm bền bỉ cho mọi khách hàng.
          </p>
        </div>
      </div>

      {/* Story & Philosophy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">Câu chuyện thương hiệu</h2>
          <p>
            Được thành lập với sứ mệnh mang đến cho thị trường Việt Nam những sản phẩm chất lượng cao và giá cả hợp lý nhất, **Hoàng Hải Sneaker** tập trung phát triển dòng sản phẩm cốt lõi gồm tất vớ dệt kim kháng khuẩn và bao tay bảo hộ lao động bền bỉ.
          </p>
          <p>
            Chúng tôi luôn đặt chất lượng sản phẩm và sự hài lòng của khách hàng làm trọng tâm phát triển. Vì vậy, Hoàng Hải Sneaker luôn tối ưu quy trình từ khâu sản xuất đến dịch vụ chăm sóc khách hàng, mang lại những sản phẩm tối ưu, an toàn và bền bỉ.
          </p>
          <h3 className="font-bold text-on-surface text-sm pt-2">Giá trị cốt lõi của Hoàng Hải Sneaker:</h3>
          <ul className="list-disc pl-5 space-y-1 font-medium">
            <li>**Giá cả cạnh tranh**: Cung cấp mức giá cực tốt đi kèm với chất lượng sản phẩm vượt trội.</li>
            <li>**Chất lượng đảm bảo**: Mọi sản phẩm tất vớ và bao tay đều được kiểm tra kỹ về độ bền, co giãn và kháng khuẩn.</li>
            <li>**Hỗ trợ nhanh chóng**: Sẵn sàng giải đáp thắc mắc và hỗ trợ khách hàng đổi trả linh hoạt trong vòng 7 ngày.</li>
          </ul>
        </div>
        
        <div className="rounded-2xl overflow-hidden shadow-md aspect-video md:aspect-square relative">
          <img 
            src="https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&q=80" 
            alt="Quality Garment Showcase" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Product categories highlight */}
      <div className="bg-surface-container-low border border-surface-variant/40 rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xs">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">style</span>
          </div>
          <h3 className="text-base font-bold text-on-surface">Tất / Vớ thời trang</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
            Các dòng tất vớ đa dạng chất liệu từ cotton organic, thun co giãn đa chiều kháng khuẩn tốt dành cho cả nam, nữ và trẻ em.
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">front_hand</span>
          </div>
          <h3 className="text-base font-bold text-on-surface">Bao tay lao động</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
            Bao tay bảo hộ dệt sợi tự nhiên dày dặn, độ bền cao, chống trơn trượt tối đa, phù hợp sử dụng cho các công việc lao động, nhà xưởng.
          </p>
        </div>
      </div>

      {/* CTA section */}
      <div className="text-center bg-white border border-surface-variant/60 rounded-2xl p-8 sm:p-10 shadow-xs space-y-4 max-w-2xl mx-auto">
        <h3 className="text-base sm:text-lg font-bold text-on-surface">Khám phá sản phẩm của Hoàng Hải Sneaker ngay hôm nay</h3>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed font-medium">
          Xem qua danh mục các sản phẩm tất vớ và bao tay chất lượng cao của chúng tôi.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/products" className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-xl transition shadow active:scale-95">
            Xem tất cả sản phẩm
          </Link>
          <Link href="/contact" className="px-6 py-2.5 bg-surface-container-lowest border-2 border-primary text-primary hover:bg-primary/5 text-xs font-bold rounded-xl transition active:scale-95">
            Liên hệ tư vấn
          </Link>
        </div>
      </div>
    </div>
  );
}
