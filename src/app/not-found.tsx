'use client';

import React from 'react';
import { EmptyState } from '@/components/ui/States';
import { AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <EmptyState
        title="Không tìm thấy trang (404)"
        description="Đường dẫn bạn đang truy cập không tồn tại hoặc đã bị thay đổi trong hệ thống Hoàng Hải Sneaker."
        icon={<AlertCircle className="w-8 h-8 text-amber-500" />}
        actionLabel="Quay lại Mua sắm"
        actionHref="/products"
      />
    </div>
  );
}
