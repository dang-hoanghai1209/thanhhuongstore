'use client';

import React from 'react';
import { EmptyState } from '@/components/ui/States';
import { MapPin } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function AccountAddressesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb items={[{ label: 'Tài khoản', href: '/account' }, { label: 'Sổ địa chỉ' }]} />
      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6">Sổ Địa Chỉ</h1>
      <EmptyState
        title="Chưa thiết lập địa chỉ"
        description="Bạn chưa thiết lập địa chỉ giao nhận hàng mặc định nào trong hồ sơ của mình."
        icon={<MapPin className="w-8 h-8 text-gray-400" />}
        actionLabel="Quay lại Mua sắm"
        actionHref="/products"
      />
    </div>
  );
}
