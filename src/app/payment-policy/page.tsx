import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function PaymentPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-fadeIn">
      <Breadcrumb items={[{ label: 'Chính sách thanh toán' }]} />

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Phương Thức & Quy Định Thanh Toán</h1>
        <p className="text-xs text-on-surface-variant/70 mt-1">Linh hoạt và an toàn cho mọi giao dịch mua sắm tại Hoàng Hải Sneaker.</p>
      </div>

      <div className="bg-white border border-surface-variant/50 rounded-2xl p-6 sm:p-8 shadow-xs text-xs sm:text-sm text-on-surface-variant leading-relaxed space-y-6 font-medium">
        
        {/* Section 1 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
            1. Thanh toán khi nhận hàng (COD)
          </h3>
          <p>
            Đây là hình thức phổ biến và an tâm nhất dành cho khách lẻ. Bạn đặt hàng trực tuyến trên website, nhân viên giao hàng của bưu cục sẽ giao kiện hàng tới tận tay. Bạn tiến hành mở kiểm tra số lượng sản phẩm và trực tiếp thanh toán tiền mặt cho Shipper.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
            2. Chuyển khoản ngân hàng trực tiếp
          </h3>
          <p>Dành cho khách hàng muốn chuyển khoản thanh toán trước đơn hàng:</p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs font-mono text-on-surface max-w-md">
            <div>
              <p className="font-bold text-[10px] text-gray-400 uppercase">Tài khoản Ngân hàng Techcombank</p>
              <p>Số tài khoản: **3988899979**</p>
              <p>Chủ tài khoản: **DANG HOANG HAI**</p>
              <p>Chi nhánh: TP. Hồ Chí Minh</p>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <p className="font-bold text-[10px] text-gray-400 uppercase">Cú pháp chuyển khoản bắt buộc</p>
              <p className="text-primary font-bold">HHSNEAKER [Mã đơn hàng của bạn]</p>
              <p className="text-[10px] font-sans text-on-surface-variant font-medium pt-1">
                Ví dụ: **HHSNEAKER ORD-20260605-0001**. Hệ thống sẽ tự kiểm duyệt tự động và cập nhật trạng thái đã thanh toán sau khi nhận được tiền gửi từ 2 - 5 phút.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">credit_card</span>
            3. Thanh toán trực tuyến qua cổng VNPAY
          </h3>
          <p>
            Khách hàng có thể thanh toán tức thời qua cổng VNPAY bằng các phương thức quét mã QR ngân hàng (Mobile Banking), thẻ ATM nội địa, hoặc thẻ tín dụng quốc tế (Visa, Mastercard, JCB). Giao dịch được bảo mật tuyệt đối theo tiêu chuẩn ngân hàng quốc tế.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">security</span>
            4. Bảo mật thông tin thanh toán
          </h3>
          <p>
            Hoàng Hải Sneaker cam kết không lưu giữ thông tin thẻ ngân hàng hoặc tài khoản thanh toán của bạn trên máy chủ của shop. Mọi quy trình nhập liệu thông tin tài chính đều diễn ra trực tiếp trên cổng thanh toán trung gian được cấp phép của Nhà nước, đảm bảo an toàn tuyệt đối trước mọi nguy cơ rò rỉ dữ liệu.
          </p>
        </div>

      </div>

      {/* Quick navigation actions */}
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Link href="/products" className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-xl transition shadow active:scale-95">
          Tiếp tục mua hàng
        </Link>
        <Link href="/order-lookup" className="px-6 py-2.5 bg-white border-2 border-primary text-primary hover:bg-primary/5 text-xs font-bold rounded-xl transition active:scale-95">
          Tra cứu đơn hàng
        </Link>
      </div>
    </div>
  );
}
