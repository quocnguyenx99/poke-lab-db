'use client';

import React from 'react';
import { UserMenu } from '@/components/UserMenu';

interface HeaderProps {
  onExport: () => void;
  onImport: () => void;
  onAddCard: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onExport, onImport, onAddCard }) => {
  return (
    <div className="topline">
      <div>
        <span style={{ color: 'var(--sb-primary-dark)', fontSize: '10px' }}>◆</span> THE COLLECTOR'S TERMINAL{' '}
        <span style={{ color: 'var(--sb-border)' }}>/</span> POKÉMON PSA ONLY ATLAS (NEXT.JS)
      </div>
      <div className="right">
        <a
          className="small-button"
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.fanaticscollect.com/marketplace?type=FIXED&q=Snorlax"
          style={{
            color: '#00529B',
            borderColor: 'rgba(0,82,155,0.25)',
            background: '#F0F7FF',
            fontWeight: 700,
          }}
          title="Tra cứu Snorlax PSA Buy Now trên Fanatics Collect (PWCC)"
        >
          ⚡ Fanatics Snorlax (Buy Now) ↗
        </a>
        <a
          className="small-button"
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.fanaticscollect.com/marketplace?type=FIXED&q=Munchlax"
          style={{
            color: '#00529B',
            borderColor: 'rgba(0,82,155,0.25)',
            background: '#F0F7FF',
            fontWeight: 700,
          }}
          title="Tra cứu Munchlax PSA Buy Now trên Fanatics Collect (PWCC)"
        >
          ⚡ Fanatics Munchlax (Buy Now) ↗
        </a>
        <button className="small-button" onClick={onExport}>
          ⇩ Xuất dữ liệu
        </button>
        <button className="small-button" onClick={onImport}>
          ⇧ Import
        </button>
        <button className="small-button primary" onClick={onAddCard}>
          ＋ Thêm thẻ
        </button>
        <span className="topline-sep" />
        <UserMenu />
      </div>
    </div>
  );
};
