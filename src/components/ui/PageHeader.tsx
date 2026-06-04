import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
}

export default function PageHeader({ title, description, badge }: PageHeaderProps) {
  return (
    <section className="bg-gradient-to-r from-primary-container to-primary text-on-primary py-12 px-6 sm:px-12 md:px-20 mb-8 rounded-2xl relative overflow-hidden shadow-md">
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full filter blur-3xl opacity-20 -mr-16 -mt-16" />
      <div className="relative max-w-7xl mx-auto space-y-2">
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/15 text-white text-[10px] font-extrabold uppercase tracking-widest">
            {badge}
          </div>
        )}
        <h1 className="text-3xl font-extrabold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-on-primary/80 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
