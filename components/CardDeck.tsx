'use client';

import React from 'react';
import { PokemonCard, Currency, SortOption } from '@/types/card';
import { CardItem } from './CardItem';
import { GRADE_META } from '@/lib/constants';
import { dec } from '@/lib/utils';

interface CardDeckProps {
  cards: PokemonCard[];
  currency: Currency;
  sort: SortOption;
  currentGrade: string;
  onOpenDetail: (card: PokemonCard) => void;
  onOpenLightbox: (card: PokemonCard) => void;
  onToggleFavorite: (id: string) => void;
  favorites: Record<string, boolean>;
  onAddToCart: (id: string) => void;
  cartIds: Record<string, boolean>;
}

export const CardDeck: React.FC<CardDeckProps> = ({
  cards,
  currency,
  sort,
  currentGrade,
  onOpenDetail,
  onOpenLightbox,
  onToggleFavorite,
  favorites,
  onAddToCart,
  cartIds,
}) => {
  if (!cards.length) {
    return (
      <div className="empty">
        <h3>Không có thẻ phù hợp</h3>
        <div>Thử đổi Tier, nhân vật hoặc từ khóa.</div>
      </div>
    );
  }

  const isSortPC = sort === 'pc_desc' || sort === 'pc_asc';

  // If filtered by specific grade or sorted by anything other than default 'score', render continuous flat deck
  if (currentGrade !== 'all' || sort !== 'score') {
    return (
      <div className="deck">
        {cards.map((c) => (
          <CardItem
            key={c.id}
            card={c}
            currency={currency}
            isSortPC={isSortPC}
            onOpenDetail={onOpenDetail}
            onOpenLightbox={onOpenLightbox}
            onToggleFavorite={onToggleFavorite}
            isFavorite={Boolean(favorites[c.id])}
            onAddToCart={onAddToCart}
            inCart={Boolean(cartIds[c.id])}
          />
        ))}
      </div>
    );
  }

  // Default: Group into grade sections
  const gradesOrder = [10, 9, 8, 7, 6] as const;

  return (
    <div>
      {gradesOrder.map((g) => {
        const sub = cards.filter((c) => {
          const gr = Number(c.grade || 10);
          if (g === 10) return gr >= 10;
          if (g === 6) return gr <= 6;
          return Math.floor(gr) === g;
        });

        if (!sub.length) return null;
        const m = GRADE_META[g];

        return (
          <div key={g} className="grade-section" style={{ marginBottom: '32px' }}>
            <div
              className="grade-section-header"
              style={{
                border: `1px solid ${m.border}`,
                borderLeft: `4px solid ${m.color}`,
                background: '#FFFFFF',
                borderRadius: '10px',
                padding: '14px 20px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: m.bg,
                    border: `1px solid ${m.border}`,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  {m.badge}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '15px',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 800,
                      color: '#111827',
                      letterSpacing: '-0.01em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>{m.title}</span>
                    <span
                      style={{
                        background: m.bg,
                        color: m.color,
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: `1px solid ${m.border}`,
                      }}
                    >
                      {m.cond}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--sb-text-secondary)', marginTop: '2px' }}>
                    {m.desc}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid var(--sb-border)',
                  borderRadius: '20px',
                  padding: '4px 14px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  color: '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: m.color,
                  }}
                ></span>
                <span>{dec(sub.length)} phiên bản</span>
              </div>
            </div>

            <div className="deck">
              {sub.map((c) => (
                <CardItem
                  key={c.id}
                  card={c}
                  currency={currency}
                  isSortPC={isSortPC}
                  onOpenDetail={onOpenDetail}
                  onOpenLightbox={onOpenLightbox}
                  onToggleFavorite={onToggleFavorite}
                  isFavorite={Boolean(favorites[c.id])}
                  onAddToCart={onAddToCart}
                  inCart={Boolean(cartIds[c.id])}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
