import type { Metadata } from 'next';
import { OrdersView } from '@/components/OrdersView';

export const metadata: Metadata = {
  title: 'Đơn hàng | PSA MARKET ATLAS',
};

export default function OrdersPage() {
  return <OrdersView />;
}
