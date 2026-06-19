import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-fadeIn">
      <Breadcrumb items={[{ label: 'Chính sách giao hàng' }]} />

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Chính Sách Vận Chuyển & Giao Nhận</h1>
        <p className="text-xs text-on-surface-variant/70 mt-1">Cập nhật mới nhất tháng 6/2026. Áp dụng cho mọi đơn hàng tại Hoàng Hải Sneaker.</p>
      </div>

      <div className="bg-white border border-surface-variant/50 rounded-2xl p-6 sm:p-8 shadow-xs text-xs sm:text-sm text-on-surface-variant leading-relaxed space-y-6 font-medium">
        
        {/* Section 1 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
            1. Các hình thức giao hàng áp dụng
          </h3>
          <p>
            Nhằm tạo điều kiện tốt nhất cho khách hàng trên cả nước tiếp cận các sản phẩm tất vớ, bao tay lao động và phụ kiện thời trang, Hoàng Hải Sneaker triển khai đa dạng kênh vận chuyển:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>**Giao hàng tiêu chuẩn toàn quốc**: Hợp tác với các đơn vị vận chuyển lớn (GHTK, Viettel Post, GHN).</li>
            <li>**Giao hàng hỏa tốc trong ngày**: Chỉ áp dụng cho khu vực nội thành Nha Trang với các đơn hàng cần gấp.</li>
            <li>**Giao qua xe khách/Chành xe**: Áp dụng đối với các đơn hàng số lượng lớn theo yêu cầu của khách hàng.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
            2. Biểu phí vận chuyển
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>**Đơn hàng tiêu chuẩn**: Áp dụng phí vận chuyển đồng giá **25.000đ** cho mọi đơn hàng dưới 500.000đ.</li>
            <li>**Miễn phí vận chuyển**: Áp dụng cho đơn hàng có giá trị thanh toán thực tế từ **500.000đ** trở lên.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
            3. Thời gian nhận hàng dự kiến
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>**Nội thành Nha Trang**: 1 - 2 ngày làm việc kể từ thời điểm xác nhận đơn hàng thành công.</li>
            <li>**Khu vực trung tâm Tỉnh/Thành khác**: 2 - 3 ngày làm việc.</li>
            <li>**Khu vực Huyện/Xã vùng sâu vùng xa**: 3 - 5 ngày làm việc.</li>
          </ul>
          <p className="italic text-xs text-on-surface-variant/80">
            * Lưu ý: Thời gian giao hàng không tính các ngày Chủ Nhật, ngày lễ Tết theo quy định pháp luật. Trong một số trường hợp thiên tai, dịch bệnh hoặc quá tải bưu cục, thời gian giao hàng có thể kéo dài hơn dự kiến.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">inventory</span>
            4. Kiểm hàng trước khi thanh toán
          </h3>
          <p>
            Nhằm đảm bảo quyền lợi tối đa cho người mua, Hoàng Hải Sneaker hỗ trợ chính sách **ĐỒNG KIỂM** khi nhận hàng. Khi nhân viên giao hàng tới, bạn được quyền mở hộp kiểm tra số lượng và mẫu mã sản phẩm trước khi thanh toán tiền (đối với COD) hoặc ký nhận đơn hàng.
          </p>
          <p>
            * Lưu ý: Việc kiểm hàng không bao gồm thử đồ (mặc thử đồ bơi, đồ lót, tất vớ) để bảo đảm vệ sinh cho sản phẩm.
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
