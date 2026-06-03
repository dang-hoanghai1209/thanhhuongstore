'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Heart,
  Copy,
  Check,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/States';

type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'VNPAY';

type OrderDetails = {
  id: string;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: PaymentMethod;
  totalAmount?: number;
};

function normalizePaymentMethod(value: string | null | undefined): PaymentMethod | undefined {
  if (value === 'COD' || value === 'BANK_TRANSFER' || value === 'VNPAY') {
    return value;
  }

  return undefined;
}

function formatCurrency(value: number | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '';
  }

  return `${value.toLocaleString('vi-VN')} đ`;
}

function getPaymentTitle(paymentMethod: PaymentMethod | undefined) {
  switch (paymentMethod) {
    case 'BANK_TRANSFER':
      return 'Chờ xác nhận chuyển khoản';
    case 'VNPAY':
      return 'Thanh toán VNPay';
    case 'COD':
    default:
      return 'Đặt hàng thành công';
  }
}

function getPaymentMessage(paymentMethod: PaymentMethod | undefined, paymentStatus?: string) {
  if (paymentMethod === 'BANK_TRANSFER') {
    return paymentStatus === 'PAID'
      ? 'Hệ thống đã ghi nhận thanh toán chuyển khoản cho đơn hàng này.'
      : 'Vui lòng chuyển khoản đúng số tiền và nội dung bên dưới để shop xác nhận đơn hàng.';
  }

  if (paymentMethod === 'VNPAY') {
    return paymentStatus === 'PAID'
      ? 'Giao dịch VNPay đã được ghi nhận thành công.'
      : 'Nếu bạn đã thanh toán VNPay, trạng thái sẽ được cập nhật sau khi cổng thanh toán phản hồi.';
  }

  return 'Đơn hàng đã được ghi nhận. Shop sẽ liên hệ xác nhận trước khi giao hàng.';
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const queryOrderNumber = searchParams.get('orderNumber');
  const queryPaymentMethod = normalizePaymentMethod(searchParams.get('paymentMethod'));
  const queryTotal = Number(searchParams.get('amount') || searchParams.get('total') || 0);

  const bankName = searchParams.get('bankName');
  const accountNumber = searchParams.get('accountNumber') || searchParams.get('accountNo');
  const accountName = searchParams.get('accountName');
  const bankCode = searchParams.get('bankCode');
  const transferContent = searchParams.get('transferContent');
  const qrImageUrl = searchParams.get('qrImageUrl');

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isFetchingOrder, setIsFetchingOrder] = useState(false);
  const [orderFetchMessage, setOrderFetchMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const currentOrderId = orderId;
    let isActive = true;

    async function fetchOrderDetails() {
      setIsFetchingOrder(true);
      setOrderFetchMessage(null);

      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(currentOrderId)}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status !== 401 && response.status !== 403 && response.status !== 404) {
            setOrderFetchMessage('Không thể tải dữ liệu đơn hàng mới nhất. Đang hiển thị dữ liệu từ phiên checkout.');
          }
          return;
        }

        const data = (await response.json()) as OrderDetails;

        if (isActive) {
          setOrderDetails(data);
        }
      } catch {
        if (isActive) {
          setOrderFetchMessage('Không thể tải dữ liệu đơn hàng mới nhất. Đang hiển thị dữ liệu từ phiên checkout.');
        }
      } finally {
        if (isActive) {
          setIsFetchingOrder(false);
        }
      }
    }

    fetchOrderDetails();

    return () => {
      isActive = false;
    };
  }, [orderId]);

  const resolvedPaymentMethod = orderDetails?.paymentMethod ?? queryPaymentMethod;
  const resolvedOrderNumber = orderDetails?.orderNumber || queryOrderNumber;
  const resolvedPaymentStatus = orderDetails?.paymentStatus;
  const resolvedTotal = useMemo(() => {
    if (typeof orderDetails?.totalAmount === 'number') {
      return orderDetails.totalAmount;
    }

    return Number.isFinite(queryTotal) && queryTotal > 0 ? queryTotal : undefined;
  }, [orderDetails?.totalAmount, queryTotal]);

  const isBankTransfer = resolvedPaymentMethod === 'BANK_TRANSFER';
  const hasBankDetails = Boolean(bankName || accountNumber || accountName || transferContent || qrImageUrl);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setCopiedField(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white border border-gray-100 p-8 sm:p-10 rounded-brand-lg shadow-sm text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest block">
            Thanh Hương Store
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
            {getPaymentTitle(resolvedPaymentMethod)}
          </h1>

          {resolvedOrderNumber ? (
            <p className="text-xs text-brand-600 font-extrabold bg-brand-50/50 px-3 py-1.5 rounded-full inline-block">
              Mã đơn hàng: {resolvedOrderNumber}
            </p>
          ) : orderId ? (
            <p className="text-xs text-brand-600 font-extrabold bg-brand-50/50 px-3 py-1.5 rounded-full inline-block">
              Mã đơn hàng: #{orderId.slice(0, 8).toUpperCase()}
            </p>
          ) : null}

          <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto pt-1">
            {getPaymentMessage(resolvedPaymentMethod, resolvedPaymentStatus)}
          </p>
        </div>

        {isFetchingOrder && (
          <div className="bg-gray-50 border border-gray-100 rounded-brand-md p-3 text-xs text-gray-500">
            Đang tải trạng thái đơn hàng mới nhất...
          </div>
        )}

        {orderFetchMessage && (
          <div className="bg-amber-50 border border-amber-100 rounded-brand-md p-3 text-xs text-amber-700 flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{orderFetchMessage}</span>
          </div>
        )}

        {isBankTransfer && hasBankDetails && (
          <div className="bg-slate-50 border border-brand-100 p-5 rounded-brand-md text-left space-y-4 shadow-3xs">
            <h3 className="text-xs font-black text-brand-700 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-brand-100/60">
              <CreditCard className="w-4 h-4" />
              Thông tin chuyển khoản
            </h3>

            {qrImageUrl && (
              <div className="flex justify-center">
                <img
                  src={qrImageUrl}
                  alt="Mã QR chuyển khoản"
                  className="w-52 h-52 object-contain rounded-brand-md border border-white bg-white"
                />
              </div>
            )}

            <div className="space-y-2 text-xs">
              {bankName && (
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-gray-400 font-semibold">Ngân hàng:</span>
                  <span className="font-extrabold text-gray-800 text-right">
                    {bankName}
                    {bankCode ? ` (${bankCode})` : ''}
                  </span>
                </div>
              )}

              {accountNumber && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-400 font-semibold">Số tài khoản:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(accountNumber, 'accountNumber')}
                    className="font-extrabold text-brand-600 hover:text-brand-700 flex items-center gap-1 focus:outline-none transition group"
                  >
                    <span>{accountNumber}</span>
                    {copiedField === 'accountNumber' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                    )}
                  </button>
                </div>
              )}

              {accountName && (
                <div className="flex justify-between items-baseline gap-2">
                  <span className="text-gray-400 font-semibold">Chủ tài khoản:</span>
                  <span className="font-extrabold text-gray-800 uppercase text-right">{accountName}</span>
                </div>
              )}

              {resolvedTotal && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-400 font-semibold">Số tiền:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(Math.round(resolvedTotal)), 'amount')}
                    className="font-extrabold text-brand-600 hover:text-brand-700 flex items-center gap-1 focus:outline-none transition group"
                  >
                    <span>{formatCurrency(resolvedTotal)}</span>
                    {copiedField === 'amount' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                    )}
                  </button>
                </div>
              )}

              {transferContent && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-400 font-semibold">Nội dung:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(transferContent, 'transferContent')}
                    className="font-extrabold text-brand-600 hover:text-brand-700 flex items-center gap-1 focus:outline-none transition group text-right"
                  >
                    <span>{transferContent}</span>
                    {copiedField === 'transferContent' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                    )}
                  </button>
                </div>
              )}
            </div>

            <p className="text-[10px] text-gray-400 italic pt-2 text-center border-t border-brand-100/30">
              Vui lòng chuyển đúng số tiền và nội dung để shop đối soát nhanh.
            </p>
          </div>
        )}

        {isBankTransfer && !hasBankDetails && (
          <div className="bg-amber-50 border border-amber-100 rounded-brand-md p-4 text-xs text-amber-700 flex items-start gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Chưa nhận được thông tin chuyển khoản từ backend. Vui lòng liên hệ shop để được hỗ trợ.</span>
          </div>
        )}

        <div className="bg-gray-50 p-4 border border-gray-100 rounded-brand-md text-left text-xs text-gray-500 space-y-2.5">
          <p className="font-bold text-gray-800 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-accent-pink fill-accent-pink" />
            Các bước tiếp theo:
          </p>
          <p className="pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-brand-500 leading-normal">
            Nhân viên hỗ trợ sẽ liên hệ trực tiếp với bạn qua số điện thoại để xác nhận thông tin đơn hàng.
          </p>
          {resolvedPaymentMethod === 'BANK_TRANSFER' ? (
            <p className="pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-brand-500 leading-normal">
              Đơn hàng sẽ được xử lý sau khi shop ghi nhận khoản chuyển khoản.
            </p>
          ) : resolvedPaymentMethod === 'VNPAY' ? (
            <p className="pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-brand-500 leading-normal">
              Nếu giao dịch VNPay thành công, đơn hàng sẽ tự động được cập nhật trạng thái thanh toán.
            </p>
          ) : (
            <p className="pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-brand-500 leading-normal">
              Đơn hàng sẽ được giao đến bạn và thanh toán bằng tiền mặt khi nhận hàng.
            </p>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
          <ShieldCheck className="w-4 h-4 text-brand-500" />
          Mọi thông tin đơn hàng đều được bảo mật an toàn
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link
            href="/products"
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-850 text-white rounded-brand-md text-xs font-black uppercase tracking-wider transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Tiếp tục mua sắm
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full py-3.5 border border-gray-250 hover:bg-gray-50 text-gray-700 rounded-brand-md text-xs font-bold transition flex items-center justify-center"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center py-20 px-4">
          <LoadingSpinner message="Đang tải thông tin đơn hàng..." />
        </main>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
