'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useCart } from '@/components/CartProvider';
import { ShopShell } from '@/components/ShopShell';
import { placeOrder, removeFromCart } from '@/lib/shop';
import { money } from '@/lib/utils';

export const CartView: React.FC = () => {
  const { user } = useAuth();
  const { items } = useCart();
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chỉ để hiển thị; tổng tiền thật của đơn được tính lại trong placeOrder từ giá trên Firestore
  const totalUSD = items.reduce((sum, it) => sum + it.priceUSD, 0);

  const handlePlaceOrder = async () => {
    if (!user) return;
    setError(null);
    setPlacing(true);
    try {
      await placeOrder(user.uid);
      router.push('/orders');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Không đặt được hàng. Thử lại sau.');
      setPlacing(false);
    }
  };

  return (
    <ShopShell title="Giỏ hàng">
      {!items.length ? (
        <div className="shop-empty">
          Giỏ hàng trống. <Link href="/">Chọn thẻ</Link>
        </div>
      ) : (
        <>
          <ul className="shop-list">
            {items.map((it) => (
              <li key={it.listingId} className="shop-row">
                {it.image ? <img src={it.image} alt={it.name} onError={(e) => (e.currentTarget.style.visibility = 'hidden')} /> : <div className="shop-thumb" />}
                <div className="shop-row-info">
                  <div className="shop-row-name">{it.name}</div>
                  <div className="shop-row-meta">PSA {it.grade}</div>
                </div>
                <div className="shop-row-price">
                  {money(it.priceUSD)}
                  <small>{money(it.priceUSD, false, 'USD')}</small>
                </div>
                <button className="small-button" onClick={() => user && removeFromCart(user.uid, it.listingId)}>
                  Xóa
                </button>
              </li>
            ))}
          </ul>

          <div className="shop-summary">
            <div>
              Tổng ({items.length} thẻ): <strong>{money(totalUSD)}</strong> <small>{money(totalUSD, false, 'USD')}</small>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button className="small-button primary" onClick={handlePlaceOrder} disabled={placing}>
              {placing ? 'Đang đặt hàng…' : 'Đặt hàng (giả lập)'}
            </button>
            <p className="shop-note">Đơn hàng chỉ để thực hành database: không thanh toán, không giao hàng.</p>
          </div>
        </>
      )}
    </ShopShell>
  );
};
