'use client';

import React from 'react';
import { EmptyState } from '@/components/ui/States';
import { Heart } from 'lucide-react';

export default function AccountWishlistPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6">Danh Sách Yêu Thích</h1>
      <EmptyState
        title="Danh sách yêu thích trống"
        description="Hãy thêm các sản phẩm bạn thích vào danh sách yêu thích để tiện theo dõi giá và khuyến mãi nhé."
        icon={<Heart className="w-8 h-8 text-gray-400" />}
        actionLabel="Khám phá sản phẩm"
        actionHref="/products"
      />
    </div>
  );
}
