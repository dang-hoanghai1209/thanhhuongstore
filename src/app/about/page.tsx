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
          alt="Thanh Hương Store Retail"
          className="absolute inset-0 w-full h-full object-cover -z-10 opacity-70"
        />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-widest">
            Chào mừng đến với Thanh Hương Store
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Nơi kết nối thời trang Việt & Tiêu dùng thông minh
          </h1>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed font-medium">
            Chúng tôi tự hào là đơn vị phân phối tất vớ, đồ bơi, đồ lót nam chất lượng cao, mang đến sự dễ chịu, bền bỉ và giá trị thực thụ cho hàng triệu gia đình Việt Nam.
          </p>
        </div>
      </div>

      {/* Story & Philosophy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">Câu chuyện thương hiệu</h2>
          <p>
            Thành lập từ mong muốn mang tới cho người dùng Việt Nam những sản phẩm may mặc thiết yếu hàng ngày với chất lượng vượt trội nhất, **Thanh Hương Store** đã tập trung xây dựng danh mục sản phẩm tất vớ, đồ bơi và đồ lót nam cao cấp.
          </p>
          <p>
            Đối với chúng tôi, một đôi vớ êm ái hay một bộ đồ bơi ôm dáng không chỉ bảo vệ cơ thể, mà còn khơi dậy nguồn tự tin to lớn giúp bạn sẵn sàng đón nhận những trải nghiệm mới mỗi ngày. Đó là lý do Thanh Hương luôn khắt khe từ khâu chọn sợi cotton tinh khiết, sợi spandex co giãn đến công nghệ dệt may liền mạch 3D tiên tiến nhất.
          </p>
          <h3 className="font-bold text-on-surface text-sm pt-2">Giá trị cốt lõi của Thanh Hương:</h3>
          <ul className="list-disc pl-5 space-y-1 font-medium">
            <li>**Chất lượng chân thật**: Nói không với hàng nhái, sợi nhân tạo kém chất lượng gây bí bách.</li>
            <li>**Giá trị xứng đáng**: Định giá hợp lý cho cả nhu cầu mua lẻ tiêu dùng và mua sỉ B2B.</li>
            <li>**Tận tâm đồng hành**: Lắng nghe và hỗ trợ khách hàng đổi trả, xử lý sự cố linh hoạt.</li>
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

      {/* Retail & Wholesale Operations */}
      <div className="bg-surface-container-low border border-surface-variant/40 rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xs">
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
          </div>
          <h3 className="text-base font-bold text-on-surface">Bán lẻ storefront (B2C)</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
            Mở cửa mua sắm dễ dàng trên website với đầy đủ sản phẩm vớ thời trang, đồ bơi thể thao nam nữ và đồ lót kháng khuẩn. Giao hàng hỏa tốc và thanh toán COD toàn quốc linh hoạt.
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">groups</span>
          </div>
          <h3 className="text-base font-bold text-on-surface">Bán sỉ & Phân phối (B2B)</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
            Chính sách chiết khấu bậc thang hấp dẫn tự động dựa trên số lượng đơn hàng dành cho đại lý và cửa hàng. Đơn giản hóa quy trình đặt hàng, xuất hóa đơn sỉ nhanh chóng qua tài khoản đại lý chuyên biệt.
          </p>
        </div>
      </div>

      {/* CTA section */}
      <div className="text-center bg-white border border-surface-variant/60 rounded-2xl p-8 sm:p-10 shadow-xs space-y-4 max-w-2xl mx-auto">
        <h3 className="text-base sm:text-lg font-bold text-on-surface">Bắt đầu trải nghiệm Thanh Hương Store ngay hôm nay</h3>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed font-medium">
          Dù bạn mua sắm cho gia đình hay tìm kiếm nguồn hàng sỉ kinh doanh bền vững, chúng tôi luôn có giải pháp phù hợp nhất.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/products" className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-xl transition shadow active:scale-95">
            Xem sản phẩm
          </Link>
          <Link href="/contact" className="px-6 py-2.5 bg-surface-container-lowest border-2 border-primary text-primary hover:bg-primary/5 text-xs font-bold rounded-xl transition active:scale-95">
            Liên hệ mua sỉ
          </Link>
        </div>
      </div>
    </div>
  );
}
