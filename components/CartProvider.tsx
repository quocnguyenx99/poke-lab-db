'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { subscribeCart } from '@/lib/shop';
import type { CartItem } from '@/types/shop';

interface CartContextValue {
  items: CartItem[];
  ids: Record<string, boolean>;
}

const CartContext = createContext<CartContextValue>({ items: [], ids: {} });

interface CartProviderProps {
  children: React.ReactNode;
}

// Lắng nghe giỏ hàng MỘT lần cho cả app (Header đếm số món, lưới thẻ hiện "Đã trong giỏ", trang /cart)
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    return subscribeCart(user.uid, setItems, (err) => console.error('Không đọc được giỏ hàng:', err));
  }, [user]);

  const ids = Object.fromEntries(items.map((it) => [it.listingId, true]));

  return <CartContext.Provider value={{ items, ids }}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => useContext(CartContext);
