'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { ShopShell } from '@/components/ShopShell';
import { getMyOrders } from '@/lib/shop';
import { money } from '@/lib/utils';
import type { Order } from '@/types/shop';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xử lý',
};

export const OrdersView: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getMyOrders(user.uid)
      .then(setOrders)
      .catch((err) => {
        console.error(err);
        setError('Không tải được đơn hàng.');
      });
  }, [user]);

  return (
    <ShopShell title="Đơn hàng của tôi">
      {error && <div className="auth-error">{error}</div>}
      {!error && orders === null && <div className="shop-empty">Đang tải…</div>}
      {orders?.length === 0 && (
        <div className="shop-empty">
          Chưa có đơn hàng. <Link href="/">Chọn thẻ</Link>
        </div>
      )}
      {orders?.map((o) => (
        <section key={o.id} className="order-card">
          <header>
            <div>
              <strong>Đơn #{o.id.slice(0, 8)}</strong>
              <span className="order-status">{STATUS_LABEL[o.status] ?? o.status}</span>
            </div>
            <span className="shop-row-meta">{o.createdAt ? o.createdAt.toLocaleString('vi-VN') : 'Đang lưu…'}</span>
          </header>
          <ul className="shop-list">
            {o.items.map((it) => (
              <li key={it.listingId} className="shop-row">
                {it.image ? <img src={it.image} alt={it.name} onError={(e) => (e.currentTarget.style.visibility = 'hidden')} /> : <div className="shop-thumb" />}
                <div className="shop-row-info">
                  <div className="shop-row-name">{it.name}</div>
                  <div className="shop-row-meta">PSA {it.grade} · giá lúc đặt</div>
                </div>
                <div className="shop-row-price">
                  {money(it.priceUSD)}
                  <small>{money(it.priceUSD, false, 'USD')}</small>
                </div>
              </li>
            ))}
          </ul>
          <footer>
            Tổng: <strong>{money(o.totalUSD)}</strong> <small>{money(o.totalUSD, false, 'USD')}</small>
          </footer>
        </section>
      ))}
    </ShopShell>
  );
};
