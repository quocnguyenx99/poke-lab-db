'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { PokemonCard, TierLevel, Currency, SortOption } from '@/types/card';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Hero } from './Hero';
import { StatGrid } from './StatGrid';
import { Toolbar } from './Toolbar';
import { CardDeck } from './CardDeck';
import { CardTable } from './CardTable';
import { DrawerDossier } from './DrawerDossier';
import { LightboxModal } from './LightboxModal';
import { getScore, gradeToTier, getBest, getDiff } from '@/lib/utils';
import { TIER_META } from '@/lib/constants';
import { useAuth } from '@/components/AuthProvider';
import { subscribeFavorites, setFavorite } from '@/lib/user-data';
import { useCart } from '@/components/CartProvider';
import { addToCart } from '@/lib/shop';
import { useRouter } from 'next/navigation';

interface DashboardProps {
  initialCatalog: PokemonCard[];
}

export const Dashboard: React.FC<DashboardProps> = ({ initialCatalog }) => {
  const [catalog, setCatalog] = useState<PokemonCard[]>(initialCatalog);
  const [currentTier, setCurrentTier] = useState<TierLevel>('ALL');
  const [character, setCharacter] = useState<string>('all');
  const [grade, setGrade] = useState<string>('all');
  const [sort, setSort] = useState<SortOption>('score');
  const [currency, setCurrency] = useState<Currency>('VND');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [maxBudget400M, setMaxBudget400M] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [serverOnline, setServerOnline] = useState<boolean>(true);

  // Modals
  const [selectedDetailCard, setSelectedDetailCard] = useState<PokemonCard | null>(null);
  const [selectedLightboxCard, setSelectedLightboxCard] = useState<PokemonCard | null>(null);

  const { user, loading: authLoading } = useAuth();
  const { ids: cartIds } = useCart();
  const router = useRouter();

  // Load currency from localStorage
  useEffect(() => {
    try {
      const savedCur = localStorage.getItem('snoratlas-currency-next') as Currency;
      if (savedCur) setCurrency(savedCur);
    } catch {}

    // Check health API
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setServerOnline(Boolean(d.ok)))
      .catch(() => setServerOnline(false));
  }, []);

  // Đã đăng nhập: favorites lấy realtime từ Firestore. Chưa đăng nhập: dùng localStorage như cũ.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      try {
        const savedFavs = localStorage.getItem('snoratlas-favorites-next');
        setFavorites(savedFavs ? JSON.parse(savedFavs) : {});
      } catch {
        setFavorites({});
      }
      return;
    }
    return subscribeFavorites(user.uid, setFavorites, (err) => console.error('Không đọc được favorites:', err));
  }, [user, authLoading]);

  const handleToggleFavorite = (id: string) => {
    if (user) {
      // Không setFavorites ở đây: onSnapshot báo thay đổi ngay lập tức (latency compensation), kể cả trước khi server xác nhận
      setFavorite(user.uid, id, !favorites[id]).catch((err) => {
        console.error(err);
        alert('Không lưu được yêu thích lên cloud. Thử lại sau.');
      });
      return;
    }
    setFavorites((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('snoratlas-favorites-next', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleAddToCart = (id: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    addToCart(user.uid, id).catch((err) => alert(err instanceof Error ? err.message : 'Không thêm được vào giỏ.'));
  };

  const handleCurrencyChange = (c: Currency) => {
    setCurrency(c);
    try {
      localStorage.setItem('snoratlas-currency-next', c);
    } catch {}
  };

  // Filtered and Sorted Cards
  const filteredCards = useMemo(() => {
    const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const list = catalog.filter((c) => {
      // BẮT BUỘC: Loại bỏ hoàn toàn thẻ có Bids / Đấu giá (Chỉ giữ Buy It Now / Fixed Price)
      if (c.listingType === 'AUCTION' || (c.bids != null && c.bids > 0)) return false;
      if (c.sellerBadge && c.sellerBadge.toLowerCase().includes('auction')) return false;

      // Danh mục P/P: Bỏ các thẻ trên 400 triệu VNĐ (~$15,710 USD)
      if (maxBudget400M) {
        const p = Number(c.listingPriceUSD || c.manualPrice || 0);
        if (p > 400000000 / 25460) return false;
      }

      if (grade !== 'all') {
        const gr = Number(c.grade || 10);
        const tg = Number(grade);
        if (tg === 10 ? gr < 10 : Math.floor(gr) !== tg) return false;
      }
      if (currentTier !== 'ALL' && (c.tier || gradeToTier(getScore(c))) !== currentTier) return false;
      if (character !== 'all' && c.character !== character) return false;
      if (showFavoritesOnly && !favorites[c.id]) return false;

      const hay = `${c.name} ${c.set} ${c.variant} ${c.character} PSA ${c.year || ''}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return hay.includes(q);
    });

    list.sort((a, b) => {
      if (sort === 'seller_rep') {
        const txB = b.sellerTransactions ?? 0;
        const txA = a.sellerTransactions ?? 0;
        if (txB !== txA) return txB - txA;
        return (b.sellerFeedback ?? 0) - (a.sellerFeedback ?? 0);
      }
      if (sort === 'pc_desc') return (b.pricecharting ?? 0) - (a.pricecharting ?? 0);
      if (sort === 'pc_asc') return (a.pricecharting ?? Infinity) - (b.pricecharting ?? Infinity);
      if (sort === 'price_desc') return (getBest(b)?.price ?? 0) - (getBest(a)?.price ?? 0);
      if (sort === 'price_asc') return (getBest(a)?.price ?? Infinity) - (getBest(b)?.price ?? Infinity);
      if (sort === 'deal') {
        const dA = getDiff(a);
        const dB = getDiff(b);
        if (dA === null && dB === null) return 0;
        if (dA === null) return 1;
        if (dB === null) return -1;
        return dA - dB;
      }
      if (sort === 'scarcity') return (a.psa10pop ?? Infinity) - (b.psa10pop ?? Infinity);
      if (sort === 'year_old') return (a.year ?? 9999) - (b.year ?? 9999);
      if (sort === 'year_new') return (b.year ?? 0) - (a.year ?? 0);
      return getScore(b) - getScore(a);
    });

    return list;
  }, [catalog, currentTier, character, grade, sort, searchQuery, showFavoritesOnly, maxBudget400M, favorites]);

  // Counts for pills
  const snorlaxCount = catalog.filter((c) => c.character === 'Snorlax').length;
  const munchlaxCount = catalog.filter((c) => c.character === 'Munchlax').length;
  const psa10Count = catalog.filter((c) => Number(c.grade) === 10).length;
  const psa9Count = catalog.filter((c) => Number(c.grade) === 9).length;
  const psaSub9Count = catalog.filter((c) => Number(c.grade) < 9).length;

  const currentTitle =
    currentTier === 'ALL'
      ? 'Toàn bộ thẻ PSA (Snorlax & Munchlax)'
      : TIER_META[currentTier]?.desc || 'Danh mục thẻ';

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(catalog, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `snoratlas-catalog-psa-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target?.result as string);
          if (Array.isArray(parsed)) {
            setCatalog(parsed);
            alert(`Đã nạp thành công ${parsed.length} thẻ vào ứng dụng Next.js!`);
          }
        } catch (err: any) {
          alert('Lỗi định dạng JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleSyncFanatics = async () => {
    alert('Đang đồng bộ listing PSA từ Fanatics Collect Vault...');
    try {
      const res = await fetch('/api/catalog');
      if (res.ok) {
        const data = await res.json();
        setCatalog(data);
        alert(`Đã cập nhật dữ liệu mới nhất (${data.length} thẻ PSA)!`);
      }
    } catch (e: any) {
      alert('Không thể đồng bộ: ' + e.message);
    }
  };

  return (
    <div className="app">
      <Sidebar
        currentTier={currentTier}
        onSelectTier={setCurrentTier}
        catalog={catalog}
        serverOnline={serverOnline}
      />

      <main>
        <Header
          onExport={handleExport}
          onImport={handleImport}
          onAddCard={() => alert('Vui lòng thêm thẻ vào catalog.json hoặc dùng API.')}
        />

        <Hero />

        <StatGrid catalog={catalog} />

        <Toolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          character={character}
          onCharacterChange={setCharacter}
          sort={sort}
          onSortChange={setSort}
          currency={currency}
          onCurrencyChange={handleCurrencyChange}
          grade={grade}
          onGradeChange={setGrade}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
          maxBudget400M={maxBudget400M}
          onToggleMaxBudget400M={() => setMaxBudget400M(!maxBudget400M)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultCount={filteredCards.length}
          snorlaxCount={snorlaxCount}
          munchlaxCount={munchlaxCount}
          psa10Count={psa10Count}
          psa9Count={psa9Count}
          psaSub9Count={psaSub9Count}
          title={currentTitle}
          onSyncFanatics={handleSyncFanatics}
        />

        {viewMode === 'grid' ? (
          <div id="cards">
            <CardDeck
              cards={filteredCards}
              currency={currency}
              sort={sort}
              currentGrade={grade}
              onOpenDetail={setSelectedDetailCard}
              onOpenLightbox={setSelectedLightboxCard}
              onToggleFavorite={handleToggleFavorite}
              favorites={favorites}
              onAddToCart={handleAddToCart}
              cartIds={cartIds}
            />
          </div>
        ) : (
          <div id="table">
            <CardTable
              cards={filteredCards}
              currency={currency}
              onOpenDetail={setSelectedDetailCard}
              onToggleSort={(type) => {
                if (type === 'pc') {
                  setSort(sort === 'pc_desc' ? 'pc_asc' : 'pc_desc');
                } else if (type === 'price') {
                  setSort(sort === 'price_desc' ? 'price_asc' : 'price_desc');
                }
              }}
            />
          </div>
        )}

        <footer>
          <strong>Minh bạch nguồn:</strong> PriceCharting / Population trong bộ dữ liệu gốc là snapshot được thẩm định chuẩn PSA. Giá sàn eBay & Fanatics Buy Now là giá chào bán thực tế tại thời điểm kiểm định. Hệ thống Next.js đảm bảo render siêu tốc và trải nghiệm mượt mà không độ trễ.
        </footer>
      </main>

      {/* Drawer Dossier Modal */}
      <DrawerDossier
        card={selectedDetailCard}
        catalog={catalog}
        currency={currency}
        onClose={() => setSelectedDetailCard(null)}
      />

      {/* Lightbox 3D Modal */}
      <LightboxModal
        card={selectedLightboxCard}
        currency={currency}
        onClose={() => setSelectedLightboxCard(null)}
        onOpenDossier={(c) => {
          setSelectedLightboxCard(null);
          setSelectedDetailCard(c);
        }}
      />
    </div>
  );
};
