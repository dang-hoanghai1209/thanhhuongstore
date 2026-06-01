import { SizeType, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export const FREE_SHIPPING_THRESHOLD = 500000; // 500,000đ
export const SHIPPING_FEE = 30000; // 30,000đ

export const SIZE_OPTIONS: Record<SizeType, string[]> = {
  [SizeType.SOCK]: ['S', 'M', 'L', 'XL'],
  [SizeType.SWIMWEAR]: ['XS', 'S', 'M', 'L', 'XL'],
  [SizeType.UNDERWEAR]: ['S', 'M', 'L', 'XL', 'XXL'],
  [SizeType.SHOE]: ['38', '39', '40', '41', '42', '43', '44'],
  [SizeType.ACCESSORY]: ['Freesize'],
};

export const SIZE_GUIDE: Record<SizeType, { label: string; details: string }[]> = {
  [SizeType.SOCK]: [
    { label: 'Size S', details: 'Size giày tương ứng: 35 - 37' },
    { label: 'Size M', details: 'Size giày tương ứng: 38 - 40' },
    { label: 'Size L', details: 'Size giày tương ứng: 41 - 43' },
    { label: 'Size XL', details: 'Size giày tương ứng: 44 - 46' },
  ],
  [SizeType.SWIMWEAR]: [
    { label: 'Size XS', details: 'Chiều cao: 1m50 - 1m55 | Cân nặng: 40 - 45kg' },
    { label: 'Size S', details: 'Chiều cao: 1m55 - 1m60 | Cân nặng: 45 - 50kg' },
    { label: 'Size M', details: 'Chiều cao: 1m60 - 1m65 | Cân nặng: 50 - 55kg' },
    { label: 'Size L', details: 'Chiều cao: 1m65 - 1m70 | Cân nặng: 55 - 60kg' },
    { label: 'Size XL', details: 'Chiều cao: 1m70 - 1m75 | Cân nặng: 60 - 68kg' },
  ],
  [SizeType.UNDERWEAR]: [
    { label: 'Size S', details: 'Vòng eo: 65 - 72cm | Vòng mông: 80 - 87cm' },
    { label: 'Size M', details: 'Vòng eo: 72 - 79cm | Vòng mông: 87 - 94cm' },
    { label: 'Size L', details: 'Vòng eo: 79 - 86cm | Vòng mông: 94 - 101cm' },
    { label: 'Size XL', details: 'Vòng eo: 86 - 93cm | Vòng mông: 101 - 108cm' },
    { label: 'Size XXL', details: 'Vòng eo: 93 - 100cm | Vòng mông: 108 - 115cm' },
  ],
  [SizeType.SHOE]: [
    { label: 'Size 38', details: 'Chiều dài bàn chân: 23.5 - 24.0cm' },
    { label: 'Size 39', details: 'Chiều dài bàn chân: 24.0 - 24.5cm' },
    { label: 'Size 40', details: 'Chiều dài bàn chân: 24.5 - 25.0cm' },
    { label: 'Size 41', details: 'Chiều dài bàn chân: 25.0 - 25.5cm' },
    { label: 'Size 42', details: 'Chiều dài bàn chân: 25.5 - 26.0cm' },
    { label: 'Size 43', details: 'Chiều dài bàn chân: 26.0 - 26.5cm' },
    { label: 'Size 44', details: 'Chiều dài bàn chân: 26.5 - 27.0cm' },
  ],
  [SizeType.ACCESSORY]: [
    { label: 'Freesize', details: 'Flexible accessory size' },
  ],
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Chờ xác nhận',
  [OrderStatus.CONFIRMED]: 'Đã xác nhận',
  [OrderStatus.PROCESSING]: 'Đang xử lý',
  [OrderStatus.SHIPPING]: 'Đang vận chuyển',
  [OrderStatus.DELIVERED]: 'Đã giao hàng',
  [OrderStatus.CANCELLED]: 'Đã hủy',
  [OrderStatus.REFUNDED]: 'Đã hoàn tiền',
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  [PaymentMethod.COD]: 'Thanh toán khi nhận hàng (COD)',
  [PaymentMethod.VNPAY]: 'Ví điện tử VNPay',
  [PaymentMethod.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Chưa thanh toán',
  [PaymentStatus.PAID]: 'Đã thanh toán',
  [PaymentStatus.FAILED]: 'Thanh toán thất bại',
  [PaymentStatus.REFUNDED]: 'Đã hoàn tiền',
};

export const BANK_CONFIG = {
  bankName: 'Techcombank',
  bankCode: 'TCB',
  accountNo: '3988899979',
  accountName: 'DANG HOANG HAI'
};

