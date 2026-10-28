---
paths:
  - "app/**"
  - "components/**"
  - "lib/**"
  - "types/**"
---

# Quy ước frontend (Next.js)

- Component: file `PascalCase.tsx`, export **named** dạng `export const X: React.FC<XProps> = (...) => {}`, interface props đặt ngay trên component. Component dùng state/effect/browser API phải có `'use client'`.
- Import qua alias `@/` (`@/lib/utils`, `@/types/card`, `@/components/...`).
- State dùng chung nằm ở `Dashboard.tsx`; component con nhận giá trị + callback qua props. Thêm bộ lọc/sort mới:
  1. thêm giá trị vào `SortOption` (hoặc state mới) trong `types/card.ts`/`Dashboard.tsx`,
  2. xử lý trong `useMemo` `filteredCards` (nhớ thêm vào dependency array),
  3. thêm control + nhãn tiếng Việt trong `Toolbar.tsx` (`sortLabels`).
- Logic tính toán (giá, tier, link, format tiền) đặt trong `lib/utils.ts` dưới dạng hàm thuần, không viết inline trong component.
- Hiển thị tiền luôn qua `money(usd, compact, currency)` / `moneyDual` — dữ liệu gốc lưu USD, không lưu VNĐ.
- Link sàn luôn qua `ebayLink(card)` / `fanaticsLink(card)` để giữ quy tắc Buy It Now. Mở tab mới với `target="_blank" rel="noopener noreferrer"`.
- `localStorage`: bọc mọi đọc/ghi trong `try {} catch {}`, key có tiền tố `snoratlas-` và hậu tố `-next`.
- Style: thêm class vào `app/globals.css`, dùng biến màu/token đã có; không thêm Tailwind, CSS-in-JS hay thư viện UI mới. Icon dùng `lucide-react`.
- `<img>` thẻ phải có `onError` fallback (xem `CardItem.tsx`).
- Không thêm dependency npm mới khi chưa hỏi.
- Lab 2 build ở chế độ static export để deploy Firebase Hosting free: không dùng tính năng cần server lúc chạy (route handler động, `cookies()`, server action). Dữ liệu theo người dùng (auth, giỏ, đơn) đọc/ghi Firestore từ client.
