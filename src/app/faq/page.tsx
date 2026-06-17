'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: string;
  items: FAQItem[];
}

export default function FAQPage() {
  const [activeId, setActiveId] = useState<number | null>(null);

  const categories: FAQCategory[] = [
    {
      title: 'Mua hàng & Thanh toán',
      icon: 'payments',
      items: [
        {
          id: 1,
          question: 'Làm thế nào để đặt mua hàng tại Hoàng Hải Sneaker?',
          answer: 'Bạn chỉ cần chọn sản phẩm yêu thích, lựa chọn màu sắc, kích cỡ và số lượng phù hợp rồi thêm vào giỏ hàng. Tiến hành điền thông tin giao hàng và chọn phương thức thanh toán tại trang Thanh toán để hoàn tất đơn đặt hàng.'
        },
        {
          id: 2,
          question: 'Hoàng Hải Sneaker hỗ trợ những phương thức thanh toán nào?',
          answer: 'Chúng tôi hỗ trợ 3 hình thức thanh toán chính: (1) Nhận hàng thanh toán COD toàn quốc, (2) Chuyển khoản ngân hàng trực tiếp (nội dung chuyển khoản ghi kèm mã đơn hàng), (3) Thanh toán thẻ và tài khoản nội địa/quốc tế qua cổng thanh toán bảo mật VNPAY.'
        },
        {
          id: 3,
          question: 'Tôi có được thay đổi thông tin đơn hàng sau khi đặt mua không?',
          answer: 'Nếu đơn hàng đang ở trạng thái "Chờ xử lý" (Pending), bạn có thể liên hệ ngay hotline 0987.654.321 để nhờ nhân viên hỗ trợ thay đổi size, màu sắc hoặc địa chỉ giao nhận. Trường hợp đơn hàng đã chuyển sang trạng thái đóng gói hoặc vận chuyển thì thông tin sản phẩm không thể chỉnh sửa.'
        }
      ]
    },
    {
      title: 'Giao hàng & Vận chuyển',
      icon: 'local_shipping',
      items: [
        {
          id: 4,
          question: 'Thời gian giao nhận hàng thường mất bao lâu?',
          answer: 'Đối với khu vực nội thành TP. Hồ Chí Minh và Hà Nội, thời gian giao hàng dao động từ 1 - 2 ngày làm việc. Đối với các tỉnh thành khác, đơn hàng thường được giao từ 3 - 5 ngày. Chúng tôi cũng hỗ trợ giao hàng hỏa tốc trong ngày tại TP.HCM nếu có yêu cầu.'
        },
        {
          id: 5,
          question: 'Phí vận chuyển tại shop được tính như thế nào?',
          answer: 'Hoàng Hải Sneaker áp dụng mức phí đồng giá 25.000đ cho đơn hàng tiêu chuẩn trên toàn quốc. Đặc biệt, miễn phí giao hàng cho tất cả các đơn hàng có giá trị từ 500.000đ trở lên.'
        }
      ]
    },
    {
      title: 'Đổi trả & Bảo hành',
      icon: 'assignment_return',
      items: [
        {
          id: 6,
          question: 'Chính sách đổi trả sản phẩm tại Hoàng Hải Sneaker ra sao?',
          answer: 'Khách hàng được quyền đổi trả sản phẩm trong vòng 7 ngày kể từ khi nhận hàng thành công. Sản phẩm đổi trả bắt buộc phải còn nguyên tem mác, chưa qua sử dụng hay giặt là, kèm theo hóa đơn mua hàng liên quan.'
        },
        {
          id: 7,
          question: 'Có sản phẩm nào bị hạn chế đổi trả không?',
          answer: 'Vì lý do vệ sinh an toàn sức khỏe cá nhân, các mặt hàng tất vớ đã xé mác và quần lót nam (underwear) đã mở hộp/bao bì bảo vệ sẽ KHÔNG áp dụng chính sách đổi trả, trừ phi phát hiện lỗi kỹ thuật từ khâu sản xuất.'
        }
      ]
    }
  ];

  const toggleFAQ = (id: number) => {
    setActiveId(prev => (prev === id ? null : id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fadeIn">
      <Breadcrumb items={[{ label: 'Câu hỏi thường gặp' }]} />

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">Câu Hỏi Thường Gặp (FAQs)</h1>
        <p className="text-xs text-on-surface-variant/70 mt-1">
          Tìm kiếm nhanh câu trả lời cho các thắc mắc phổ biến về mua hàng, vận chuyển và chế độ hậu mãi tại Hoàng Hải Sneaker.
        </p>
      </div>

      <div className="space-y-8">
        {categories.map((cat, catIdx) => (
          <div key={catIdx} className="space-y-4">
            <h3 className="font-bold text-on-surface text-base flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="material-symbols-outlined text-primary text-[20px]">{cat.icon}</span>
              {cat.title}
            </h3>

            <div className="space-y-3">
              {cat.items.map((item) => {
                const isOpen = activeId === item.id;
                return (
                  <div 
                    key={item.id}
                    className="bg-white border border-surface-variant/50 rounded-xl overflow-hidden shadow-2xs transition-all duration-200"
                  >
                    <button
                      onClick={() => toggleFAQ(item.id)}
                      className="w-full px-5 py-4 text-left font-bold text-xs sm:text-sm text-on-surface flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                    >
                      <span>{item.question}</span>
                      <span className="material-symbols-outlined text-primary transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        keyboard_arrow_down
                      </span>
                    </button>
                    
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs text-on-surface-variant leading-relaxed font-medium border-t border-slate-50 pt-3 bg-slate-50/30 animate-fadeIn">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Help CTA card */}
      <div className="bg-surface-container-low border border-surface-variant/40 rounded-2xl p-6 text-center space-y-3 mt-8 shadow-3xs max-w-xl mx-auto">
        <h4 className="font-bold text-on-surface text-sm">Vẫn còn thắc mắc khác chưa được giải quyết?</h4>
        <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed font-medium">
          Đừng ngần ngại liên hệ trực tiếp với bộ phận chăm sóc khách hàng của chúng tôi để được tư vấn tận tình nhất.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link href="/contact" className="px-5 py-2 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-xl transition shadow active:scale-95">
            Liên hệ ngay
          </Link>
          <Link href="/order-lookup" className="px-5 py-2 bg-white border border-primary text-primary hover:bg-primary/5 text-xs font-bold rounded-xl transition active:scale-95">
            Tra cứu đơn hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
