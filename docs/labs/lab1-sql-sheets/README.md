# Lab 1 — SQL, ERD, Use Case với Google Sheets + Apps Script (Agent điều khiển)

**Thời lượng**: ~90 phút · **Yêu cầu**: Node.js 22+, tài khoản Google, một AI coding Agent (Claude Code…)

## Mục tiêu
1. Đọc dữ liệu thật và nhận ra vì sao một bảng phẳng gây ra **dư thừa và bất thường khi cập nhật**.
2. Chuẩn hóa thành **ERD 3NF**, viết **DDL** và các câu **SQL** (JOIN, GROUP BY, HAVING, VIEW, subquery).
3. Vẽ **Use case** và ánh xạ từng use case sang bảng/câu lệnh.
4. Dùng **Google Sheets làm kho dữ liệu** và **Apps Script làm REST API**. Agent viết code, `clasp push`, `clasp deploy`.
5. Cho web app Next.js đọc dữ liệu từ Sheets thay vì file JSON.
6. Biết **nghiệm thu** kết quả của Agent bằng con số kiểm chứng được.

## Bắt đầu

```bash
git clone <repo> && cd pokemon-tcg
git checkout -b lab1-<ten-ban>              # làm bài trên branch riêng
npm install
npm run dev                                  # http://localhost:4173 — app đang đọc data/catalog/catalog.json
```

> Mỗi bước dưới đây có: **Prompt** (dán cho Agent), **Kết quả mong đợi**, **Tự kiểm tra**. Đừng chấp nhận kết quả của Agent nếu chưa tự kiểm tra.
> Bị kẹt? Lời giải tham khảo ở branch `lab1-solution` (`git diff main lab1-solution` để xem toàn bộ thay đổi).

---

## Bước 1 — Khảo sát dữ liệu (10')

**Prompt**
> Đọc `data/catalog/catalog.json` và `types/card.ts`. Thống kê: số phần tử, số giá trị khác nhau của `set`, `seller`, `character`. Seller nào lặp lại nhiều nhất và bao nhiêu lần? Có field nào tính được từ field khác không? Trình bày dạng bảng, chưa viết code vào repo.

**Kết quả mong đợi**: 535 listing, 44 set, 37 seller. "Official PSA Store" lặp 338 lần. `tier` tính được từ `tierScore`, `diffPercent` tính được từ giá niêm yết và giá PriceCharting.

**Thảo luận**: nếu "Official PSA Store" đổi số feedback thì phải sửa bao nhiêu dòng? Đó là *update anomaly*.

## Bước 2 — Thiết kế ERD (15')

**Prompt**
> Đề xuất lược đồ quan hệ đạt 3NF cho dữ liệu này. Với mỗi bảng: khóa chính, khóa ngoại, và lý do tách (phụ thuộc hàm nào). Kiểm tra trên dữ liệu thật xem `year` phụ thuộc vào `set` hay vào thẻ. Vẽ bằng Mermaid `erDiagram` vào `docs/labs/lab1-sql-sheets/erd.md`. Thêm phần mở rộng cho website bán thẻ: users, favorites, orders, order_items.

**Tự kiểm tra**: mở `erd.md` trên GitHub/VS Code (Mermaid preview). Tự hỏi: mỗi cột không phải khóa có phụ thuộc vào *toàn bộ* khóa và *chỉ* khóa không?
Gợi ý: set "Jungle" có nhiều năm, nên `year` thuộc về `cards`.

## Bước 3 — Use case (10')

**Prompt**
> Vẽ sơ đồ use case (Mermaid flowchart) cho website tra cứu & bán thẻ: actor Khách, Thành viên, Quản trị viên. Kèm bảng ánh xạ use case → bảng đọc/ghi. Lưu vào `docs/labs/lab1-sql-sheets/usecase.md`.

## Bước 4 — Chuẩn hóa dữ liệu + SQL thật với SQLite (20')

**Prompt**
> Viết `scripts/labs/export-normalized.mjs` (Node thuần, không thêm thư viện) chuyển catalog thành các bảng theo ERD, ghi `data/normalized/<bảng>.csv` và `.json`. Id thẻ phải ổn định giữa các lần chạy. Nếu cùng một (thẻ, grade) có 2 giá PriceCharting khác nhau thì KHÔNG tự chọn mà ghi vào `data/normalized/_conflicts.csv`.
> Sau đó viết `docs/labs/lab1-sql-sheets/schema.sql` (có PRIMARY KEY, FOREIGN KEY, CHECK, INDEX và VIEW `v_listing_deals` tính tier/% chênh lệch), `queries.sql` (ít nhất 8 câu dùng JOIN, GROUP BY, HAVING, subquery), và `scripts/labs/sqlite-demo.mjs` dùng `node:sqlite` để nạp dữ liệu rồi chạy toàn bộ query.

```bash
node scripts/labs/export-normalized.mjs
node scripts/labs/sqlite-demo.mjs                        # chạy trong RAM
node scripts/labs/sqlite-demo.mjs data/normalized/atlas.db   # lưu file, mở bằng DB Browser for SQLite / DBeaver
```

**Kết quả mong đợi**: `listings 535`, `cards 253`, `sets 44`, `sellers 37`, `_conflicts 11`.

**Tự kiểm tra**
- Q1 trong `queries.sql` đếm đúng 535 listing.
- Thử `INSERT` một listing có `card_id` không tồn tại. SQLite phải báo lỗi `FOREIGN KEY constraint failed`.
- Query Q10 (giá < 5% PriceCharting) trả về 13 listing giá $1.01. **Đây là lỗi dữ liệu thật trong app** (app đang gắn nhãn "SIÊU HỜI"). Thảo luận: Agent có nên tự sửa giá không? (Không. Phải xác minh trên sàn trước.)

## Bước 5 — Google Sheets + Apps Script qua clasp (25')

### 5.1 Việc bạn tự làm (Agent không đăng nhập thay bạn được)
1. Bật Apps Script API: <https://script.google.com/home/usersettings> → **On**.
2. Đăng nhập clasp: `npx @google/clasp login` (mở trình duyệt, chọn tài khoản Google).

### 5.2 Giao cho Agent

**Prompt**
> Trong thư mục `apps-script/`, viết Apps Script (V8) cho một Google Sheet đóng vai database:
> - `Schema.js`: định nghĩa các tab = bảng theo ERD (kể cả users, favorites, orders, order_items) và khóa chính.
> - `Setup.js`: `setupSheets()` tạo tab + header, sinh `API_TOKEN` lưu trong Script Properties, tạo tab `reports` dùng hàm `QUERY()`.
> - `Api.js`: Web App `doGet` (`?table=` có lọc theo cột, `?view=catalog` ghép các bảng như một VIEW) và `doPost` (`import` hàng loạt, `insert`/`delete` cho bảng người dùng, bắt buộc token, dùng `LockService`, tự kiểm tra trùng khóa chính).
> Sau đó dùng clasp: tạo project gắn với một Google Sheet mới tên "Pokemon Atlas DB", push code, và hướng dẫn tôi chạy `setupSheets` một lần.

Lệnh Agent sẽ chạy (tham khảo):
```bash
cd apps-script
npx @google/clasp create --type sheets --title "Pokemon Atlas DB" --rootDir .
git checkout -- appsscript.json      # clasp create có thể ghi đè manifest — khôi phục bản của repo
npx @google/clasp push
npx @google/clasp open-container     # mở Sheet
```

### 5.3 Chạy `setupSheets` (bạn tự bấm, lần đầu Google sẽ hỏi cấp quyền)
Trong Sheet: **Tiện ích mở rộng → Apps Script** → chọn hàm `setupSheets` → **Chạy** → cấp quyền → mở **Nhật ký thực thi**, copy `API_TOKEN`.

### 5.4 Deploy Web App và nạp dữ liệu

**Prompt**
> Deploy Apps Script thành Web App (`npx @google/clasp deploy`), lấy URL `/exec`. Ghi `SHEETS_API_URL` và `SHEETS_API_TOKEN` vào `.env.local`. Viết `scripts/labs/push-to-sheets.mjs` nạp `data/normalized/*.json` lên Sheets theo lô 200 dòng, rồi gọi `GET ?table=listings` để xác nhận số dòng.

```bash
node scripts/labs/push-to-sheets.mjs
```

**Kết quả mong đợi**: in `listings 535 dòng` … và `Kiểm tra GET ?table=listings → 535 dòng`. Mở Sheet: có 6 tab dữ liệu, tab `reports` hiện kết quả `QUERY()`.

> Lần deploy đầu, nếu GET trả về trang HTML đăng nhập thay vì JSON: vào Apps Script → **Triển khai → Quản lý** và kiểm tra **Ai có quyền truy cập = Bất kỳ ai**.

**Tự kiểm tra bằng trình duyệt**
- `<URL>?table=sellers` → 37 seller.
- `<URL>?table=listings&grade=9` → các listing PSA 9.

## Bước 6 — App đọc dữ liệu từ Sheets (10')

**Prompt**
> Tạo `lib/data-source.ts` với `getCatalog()` chọn nguồn theo env `DATA_SOURCE` (`json` mặc định, `sheets` gọi `SHEETS_API_URL?view=catalog`). Chuyển dữ liệu chuẩn hóa về đúng kiểu `PokemonCard` hiện có, tính lại `tier` và `diffPercent` thay vì đọc từ bảng. Cho `app/page.tsx` và `app/api/catalog/route.ts` dùng `getCatalog()`. Chạy `npx tsc --noEmit`.

```bash
# .env.local: DATA_SOURCE=sheets
npm run dev
```

**Tự kiểm tra**
- Trang chủ hiển thị đủ thẻ. `http://localhost:4173/api/catalog` trả 535 phần tử.
- Sửa giá 1 dòng trong tab `listings` trên Sheet, reload trang (chế độ dev) và thấy giá đổi. Bạn vừa có một "CMS" bằng Google Sheets.
- So sánh với `DATA_SOURCE=json`: 11 thẻ có giá PriceCharting khác nhau. Vì sao? (Xem `_conflicts.csv`.)

---

## Câu hỏi ôn tập
1. Google Sheets thiếu những gì so với một RDBMS? (khóa ngoại, transaction, kiểu dữ liệu chặt, JOIN, đồng thời ghi.) Code Apps Script đã bù những điểm nào? (`LockService`, kiểm tra trùng khóa, `catalogView_` thay cho JOIN.)
2. Vì sao `order_items` lưu `unit_price_usd` dù đã có `listings.price_usd`?
3. Hàm `QUERY()` của Sheets giống và khác SQL ở đâu?
4. Token trong `doPost` bảo vệ được gì và **không** bảo vệ được gì? (URL `doGet` vẫn công khai.)

## Bài tập mở rộng
- Viết thêm Q11: tổng giá trị danh mục P/P theo tier, chỉ tính listing không nằm trong danh sách Q10.
- Thêm API `?action=topDeals&tier=S` trong Apps Script.
- Chuyển `schema.sql` sang PostgreSQL (Supabase/Neon free) và chạy lại `queries.sql`.
