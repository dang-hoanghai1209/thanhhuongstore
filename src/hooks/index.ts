import { useState, useEffect, useCallback } from 'react';
import { useCartStore, useAuthStore, useUIStore } from '@/store';

// ==========================================
// 1. useDebounce
// ==========================================
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ==========================================
// 2. useLocalStorage
// ==========================================
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage key:', key, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error setting localStorage key:', key, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// ==========================================
// 3. useCart
// ==========================================
export function useCart() {
  const { items, setItems, openCart } = useCartStore();
  const { user, accessToken } = useAuthStore();
  const { addToast } = useUIStore();
  const [loading, setLoading] = useState(false);

  const isWholesale = user?.role === 'WHOLESALE';

  // 1. Fetch Cart Items from Server
  const fetchCart = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken, setItems]);

  // 2. Add Item to Cart
  const addItem = useCallback(async (variantId: string, quantity: number = 1) => {
    if (!accessToken) {
      addToast('warning', 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ variantId, quantity }),
      });
      
      const data = await res.json();

      if (res.ok) {
        setItems(data.items || []);
        addToast('success', 'Đã thêm sản phẩm vào giỏ hàng');
        openCart();
      } else {
        addToast('error', data.error || 'Không thể thêm vào giỏ hàng');
      }
    } catch (error) {
      addToast('error', 'Đã xảy ra lỗi, vui lòng thử lại');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [accessToken, addToast, setItems, openCart]);

  // 3. Update Cart Item Quantity
  const updateQuantity = useCallback(async (variantId: string, quantity: number) => {
    if (!accessToken) return;
    if (quantity <= 0) {
      // Remove item if quantity is set to 0 or less
      removeItem(variantId);
      return;
    }
    
    // Optimistic update
    const previousItems = [...items];
    const updatedItems = items.map((item) =>
      item.variantId === variantId ? { ...item, quantity } : item
    );
    setItems(updatedItems);

    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ variantId, quantity }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Rollback on error
        setItems(previousItems);
        addToast('error', data.error || 'Không thể cập nhật số lượng');
      } else {
        setItems(data.items || []);
      }
    } catch (error) {
      setItems(previousItems);
      addToast('error', 'Lỗi kết nối khi cập nhật số lượng');
      console.error(error);
    }
  }, [accessToken, items, setItems, addToast]);

  // 4. Remove Item from Cart
  const removeItem = useCallback(async (variantId: string) => {
    if (!accessToken) return;

    // Optimistic update
    const previousItems = [...items];
    setItems(items.filter((item) => item.variantId !== variantId));

    try {
      const res = await fetch(`/api/cart?variantId=${variantId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        // Rollback
        setItems(previousItems);
        addToast('error', data.error || 'Không thể xóa sản phẩm khỏi giỏ hàng');
      } else {
        setItems(data.items || []);
        addToast('info', 'Đã xóa sản phẩm khỏi giỏ hàng');
      }
    } catch (error) {
      setItems(previousItems);
      addToast('error', 'Lỗi kết nối khi xóa sản phẩm');
      console.error(error);
    }
  }, [accessToken, items, setItems, addToast]);

  // 5. Clear all items
  const clearCart = useCallback(async () => {
    if (!accessToken) return;
    
    const previousItems = [...items];
    setItems([]);

    try {
      const res = await fetch('/api/cart?all=1', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setItems(previousItems);
        addToast('error', data.error || 'Không thể làm sạch giỏ hàng');
      } else {
        setItems([]);
      }
    } catch (error) {
      setItems(previousItems);
      console.error(error);
    }
  }, [accessToken, items, setItems, addToast]);

  return {
    items,
    loading,
    isWholesale,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
