import Link from 'next/link';

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
      className="flex items-center flex-wrap gap-xs text-label-md text-on-surface-variant mb-md"
    >
      {/* Home Link */}
      <Link 
        href="/" 
        className="hover:text-primary transition-colors flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-[18px]">home</span>
        <span>Trang chủ</span>
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <div key={idx} className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant/60 select-none">
              chevron_right
            </span>
            
            {isLast || !item.href ? (
              <span className="text-on-surface font-semibold truncate max-w-[160px] sm:max-w-xs">
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href}
                className="hover:text-primary transition-colors"
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
