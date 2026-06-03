import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '@prisma/client';

// ==========================================
// 1. AUTH STORE TYPES & IMPLEMENTATION
// ==========================================

export interface AuthUser {
  id: string;
  email: string;
  phone?: string | null;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

interface AuthState {
  user: AuthUser | null;
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setAuth: (user) => set({ user }),
      clearAuth: () => set({ user: null }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: 'Thanh Hương Storestore-auth-storage',
    }
  )
);

// ==========================================
// 2. CART STORE TYPES & IMPLEMENTATION
// ==========================================

export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    size: string;
    color: string;
    colorHex: string;
    retailPrice: number | string; // Prisma Decimals might be strings in API payloads
    wholesalePrice: number | string;
    stock: number;
    product: {
      id: string;
      name: string;
      slug: string;
      wholesaleTiers: any; // [{minQty, discount}]
    };
  };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setItems: (items: CartItem[]) => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: (isWholesale?: boolean) => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  setItems: (items) => set({ items }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  totalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
  totalPrice: (isWholesale = false) => {
    return get().items.reduce((sum, item) => {
      const variant = item.variant;
      let unitPrice = Number(isWholesale ? variant.wholesalePrice : variant.retailPrice);

      // Apply wholesale tiers if user is wholesale customer and tiers exist
      if (isWholesale && variant.product.wholesaleTiers) {
        try {
          const tiers = typeof variant.product.wholesaleTiers === 'string'
            ? JSON.parse(variant.product.wholesaleTiers)
            : variant.product.wholesaleTiers;

          if (Array.isArray(tiers)) {
            const matchedTiers = tiers
              .filter((t: any) => item.quantity >= t.minQty)
              .sort((a: any, b: any) => b.discount - a.discount);
            
            const bestTier = matchedTiers[0];
            if (bestTier) {
              unitPrice = Math.round(unitPrice * (1 - bestTier.discount / 100));
            }
          }
        } catch (e) {
          console.error('Error parsing wholesale tiers:', e);
        }
      }

      return sum + unitPrice * item.quantity;
    }, 0);
  },
}));

// ==========================================
// 3. UI STORE TYPES & IMPLEMENTATION
// ==========================================

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface UIState {
  toasts: Toast[];
  searchOpen: boolean;
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  searchOpen: false,
  addToast: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }],
    }));
    // Auto remove after 4 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
}));
