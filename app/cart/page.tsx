import type { Metadata } from 'next';
import { CartView } from '@/components/CartView';

export const metadata: Metadata = {
  title: 'Giỏ hàng | PSA MARKET ATLAS',
};

export default function CartPage() {
  return <CartView />;
}
