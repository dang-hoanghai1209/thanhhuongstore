import crypto from 'crypto';

interface VNPayConfig {
  tmnCode: string;
  hashSecret: string;
  paymentUrl: string;
  returnUrl: string;
}

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
  [key: string]: string | number;
}

function getRequiredEnv(name: 'VNPAY_TMN_CODE' | 'VNPAY_HASH_SECRET' | 'VNPAY_URL' | 'VNPAY_RETURN_URL') {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} environment variable is required.`);
  }

  return value;
}

export function isVNPayConfigured() {
  return Boolean(
    process.env.VNPAY_TMN_CODE?.trim() &&
      process.env.VNPAY_HASH_SECRET?.trim() &&
      process.env.VNPAY_URL?.trim() &&
      process.env.VNPAY_RETURN_URL?.trim(),
  );
}

function getVNPayConfig(): VNPayConfig {
  return {
    tmnCode: getRequiredEnv('VNPAY_TMN_CODE'),
    hashSecret: getRequiredEnv('VNPAY_HASH_SECRET'),
    paymentUrl: getRequiredEnv('VNPAY_URL'),
    returnUrl: getRequiredEnv('VNPAY_RETURN_URL'),
  };
}

function encodeValue(value: string | number) {
  return encodeURIComponent(String(value)).replace(/%20/g, '+');
}

function buildSignedData(params: Record<string, string | number>) {
  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${encodeValue(params[key])}`)
    .join('&');
}

function calculateHash(signData: string, secret: string) {
  return crypto.createHmac('sha512', secret).update(signData, 'utf8').digest('hex');
}

function formatVNPayDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('');
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
  const config = getVNPayConfig();

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('VNPay amount must be a positive number.');
  }

  const params: VNPayParams = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: config.tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(amount * 100),
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: ipAddr || '127.0.0.1',
    vnp_CreateDate: formatVNPayDate(new Date()),
  };
  const signData = buildSignedData(params);
  const secureHash = calculateHash(signData, config.hashSecret);

  return `${config.paymentUrl}?${signData}&vnp_SecureHash=${secureHash}`;
}

export function verifyVNPayReturn(queryParams: Record<string, string>): {
  isValid: boolean;
  orderId: string;
  amountMinorUnits: number;
  responseCode: string;
  transactionStatus: string;
} {
  const config = getVNPayConfig();
  const secureHash = queryParams.vnp_SecureHash?.toLowerCase() ?? '';
  const unsignedParams: Record<string, string> = { ...queryParams };

  delete unsignedParams.vnp_SecureHash;
  delete unsignedParams.vnp_SecureHashType;

  const calculatedHash = calculateHash(buildSignedData(unsignedParams), config.hashSecret);
  const suppliedHashBuffer = Buffer.from(secureHash, 'hex');
  const calculatedHashBuffer = Buffer.from(calculatedHash, 'hex');
  const isValid =
    /^[a-f0-9]{128}$/.test(secureHash) &&
    suppliedHashBuffer.length === calculatedHashBuffer.length &&
    crypto.timingSafeEqual(suppliedHashBuffer, calculatedHashBuffer);
  const amountMinorUnits = Number.parseInt(queryParams.vnp_Amount ?? '', 10);

  return {
    isValid,
    orderId: queryParams.vnp_TxnRef ?? '',
    amountMinorUnits: Number.isSafeInteger(amountMinorUnits) ? amountMinorUnits : 0,
    responseCode: queryParams.vnp_ResponseCode ?? '',
    transactionStatus: queryParams.vnp_TransactionStatus ?? '',
  };
}
