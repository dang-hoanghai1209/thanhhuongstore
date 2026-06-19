'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Flame, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideData {
  id: number;
  type: 'purple' | 'image' | 'banner-only';
  imageUrl?: string;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  ctaUrl: string;
  ctaText: string;
}

const slides: SlideData[] = [
  {
    id: 1,
    type: 'purple',
    label: 'Sản Phẩm Chất Lượng',
    title: 'Hoàng Hải Sneaker',
    subtitle: 'Bộ sưu tập tất, vớ, bao tay chất lượng',
    description: 'Hoàng Hải Sneaker giới thiệu bộ sưu tập tất, vớ thời trang nam nữ, bao tay bảo hộ lao động dệt sợi tự nhiên và các phụ kiện thời trang.',
    ctaUrl: '/products',
    ctaText: 'Xem sản phẩm',
  },
  {
    id: 2,
    type: 'image',
    imageUrl: '/uploads/products/carousel-tatnam.jpg',
    label: 'Sản Phẩm Chọn Lọc',
    title: 'Tất Nam Dệt Sợi',
    subtitle: 'Thoáng mát, co giãn, êm chân',
    description: 'Các dòng tất vớ nam dệt sợi tự nhiên chất lượng, thoáng khí, nâng niu bàn chân của bạn suốt ngày dài.',
    ctaUrl: '/products?category=tat-nam',
    ctaText: 'Xem bộ sưu tập',
  },
  {
    id: 3,
    type: 'image',
    imageUrl: '/uploads/products/sneaker-banner-carousel.jpg',
    label: 'Mẫu Mã Đa Dạng',
    title: 'Hoàng Hải Sneaker',
    subtitle: 'Phù hợp sử dụng hằng ngày',
    description: 'Chuyên cung cấp các loại tất vớ thời trang và bao tay lao động dệt sợi tự nhiên chất lượng cao.',
    ctaUrl: '/products',
    ctaText: 'Khám phá ngay',
  },
  {
    id: 4,
    type: 'banner-only',
    imageUrl: '/uploads/products/cap-nhat-carousel.jpg',
    label: '',
    title: 'Sắp ra mắt sneaker mới',
    subtitle: '',
    description: '',
    ctaUrl: '/products',
    ctaText: 'Xem sản phẩm hiện có',
  },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isPaused) {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [isPaused, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section 
      className="relative overflow-hidden w-full h-[450px] sm:h-[500px] lg:h-[580px] border-b border-gray-150"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides wrapper */}
      <div className="relative w-full h-full">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {slide.type === 'purple' ? (
                /* Slide 1 - Original Purple Gradient Theme */
                <div className="relative w-full h-full bg-gradient-to-r from-brand-950 via-brand-900 to-brand-850 text-white flex items-center px-6 sm:px-12 md:px-20 py-12">
                  {/* Glowing Ambient Backdrops */}
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-500 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20" />
                  <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent-pink rounded-full filter blur-3xl opacity-15 -ml-20 -mb-20" />

                  <div className="relative max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
                    {/* Content */}
                    <div className="flex-1 space-y-5 sm:space-y-6 text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-200 text-xs font-black uppercase tracking-widest mx-auto lg:mx-0">
                        <Flame className="w-3.5 h-3.5 text-accent-pink animate-pulse" />
                        {slide.label}
                      </div>

                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white uppercase">
                        {slide.title} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold via-accent-pink to-brand-300 text-xl sm:text-2xl md:text-3xl lg:text-4xl block mt-2">
                          {slide.subtitle}
                        </span>
                      </h1>

                      <p className="text-xs sm:text-sm text-brand-100 max-w-xl font-medium leading-relaxed mx-auto lg:mx-0">
                        {slide.description}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                        <Link
                          href={slide.ctaUrl}
                          className="px-6 py-3 sm:px-8 sm:py-4 rounded-brand-md bg-white text-gray-950 hover:bg-gray-100 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                          {slide.ctaText}
                          <ArrowRight className="w-4 h-4 text-brand-600" />
                        </Link>
                        <Link
                          href="/contact"
                          className="px-6 py-3 sm:px-8 sm:py-4 rounded-brand-md bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs uppercase tracking-wider transition-all border border-white/20 backdrop-blur-xs flex items-center justify-center"
                        >
                          Liên hệ tư vấn
                        </Link>
                      </div>
                    </div>

                    {/* Quick Marketing Grid */}
                    <div className="grid grid-cols-2 gap-4 w-full lg:w-auto min-w-[280px] sm:min-w-[400px]">
                      {[
                        { title: "Thiết Kế Đẹp", desc: "Mẫu mã thời trang đa dạng" },
                        { title: "Sản phẩm chọn lọc", desc: "Tất vớ, bao tay chất lượng" }
                      ].map((box, boxIdx) => (
                        <div key={boxIdx} className="p-4 sm:p-6 rounded-brand-lg bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300">
                          <span className="w-5 h-5 rounded bg-brand-500/20 text-brand-300 flex items-center justify-center text-[10px] font-black mb-2 sm:mb-3">
                            0{boxIdx+1}
                          </span>
                          <h4 className="text-[10px] sm:text-xs font-black text-white uppercase tracking-wider">{box.title}</h4>
                          <p className="text-[9px] sm:text-[10px] text-brand-200 mt-1">{box.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : slide.type === 'banner-only' ? (
                /* Slide 4 - Banner Only Slide (Text is already in the image) */
                <div className="relative w-full h-full bg-[#FAF9F6]">
                  {/* Background Image */}
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                  
                  {/* Render CTA button if defined */}
                  {slide.ctaText && (
                    <div className="absolute bottom-10 left-6 sm:left-12 md:left-20 z-20">
                      <Link
                        href={slide.ctaUrl}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-brand-md bg-brand-950 hover:bg-brand-900 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
                      >
                        {slide.ctaText}
                        <ArrowRight className="w-4 h-4 text-accent-gold" />
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                /* Slide 2 & 3 - Image Slides */
                <div className="relative w-full h-full">
                  {/* Background Image */}
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20 lg:from-black/75 lg:via-black/45 lg:to-transparent" />

                  {/* Image Slide Content */}
                  <div className="relative max-w-7xl mx-auto w-full h-full flex items-center px-6 sm:px-12 md:px-20 z-20">
                    <div className="max-w-xl space-y-4 sm:space-y-6 text-center lg:text-left text-white">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-accent-gold text-xs font-black uppercase tracking-widest mx-auto lg:mx-0">
                        {slide.label}
                      </div>

                      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none uppercase">
                        {slide.title} <br />
                        <span className="text-accent-gold text-xl sm:text-2xl md:text-3xl lg:text-4xl block mt-2 font-black">
                          {slide.subtitle}
                        </span>
                      </h2>

                      <p className="text-xs sm:text-sm text-gray-200 max-w-lg font-medium leading-relaxed mx-auto lg:mx-0">
                        {slide.description}
                      </p>

                      <div className="pt-2">
                        <Link
                          href={slide.ctaUrl}
                          className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-brand-md bg-white text-gray-950 hover:bg-gray-100 font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                          {slide.ctaText}
                          <ArrowRight className="w-4 h-4 text-brand-600" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Slide Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/10 transition backdrop-blur-xs flex items-center justify-center"
        aria-label="Slide trước"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/10 transition backdrop-blur-xs flex items-center justify-center"
        aria-label="Slide tiếp theo"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`h-2 transition-all duration-300 rounded-full ${
              idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Đi tới slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
