'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  ChevronRight, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  CreditCard,
  Truck,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { EmptyState, LoadingSpinner } from '@/components/ui/States';

type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'VNPAY';

type CheckoutResponse = {
  orderId: string;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: PaymentMethod;
  totalAmount?: number;
  bankTransfer?: {
    bankId?: string;
    bankName?: string;
    accountNumber?: string;
    accountNo?: string;
    accountName?: string;
    amount?: number;
    transferContent?: string;
    qrImageUrl?: string;
  };
  message?: string;
  error?: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  // Delivery Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  
  // Submit & Error Handling States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Avoid Next.js hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate items cost
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  // B2C Free Shipping Business Rule: Freeship from 500,000đ, otherwise 30,000đ
  const shippingFee = useMemo(() => {
    if (subtotal >= 500000) return 0;
    return 30000;
  }, [subtotal]);

  // Final Total calculation
  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic front-end validations
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setError('Vui lòng điền đầy đủ các trường thông tin giao hàng bắt buộc.');
      return;
    }

    if (phone.trim().length < 9 || phone.trim().length > 11) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập từ 9 đến 11 chữ số.');
      return;
    }

    if (items.length === 0) {
      setError('Giỏ hàng của bạn đang trống.');
      return;
    }

    setLoading(true);

    // Build standard payload matching the backend checkoutSchema
    const payload = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes.trim(),
      paymentMethod,
      items: items.map(item => ({
        id: item.id,
        quantity: Number(item.quantity)
      }))
    };

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as CheckoutResponse;

      if (!response.ok) {
        throw new Error(result.message || 'Đặt hàng thất bại. Vui lòng kiểm tra lại thông tin.');
      }

      // Success flow
      if (paymentMethod === 'VNPAY') {
        const vnpayResponse = await fetch('/api/payment/vnpay/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ orderId: result.orderId })
        });
        const vnpayResult = await vnpayResponse.json();
        if (!vnpayResponse.ok) {
          throw new Error(vnpayResult.error || 'Không thể tạo liên kết thanh toán VNPay.');
        }
        if (vnpayResult.paymentUrl) {
          clearCart();
          window.location.href = vnpayResult.paymentUrl;
          return;
        }
      }

      clearCart();
      const checkoutTotal = Number(result.totalAmount ?? total);
      const params = new URLSearchParams({
        orderId: result.orderId,
        orderNumber: result.orderNumber || '',
        paymentMethod: result.paymentMethod || paymentMethod,
        total: String(checkoutTotal),
      });

      if (result.bankTransfer) {
        const accountNumber = result.bankTransfer.accountNumber || result.bankTransfer.accountNo || '';

        params.append('bankName', result.bankTransfer.bankName || '');
        params.append('accountNumber', accountNumber);
        params.append('accountNo', accountNumber);
        params.append('accountName', result.bankTransfer.accountName || '');
        params.append('bankCode', result.bankTransfer.bankId || '');
        params.append('amount', String(result.bankTransfer.amount ?? checkoutTotal));
        params.append('transferContent', result.bankTransfer.transferContent || '');
        params.append('qrImageUrl', result.bankTransfer.qrImageUrl || '');
      }

      router.push(`/checkout/success?${params.toString()}`);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi kết nối với máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center py-20 px-4">
        <LoadingSpinner message="Đang chuẩn bị thanh toán..." />
      </main>
    );
  }

  // Empty cart redirect view
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center py-20 px-4 text-center">
        <EmptyState
          title="Giỏ hàng trống"
          description="Hiện tại giỏ hàng của bạn đang trống, không thể thực hiện thủ tục thanh toán. Vui lòng quay lại chọn sản phẩm."
          icon={<ShoppingBag className="w-8 h-8 text-gray-400" />}
          actionLabel="Quay lại mua sắm"
          actionHref="/products"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-gray-900 pb-24 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-brand-600 transition">Trang chủ</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/cart" className="hover:text-brand-600 transition">Giỏ hàng</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600">Thanh toán</span>
        </nav>

        {/* Back Link */}
        <div className="mb-6">
          <Link 
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại giỏ hàng
          </Link>
        </div>

        {/* Form Container Grid (12 Columns) */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN: Shipping info & delivery options (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery address box */}
            <div className="bg-white p-6 sm:p-8 rounded-brand-lg border border-gray-100 shadow-2xs space-y-6">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-gray-100">
                <MapPin className="w-4 h-4 text-brand-600" />
                Thông tin giao hàng
              </h2>

              {/* Form Input fields */}
              <div className="space-y-4">
                {/* Full name */}
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Họ và tên người nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    required
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-brand-md text-xs font-bold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition"
                  />
                </div>

                {/* Phone number */}
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    Số điện thoại liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    placeholder="0912345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-brand-md text-xs font-bold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition"
                  />
                </div>

                {/* Detailed Address */}
                <div className="space-y-1.5">
                  <label htmlFor="address" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Địa chỉ giao hàng chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    required
                    rows={3}
                    placeholder="Số 123, Đường Láng, Quận Đống Đa, Hà Nội"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-brand-md text-xs font-bold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition resize-none"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label htmlFor="notes" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Ghi chú đơn hàng (Không bắt buộc)
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    placeholder="Giao giờ hành chính, gọi trước khi giao..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-brand-md text-xs font-bold focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method box */}
            <div className="bg-white p-6 sm:p-8 rounded-brand-lg border border-gray-100 shadow-2xs space-y-5">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-gray-100">
                <CreditCard className="w-4 h-4 text-brand-600" />
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                {/* COD Radio */}
                <div 
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 border rounded-brand-md flex items-center gap-4 relative cursor-pointer transition ${
                    paymentMethod === 'COD' 
                      ? 'bg-brand-50/50 border-brand-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                    <Truck className="w-4.5 h-4.5 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-extrabold text-gray-900">Thanh toán khi nhận hàng (COD)</h4>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Khách hàng kiểm tra hàng trước khi thanh toán cho shipper.</p>
                  </div>
                  <span className={`w-4.5 h-4.5 rounded-full border-4 ${
                    paymentMethod === 'COD' ? 'border-brand-600 bg-white' : 'border-gray-300 bg-white'
                  }`} />
                </div>

                {/* BANK TRANSFER Radio */}
                <div 
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`p-4 border rounded-brand-md flex items-center gap-4 relative cursor-pointer transition ${
                    paymentMethod === 'BANK_TRANSFER' 
                      ? 'bg-brand-50/50 border-brand-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                    <CreditCard className="w-4.5 h-4.5 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-extrabold text-gray-900">Chuyển khoản ngân hàng (BANK_TRANSFER)</h4>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Thanh toán chuyển khoản qua ngân hàng trước khi giao nhận hàng.</p>
                  </div>
                  <span className={`w-4.5 h-4.5 rounded-full border-4 ${
                    paymentMethod === 'BANK_TRANSFER' ? 'border-brand-600 bg-white' : 'border-gray-300 bg-white'
                  }`} />
                </div>

                {/* VNPAY Radio */}
                <div 
                  onClick={() => setPaymentMethod('VNPAY')}
                  className={`p-4 border rounded-brand-md flex items-center gap-4 relative cursor-pointer transition ${
                    paymentMethod === 'VNPAY' 
                      ? 'bg-brand-50/50 border-brand-500' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                    <CreditCard className="w-4.5 h-4.5 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-extrabold text-gray-900">Cổng thanh toán VNPay (VNPAY)</h4>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Thanh toán trực tuyến bằng thẻ ATM, Mobile Banking hoặc QR Code qua VNPay.</p>
                  </div>
                  <span className={`w-4.5 h-4.5 rounded-full border-4 ${
                    paymentMethod === 'VNPAY' ? 'border-brand-600 bg-white' : 'border-gray-300 bg-white'
                  }`} />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary sidebar (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            <div className="bg-white p-6 rounded-brand-lg border border-gray-100 shadow-2xs space-y-6">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100 flex items-center justify-between">
                <span>Tóm tắt đơn hàng</span>
                <span className="text-xs text-gray-400 font-bold normal-case">({items.length} món)</span>
              </h2>

              {/* Items List inside summary */}
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-2 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-3.5 items-center">
                    {/* Thumbnail */}
                    <div className="w-12 h-15 bg-gray-50 border border-gray-100 rounded overflow-hidden shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-gray-900 truncate leading-snug">{item.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                        Phân loại: {item.color} / Size {item.size}
                      </p>
                      <div className="flex items-center justify-between mt-1 text-[10px] font-bold text-gray-500">
                        <span>Số lượng: {item.quantity}</span>
                        <span className="text-gray-800 font-extrabold">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-gray-100 pt-5 space-y-3.5">
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span>Tạm tính</span>
                  <span className="font-extrabold text-gray-900">{subtotal.toLocaleString('vi-VN')} đ</span>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    Phí vận chuyển
                    <Truck className="w-3.5 h-3.5 text-gray-400" />
                  </span>
                  <span className="font-extrabold text-gray-900">
                    {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')} đ`}
                  </span>
                </div>

                {/* Free shipping progress warning/success info */}
                {shippingFee > 0 && (
                  <div className="p-3 bg-brand-50 border border-brand-100 rounded text-[10px] text-brand-700 leading-normal">
                    💡 Mua thêm <span className="font-bold">{(500000 - subtotal).toLocaleString('vi-VN')} đ</span> để được **Miễn phí vận chuyển toàn quốc**.
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
                  <span className="text-xs font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-xl font-black text-brand-600 tracking-tight">
                    {total.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {/* Alert Error Box */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-brand-md text-red-700 text-xs font-bold flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit CTA button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-850 text-white rounded-brand-md text-xs font-black uppercase tracking-wider transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý đơn hàng...
                  </>
                ) : (
                  'Hoàn tất đặt hàng'
                )}
              </button>
            </div>

          </div>

        </form>

      </div>
    </main>
  );
}
