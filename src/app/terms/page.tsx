import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-fadeIn">
      <Breadcrumb items={[{ label: 'Điều khoản sử dụng' }]} />

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Điều Khoản Dịch Vụ & Sử Dụng Website</h1>
        <p className="text-xs text-on-surface-variant/70 mt-1">Các quy định chung đối với người dùng truy cập mua sỉ và lẻ tại Thanh Hương Store.</p>
      </div>

      <div className="bg-white border border-surface-variant/50 rounded-2xl p-6 sm:p-8 shadow-xs text-xs sm:text-sm text-on-surface-variant leading-relaxed space-y-6 font-medium">
        
        {/* Section 1 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">assignment_ind</span>
            1. Trách nhiệm bảo mật tài khoản
          </h3>
          <p>
            Khi đăng ký tài khoản mua sỉ hoặc lẻ trên Thanh Hương Store, bạn chịu trách nhiệm hoàn toàn về việc bảo mật thông tin mật khẩu truy cập của mình. Nếu có bất kỳ dấu hiệu truy cập trái phép nào xảy ra, vui lòng thông báo ngay cho đội ngũ hỗ trợ kỹ thuật của shop để khóa tài khoản tạm thời.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">shopping_bag</span>
            2. Cam kết thông tin đơn hàng
          </h3>
          <p>
            Bạn cam kết cung cấp đúng và đầy đủ thông tin giao hàng bao gồm: Họ tên người nhận, số điện thoại liên lạc chính thức và địa chỉ nhà chi tiết. Mọi thiệt hại do việc khai báo sai thông tin địa chỉ dẫn tới thất lạc bưu phẩm, khách hàng sẽ tự chịu trách nhiệm chi trả chi phí hoàn đơn liên quan.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">handshake</span>
            3. Quy định đối với khách hàng mua sỉ B2B
          </h3>
          <p>
            Đại lý hoặc cửa hàng mua sỉ cam kết bảo mật bảng giá sỉ và các chính sách ưu đãi Wholesale được cung cấp nội bộ bởi Thanh Hương Store. Việc cố tình tiết lộ thông tin giá chiết khấu đại lý cho các đơn vị cạnh tranh khác có thể dẫn đến việc tài khoản sỉ bị thu hồi vĩnh viễn không cần báo trước.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">gavel</span>
            4. Điều khoản giao dịch chung
          </h3>
          <p>
            Mọi tranh chấp phát sinh trong quá trình mua bán hàng hóa sỉ/lẻ trên website trước hết sẽ được ưu tiên giải quyết dựa trên tinh thần hòa giải và thương lượng song phương. Trong trường hợp không thể thỏa thuận, vụ việc sẽ được đưa ra phân xử tại Cơ quan quản lý có thẩm quyền theo quy định của pháp luật Việt Nam.
          </p>
        </div>

      </div>

      {/* Quick navigation actions */}
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Link href="/products" className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-xl transition shadow active:scale-95">
          Tiếp tục mua hàng
        </Link>
        <Link href="/privacy-policy" className="px-6 py-2.5 bg-white border-2 border-primary text-primary hover:bg-primary/5 text-xs font-bold rounded-xl transition active:scale-95">
          Chính sách bảo mật
        </Link>
      </div>
    </div>
  );
}
