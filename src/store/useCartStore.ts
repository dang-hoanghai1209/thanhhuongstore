'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // Unique ID (usually represent the variant ID)
  name: string;
  categoryName?: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  imageUrl: string;
  stock: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

// Migrate cart data from old brand to new brand key
if (typeof window !== 'undefined') {
  try {
    const oldCart = window.localStorage.getItem('thanhhuongstore-cart-storage') || window.localStorage.getItem('vivastore-cart-storage');
    if (oldCart && !window.localStorage.getItem('hhsneaker-cart-storage')) {
      window.localStorage.setItem('hhsneaker-cart-storage', oldCart);
    }
  } catch (e) {
    console.error('Failed to migrate cart storage:', e);
  }
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (newItem) => set((state) => {
        const existingItem = state.items.find(item => item.id === newItem.id);
        const addQty = newItem.quantity || 1;
        
        if (existingItem) {
          const newQty = existingItem.quantity + addQty;
          const safeQty = Math.min(newQty, existingItem.stock);
          return {
            items: state.items.map(item => 
              item.id === newItem.id 
                ? { ...item, quantity: safeQty } 
                : item
            )
          };
        }
        
        return { 
          items: [...state.items, { ...newItem, quantity: Math.min(addQty, newItem.stock) } as CartItem] 
        };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(item => 
          item.id === id 
            ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } 
            : item
        )
      })),
      clearCart: () => set({ items: [] })
    }),
    {
      name: 'hhsneaker-cart-storage', // Key for LocalStorage persistence
    }
  )
);
