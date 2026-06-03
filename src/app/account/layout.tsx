'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store';
import { LoadingSpinner } from '@/components/ui/States';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const cachedUser = useAuthStore.getState().user;
    if (!cachedUser) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    const verifySession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          clearAuth();
          router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        } else {
          const data = await res.json();
          useAuthStore.setState({ user: data.user });
          setLoading(false);
        }
      } catch (err) {
        console.error('Session verify failed:', err);
        clearAuth();
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      }
    };

    verifySession();
  }, [pathname, router, clearAuth]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner message="Đang kiểm tra bảo mật phiên đăng nhập..." />
      </div>
    );
  }

  return <>{children}</>;
}
