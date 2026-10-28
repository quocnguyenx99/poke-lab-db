# Snorlax × Munchlax — PSA Market Atlas

Dashboard nghiên cứu đầu tư thẻ Pokémon **Snorlax & Munchlax đã chấm điểm PSA**. App hiển thị catalog thẻ (~535 thẻ), so sánh giá **Buy It Now** đang niêm yết (eBay / Fanatics Collect) với giá tham chiếu **PriceCharting**, xếp hạng tiềm năng **S/A/B/C/D/F**, PSA population, uy tín seller, và chế độ danh mục **P/P (< 400 triệu VNĐ)**. Người dùng là nhà đầu tư Việt Nam → UI tiếng Việt, mặc định hiển thị VNĐ.

Đây là app đọc-only chạy local: không có DB, không auth. Toàn bộ dữ liệu là file JSON tĩnh được bundle vào trang lúc build.

## Chạy dự án

```bash
npm install
npm run dev        # Next.js dev, http://localhost:4173 (bind 0.0.0.0 → truy cập được qua LAN)
npm run build && npm start   # production
npm test           # node:test — tests/ebay-market.test.js, tests/graded-research.test.js
npx tsc --noEmit   # typecheck
```
Windows 1-click: `CHAY_WINDOWS.bat`. Cần Node 22+. Biến môi trường mẫu trong `.env.example` (copy thành `.env.local`).

## Kiến trúc (app chính = Next.js)

- **Stack**: Next.js 16 App Router, React 19, TypeScript, `lucide-react`. CSS thuần trong [app/globals.css](../app/globals.css) (Supabase light theme, không Tailwind).
- [app/page.tsx](../app/page.tsx) — Server Component import trực tiếp `data/catalog/catalog.json` rồi truyền vào `<Dashboard>`.
- [components/Dashboard.tsx](../components/Dashboard.tsx) — client component giữ **toàn bộ state** (tier, character, grade, sort, currency, search, favorites, P/P toggle, view grid/table, modal). Lọc + sort nằm trong một `useMemo` duy nhất. Favorites/currency lưu `localStorage` (key `snoratlas-*-next`).
- Components con là presentational, nhận props từ Dashboard: `Sidebar` (tier), `Header` (export/import JSON), `Hero`, `StatGrid`, `Toolbar` (search/filter/sort/currency/P/P), `CardDeck`/`CardItem` (grid + hiệu ứng 3D), `CardTable`, `DrawerDossier` (chi tiết, so sánh 2 sàn), `LightboxModal` (zoom).
- [lib/utils.ts](../lib/utils.ts) — logic nghiệp vụ: `getScore`, `gradeToTier`, `getBest` (giá tốt nhất), `getDiff` (% so PC), `money`/`moneyDual` (format VNĐ/USD), `ebayLink`/`fanaticsLink`, `getPsaBreakdown`.
- [lib/constants.ts](../lib/constants.ts) — `RATE_USD_VND = 25460`, `TIER_META`, `GRADE_META`.
- [types/card.ts](../types/card.ts) — interface `PokemonCard` (schema chuẩn của catalog), `SortOption`, `TierLevel`, `Currency`.
- API routes: `app/api/catalog` (trả catalog), `app/api/health`.
- **Next.js 16 có breaking changes so với kiến thức cũ** — trước khi dùng API Next lạ, đọc tài liệu đi kèm trong `node_modules/next/dist/docs/`. `AGENTS.md` ở root và thay đổi trong `next-env.d.ts` do `next dev` tự sinh — đừng sửa tay.

## Dữ liệu

- **Nguồn sự thật duy nhất: [data/catalog/catalog.json](../data/catalog/catalog.json)** (mảng `PokemonCard`, JSON indent 2, UTF-8, `ensure_ascii=False`).
- Chi tiết quy ước dữ liệu: xem `.claude/rules/catalog-data.md`. Nguyên tắc giá/link bắt buộc: `.claude/rules/data-integrity.md`.

## Labs dạy học

Repo là bài thực hành Database với Agent cho học viên (xem `docs/labs/`):
- **Lab 1** (`docs/labs/lab1-sql-sheets/`, `apps-script/`): chuẩn hóa catalog → ERD/SQL (`node:sqlite`), lưu Google Sheets, API bằng Apps Script deploy qua clasp.
- **Lab 2** (`docs/labs/lab2-firebase-nosql/`): Firestore + Firebase Auth, shop demo (giỏ hàng, đặt hàng giả lập), deploy static export lên Firebase Hosting (gói Spark free).
- Branch này chứa lời giải Lab 1: `lib/data-source.ts` (DATA_SOURCE=json|sheets), `apps-script/`, `scripts/labs/`, `docs/labs/lab1-sql-sheets/*.sql|*.md`.
- Tài liệu lab viết cho học viên: mỗi bước là một prompt cho Agent + kết quả mong đợi + cách tự kiểm tra.

Phiên bản cũ (HTML 1 file, `server.js`, script cào) ở branch/tag `legacy-snapshot`.

## Quy ước làm việc

- Mọi thay đổi UI làm trong `app/`, `components/`, `lib/`, `types/` — xem `.claude/rules/frontend.md`.
- Text hiển thị cho người dùng viết **tiếng Việt**; tên field, code, commit type giữ tiếng Anh.
- Commit theo Conventional Commits có scope, ví dụ `feat(portfolio): ...`, `fix(catalog): ...`, `fix(policy): ...`.
- Trước khi báo xong: `npx tsc --noEmit` và `npm test` phải pass; nếu đụng dữ liệu, chạy kiểm tra trong `catalog-data.md`.
- Nếu yêu cầu mơ hồ về giá/nguồn dữ liệu → hỏi lại, không tự suy diễn số liệu.
