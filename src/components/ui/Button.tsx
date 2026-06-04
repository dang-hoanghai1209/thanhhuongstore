import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle = 'inline-flex items-center justify-center font-bold transition-all active:scale-95 duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-container text-on-primary shadow-lg shadow-primary/20 rounded-xl',
    secondary: 'border-2 border-primary text-primary bg-surface-container-lowest hover:bg-primary-fixed-dim rounded-xl',
    tertiary: 'p-2 hover:bg-surface-container rounded-full text-primary',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="material-symbols-outlined text-[16px] animate-spin mr-2">sync</span>
          <span>Đang xử lý...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
