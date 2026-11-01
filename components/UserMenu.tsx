'use client';

import React from 'react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';

export const UserMenu: React.FC = () => {
  const { user, loading } = useAuth();
  const { items: cart } = useCart();

  // Chưa biết trạng thái: giữ chỗ để Header không bị nháy nút "Đăng nhập"
  if (loading) return <span className="user-chip muted">…</span>;

  if (!user) {
    return (
      <Link href="/login" className="small-button primary">
        Đăng nhập
      </Link>
    );
  }

  return (
    <>
      <Link href="/cart" className="small-button">
        🛒 Giỏ hàng{cart.length ? ` (${cart.length})` : ''}
      </Link>
      <Link href="/orders" className="small-button">
        Đơn hàng
      </Link>
      <span className="user-chip" title={user.uid}>
        {user.displayName || user.email}
      </span>
      <button className="small-button" onClick={() => signOut(auth)}>
        Đăng xuất
      </button>
    </>
  );
};
