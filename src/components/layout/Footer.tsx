import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 text-gray-600 mt-auto">
      {/* Upper Info Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start space-y-2">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-[18px]">home_pin</span>
            Địa chỉ kho hàng
          </h4>
          <p className="text-xs text-gray-500 font-medium">123 Đường Ba Tháng Hai, Phường 11, Quận 10, TP. Hồ Chí Minh</p>
        </div>
        <div className="flex flex-col items-center md:items-start space-y-2">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
            Giờ hoạt động
          </h4>
          <p className="text-xs text-gray-500 font-medium">Thứ 2 - Chủ Nhật: 08:00 - 21:30 (Kể cả ngày lễ)</p>
        </div>
        <div className="flex flex-col items-center md:items-start space-y-2">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            Cam kết chất lượng
          </h4>
          <p className="text-xs text-gray-500 font-medium">100% sản phẩm dệt kim chất lượng cao, đổi trả 7 ngày linh hoạt</p>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Col 1: About */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-8 h-8 rounded-brand-sm bg-primary flex items-center justify-center text-white font-black text-sm shadow-xs">
              TH
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-on-surface">Thanh Hương Store</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Thanh Hương Store là thương hiệu hàng đầu cung cấp các dòng sản phẩm tất vớ cao cấp, đồ bơi thể thao nam nữ và đồ lót nam kháng khuẩn dệt kim cao cấp chính hãng Việt Nam.
          </p>
        </div>

        {/* Col 2: Customer Support & Policies */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Chính sách cửa hàng</h4>
          <ul className="space-y-2.5 text-xs font-semibold text-gray-500">
            <li><Link href="/terms" className="hover:text-primary transition">Điều khoản dịch vụ</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-primary transition">Chính sách bảo mật</Link></li>
            <li><Link href="/shipping-policy" className="hover:text-primary transition">Chính sách vận chuyển</Link></li>
            <li><Link href="/return-policy" className="hover:text-primary transition">Chính sách đổi trả</Link></li>
            <li><Link href="/payment-policy" className="hover:text-primary transition">Chính sách thanh toán</Link></li>
          </ul>
        </div>

        {/* Col 3: Information & Shopping */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2.5 text-xs font-semibold text-gray-500">
            <li><Link href="/about" className="hover:text-primary transition">Giới thiệu về shop</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition">Liên hệ CSKH</Link></li>
            <li><Link href="/faq" className="hover:text-primary transition">Câu hỏi thường gặp (FAQ)</Link></li>
            <li><Link href="/order-lookup" className="hover:text-primary transition">Tra cứu đơn hàng nhanh</Link></li>
            <li><Link href="/wholesale/register" className="hover:text-primary transition">Đăng ký mua sỉ (B2B)</Link></li>
          </ul>
        </div>

        {/* Col 4: Contacts & Socials */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Kết nối với chúng tôi</h4>
          <div className="space-y-2.5 text-xs font-semibold text-gray-500">
            <p className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[16px]">phone</span>
              0987.654.321
            </p>
            <p className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[16px]">mail</span>
              hotro@thanhhuongstore.vn
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <a href="#" className="p-2 bg-gray-50 hover:bg-primary/5 hover:text-primary rounded-full border border-gray-100 transition shadow-xs flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" className="p-2 bg-gray-50 hover:bg-primary/5 hover:text-primary rounded-full border border-gray-100 transition shadow-xs flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Lower Copyright Strip */}
      <div className="bg-gray-50 py-6 border-t border-gray-100 text-center text-[10px] text-gray-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Thanh Hương Store. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-1.5 font-bold text-gray-500">
            <span className="material-symbols-outlined text-primary text-[16px]">verified_user</span>
            Bản quyền thuộc về Thanh Hương Store B2B/B2C Platform
          </div>
        </div>
      </div>
    </footer>
  );
}
