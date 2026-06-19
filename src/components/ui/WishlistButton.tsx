'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface WishlistButtonProps {
  productSlug: string;
  productId?: string;
  className?: string;
}

export default function WishlistButton({ productSlug, productId, className = '' }: WishlistButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkWishlistState = () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('hhsneaker_wishlist');
    if (stored) {
      try {
        const list = JSON.parse(stored) as string[];
        const isStoredBySlug = list.includes(productSlug);
        const isStoredByLegacyId = productId ? list.includes(productId) : false;
        
        setIsWishlisted(isStoredBySlug || isStoredByLegacyId);

        // Perform lazy migration from legacy ID to slug if detected
        if (isStoredByLegacyId && productId) {
          const migratedList = Array.from(
            new Set([...list.filter((item) => item !== productId), productSlug]),
          );
          localStorage.setItem('hhsneaker_wishlist', JSON.stringify(migratedList));
          window.dispatchEvent(new Event('storage'));
        }
      } catch (e) {
        console.error('Failed to parse wishlist in WishlistButton:', e);
      }
    } else {
      setIsWishlisted(false);
    }
  };

  // Initial check on mount
  useEffect(() => {
    if (mounted) {
      checkWishlistState();
    }
  }, [mounted, productSlug, productId]);

  // Synchronize state changes across components via the storage event
  useEffect(() => {
    if (!mounted) return;

    const handleStorageChange = () => {
      checkWishlistState();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [mounted, productSlug, productId]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('hhsneaker_wishlist');
    let list: string[] = [];
    if (stored) {
      try {
        list = JSON.parse(stored) as string[];
      } catch (e) {
        console.error('Failed to parse wishlist storage during toggle:', e);
      }
    }

    // Check if it's already wishlisted by slug or legacy ID
    const indexBySlug = list.indexOf(productSlug);
    const indexById = productId ? list.indexOf(productId) : -1;

    if (indexBySlug > -1 || indexById > -1) {
      // Remove from wishlist (filter out both slug and legacy ID)
      list = list.filter((item) => item !== productSlug && item !== productId);
      setIsWishlisted(false);
    } else {
      // Add to wishlist (always use slug now)
      list.push(productSlug);
      setIsWishlisted(true);
    }

    localStorage.setItem('hhsneaker_wishlist', JSON.stringify(list));
    // Trigger custom storage event for communication between client-side components
    window.dispatchEvent(new Event('storage'));
  };

  if (!mounted) {
    return (
      <div 
        className={`p-2 rounded-full bg-white/80 text-gray-300 border border-gray-100 flex items-center justify-center ${className}`}
        aria-hidden="true"
      >
        <Heart className="w-4 h-4 text-gray-300" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      className={`p-2 rounded-full bg-white/80 hover:bg-white border border-gray-100 text-gray-500 hover:text-red-500 shadow-sm transition-all duration-200 flex items-center justify-center ${className}`}
      title={isWishlisted ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
    >
      <Heart 
        className={`w-4 h-4 transition-colors ${
          isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'
        }`} 
      />
    </button>
  );
}
