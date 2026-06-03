import Link from 'next/link';
import { 
  Facebook, 
  Instagram, 
  Mail, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Twitter 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 text-gray-600 mt-auto">
      {/* Upper Info Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div className="flex flex-col items-center md:items-start space-y-2">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">📍 Địa chỉ cửa hàng</h4>
          <p className="text-xs text-gray-500">123 Đường Cách Mạng Tháng 8, Quận 1, TP. Hồ Chí Minh</p>
        </div>
        <div className="flex flex-col items-center md:items-start space-y-2">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">⏰ Giờ hoạt động</h4>
          <p className="text-xs text-gray-500">Thứ 2 - Chủ Nhật: 08:30 - 22:00 (Kể cả ngày lễ)</p>
        </div>
        <div className="flex flex-col items-center md:items-start space-y-2">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">🛡️ Cam kết chất lượng</h4>
          <p className="text-xs text-gray-500">100% hình ảnh thật, đổi trả miễn phí trong 7 ngày nếu lỗi sản xuất</p>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        {/* Col 1: About */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-brand-600">
            <div className="w-8 h-8 rounded-brand-sm bg-brand-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
              TH
            </div>
            <span className="text-sm font-black uppercase tracking-widest">Thanh Hương Store</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Thanh Hương Store là thương hiệu hàng đầu cung cấp các dòng sản phẩm tất vớ, bikini nữ và quần lót nam cao cấp, mang lại sự thoải mái và tự tin tuyệt đối cho bạn.
          </p>
        </div>

        {/* Col 2: Customer Support */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Hỗ trợ khách hàng</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/terms" className="hover:text-brand-600 transition">Điều khoản dịch vụ</Link></li>
            <li><Link href="/privacy" className="hover:text-brand-600 transition">Chính sách bảo mật</Link></li>
            <li><Link href="/shipping" className="hover:text-brand-600 transition">Chính sách giao nhận hàng</Link></li>
            <li><Link href="/returns" className="hover:text-brand-600 transition">Chính sách đổi trả bảo hành</Link></li>
          </ul>
        </div>

        {/* Col 3: Quick Shop Links */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Mua sắm</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/products" className="hover:text-brand-600 transition">Tất cả sản phẩm</Link></li>
            <li><Link href="/wholesale/register" className="hover:text-brand-600 transition">Chính sách B2B sỉ</Link></li>
            <li><Link href="/cart" className="hover:text-brand-600 transition">Giỏ hàng của bạn</Link></li>
            <li><Link href="/login" className="hover:text-brand-600 transition">Đăng nhập tài khoản</Link></li>
          </ul>
        </div>

        {/* Col 4: Contacts & Socials */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Kết nối với chúng tôi</h4>
          <div className="space-y-2.5 text-xs">
            <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-brand-600" /> 0912.345.678</p>
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-brand-600" /> support@thanhhuongstore.vn</p>
          </div>
          <div className="flex gap-3 pt-2">
            <a href="#" className="p-2 bg-gray-50 hover:bg-brand-50 hover:text-brand-600 rounded-full border border-gray-100 transition shadow-xs">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-gray-50 hover:bg-brand-50 hover:text-brand-600 rounded-full border border-gray-100 transition shadow-xs">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 bg-gray-50 hover:bg-brand-50 hover:text-brand-600 rounded-full border border-gray-100 transition shadow-xs">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Lower Copyright Strip */}
      <div className="bg-gray-50 py-6 border-t border-gray-100 text-center text-[10px] text-gray-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Thanh Hương Store. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-1.5 font-bold text-gray-500">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            Bản quyền thuộc về Thanh Hương Store B2B/B2C Platform
          </div>
        </div>
      </div>
    </footer>
  );
}
