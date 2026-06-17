import React from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-fadeIn">
      <Breadcrumb items={[{ label: 'Chính sách đổi trả' }]} />

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Chính Sách Đổi Trả Sản Phẩm</h1>
        <p className="text-xs text-on-surface-variant/70 mt-1">Hỗ trợ khách hàng an tâm mua sắm tại Hoàng Hải Sneaker.</p>
      </div>

      <div className="bg-white border border-surface-variant/50 rounded-2xl p-6 sm:p-8 shadow-xs text-xs sm:text-sm text-on-surface-variant leading-relaxed space-y-6 font-medium">
        
        {/* Section 1 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">assignment_return</span>
            1. Thời hạn đổi trả quy định
          </h3>
          <p>
            Hoàng Hải Sneaker hỗ trợ khách hàng đổi size, đổi mẫu hoặc hoàn trả sản phẩm trong vòng **7 ngày** tính từ ngày khách hàng nhận được kiện hàng thành công từ đơn vị chuyển phát.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
            2. Điều kiện sản phẩm đổi trả hợp lệ
          </h3>
          <p>Sản phẩm gửi lại cho shop bắt buộc phải thỏa mãn đầy đủ các tiêu chuẩn sau:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sản phẩm còn mới 100%, chưa qua sử dụng, chưa giặt ủi, không có mùi lạ (nước hoa, bột giặt).</li>
            <li>Sản phẩm còn nguyên vẹn tem giá, mác vải dệt và hộp bao bì đi kèm ban đầu.</li>
            <li>Có biên lai mua hàng hoặc mã đơn hàng đối chiếu trên hệ thống.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">cancel</span>
            3. Các trường hợp KHÔNG áp dụng đổi trả
          </h3>
          <p>Để đảm bảo vệ sinh cá nhân tối đa cho mọi khách hàng, Hoàng Hải Sneaker xin từ chối đổi trả đối với:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sản phẩm tất vớ đã xé mác, đã mang thử hoặc bị trầy xước sợi.</li>
            <li>Các sản phẩm quần lót nam (underwear) đã bóc hộp hoặc mở bao bì niêm phong bảo vệ.</li>
            <li>Sản phẩm mua trong các chương trình xả kho thanh lý cuối năm có ghi chú "Không đổi trả".</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
            4. Phí vận chuyển khi đổi trả
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>**Lỗi từ phía Hoàng Hải Sneaker** (giao sai mẫu, sai màu, hàng bị rách chỉ hoặc lỗi vải): Cửa hàng chịu hoàn toàn 100% phí ship thu hồi và gửi lại sản phẩm thay thế cho khách.</li>
            <li>**Theo nhu cầu cá nhân của khách** (muốn đổi size khác, đổi sang màu hoặc mẫu sản phẩm khác): Khách hàng vui lòng tự thanh toán tiền phí ship gửi hàng về kho và phí ship gửi hàng mới quay lại.</li>
          </ul>
        </div>

      </div>

      {/* Quick navigation actions */}
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Link href="/products" className="px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-xl transition shadow active:scale-95">
          Tiếp tục mua hàng
        </Link>
        <Link href="/contact" className="px-6 py-2.5 bg-white border-2 border-primary text-primary hover:bg-primary/5 text-xs font-bold rounded-xl transition active:scale-95">
          Gửi yêu cầu hỗ trợ
        </Link>
      </div>
    </div>
  );
}
