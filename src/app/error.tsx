'use client';

import React, { useEffect } from 'react';
import { ErrorState } from '@/components/ui/States';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ErrorState
        title="Hệ thống đang gặp sự cố"
        description="Ứng dụng gặp sự cố không mong muốn trong khi tải nội dung. Vui lòng thử tải lại hoặc quay về trang chủ."
        errorDetail={error.message || error.digest}
        onRetry={reset}
        retryLabel="Tải lại trang"
      />
    </div>
  );
}
