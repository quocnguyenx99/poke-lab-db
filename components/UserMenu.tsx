'use client';

import React from 'react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';

export const UserMenu: React.FC = () => {
  const { user, loading } = useAuth();

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
      <span className="user-chip" title={user.uid}>
        {user.displayName || user.email}
      </span>
      <button className="small-button" onClick={() => signOut(auth)}>
        Đăng xuất
      </button>
    </>
  );
};
