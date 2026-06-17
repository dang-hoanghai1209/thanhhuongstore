'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Breadcrumb from '@/components/ui/Breadcrumb';
import {
  ClipboardList,
  ShoppingBag,
  Settings,
  Users,
  TrendingUp,
  LayoutDashboard,
  Tag,
  Percent,
  UserCheck,
  BarChart2,
  MessageCircle
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  {
    name: 'Tổng quan',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Đơn hàng',
    href: '/admin/orders',
    icon: ClipboardList,
  },
  {
    name: 'Sản phẩm',
    href: '/admin/products',
    icon: ShoppingBag,
  },
  {
    name: 'Danh mục',
    href: '/admin/categories',
    icon: Tag,
  },
  {
    name: 'Khách hàng',
    href: '/admin/customers',
    icon: Users,
  },
  {
    name: 'Tin nháº¯n',
    href: '/admin/chat',
    icon: MessageCircle,
  },
  {
    name: 'Tài khoản sỉ',
    href: '/admin/wholesale',
    icon: UserCheck,
  },
  {
    name: 'Mã giảm giá',
    href: '/admin/coupons',
    icon: Percent,
  },
  {
    name: 'Banners & Marketing',
    href: '/admin/banners',
    icon: TrendingUp,
  },
  {
    name: 'Báo cáo',
    href: '/admin/analytics',
    icon: BarChart2,
  },
  {
    name: 'Cấu hình hệ thống',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sticky Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 sticky top-0 h-[calc(100vh-64px)] z-10 hidden md:flex">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-primary">
              Hoàng Hải Admin
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-grow px-4 py-6 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Quay lại Cửa hàng
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Mobile menu indicator row (small screen only) */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:hidden">
          <span className="text-sm font-bold text-slate-800">Hoàng Hải Admin</span>
          <div className="flex gap-2">
            <Link href="/admin/orders" className="text-xs text-primary font-semibold px-2 py-1 bg-primary/10 rounded">
              Đơn hàng
            </Link>
            <Link href="/admin/products" className="text-xs text-slate-600 px-2 py-1 rounded">
              Sản phẩm
            </Link>
          </div>
        </header>

        {/* Page children container */}
        <main className="flex-grow p-4 md:p-8 max-w-7xl w-full mx-auto">
          {(() => {
            const items: { label: string; href?: string }[] = [{ label: 'Quản trị', href: pathname === '/admin' ? undefined : '/admin' }];
            if (pathname.startsWith('/admin/orders')) {
              items.push({ label: 'Đơn hàng' });
            } else if (pathname.startsWith('/admin/products')) {
              items.push({ label: 'Sản phẩm' });
            } else if (pathname.startsWith('/admin/customers')) {
              items.push({ label: 'Khách hàng' });
            } else if (pathname.startsWith('/admin/chat')) {
              items.push({ label: 'Tin nháº¯n' });
            } else if (pathname.startsWith('/admin/banners')) {
              items.push({ label: 'Banners' });
            } else if (pathname.startsWith('/admin/coupons')) {
              items.push({ label: 'Mã giảm giá' });
            } else if (pathname.startsWith('/admin/categories')) {
              items.push({ label: 'Danh mục' });
            } else if (pathname.startsWith('/admin/analytics')) {
              items.push({ label: 'Báo cáo thống kê' });
            } else if (pathname.startsWith('/admin/wholesale')) {
              items.push({ label: 'Tài khoản sỉ/B2B' });
            } else if (pathname.startsWith('/admin/settings')) {
              items.push({ label: 'Cấu hình hệ thống' });
            }
            return <Breadcrumb items={items} />;
          })()}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 md:p-8 min-h-[calc(100vh-140px)] mt-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
