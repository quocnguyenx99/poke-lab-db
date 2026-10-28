'use client';

import React from 'react';
import { PokemonCard, Currency } from '@/types/card';
import {
  getPsaBreakdown,
  getDiff,
  money,
  moneyDual,
  fanaticsLink,
  ebayLink,
  dec,
} from '@/lib/utils';
import { RATE_USD_VND } from '@/lib/constants';

interface DrawerDossierProps {
  card: PokemonCard | null;
  catalog: PokemonCard[];
  currency: Currency;
  onClose: () => void;
}

export const DrawerDossier: React.FC<DrawerDossierProps> = ({
  card,
  catalog,
  currency,
  onClose,
}) => {
  if (!card) return null;

  const diff = getDiff(card);
  const curGradeNum = Number(card.grade || 10);
  const isFanatics = card.listingUrl && card.listingUrl.includes('fanaticscollect.com');

  const targetGrades = [
    { grade: 10, name: 'PSA 10', condition: 'Gem Mint', color: '#3FCF8E', badgeBg: '#3FCF8E', textColor: '#000' },
    { grade: 9, name: 'PSA 9', condition: 'Mint', color: '#72E3AD', badgeBg: 'rgba(63,207,142,0.15)', textColor: '#72E3AD' },
    { grade: 8, name: 'PSA 8', condition: 'NM-MT', color: '#F3BA63', badgeBg: 'rgba(243,186,99,0.15)', textColor: '#F3BA63' },
    { grade: 7, name: 'PSA 7', condition: 'Near Mint', color: '#DC7B18', badgeBg: 'rgba(220,123,24,0.15)', textColor: '#DC7B18' },
  ];

  const breakdown = getPsaBreakdown(card);

  // Arbitrage math
  const base10 = card.pricecharting || 100;
  const rawEst = Math.round(base10 * 0.28);
  const psaFee = 25;
  const totalCost = rawEst + psaFee;
  const psa10Val = Math.round(base10);
  const floor9Val = Math.round(base10 * 0.45);
  const profitPSA10 = psa10Val - totalCost;
  const roiPSA10 = Math.round((profitPSA10 / totalCost) * 100);
  const profitFloor = floor9Val - totalCost;

  const rawVND = Math.round(rawEst * RATE_USD_VND).toLocaleString('vi-VN') + ' ₫';

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
    <>
      <div className="drawer-cover show" onClick={onClose} />
      <aside className="drawer show" id="drawer">
        <div className="drawerhead">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="psa-chip chip-company chip-psa">
              {card.gradeLabel || `PSA ${card.grade || 10}`}
            </span>
            <span className="grade-chip">{card.character.toUpperCase()}</span>
          </div>
          <button className="close" onClick={onClose} title="Đóng (Esc)">
            ✕
          </button>
        </div>

        <div className="drawer-body">
          <h2 style={{ fontSize: '20px', margin: '0 0 6px 0', fontFamily: 'var(--font-heading)', color: '#111827' }}>
            {card.name}
          </h2>
          <div style={{ fontSize: '12px', color: 'var(--sb-text-secondary)', marginBottom: '16px' }}>
            {card.set} • Năm phát hành: {card.year || 'Chưa rõ'} • Biến thể: {card.variant || 'Standard'}
          </div>

          {/* DUAL MARKETPLACE LIVE COMPARISON */}
          <div className="detailblock" style={{ background: '#F8FAFC', border: '1px solid rgba(0,82,155,0.2)', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '15px' }}>⚡</span>
                <h4 style={{ margin: 0, fontSize: '11px', letterSpacing: '0.08em', color: '#00529B', textTransform: 'uppercase', fontWeight: 800 }}>
                  ĐỐI CHIẾU TRỰC TIẾP 2 SÀN GIAO DỊCH
                </h4>
              </div>
              <span className="psa-chip" style={{ fontSize: '9px', background: '#00529B', color: '#FFF' }}>
                DUAL MARKETPLACE
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              {/* Fanatics Box */}
              <div style={{ background: '#FFFFFF', border: '1px solid #BAE6FD', borderRadius: '6px', padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#00529B' }}>⚡ FANATICS COLLECT</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#00529B', fontFamily: 'var(--font-mono)' }}>
                  {card.listingPriceUSD ? money(card.listingPriceUSD, false, currency) : 'Chưa có Buy Now'}
                </div>
                <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                  {isFanatics ? 'Listing Buy Now trực tiếp' : 'Tra cứu kho lưu trữ Fanatics Vault'}
                </div>
                <a
                  className="small-button primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={fanaticsLink(card)}
                  style={{ display: 'block', textAlign: 'center', background: '#00529B', color: '#FFF', borderColor: '#00529B', marginTop: '8px', fontSize: '11px', padding: '4px 8px' }}
                >
                  ⚡ Mở trên Fanatics ↗
                </a>
              </div>

              {/* eBay Box */}
              <div style={{ background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '6px', padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669' }}>🛒 EBAY BUY IT NOW</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>
                  {(!isFanatics && card.listingPriceUSD)
                    ? money(card.listingPriceUSD, false, currency)
                    : card.ebayItemPrice
                    ? money(card.ebayItemPrice, false, currency)
                    : card.manualPrice
                    ? money(card.manualPrice, false, currency)
                    : 'Chưa có giá sàn'}
                </div>
                <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                  Giá cố định Buy It Now (Không Auction)
                </div>
                <a
                  className="small-button primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={ebayLink(card)}
                  style={{ display: 'block', textAlign: 'center', background: '#059669', color: '#FFF', borderColor: '#059669', marginTop: '8px', fontSize: '11px', padding: '4px 8px' }}
                >
                  🛒 Mở trên eBay ↗
                </a>
              </div>
            </div>
          </div>

          {/* GRADES MATRIX */}
          <div className="detailblock" style={{ marginBottom: '14px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', letterSpacing: '0.08em', color: 'var(--sb-text-secondary)', textTransform: 'uppercase' }}>
              PHÂN HẠNG GRADE PSA THỊ TRƯỜNG (7 - 10)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {targetGrades.map((tg) => {
                const isCurrent = Math.abs(curGradeNum - tg.grade) < 0.1;
                const popObj = breakdown.find((b) => b.grade.includes(String(tg.grade))) || { pop: 0, rate: '0' };
                const cleanName = card.name.toLowerCase().replace(/\s*\((?:psa|cgc|bgs|sgc)\s*[\d.]+\)/i, '').trim();
                const matched = catalog.find(
                  (x) =>
                    x.character === card.character &&
                    x.id !== card.id &&
                    x.name.toLowerCase().replace(/\s*\((?:psa|cgc|bgs|sgc)\s*[\d.]+\)/i, '').trim() === cleanName &&
                    Math.abs(Number(x.grade) - tg.grade) < 0.1
                );

                const priceUSD = isCurrent
                  ? card.listingPriceUSD || card.manualPrice
                  : matched
                  ? matched.listingPriceUSD || matched.manualPrice
                  : null;

                return (
                  <div
                    key={tg.grade}
                    style={{
                      background: isCurrent ? 'var(--sb-surface-2)' : 'var(--sb-surface-1)',
                      border: isCurrent ? '1px solid var(--sb-primary)' : '1px solid var(--sb-border)',
                      borderRadius: '6px',
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: tg.badgeBg, color: tg.textColor, fontWeight: 700, fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
                          {tg.name}
                        </span>
                        <span style={{ color: 'var(--sb-text-primary)', fontWeight: 600, fontSize: '13px' }}>
                          {tg.condition}
                        </span>
                        {isCurrent && (
                          <span style={{ background: 'rgba(63,207,142,0.15)', color: 'var(--sb-primary)', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                            ĐANG CHỌN
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--sb-text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        Pop: <b style={{ color: tg.color }}>{dec(popObj.pop)}</b> ({popObj.rate}%)
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--sb-text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {priceUSD ? money(priceUSD, false, currency) : 'Chưa niêm yết'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PSA ARBITRAGE MATRIX */}
          <div className="detailblock" style={{ background: '#F8FAFC', border: '1px solid rgba(2,132,199,0.3)', borderLeft: '4px solid #0284C7', borderRadius: '8px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{ fontSize: '16px' }}>📊</span>
                <h4 style={{ margin: 0, fontSize: '11px', letterSpacing: '0.08em', color: '#0369A1', textTransform: 'uppercase', fontWeight: 700 }}>
                  MA TRẬN CHÊNH LỆCH ĐỊNH GIÁ & ARBITRAGE (RAW VS. PSA 10)
                </h4>
              </div>
              <span className="chip-company chip-psa" style={{ fontSize: '9px' }}>
                🏆 PSA ARBITRAGE
              </span>
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '11.5px', lineHeight: 1.55, color: '#334155' }}>
              Mô hình định lượng: Mua thẻ <b>Raw Near Mint</b> và gửi kiểm định lab PSA để gặt hái biên lợi nhuận PSA 10 / PSA 9.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '10px' }}>
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Thẻ Raw Near Mint</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', fontFamily: 'var(--font-mono)' }}>${rawEst.toLocaleString('en-US')}</div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>~{rawVND}</div>
              </div>
              <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px 10px' }}>
                <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>Phí gửi Lab PSA</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748B', fontFamily: 'var(--font-mono)' }}>${psaFee}</div>
                <div style={{ fontSize: '10px', color: '#64748B' }}>Tổng vốn: ${totalCost.toLocaleString('en-US')}</div>
              </div>
              <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: '6px', padding: '8px 10px' }}>
                <div style={{ fontSize: '10px', color: '#E11D48', fontWeight: 700, textTransform: 'uppercase' }}>PSA 10 Gem Mint</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#E11D48', fontFamily: 'var(--font-mono)' }}>${psa10Val.toLocaleString('en-US')}</div>
                <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700 }}>
                  Lãi +{roiPSA10}% (+${profitPSA10.toLocaleString('en-US')})
                </div>
              </div>
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '8px 10px' }}>
                <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: 700, textTransform: 'uppercase' }}>Kịch bản phòng vệ (PSA 9)</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#16A34A', fontFamily: 'var(--font-mono)' }}>${floor9Val.toLocaleString('en-US')}</div>
                <div style={{ fontSize: '10px', color: profitFloor >= 0 ? '#059669' : '#DC2626', fontWeight: 700 }}>
                  {profitFloor >= 0 ? `+$${profitFloor}` : `-$${Math.abs(profitFloor)}`}
                </div>
              </div>
            </div>
          </div>

          {/* PSA POPULATION REPORT TABLE */}
          <div className="detailblock" style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '11px', letterSpacing: '0.08em', color: 'var(--sb-text-secondary)', textTransform: 'uppercase' }}>
                🏛️ PHÂN BỔ THANG ĐIỂM PSA (GRADE 1 - 10)
              </h4>
              <span className="psa-chip" style={{ fontSize: '9px' }}>
                HỒ SƠ GỐC PSA
              </span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ color: '#78859b', fontSize: '10px', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>Grade</th>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>Cấp bậc</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>Số lượng</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((r) => (
                    <tr
                      key={r.grade}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        background: r.highlight ? 'rgba(63,207,142,0.1)' : 'transparent',
                        fontWeight: r.highlight ? 700 : 400,
                      }}
                    >
                      <td style={{ padding: '6px 8px', color: r.color }}>{r.grade}</td>
                      <td style={{ padding: '6px 8px' }}>{r.label}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right' }}>{dec(r.pop)}</td>
                      <td style={{ padding: '6px 8px', textAlign: 'right', color: r.color }}>{r.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a
                className="small-button"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.ebay.com/str/psa?_nkw=${encodeURIComponent(card.character + ' ' + card.name)}`}
                style={{ flex: 1, fontSize: '11px', textAlign: 'center', background: 'var(--sb-surface-2)', color: 'var(--sb-primary-dark)', border: '1px solid var(--sb-primary)', fontWeight: 600 }}
              >
                🛒 Official PSA Store ↗
              </a>
              <a
                className="small-button"
                target="_blank"
                rel="noopener noreferrer"
                href={`https://www.psacard.com/pop/tcg-cards?q=${encodeURIComponent(card.character + ' ' + card.name)}`}
                style={{ flex: 1, fontSize: '11px', textAlign: 'center' }}
              >
                🏛️ Tra PSA Pop Gốc ↗
              </a>
            </div>
          </div>

          {/* NOTES & NOTICE */}
          <div className="notice" style={{ marginBottom: '14px' }}>
            {card.notes || 'Chưa có thông tin bổ sung.'} Chưa tính ship/thuế tại Việt Nam. Không được xem giá eBay BIN là giao dịch Sold.
          </div>

          {/* FOOTER ACTIONS */}
          <div className="modalfoot" style={{ justifyContent: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
            <a
              className="small-button primary"
              target="_blank"
              rel="noopener noreferrer"
              href={fanaticsLink(card)}
              style={{ background: '#00529B', color: '#FFF', borderColor: '#00529B' }}
            >
              ⚡ Mở trên Fanatics Collect ↗
            </a>
            <a
              className="small-button primary"
              target="_blank"
              rel="noopener noreferrer"
              href={ebayLink(card)}
              style={{ background: '#059669', color: '#FFF', borderColor: '#059669' }}
            >
              🛒 Mở trên eBay Buy It Now ↗
            </a>
            {card.priceChartingUrl && (
              <a
                className="small-button"
                target="_blank"
                rel="noopener noreferrer"
                href={card.priceChartingUrl}
              >
                PriceCharting ↗
              </a>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
