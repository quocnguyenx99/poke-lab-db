'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { UserMenu } from '@/components/UserMenu';

interface ShopShellProps {
  title: string;
  children: React.ReactNode;
}

// Khung chung cho /cart, /orders: bắt buộc đăng nhập
export const ShopShell: React.FC<ShopShellProps> = ({ title, children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  return (
    <div className="shop-page">
      <div className="topline">
        <Link href="/" className="auth-back">
          ← Về danh sách thẻ
        </Link>
        <div className="right">
          <UserMenu />
        </div>
      </div>
      <main className="shop-main">
        <h1>{title}</h1>
        {loading || !user ? <div className="shop-empty">Đang kiểm tra đăng nhập…</div> : children}
      </main>
    </div>
  );
};
