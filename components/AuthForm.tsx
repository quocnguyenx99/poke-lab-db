'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { useAuth } from '@/components/AuthProvider';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  // Đã đăng nhập (vừa xong, hoặc vào thẳng /login khi còn phiên cũ) thì về trang chủ
  useEffect(() => {
    if (!loading && user) router.replace('/');
  }, [loading, user, router]);

  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    setSubmitting(true);
    try {
      await action();
      // Không cần tự chuyển trang: onAuthStateChanged cập nhật user → useEffect ở trên chạy
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName.trim()) await updateProfile(cred.user, { displayName: displayName.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    });
  };

  const handleGoogle = () => run(() => signInWithPopup(auth, googleProvider));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link href="/" className="auth-back">
          ← Về trang chủ
        </Link>
        <h1>{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</h1>
        <p className="auth-sub">
          {isRegister
            ? 'Lưu thẻ yêu thích, giỏ hàng và đơn hàng trên mọi thiết bị.'
            : 'Đăng nhập để dùng yêu thích, giỏ hàng và đơn hàng.'}
        </p>

        <button type="button" className="small-button auth-google" onClick={handleGoogle} disabled={submitting}>
          <span className="auth-google-g">G</span> {isRegister ? 'Đăng ký' : 'Đăng nhập'} bằng Google
        </button>

        <div className="auth-divider">
          <span>hoặc dùng email</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <label className="auth-field">
              Tên hiển thị
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ví dụ: Quốc"
                autoComplete="name"
              />
            </label>
          )}
          <label className="auth-field">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="auth-field">
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRegister ? 'Ít nhất 6 ký tự' : ''}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={6}
              required
            />
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="small-button primary auth-submit" disabled={submitting}>
            {submitting ? 'Đang xử lý…' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? (
            <>
              Đã có tài khoản? <Link href="/login">Đăng nhập</Link>
            </>
          ) : (
            <>
              Chưa có tài khoản? <Link href="/register">Đăng ký</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};
