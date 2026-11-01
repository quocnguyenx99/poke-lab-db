// Nạp data/catalog/catalog.json lên Firestore collection `cards` bằng Admin SDK.
// Chạy: node scripts/labs/seed-firestore.mjs
// Admin SDK BỎ QUA Security Rules → chỉ chạy trên máy dev, không bao giờ đưa vào code trình duyệt.

import { readFileSync, existsSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const BATCH_SIZE = 400; // Firestore giới hạn 500 thao tác / batch
const ALLOWED_LISTING_TYPES = new Set(['BUY_IT_NOW', 'BUY_NOW']); // .claude/rules/data-integrity.md §2

process.loadEnvFile('.env.local');

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './secrets/service-account.json';
if (!existsSync(keyPath)) {
  console.error(`Không tìm thấy service account key: ${keyPath}`);
  process.exit(1);
}
const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
if (serviceAccount.project_id !== projectId) {
  console.error(`Key thuộc project "${serviceAccount.project_id}" nhưng .env.local là "${projectId}". Dừng để tránh ghi nhầm project.`);
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount), projectId });
const db = getFirestore();

// Giữ nguyên null khi catalog không có giá trị: không bịa số (data-integrity §1)
const orNull = (v) => (v === undefined || v === '' ? null : v);

// Chuyển 1 phần tử catalog thành document theo docs/firebase-guide/01-phan-tich-usecase-erd.md §4.
// Không lưu field tính ra được: tier, diffPercent, priceDiffUSD, dealRating (và priceVND — dữ liệu gốc lưu USD).
const toCardDoc = (c) => ({
  name: c.name,
  character: c.character,
  set: c.set,
  year: c.year,
  variant: c.variant,
  grade: c.grade,
  gradeLabel: orNull(c.gradeLabel),
  slabCompany: c.slabCompany,
  tierScore: orNull(c.tierScore),

  marketplace: c.listingType === 'BUY_NOW' ? 'fanatics' : 'ebay',
  listingType: c.listingType,
  listingPriceUSD: orNull(c.listingPriceUSD),
  manualPrice: orNull(c.manualPrice),
  listingUrl: orNull(c.listingUrl),
  listingTitle: orNull(c.listingTitle),
  manualUrl: orNull(c.manualUrl),
  fanaticsId: orNull(c.fanaticsId),
  ebayItemUrl: orNull(c.ebayItemUrl),
  ebayItemTitle: orNull(c.ebayItemTitle),
  ebayItemPrice: orNull(c.ebayItemPrice),
  ebayQuery: orNull(c.ebayQuery),

  // Nhúng seller (SQL: bảng sellers + FK)
  seller: {
    name: c.seller,
    href: orNull(c.sellerHref),
    badge: orNull(c.sellerBadge),
    transactions: orNull(c.sellerTransactions),
    feedback: orNull(c.sellerFeedback),
    isPowerSeller8k: c.isPowerSeller8k ?? false,
  },
  // Nhúng giá tham chiếu đúng grade của listing (SQL: price_references khóa card + grade)
  priceRef: {
    source: 'pricecharting',
    priceUSD: orNull(c.pricecharting),
    url: orNull(c.priceChartingUrl),
  },
  // Nhúng population (SQL: pop_reports)
  pop: {
    psa10: orNull(c.psa10pop),
    total: orNull(c.psaTotal),
  },

  image: orNull(c.image), // đường dẫn trong public/, Hosting phục vụ. Giai đoạn 4 sẽ thêm imagePath trên Storage
  origin: orNull(c.origin),
  researched: c.researched ?? false,
  notes: orNull(c.notes),
  investmentThesis: orNull(c.investmentThesis),
  updatedAt: FieldValue.serverTimestamp(),
});

const catalog = JSON.parse(readFileSync('data/catalog/catalog.json', 'utf8'));
const valid = catalog.filter((c) => ALLOWED_LISTING_TYPES.has(c.listingType) && !(c.bids > 0) && c.slabCompany === 'PSA');
const skipped = catalog.length - valid.length;

console.log(`Project: ${projectId} | Catalog: ${catalog.length} thẻ | Bỏ qua (không phải PSA Buy It Now): ${skipped}`);

let written = 0;
for (let i = 0; i < valid.length; i += BATCH_SIZE) {
  const batch = db.batch();
  for (const card of valid.slice(i, i + BATCH_SIZE)) {
    // id document = id listing → chạy lại script sẽ ghi đè, không tạo bản trùng
    batch.set(db.collection('cards').doc(card.id), toCardDoc(card));
  }
  await batch.commit();
  written += Math.min(BATCH_SIZE, valid.length - i);
  console.log(`  … đã ghi ${written}/${valid.length}`);
}

// Đếm lại trên server bằng aggregation (tốn 1 lượt đọc / 1000 document)
const snap = await db.collection('cards').count().get();
console.log(`Đã ghi ${written} document vào cards. Firestore hiện có ${snap.data().count} document.`);
