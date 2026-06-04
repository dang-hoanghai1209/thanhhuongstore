'use client';

import React from 'react';
import Link from 'next/link';

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({ message = 'Đang tải dữ liệu...', className = 'py-20' }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center space-y-3 animate-fadeIn ${className}`}>
      <span className="material-symbols-outlined text-[40px] text-primary animate-spin">sync</span>
      <span className="text-sm font-semibold text-on-surface-variant">{message}</span>
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode; // Can be a string name of Material Symbol, or standard React node
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
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-surface-container-lowest rounded-2xl border border-surface-variant shadow-sm animate-fadeIn ${className}`}>
      <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-primary mb-5">
        {typeof icon === 'string' ? (
          <span className="material-symbols-outlined text-[32px]">{icon}</span>
        ) : (
          icon || <span className="material-symbols-outlined text-[32px]">inbox</span>
        )}
      </div>
      <h3 className="text-base font-bold text-on-surface">{title}</h3>
      <p className="text-xs text-on-surface-variant mt-2 leading-relaxed max-w-sm">{description}</p>
      
      {actionLabel && (
        <div className="mt-6">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-xl transition shadow-lg shadow-primary/10 select-none active:scale-95 transition-transform"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-xl transition shadow-lg shadow-primary/10 select-none active:scale-95 transition-transform"
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
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-error-container/20 rounded-2xl border border-error-container/80 shadow-sm animate-fadeIn ${className}`}>
      <div className="w-16 h-16 rounded-full bg-error-container/40 flex items-center justify-center text-error mb-5">
        <span className="material-symbols-outlined text-[32px]">warning</span>
      </div>
      <h3 className="text-base font-bold text-on-surface">{title}</h3>
      <p className="text-xs text-on-surface-variant mt-2 leading-relaxed max-w-sm">{description}</p>
      
      {errorDetail && (
        <div className="mt-3 text-[10px] font-mono text-error bg-error-container/40 border border-error-container rounded-lg p-2 max-w-xs break-all select-all">
          Lỗi: {errorDetail}
        </div>
      )}
      
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold rounded-xl transition shadow-lg shadow-primary/10 select-none active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            {retryLabel}
          </button>
        )}
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface font-semibold text-xs rounded-xl transition select-none active:scale-95 transition-transform"
        >
          {homeLabel}
        </Link>
      </div>
    </div>
  );
}
