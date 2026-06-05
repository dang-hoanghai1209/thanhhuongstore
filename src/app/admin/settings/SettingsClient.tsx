'use client';

import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Info,
  Store,
  CreditCard,
  Truck,
  HeartHandshake,
  FileText,
  Save
} from 'lucide-react';
import { SystemSettings } from '@/lib/settings';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

export default function SettingsClient() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<'store' | 'payment' | 'shipping' | 'support' | 'policy'>('store');

  // Form states mapping SystemSettings
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeHours, setStoreHours] = useState('');
  const [storeFooterDesc, setStoreFooterDesc] = useState('');

  const [codEnabled, setCodEnabled] = useState(true);
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [vnpayStatus, setVnpayStatus] = useState('active');

  const [shipFee, setShipFee] = useState(30000);
  const [shipFreeThreshold, setShipFreeThreshold] = useState(500000);
  const [shipEstimatedDelivery, setShipEstimatedDelivery] = useState('');

  const [supportHotline, setSupportHotline] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportFB, setSupportFB] = useState('');
  const [supportZalo, setSupportZalo] = useState('');

  const [policyShipping, setPolicyShipping] = useState('');
  const [policyReturn, setPolicyReturn] = useState('');
  const [policyPayment, setPolicyPayment] = useState('');

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/settings');
      if (!res.ok) {
        throw new Error(`Mã lỗi HTTP: ${res.status}`);
      }
      const data = await res.json();
      if (data.success && data.settings) {
        const s: SystemSettings = data.settings;
        setSettings(s);
        
        // Populate form states
        setStoreName(s.storeInfo.name);
        setStorePhone(s.storeInfo.phone);
        setStoreEmail(s.storeInfo.email);
        setStoreAddress(s.storeInfo.address);
        setStoreHours(s.storeInfo.businessHours);
        setStoreFooterDesc(s.storeInfo.footerDescription);

        setCodEnabled(s.paymentSettings.codEnabled);
        setBankName(s.paymentSettings.bankName);
        setBankCode(s.paymentSettings.bankCode);
        setBankAccountNo(s.paymentSettings.accountNo);
        setBankAccountName(s.paymentSettings.accountName);
        setVnpayStatus(s.paymentSettings.vnpayStatus);

        setShipFee(s.shippingSettings.defaultFee);
        setShipFreeThreshold(s.shippingSettings.freeThreshold);
        setShipEstimatedDelivery(s.shippingSettings.estimatedDelivery);

        setSupportHotline(s.supportSettings.hotline);
        setSupportEmail(s.supportSettings.supportEmail);
        setSupportFB(s.supportSettings.facebookLink);
        setSupportZalo(s.supportSettings.zaloLink);

        setPolicyShipping(s.policySummary.shipping);
        setPolicyReturn(s.policySummary.return);
        setPolicyPayment(s.policySummary.payment);
      } else {
        throw new Error(data.error || 'Không thể lấy cấu hình');
      }
    } catch (err: any) {
      console.error('Fetch settings error:', err);
      setError(err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ.');
      showToast('Lỗi khi tải cấu hình hệ thống', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: SystemSettings = {
        storeInfo: {
          name: storeName,
          phone: storePhone,
          email: storeEmail,
          address: storeAddress,
          businessHours: storeHours,
          footerDescription: storeFooterDesc,
        },
        paymentSettings: {
          codEnabled,
          bankName,
          bankCode,
          accountNo: bankAccountNo,
          accountName: bankAccountName,
          vnpayStatus,
        },
        shippingSettings: {
          defaultFee: Number(shipFee),
          freeThreshold: Number(shipFreeThreshold),
          estimatedDelivery: shipEstimatedDelivery,
        },
        supportSettings: {
          hotline: supportHotline,
          supportEmail: supportEmail,
          facebookLink: supportFB,
          zaloLink: supportZalo,
        },
        policySummary: {
          shipping: policyShipping,
          return: policyReturn,
          payment: policyPayment,
        },
      };

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Cập nhật cấu hình thất bại');
      }

      showToast('Cập nhật cấu hình hệ thống thành công!', 'success');
      setSettings(data.settings);
    } catch (err: any) {
      console.error('Save settings error:', err);
      showToast(err.message || 'Lỗi mạng khi cập nhật cấu hình', 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatVND = (value: number) => {
    return value.toLocaleString('vi-VN') + ' đ';
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-4 rounded-xl border shadow-lg flex items-center gap-3 transition-all duration-300 pointer-events-auto bg-white ${
              t.type === 'success' ? 'border-green-200 text-green-800' : 'border-red-200 text-red-800'
            }`}
          >
            {t.type === 'success' ? (
              <Check className="w-5 h-5 text-green-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            )}
            <p className="text-sm font-semibold flex-grow">{t.message}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="text-slate-400 hover:text-slate-600 focus:outline-none transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cấu Hình Hệ Thống</h1>
          <p className="text-sm text-slate-500 mt-1">
            Chỉnh sửa thông tin cửa hàng, biểu phí vận chuyển, thanh toán đại lý sỉ & lẻ.
          </p>
        </div>
        
        <button
          onClick={fetchSettings}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Tải lại
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 animate-pulse">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-medium text-slate-500">Đang tải cấu hình hệ thống...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 bg-red-50/50 border border-red-200 rounded-2xl text-center p-6 space-y-4">
          <AlertTriangle className="w-10 h-10 text-red-500 animate-bounce" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800">Không thể tải cấu hình</h3>
            <p className="text-sm text-slate-600">Đã xảy ra lỗi: {error}</p>
          </div>
          <button
            onClick={fetchSettings}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
          >
            Thử lại
          </button>
        </div>
      ) : settings ? (
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Tabs selector left side */}
          <div className="md:col-span-1 space-y-2">
            {[
              { id: 'store', name: 'Thông tin shop', icon: Store },
              { id: 'payment', name: 'Thanh toán', icon: CreditCard },
              { id: 'shipping', name: 'Vận chuyển', icon: Truck },
              { id: 'support', name: 'Hỗ trợ & Hotline', icon: HeartHandshake },
              { id: 'policy', name: 'Chính sách tóm tắt', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-left transition select-none ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {tab.name}
                </button>
              );
            })}

            <div className="pt-4 border-t border-slate-150">
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-container text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu cấu hình
              </button>
            </div>
          </div>

          {/* Form details right side */}
          <div className="md:col-span-3 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
            
            {/* 1. STORE TAB */}
            {activeTab === 'store' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Thông Tin Cửa Hàng</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Cấu hình tên thương hiệu, địa chỉ, giờ làm việc hiển thị trên footer.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tên cửa hàng *</label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Số điện thoại liên hệ</label>
                    <input
                      type="text"
                      value={storePhone}
                      onChange={(e) => setStorePhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email cửa hàng</label>
                    <input
                      type="email"
                      value={storeEmail}
                      onChange={(e) => setStoreEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Địa chỉ trụ sở</label>
                    <input
                      type="text"
                      value={storeAddress}
                      onChange={(e) => setStoreAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Giờ mở cửa hoạt động</label>
                    <input
                      type="text"
                      value={storeHours}
                      onChange={(e) => setStoreHours(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mô tả tóm tắt chân trang (Footer)</label>
                    <textarea
                      rows={3}
                      value={storeFooterDesc}
                      onChange={(e) => setStoreFooterDesc(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. PAYMENT TAB */}
            {activeTab === 'payment' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Cấu Hình Thanh Toán</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Thiết lập các cổng nhận tiền từ khách hàng lẻ & sỉ.</p>
                </div>

                <div className="space-y-6">
                  {/* COD config */}
                  <div className="flex items-center gap-3 p-4 border border-slate-100 bg-slate-50/50 rounded-2xl">
                    <input
                      type="checkbox"
                      id="cod"
                      checked={codEnabled}
                      onChange={(e) => setCodEnabled(e.target.checked)}
                      className="w-5 h-5 text-primary focus:ring-primary rounded cursor-pointer"
                    />
                    <div>
                      <label htmlFor="cod" className="text-sm font-bold text-slate-800 cursor-pointer">
                        Nhận hàng thanh toán (COD)
                      </label>
                      <p className="text-[11px] text-slate-400 mt-0.5">Khách hàng được phép chọn COD khi đặt mua.</p>
                    </div>
                  </div>

                  {/* Bank info config */}
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4">
                    <h4 className="text-sm font-bold text-slate-700">Tài Khoản Ngân Hàng (Chuyển khoản)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tên ngân hàng</label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mã viết tắt ngân hàng (Ví dụ: TCB, VCB)</label>
                        <input
                          type="text"
                          value={bankCode}
                          onChange={(e) => setBankCode(e.target.value)}
                          className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Số tài khoản</label>
                        <input
                          type="text"
                          value={bankAccountNo}
                          onChange={(e) => setBankAccountNo(e.target.value)}
                          className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tên người thụ hưởng</label>
                        <input
                          type="text"
                          value={bankAccountName}
                          onChange={(e) => setBankAccountName(e.target.value)}
                          className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition font-bold uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* VNPay status */}
                  <div className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl bg-slate-50">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cổng thanh toán VNPay</span>
                      <p className="text-sm font-semibold text-slate-800">Trạng thái: Hoạt động</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                      ✓ Đã kết nối (Sandbox/Production)
                    </span>
                  </div>

                  <div className="bg-amber-50 border border-amber-250 p-4 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 leading-relaxed">
                    <Info className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                    <p>
                      <strong>Lưu ý bảo mật:</strong> Hệ thống không hiển thị các mã khóa bí mật (Secret Hash Key, Merchant ID) tại giao diện quản trị này để tránh nguy cơ rò rỉ. Các mã khóa vẫn được bảo mật trong tệp biến môi trường `.env`.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SHIPPING TAB */}
            {activeTab === 'shipping' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Phí Vận Chuyển & Giao Nhận</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Quản lý biểu phí giao hàng toàn quốc và hạn mức miễn phí vận chuyển.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phí giao hàng mặc định (VNĐ)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={shipFee}
                      onChange={(e) => setShipFee(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hạn mức miễn phí vận chuyển (VNĐ)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={shipFreeThreshold}
                      onChange={(e) => setShipFreeThreshold(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Thời gian giao hàng dự kiến (Text)</label>
                    <input
                      type="text"
                      required
                      value={shipEstimatedDelivery}
                      onChange={(e) => setShipEstimatedDelivery(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. SUPPORT TAB */}
            {activeTab === 'support' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Cấu Hình Hỗ Trợ & Mạng Xã Hội</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Cấu hình hotline, đường dẫn hỗ trợ nhanh bên ngoài shop.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Đường dây nóng (Hotline)</label>
                    <input
                      type="text"
                      value={supportHotline}
                      onChange={(e) => setSupportHotline(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email hỗ trợ chăm sóc KH</label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Đường dẫn trang Facebook Fanpage</label>
                    <input
                      type="url"
                      value={supportFB}
                      onChange={(e) => setSupportFB(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Đường dẫn chat Zalo OA hoặc SĐT Zalo</label>
                    <input
                      type="text"
                      value={supportZalo}
                      onChange={(e) => setSupportZalo(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. POLICY TAB */}
            {activeTab === 'policy' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Bản Tóm Tắt Chính Sách Shop</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Cấu hình đoạn văn bản tóm tắt xuất hiện trong các khu vực thanh toán/lookup.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tóm tắt Chính sách Giao hàng</label>
                    <textarea
                      rows={3}
                      value={policyShipping}
                      onChange={(e) => setPolicyShipping(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tóm tắt Chính sách Đổi trả</label>
                    <textarea
                      rows={3}
                      value={policyReturn}
                      onChange={(e) => setPolicyReturn(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition resize-none leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tóm tắt Quy trình Thanh toán</label>
                    <textarea
                      rows={3}
                      value={policyPayment}
                      onChange={(e) => setPolicyPayment(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition resize-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </form>
      ) : null}
    </div>
  );
}
