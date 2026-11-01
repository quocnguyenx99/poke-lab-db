import type { Metadata } from 'next';
import { AuthForm } from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Đăng nhập | PSA MARKET ATLAS',
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
