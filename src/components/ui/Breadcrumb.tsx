import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb"
      className="flex items-center flex-wrap gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-6 bg-white py-3 px-4 rounded-brand-md border border-gray-100/60 shadow-xs max-w-max"
    >
      {/* Home link always visible at the start */}
      <Link 
        href="/" 
        className="flex items-center gap-1 hover:text-brand-600 transition duration-200"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Trang chủ</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <div key={idx} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            
            {isLast || !item.href ? (
              <span className="text-gray-800 font-extrabold truncate max-w-[160px] sm:max-w-xs">
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href}
                className="hover:text-brand-600 transition duration-200"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
