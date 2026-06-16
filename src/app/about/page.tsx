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
            Chuyên sỉ tất, vớ, bao tay giá tốt hàng đầu
          </h1>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed font-medium">
            Chúng tôi tự hào là đơn vị phân phối tất, vớ thời trang nam nữ, trẻ em và bao tay bảo hộ lao động chất lượng cao, cung cấp nguồn hàng sỉ ổn định và tối ưu chi phí cho các đại lý toàn quốc.
          </p>
        </div>
      </div>

      {/* Story & Philosophy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-4 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          <h2 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">Câu chuyện thương hiệu</h2>
          <p>
            Được thành lập với sứ mệnh mang đến cho thị trường Việt Nam nguồn hàng sỉ chất lượng cao và giá cả cạnh tranh nhất, **Hoàng Hải Sneaker** tập trung phát triển dòng sản phẩm cốt lõi gồm tất vớ dệt kim kháng khuẩn và bao tay bảo hộ lao động bền bỉ.
          </p>
          <p>
            Chúng tôi hiểu rằng đối với các cửa hàng bán lẻ, xưởng sản xuất hay đại lý phân phối, nguồn hàng ổn định cùng mức chiết khấu tốt là yếu tố sống còn cho hoạt động kinh doanh. Vì vậy, Hoàng Hải Sneaker luôn tối ưu quy trình từ sản xuất đến vận chuyển, mang lại giải pháp nhập sỉ B2B thông minh, nhanh chóng và tiết kiệm.
          </p>
          <h3 className="font-bold text-on-surface text-sm pt-2">Giá trị cốt lõi của Hoàng Hải Sneaker:</h3>
          <ul className="list-disc pl-5 space-y-1 font-medium">
            <li>**Giá sỉ tận xưởng**: Cung cấp mức giá sỉ cực tốt cho các cửa hàng, xưởng, đại lý và khách mua số lượng lớn.</li>
            <li>**Chất lượng đảm bảo**: Mọi sản phẩm tất vớ và bao tay đều được kiểm tra kỹ về độ bền, co giãn và kháng khuẩn.</li>
            <li>**Chiết khấu tự động**: Tích hợp công nghệ tính chiết khấu bậc thang tự động trực tiếp trên giỏ hàng, minh bạch và tiện lợi.</li>
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
          <h3 className="text-base font-bold text-on-surface">Mua sắm tiện lợi (B2C)</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
            Hỗ trợ khách hàng mua lẻ dễ dàng trên website với các lô tất vớ kháng khuẩn chất lượng cao cùng các lô hàng quần áo xả kho giá tốt. Giao hàng toàn quốc nhanh chóng.
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">groups</span>
          </div>
          <h3 className="text-base font-bold text-on-surface">Đại lý & Bán sỉ (B2B)</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
            Áp dụng chính sách giá sỉ sập sàn và chiết khấu cộng dồn tự động khi đặt số lượng lớn. Đơn giản hóa quy trình đặt hàng, kiểm duyệt và giao nhận dành riêng cho khách sỉ.
          </p>
        </div>
      </div>

      {/* CTA section */}
      <div className="text-center bg-white border border-surface-variant/60 rounded-2xl p-8 sm:p-10 shadow-xs space-y-4 max-w-2xl mx-auto">
        <h3 className="text-base sm:text-lg font-bold text-on-surface">Bắt đầu nhập hàng tại Hoàng Hải Sneaker ngay hôm nay</h3>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed font-medium">
          Đăng ký tài khoản đại lý sỉ để mở khóa các đặc quyền chiết khấu lớn nhất trên toàn bộ danh mục sản phẩm của chúng tôi.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/products" className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-xl transition shadow active:scale-95">
            Xem sản phẩm
          </Link>
          <Link href="/wholesale/register" className="px-6 py-2.5 bg-surface-container-lowest border-2 border-primary text-primary hover:bg-primary/5 text-xs font-bold rounded-xl transition active:scale-95">
            Đăng ký mua sỉ
          </Link>
        </div>
      </div>
    </div>
  );
}
