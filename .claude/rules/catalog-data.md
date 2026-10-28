---
paths:
  - "data/**"
  - "scripts/**"
  - "public/assets/**"
  - "types/card.ts"
---

# Quy ước dữ liệu catalog

## Nguồn sự thật và các bản mirror
- **Nguồn duy nhất**: `data/catalog/catalog.json` — đây là file Next.js import (`app/page.tsx`, `app/api/catalog/route.ts`).
- Không tạo bản sao catalog ở chỗ khác. Dữ liệu dẫn xuất cho lab (`data/normalized/`, Google Sheets, Firestore) luôn sinh lại **từ** file này bằng script trong `scripts/labs/`, không sửa tay ngược lại.
- Định dạng ghi: UTF-8, indent 2, giữ nguyên ký tự tiếng Việt (`JSON.stringify(x, null, 2)`).

## Schema
Mỗi phần tử theo `PokemonCard` trong `types/card.ts`. Thêm field mới → cập nhật interface trước.
- `id`: tiền tố theo nguồn — `snor-NNN`/`munch-NNN` (nghiên cứu thủ công), `bonus-NNN`, `fc-snorlax-NNN`/`fc-munchlax-NNN` (Fanatics), `ebay-{itemId}` (eBay). Không đổi id đã có (favorites của người dùng lưu theo id).
- `image`: luôn `/assets/cards/{id}.webp`, file thật nằm ở `public/assets/cards/` (Next.js serve thư mục `public/`).
- `grade`: số (cho phép `.5`); `gradeLabel` dạng `"PSA 10 GEM MT"`.
- `listingType`: `BUY_IT_NOW` | `BUY_NOW`.

## Field dẫn xuất — phải tính lại khi giá thay đổi
- `tier` từ `tierScore`: ≥90 S, ≥80 A, ≥70 B, ≥63 C, còn lại D (giống `gradeToTier` trong `lib/utils.ts`).
- `diffPercent = (listingPriceUSD / pricecharting - 1) * 100` (làm tròn 1 chữ số), `priceDiffUSD = listingPriceUSD - pricecharting`.
- `dealRating` theo `diffPercent`:
  `≤ -15` → `SIÊU HỜI (Rẻ hơn PC ≥15%)`; `< 0` → `GIÁ TỐT (Rẻ hơn PC)`; `≤ 15` → `GIÁ CHUẨN (Ngang giá PC)`; còn lại → `PREMIUM (Cao hơn PC)`.
- Tỷ giá: `RATE_USD_VND = 25460` (`lib/constants.ts`). Ngưỡng P/P 400 triệu VNĐ = `400_000_000 / 25460` USD. Đổi tỷ giá → sửa ở constants.

## Kiểm tra sau khi sửa dữ liệu
Chạy nhanh từ root (Node) và xác nhận:
- Mọi `image` tồn tại trong `public/assets/cards/`.
- Không có `listingType` ngoài `BUY_IT_NOW`/`BUY_NOW`, không có `bids > 0`.
- `tier` khớp `tierScore`; `diffPercent` khớp công thức (sai số ≤ 0.2).
- Không trùng `id`.
- `npx tsc --noEmit` vẫn pass (JSON được import có kiểu).

## Script
- Chạy mọi script từ root repo.
- Script cho lab đặt trong `scripts/labs/`, dạng ES module `.mjs`, không thêm thư viện khi Node có sẵn (`node:fs`, `node:sqlite`).
- Phiên bản cũ (script cào dữ liệu, app legacy) nằm ở branch `legacy-snapshot` — chỉ tham khảo.
