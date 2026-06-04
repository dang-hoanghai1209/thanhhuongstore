import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusLower = status.toLowerCase();

  const config: Record<string, { bg: string; label: string }> = {
    pending: { bg: 'bg-yellow-50 border-yellow-200 text-yellow-800', label: 'Chờ xử lý' },
    confirmed: { bg: 'bg-blue-50 border-blue-200 text-blue-800', label: 'Đã xác nhận' },
    processing: { bg: 'bg-indigo-50 border-indigo-200 text-indigo-800', label: 'Đang đóng gói' },
    shipping: { bg: 'bg-purple-50 border-purple-200 text-purple-800', label: 'Đang vận chuyển' },
    delivered: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', label: 'Đã giao' },
    cancelled: { bg: 'bg-red-50 border-red-200 text-red-800', label: 'Đã hủy' },
    refunded: { bg: 'bg-gray-50 border-gray-200 text-gray-800', label: 'Đã hoàn tiền' },
    paid: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', label: 'Đã thanh toán' },
    failed: { bg: 'bg-red-50 border-red-200 text-red-800', label: 'Thất bại' }
  };

  const current = config[statusLower] || { bg: 'bg-gray-50 border-gray-200 text-gray-800', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${current.bg}`}>
      {current.label}
    </span>
  );
}
