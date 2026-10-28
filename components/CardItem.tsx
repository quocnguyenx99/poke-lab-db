'use client';

import React, { useState } from 'react';
import { PokemonCard, Currency } from '@/types/card';
import {
  getScore,
  gradeToTier,
  getBest,
  getDiff,
  money,
  fanaticsLink,
  ebayLink,
  isEstimated,
  dec,
} from '@/lib/utils';

interface CardItemProps {
  card: PokemonCard;
  currency: Currency;
  isSortPC: boolean;
  onOpenDetail: (card: PokemonCard) => void;
  onOpenLightbox: (card: PokemonCard) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: boolean;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  currency,
  isSortPC,
  onOpenDetail,
  onOpenLightbox,
  onToggleFavorite,
  isFavorite,
}) => {
  const [imgError, setImgError] = useState(false);
  const score = getScore(card);
  const tier = gradeToTier(score);
  const best = getBest(card);
  const diff = getDiff(card);

  const gradeLabel = card.gradeLabel || `PSA ${card.grade || 10}`;
  const isFanatics = card.listingUrl && card.listingUrl.includes('fanaticscollect.com');
  const platformLabel = isFanatics ? '⚡ Fanatics Buy Now' : '🛒 eBay Buy Now';

  const badgeDiff = (d: number | null) => {
    if (d == null) return <span className="delta mid">Chưa có %</span>;
    const isGood = d <= -10;
    const isBad = d >= 12;
    return (
      <span className={`delta ${isGood ? 'good' : isBad ? 'bad' : 'mid'}`}>
        {d > 0 ? '+' : ''}
        {d.toFixed(1)}%
      </span>
    );
  };

  return (
    <article className="card" data-card={card.id}>
      <div
        className="card-visual"
        onClick={() => onOpenLightbox(card)}
        style={{ cursor: 'pointer' }}
        title="Nhấp để phóng to & trải nghiệm 3D"
      >
        <div className="slab-3d-wrapper">
          {card.image && !imgError ? (
            <img
              src={card.image}
              alt={card.name}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="visual-fallback" style={{ display: 'flex' }}>
              <div className="zz">Zz</div>
              <small>{card.character.toUpperCase()}</small>
            </div>
          )}
          <div className="holo-glare"></div>
        </div>

        <div className="topbadge">
          <span className="psa-chip chip-company chip-psa">{gradeLabel}</span>
          <span className="grade-chip">{card.character.toUpperCase()}</span>
        </div>

        <button
          className={`heart ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(card.id);
          }}
          title="Lưu yêu thích"
        >
          {isFavorite ? '♥' : '♡'}
        </button>

        <div className={`tier tier-${tier}`} title={`Điểm tiềm năng ${score}/100`}>
          {tier}
        </div>
      </div>

      <div className="card-body">
        <div className="meta">
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <span className="meta-card-badge">{card.year || 'CHƯA RÕ NĂM'}</span>
            <span className="meta-card-badge">{card.variant || 'PROMO'}</span>
          </div>
          <span className="meta-card-badge score">
            {score}/100{isEstimated(card) ? '*' : ''}
          </span>
        </div>

        <div className="name" title={card.name}>
          {card.name}
        </div>

        <div
          style={{
            fontSize: '11px',
            color: isFanatics ? '#00529B' : 'var(--sb-primary-dark)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            margin: '-2px 0 4px 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={`Sàn giao dịch: ${platformLabel}`}
        >
          <span style={{ fontSize: '12px' }}>{isFanatics ? '⚡' : '🏪'}</span>{' '}
          <span>{platformLabel}</span>
        </div>

        <div
          style={{
            fontSize: '10.5px',
            color: '#047857',
            background: '#ECFDF5',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #A7F3D0',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            margin: '0 0 6px 0',
            width: 'fit-content',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={`Uy tín người bán: ${dec(card.sellerTransactions || 8000)}+ đơn hàng hoàn thành • ${card.sellerFeedback || 99.8}% đánh giá tích cực`}
        >
          <span>🛡️</span>
          <span>{card.sellerBadge || 'Top Seller >8.000 GD (99.8%)'}</span>
        </div>

        <div className="subline" title={card.set}>
          <span style={{ fontWeight: 600, color: 'var(--sb-text-primary)' }}>
            {card.set || 'Không rõ bộ'}
          </span>
          <span style={{ margin: '0 4px', color: 'var(--sb-text-muted)' }}>•</span>
          <span className="subline-pop">
            {card.psa10pop != null ? dec(card.psa10pop) + ' PSA 10' : 'Slab: PSA'}
          </span>
        </div>

        <div
          style={{
            margin: '6px 0 8px 0',
            background: 'var(--sb-surface-1)',
            padding: '6px 8px',
            borderRadius: '4px',
            border: '1px solid var(--sb-border)',
            borderLeft: '2px solid var(--sb-primary)',
            display: 'flex',
            gap: '6px',
            alignItems: 'flex-start',
          }}
          title={card.investmentThesis || card.notes || ''}
        >
          <span style={{ fontSize: '12px', lineHeight: 1.3, flexShrink: 0 }}>💡</span>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--sb-text-secondary)',
              lineHeight: 1.35,
              maxHeight: '2.7em',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
            }}
          >
            {card.investmentThesis || card.notes || 'Chưa có phân tích.'}
          </span>
        </div>

        <div className="pricebox">
          <div>
            <div className="lbl">
              {isFanatics ? 'Fanatics BIN' : 'eBay BIN'}
            </div>
            <div className="val">
              {best ? money(best.price, false, currency) : 'Chưa có giá'}
            </div>
          </div>

          <div
            className="pc-ref"
            style={
              isSortPC
                ? {
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.4)',
                    borderRadius: '4px',
                    padding: '3px 6px',
                  }
                : undefined
            }
          >
            <div style={isSortPC ? { fontWeight: 700, color: '#0A844E' } : undefined}>
              {isSortPC ? '📈 ' : ''}PC: {money(card.pricecharting, true, currency)}
            </div>
            <div>{badgeDiff(diff)}</div>
          </div>
        </div>

        <div className="actionline">
          <button onClick={() => onOpenDetail(card)}>Chi tiết</button>
          <a
            className="go-fanatics"
            target="_blank"
            rel="noopener noreferrer"
            href={fanaticsLink(card)}
            title="Mở Fanatics Collect (Buy Now)"
          >
            ⚡ Fanatics ↗
          </a>
          <a
            className="go-ebay"
            target="_blank"
            rel="noopener noreferrer"
            href={ebayLink(card)}
            title="Mở eBay (Buy It Now)"
          >
            🛒 eBay ↗
          </a>
        </div>
      </div>
    </article>
  );
};
