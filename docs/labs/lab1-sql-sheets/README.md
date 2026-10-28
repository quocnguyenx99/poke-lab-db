# Lab 1 — SQL · ERD · Google Sheets + Apps Script (50 phút)

**Kết quả cuối**: dữ liệu thẻ được tách thành 6 bảng quan hệ, truy vấn bằng SQL thật (SQLite), lưu trên Google Sheets và mở thành REST API bằng Apps Script. Toàn bộ code do Agent viết và deploy qua `clasp`.

```bash
git checkout -b lab1          # làm bài trên branch riêng
git fetch origin lab1-solution  # tải lời giải để dùng "Đường tắt" khi kẹt
```

| Bước | Thời gian | Nội dung |
|---|---|---|
| 1 | 10' | Khảo sát dữ liệu → ERD → Use case |
| 2 | 15' | Chuẩn hóa dữ liệu + SQL thật với SQLite |
| 3 | 15' | Google Sheet + Apps Script API qua clasp |
| 4 | 10' | Nạp dữ liệu lên Sheet, gọi API, `QUERY()` |

---

## Bước 1 — Khảo sát dữ liệu, ERD, Use case (10')

**Prompt**
> Đọc `data/catalog/catalog.json` và `types/card.ts`. (1) Thống kê số phần tử, số giá trị khác nhau của `set`, `seller`, `character`; seller nào lặp nhiều nhất. (2) Chỉ ra field nào tính được từ field khác. (3) Kiểm tra trên dữ liệu: `year` phụ thuộc vào `set` hay vào từng thẻ? (4) Đề xuất lược đồ 3NF và vẽ Mermaid `erDiagram` vào `docs/labs/lab1-sql-sheets/erd.md`, kèm phần mở rộng cho web bán thẻ: users, favorites, orders, order_items. (5) Vẽ sơ đồ use case (Mermaid flowchart, actor Khách / Thành viên / Quản trị viên) vào `docs/labs/lab1-sql-sheets/usecase.md`.

**Kết quả mong đợi**
- 535 listing, 44 set, 37 seller. "Official PSA Store" lặp **338 lần**.
- `tier` tính từ `tierScore`; `diffPercent`, `dealRating` tính từ giá. Những field này **không nên lưu**.
- Set "Jungle" có nhiều năm (1996 bản Nhật, 1999 bản Mỹ…), nên `year` thuộc bảng `cards`.
- 6 bảng: `sets`, `cards`, `sellers`, `listings`, `price_references` (khóa ghép thẻ + grade), `pop_reports`.

**Giảng**: seller đổi số feedback thì phải sửa 338 dòng (*update anomaly*). Đó là lý do cần chuẩn hóa.

**Tự kiểm tra**: mở `erd.md` bằng Markdown Preview của VS Code/GitHub, thấy sơ đồ hiển thị.

**Đường tắt**: `git checkout origin/lab1-solution -- docs/labs/lab1-sql-sheets/erd.md docs/labs/lab1-sql-sheets/usecase.md`

---

## Bước 2 — Chuẩn hóa + SQL thật với SQLite (15')

**Prompt**
> Theo ERD trong `erd.md`:
> 1. Viết `scripts/labs/export-normalized.mjs` (Node thuần, không cài thư viện): đọc catalog, ghi `data/normalized/<bảng>.json` và `.csv`. Id thẻ phải ổn định giữa các lần chạy (hash của character+set+year+variant+name). Nếu cùng (thẻ, grade) có 2 giá PriceCharting khác nhau thì KHÔNG tự chọn, ghi vào `data/normalized/_conflicts.csv`.
> 2. Viết `docs/labs/lab1-sql-sheets/schema.sql` (SQLite): PRIMARY KEY, FOREIGN KEY, CHECK, INDEX, và VIEW `v_listing_deals` tính tier + % chênh lệch so với PriceCharting.
> 3. Viết `docs/labs/lab1-sql-sheets/queries.sql`: mỗi câu mở đầu bằng dòng `-- Qn: <mô tả>`, gồm WHERE/ORDER BY, JOIN + GROUP BY + HAVING, dùng VIEW, subquery, và Q10 tìm listing có giá < 5% giá PriceCharting.
> 4. Viết `scripts/labs/sqlite-demo.mjs` dùng `node:sqlite` nạp schema + dữ liệu rồi in kết quả từng query bằng `console.table`.
> Chạy cả hai script và báo số dòng từng bảng.

```bash
node scripts/labs/export-normalized.mjs
node scripts/labs/sqlite-demo.mjs
```

**Kết quả mong đợi**: `sets 44`, `cards 253`, `sellers 37`, `listings 535`, `price_references 269`, `pop_reports 148`, `_conflicts 11`.

**Tự kiểm tra**
- Q1 đếm đúng 535 listing.
- Q10 trả về **13 listing giá $1.01**. Đây là **lỗi dữ liệu thật**: app đang gắn nhãn "SIÊU HỜI −99%" cho chúng. Hỏi lớp: Agent có nên tự sửa giá không? (Không. Phải xác minh trên sàn trước.)
- `_conflicts.csv` có 11 dòng: cùng một thẻ cùng grade nhưng có 2 giá tham chiếu. Chuẩn hóa đã **làm lộ** dữ liệu không nhất quán.

**Đường tắt**: `git checkout origin/lab1-solution -- scripts/labs docs/labs/lab1-sql-sheets`

---

## Bước 3 — Google Sheet + Apps Script API qua clasp (15')

Yêu cầu: đã bật Apps Script API và đã `clasp login` (xem [chuẩn bị](../README.md#chuẩn-bị-trước-buổi-học)).

**Prompt**
> Tạo database trên Google Sheets điều khiển bằng Apps Script, dùng clasp 3.4.1:
> 1. Tạo thư mục `apps-script/`, trong đó chạy `npx @google/clasp@3.4.1 create --type sheets --title "Poke Lab DB" --rootDir .` **trước khi viết code** (lệnh này ghi đè `appsscript.json`).
> 2. Sửa `appsscript.json`: runtime V8, timeZone Asia/Ho_Chi_Minh, `webapp` với `executeAs: USER_DEPLOYING`, `access: ANYONE_ANONYMOUS`.
> 3. `Schema.js`: object `TABLES` = tên tab → danh sách cột, đúng ERD (cả users, favorites, orders, order_items), và khóa chính từng bảng.
> 4. `Setup.js`: hàm `setupSheets()` tạo tab + header in đậm, sinh `API_TOKEN` (UUID) lưu vào Script Properties rồi `Logger.log` ra, và tạo tab `reports` dùng hàm `QUERY()`.
> 5. `Api.js`: `doGet` hỗ trợ `?table=<tên>` có lọc theo cột (vd `&grade=10`) và `?view=catalog` (ghép các bảng như VIEW); `doPost` nhận JSON `{token, action, table, ...}` với `action` = `import` (ghi hàng loạt, có `replace`), `insert`/`delete` (chỉ cho bảng người dùng). Bắt buộc đúng token, dùng `LockService`, tự kiểm tra trùng khóa chính. Lỗi trả `{ok:false, error}`.
> 6. Thêm `.claspignore` chỉ đẩy `*.js` và `appsscript.json`, rồi chạy `npx @google/clasp@3.4.1 push`.

**Bạn tự làm** (cần bấm cấp quyền, Agent không làm thay được):
1. `cd apps-script && npx @google/clasp@3.4.1 open-container` để mở Sheet.
2. **Tiện ích mở rộng → Apps Script** → chọn hàm `setupSheets` → **Chạy** → cấp quyền (*Nâng cao → Đi tới… (không an toàn)* là bình thường với script của chính mình).
3. Mở **Nhật ký thực thi** và copy `API_TOKEN`.

**Prompt (deploy)**
> Chạy `npx @google/clasp@3.4.1 deploy -d "v1"` trong `apps-script/`, lấy deploymentId và tạo URL `https://script.google.com/macros/s/<deploymentId>/exec`. Ghi vào `.env.local`: `SHEETS_API_URL=<URL>` và `SHEETS_API_TOKEN=<token tôi dán>`.

**Tự kiểm tra**: mở `<URL>?table=sets` trên trình duyệt, thấy `{"ok":true,"count":0,"rows":[]}`. Sheet có 10 tab bảng + tab `reports`.

> Sửa code sau khi đã deploy thì phải `push` rồi `deploy -i <deploymentId>` để cập nhật **cùng một URL**.

**Đường tắt**: `git checkout origin/lab1-solution -- apps-script` rồi làm tiếp từ mục 6 (`push`).

---

## Bước 4 — Nạp dữ liệu, gọi API, QUERY (10')

**Prompt**
> Viết `scripts/labs/push-to-sheets.mjs`: đọc `SHEETS_API_URL`, `SHEETS_API_TOKEN` từ `.env.local` (dùng `process.loadEnvFile`), gửi `data/normalized/<bảng>.json` lên Web App bằng `action: 'import'` theo lô 200 dòng (lô đầu `replace: true`), theo thứ tự sets → cards → sellers → listings → price_references → pop_reports. Cuối cùng gọi `GET ?table=listings` và in số dòng. Chạy script.

```bash
node scripts/labs/push-to-sheets.mjs
```

**Kết quả mong đợi**: `Kiểm tra GET ?table=listings → 535 dòng`.

**Tự kiểm tra trên trình duyệt**
- `<URL>?table=sellers` → 37 seller.
- `<URL>?table=listings&grade=9` → chỉ listing PSA 9.
- Tab `reports` trong Sheet: hàm `QUERY()` hiển thị kết quả (cú pháp gần giống SQL nhưng **không JOIN được**).

**Đường tắt**: `git checkout origin/lab1-solution -- scripts/labs/push-to-sheets.mjs`

---

## Tổng kết (thảo luận 3')
1. Google Sheets thiếu gì so với RDBMS? (khóa ngoại, transaction, kiểu dữ liệu, JOIN.) Code Apps Script đã bù bằng gì? (`LockService`, tự kiểm tra trùng khóa, `?view=catalog` thay JOIN.)
2. Token trong `doPost` bảo vệ được gì? `doGet` có lộ dữ liệu không?
3. Vì sao `order_items` lưu lại giá lúc đặt dù `listings` đã có giá?

## Bài về nhà
- Cho app đọc dữ liệu từ Sheet: tạo `lib/data-source.ts` chọn nguồn theo `DATA_SOURCE=json|sheets`, chuyển dữ liệu chuẩn hóa về kiểu `PokemonCard`, dùng trong `app/page.tsx`. (Lời giải: `git diff main origin/lab1-solution -- lib app`.)
- Chuyển `schema.sql` sang PostgreSQL (Supabase/Neon free) và chạy lại `queries.sql`.
