import fs from 'fs';
import path from 'path';

export interface StoreInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  footerDescription: string;
}

export interface PaymentSettings {
  codEnabled: boolean;
  bankName: string;
  bankCode: string;
  accountNo: string;
  accountName: string;
  vnpayStatus: string;
}

export interface ShippingSettings {
  defaultFee: number;
  freeThreshold: number;
  estimatedDelivery: string;
}

export interface SupportSettings {
  hotline: string;
  supportEmail: string;
  facebookLink: string;
  zaloLink: string;
}

export interface PolicySummary {
  shipping: string;
  return: string;
  payment: string;
}

export interface SystemSettings {
  storeInfo: StoreInfo;
  paymentSettings: PaymentSettings;
  shippingSettings: ShippingSettings;
  supportSettings: SupportSettings;
  policySummary: PolicySummary;
}

const DEFAULT_SETTINGS: SystemSettings = {
  storeInfo: {
    name: "Hoàng Hải Sneaker",
    phone: "0912345678",
    email: "contact@hhsneaker.id.vn",
    address: "Số 123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh",
    businessHours: "08:00 - 22:00 (Hàng ngày)",
    footerDescription: "Hoàng Hải Sneaker chuyên sỉ tất, vớ, bao tay và phụ kiện thời trang giá tốt."
  },
  paymentSettings: {
    codEnabled: true,
    bankName: "Techcombank",
    bankCode: "TCB",
    accountNo: "3988899979",
    accountName: "DANG HOANG HAI",
    vnpayStatus: "active"
  },
  shippingSettings: {
    defaultFee: 30000,
    freeThreshold: 500000,
    estimatedDelivery: "Từ 2 - 4 ngày làm việc tùy thuộc vào địa điểm của bạn."
  },
  supportSettings: {
    hotline: "1900 1234",
    supportEmail: "support@hhsneaker.id.vn",
    facebookLink: "https://facebook.com/hhsneaker.id.vn",
    zaloLink: "https://zalo.me/0912345678"
  },
  policySummary: {
    shipping: "Giao hàng toàn quốc với phí ship đồng giá 30,000đ. Miễn phí vận chuyển cho đơn hàng từ 500,000đ trở lên.",
    return: "Hỗ trợ đổi trả trong vòng 7 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên tag, chưa qua sử dụng. Không áp dụng đổi trả đối với sản phẩm tất vớ/đồ lót vì lý do vệ sinh.",
    payment: "Hỗ trợ thanh toán khi nhận hàng (COD), thanh toán qua ví điện tử VNPay hoặc chuyển khoản ngân hàng trực tiếp."
  }
};

const getFilePath = () => {
  return path.join(process.cwd(), 'src', 'data', 'settings.json');
};

export function getSystemSettings(): SystemSettings {
  const filePath = getFilePath();
  try {
    if (!fs.existsSync(filePath)) {
      return DEFAULT_SETTINGS;
    }
    const rawData = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(rawData);
    
    // Deep merge to guarantee all keys exist
    return {
      storeInfo: { ...DEFAULT_SETTINGS.storeInfo, ...parsed.storeInfo },
      paymentSettings: { ...DEFAULT_SETTINGS.paymentSettings, ...parsed.paymentSettings },
      shippingSettings: { ...DEFAULT_SETTINGS.shippingSettings, ...parsed.shippingSettings },
      supportSettings: { ...DEFAULT_SETTINGS.supportSettings, ...parsed.supportSettings },
      policySummary: { ...DEFAULT_SETTINGS.policySummary, ...parsed.policySummary }
    };
  } catch (error) {
    console.error('Error reading settings file, returning default settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export function saveSystemSettings(settings: Partial<SystemSettings>): boolean {
  const filePath = getFilePath();
  try {
    const currentSettings = getSystemSettings();
    const updatedSettings: SystemSettings = {
      storeInfo: { ...currentSettings.storeInfo, ...settings.storeInfo },
      paymentSettings: { ...currentSettings.paymentSettings, ...settings.paymentSettings },
      shippingSettings: { ...currentSettings.shippingSettings, ...settings.shippingSettings },
      supportSettings: { ...currentSettings.supportSettings, ...settings.supportSettings },
      policySummary: { ...currentSettings.policySummary, ...settings.policySummary }
    };
    
    // Make sure folder exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(updatedSettings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving settings to file:', error);
    return false;
  }
}
