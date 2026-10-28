# Snorlax × Munchlax — PSA Market Atlas

Web app Next.js tra cứu **535 thẻ Pokémon Snorlax & Munchlax đã chấm điểm PSA**: giá Buy It Now trên eBay / Fanatics Collect, giá tham chiếu PriceCharting, xếp hạng tiềm năng S → F, PSA population, chế độ danh mục P/P < 400 triệu VNĐ.

Repo này đồng thời là **bài thực hành Database với Agent** (2 tiếng). Đọc trước: [docs/labs/README.md](docs/labs/README.md) (lịch học, chuẩn bị, xử lý sự cố).

| Lab | Nội dung | Tài liệu |
|---|---|---|
| Lab 1 | SQL · ERD · Use case · Google Sheets + Apps Script (clasp) | [docs/labs/lab1-sql-sheets](docs/labs/lab1-sql-sheets/README.md) |
| Lab 2 | NoSQL · Firestore · Firebase Auth · Shop demo · Firebase Hosting | [docs/labs/lab2-firebase-nosql](docs/labs/lab2-firebase-nosql/README.md) |

## Chạy app

Cần Node.js 22.13+ (kiểm tra: `node -v`).

```bash
npm install
npm run dev          # http://localhost:4173
```

Windows: nhấp đúp `CHAY_WINDOWS.bat`. macOS/Linux: `sh chay_mac_linux.sh`.

Lệnh khác:

```bash
npm run build        # build production
npm test             # unit test
npx tsc --noEmit     # kiểm tra kiểu TypeScript
```

## Cấu trúc

```
app/                 Next.js App Router (page, layout, API routes)
components/          Giao diện React (Dashboard giữ state, các component con)
lib/                 Logic nghiệp vụ (utils.ts) và hằng số (constants.ts)
types/card.ts        Kiểu PokemonCard — schema của catalog
data/catalog/        catalog.json — nguồn dữ liệu gốc (535 thẻ)
public/assets/cards/ Ảnh thẻ (.webp), tên file = id thẻ
scripts/             Module eBay / graded research (có unit test)
tests/               Unit test (node:test)
docs/labs/           Đề bài và hướng dẫn 2 lab
```

Phiên bản cũ (HTML 1 file, server Node, script cào dữ liệu) được giữ ở branch/tag `legacy-snapshot`.

> Dữ liệu giá và ảnh lấy từ listing công khai, chỉ phục vụ mục đích học tập và nghiên cứu.
