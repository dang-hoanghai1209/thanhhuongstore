import crypto from 'crypto';

interface VNPayParams {
  vnp_Version: string;
  vnp_Command: string;
  vnp_TmnCode: string;
  vnp_Amount: number;
  vnp_CreateDate: string;
  vnp_CurrCode: string;
  vnp_IpAddr: string;
  vnp_Locale: string;
  vnp_OrderInfo: string;
  vnp_OrderType: string;
  vnp_ReturnUrl: string;
  vnp_TxnRef: string;
  [key: string]: any;
}

function sortObject(obj: Record<string, any>) {
  const sorted: Record<string, any> = {};
  const keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
  }
  return sorted;
}

export function createVNPayUrl({
  ipAddr,
  orderId,
  amount,
  orderInfo,
}: {
  ipAddr: string;
  orderId: string;
  amount: number;
  orderInfo: string;
}): string {
  const tmnCode = process.env.VNPAY_TMN_CODE || '';
  const secretKey = process.env.VNPAY_HASH_SECRET || '';
  let vnpUrl = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const returnUrl = process.env.VNPAY_RETURN_URL || 'http://localhost:3000/api/payment/vnpay/webhook';

  const date = new Date();
  const createDate = date.toISOString().replace(/T/, ' ').replace(/\..+/, '').replace(/-|:|\s/g, '');

  let vnpParams: Partial<VNPayParams> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: amount * 100, // VNPay expects amount in cents
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr || '127.0.0.1',
    vnp_CreateDate: createDate,
  };

  vnpParams = sortObject(vnpParams);

  const signData = Object.entries(vnpParams)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');

  const hmac = crypto.createHmac('sha512', secretKey);
  const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  vnpParams['vnp_SecureHash'] = secureHash;

  const queryParams = Object.entries(vnpParams)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');

  return `${vnpUrl}?${queryParams}`;
}

export function verifyVNPayReturn(queryParams: Record<string, string>): {
  isValid: boolean;
  orderId: string;
  amount: number;
  responseCode: string;
} {
  const secureHash = queryParams['vnp_SecureHash'];
  const secretKey = process.env.VNPAY_HASH_SECRET || '';

  // Copy query params and delete hash keys to rebuild sign data
  const vnpParams = { ...queryParams };
  delete vnpParams['vnp_SecureHash'];
  delete vnpParams['vnp_SecureHashType'];

  const sortedParams = sortObject(vnpParams);

  const signData = Object.entries(sortedParams)
    .map(([key, val]) => `${key}=${val}`)
    .join('&');

  const hmac = crypto.createHmac('sha512', secretKey);
  const calculatedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const isValid = secureHash === calculatedHash;
  const orderId = queryParams['vnp_TxnRef'] || '';
  const amount = parseInt(queryParams['vnp_Amount'] || '0', 10) / 100;
  const responseCode = queryParams['vnp_ResponseCode'] || '';

  return {
    isValid,
    orderId,
    amount,
    responseCode,
  };
}
