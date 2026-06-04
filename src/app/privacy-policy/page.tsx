import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-fadeIn">
      <Breadcrumb items={[{ label: 'Chính sách bảo mật' }]} />

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Chính Sách Bảo Mật Thông Tin</h1>
        <p className="text-xs text-on-surface-variant/70 mt-1">Bảo vệ quyền lợi riêng tư tuyệt đối cho khách hàng sỉ/lẻ tại Thanh Hương Store.</p>
      </div>

      <div className="bg-white border border-surface-variant/50 rounded-2xl p-6 sm:p-8 shadow-xs text-xs sm:text-sm text-on-surface-variant leading-relaxed space-y-6 font-medium">
        
        {/* Section 1 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">policy</span>
            1. Mục đích thu thập dữ liệu khách hàng
          </h3>
          <p>
            Thanh Hương Store chỉ thu thập các thông tin cơ bản liên quan trực tiếp đến việc xử lý đơn hàng và cung cấp dịch vụ khách hàng:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Họ và tên, địa chỉ nhận hàng để shipper bàn giao sản phẩm.</li>
            <li>Số điện thoại và Email để thông báo mã đơn hàng, xác minh thanh toán hoặc khôi phục tài khoản mật khẩu.</li>
            <li>Công ty và Mã số thuế (chỉ áp dụng đối với đại lý mua sỉ đăng ký Wholesale).</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">share</span>
            2. Phạm vi sử dụng thông tin
          </h3>
          <p>Thông tin thu thập từ khách hàng chỉ được lưu hành nội bộ cho mục đích:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Xử lý giỏ hàng, xuất hóa đơn và lập hồ sơ vận đơn chuyển phát hàng hóa.</li>
            <li>Hỗ trợ xử lý nhanh chóng các trường hợp khiếu nại, hoàn tiền hoặc đổi trả sản phẩm lỗi.</li>
            <li>Gửi email hoặc tin nhắn giới thiệu các chương trình ưu đãi tri ân đối với khách hàng thân thiết.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">lock</span>
            3. Cam kết bảo mật an toàn thông tin
          </h3>
          <p>
            Chúng tôi cam kết bảo mật tuyệt đối các dữ liệu cá nhân của người mua. Thanh Hương Store tuyệt đối **KHÔNG chia sẻ, bán, hoặc cho thuê** thông tin người dùng cho bất kỳ bên thứ ba nào vì mục đích thương mại riêng của họ.
          </p>
          <p>
            Các thông tin giao nhận hàng chỉ được chia sẻ duy nhất cho đơn vị bưu cục đối tác giao hàng (như GHTK, Viettel Post) để đảm bảo việc giao vận hàng hóa chính xác.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">manage_accounts</span>
            4. Quyền chỉnh sửa và xóa thông tin dữ liệu
          </h3>
          <p>
            Bạn có quyền đăng nhập vào tài khoản cá nhân trên website để cập nhật số điện thoại, mật khẩu hoặc cấu hình sổ địa chỉ nhận hàng bất kỳ lúc nào. Nếu có nhu cầu yêu cầu hệ thống xóa vĩnh viễn tài khoản và các dữ liệu liên quan, bạn vui lòng gửi thư yêu cầu tới địa chỉ Email: **hotro@thanhhuongstore.vn** để nhân viên hỗ trợ xóa thủ công.
          </p>
        </div>

      </div>

      {/* Quick navigation actions */}
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Link href="/products" className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-xl transition shadow active:scale-95">
          Tiếp tục mua hàng
        </Link>
        <Link href="/terms" className="px-6 py-2.5 bg-white border-2 border-primary text-primary hover:bg-primary/5 text-xs font-bold rounded-xl transition active:scale-95">
          Điều khoản sử dụng
        </Link>
      </div>
    </div>
  );
}
