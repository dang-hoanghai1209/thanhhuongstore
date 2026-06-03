'use client';

import React from 'react';
import { Loader2, Inbox, AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({ message = 'Đang tải dữ liệu...', className = 'py-20' }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center space-y-3 animate-fadeIn ${className}`}>
      <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
      <span className="text-sm font-semibold text-gray-500">{message}</span>
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = 'Không tìm thấy dữ liệu',
  description = 'Hiện tại không có thông tin để hiển thị.',
  icon,
  actionLabel,
  actionHref,
  onAction,
  className = 'py-20 max-w-md mx-auto'
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-white rounded-brand-lg border border-gray-100/60 shadow-xs animate-fadeIn ${className}`}>
      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 mb-5">
        {icon || <Inbox className="w-8 h-8" />}
      </div>
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
      <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-sm">{description}</p>
      
      {actionLabel && (
        <div className="mt-6">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-brand-md transition shadow-xs select-none"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-brand-md transition shadow-xs select-none"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  errorDetail?: string;
  retryLabel?: string;
  onRetry?: () => void;
  homeLabel?: string;
  className?: string;
}

export function ErrorState({
  title = 'Đã xảy ra sự cố',
  description = 'Hệ thống đang gặp sự cố kết nối dữ liệu. Vui lòng thử lại sau.',
  errorDetail,
  retryLabel = 'Thử lại ngay',
  onRetry,
  homeLabel = 'Về trang chủ',
  className = 'py-20 max-w-md mx-auto'
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-red-50/50 rounded-brand-lg border border-red-100/80 shadow-xs animate-fadeIn ${className}`}>
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-5 animate-pulseSubtle">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-bold text-gray-800">{title}</h3>
      <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-sm">{description}</p>
      
      {errorDetail && (
        <div className="mt-3 text-[10px] font-mono text-red-600 bg-red-50 border border-red-100/50 rounded-lg p-2 max-w-xs break-all select-all">
          Lỗi: {errorDetail}
        </div>
      )}
      
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-brand-md transition shadow-xs select-none"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {retryLabel}
          </button>
        )}
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-brand-md transition select-none"
        >
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
