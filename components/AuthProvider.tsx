'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ensureUserProfile } from '@/lib/user-data';

interface AuthContextValue {
  user: User | null;
  // true trong lúc Firebase đọc lại phiên đăng nhập cũ khi trang vừa tải
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi lần đầu ngay khi Firebase biết trạng thái, sau đó gọi lại mỗi lần đăng nhập/đăng xuất
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
      if (firebaseUser) {
        // Không chặn giao diện chờ Firestore; lỗi (thường do Rules) chỉ ghi ra console
        ensureUserProfile(firebaseUser).catch((err) => console.error('Không tạo được users/{uid}:', err));
      }
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => useContext(AuthContext);
