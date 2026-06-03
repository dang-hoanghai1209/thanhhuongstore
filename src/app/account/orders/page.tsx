'use client';

import React from 'react';
import { EmptyState } from '@/components/ui/States';
import { ShoppingBag } from 'lucide-react';

export default function AccountOrdersPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6">Đơn Hàng Của Bạn</h1>
      <EmptyState
        title="Chưa có đơn hàng nào"
        description="Bạn chưa thực hiện bất kỳ giao dịch mua sắm nào tại Thanh Hương Store."
        icon={<ShoppingBag className="w-8 h-8 text-gray-400" />}
        actionLabel="Bắt đầu mua sắm"
        actionHref="/products"
      />
    </div>
  );
}
