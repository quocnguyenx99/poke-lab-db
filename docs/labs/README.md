# Thực hành Database với AI Agent — 2 tiếng

Cùng một bộ dữ liệu thật (535 listing thẻ Pokémon PSA), học viên làm 2 cách lưu trữ và so sánh chúng:

| | Lab 1 — SQL | Lab 2 — NoSQL |
|---|---|---|
| Mô hình | Quan hệ, chuẩn hóa 3NF | Document, nhúng dữ liệu |
| Lưu trữ | SQLite (local) + Google Sheets | Cloud Firestore |
| API | Apps Script Web App (clasp) | Firebase SDK + Security Rules |
| Kết quả | Sheet có 6 bảng + REST API | Web bán thẻ có đăng nhập, giỏ hàng, đơn hàng, public trên `*.web.app` |
| Đề bài | [lab1-sql-sheets](lab1-sql-sheets/README.md) | [lab2-firebase-nosql](lab2-firebase-nosql/README.md) |

## Lịch 120 phút

| Phút | Nội dung |
|---|---|
| 0–5 | Clone repo, `npm install`, `npm run dev` (đã kiểm tra trước ở nhà) |
| 5–55 | **Lab 1**: dữ liệu → ERD → SQL → Google Sheets + Apps Script API |
| 55–60 | Nghỉ, clone bản mới cho Lab 2 |
| 60–115 | **Lab 2**: Firestore → Auth → giỏ hàng/đơn hàng → Rules → Hosting |
| 115–120 | Tổng kết: SQL hay NoSQL, khi nào dùng cái nào |

## Chuẩn bị TRƯỚC buổi học (học viên tự làm ở nhà, ~15 phút)

Thiếu bước nào trong này thì sẽ mất 10–20 phút trên lớp.

- [ ] **Node.js 22.13 trở lên**: `node -v` (phiên bản cũ hơn không có `node:sqlite`)
- [ ] **Git** và một **AI coding Agent** (Claude Code / Cursor / Copilot Agent…) đã đăng nhập
- [ ] **Tài khoản Google** (Gmail cá nhân, không dùng tài khoản công ty/trường bị chặn Apps Script)
- [ ] Clone và chạy thử:
  ```bash
  git clone https://github.com/quocnguyenx99/poke-lab-db.git
  cd poke-lab-db
  npm install
  npm run dev        # mở http://localhost:4173 → thấy lưới thẻ Snorlax
  ```
- [ ] Bật Apps Script API: <https://script.google.com/home/usersettings> → **Google Apps Script API: On**
- [ ] Đăng nhập trước 2 CLI (mỗi lệnh mở trình duyệt để chọn tài khoản Google):
  ```bash
  npx @google/clasp@3.4.1 login
  npx firebase-tools@15.34.1 login
  ```
- [ ] Tạo sẵn Firebase project (gói **Spark**, miễn phí, không cần thẻ): xem mục "Chuẩn bị" trong [Lab 2](lab2-firebase-nosql/README.md#chuẩn-bị-trước-buổi-học).

## Cách làm bài với Agent

Mỗi bước gồm 3 phần:
- **Prompt**: dán nguyên văn cho Agent. Được phép sửa, nhưng giữ các ràng buộc.
- **Kết quả mong đợi**: con số hoặc hiện tượng cụ thể.
- **Tự kiểm tra**: tự chạy lệnh và tự nhìn. Không chấp nhận "Agent bảo xong rồi".

Bị kẹt quá 3 phút thì dùng **Đường tắt** (lấy file từ lời giải) để theo kịp lớp, về nhà làm lại.

## Xử lý sự cố nhanh

| Triệu chứng | Cách xử lý |
|---|---|
| `npm run build`/`dev` báo `Invalid character` trong `node_modules/...d.ts` | Thư viện cài bị hỏng: xóa `node_modules` rồi chạy `npm ci` |
| `Cannot find module 'node:sqlite'` | Node quá cũ, cài Node 22.13+ |
| Port 4173 đang bận | `npx next dev -p 4180` |
| `clasp` báo `User has not enabled the Apps Script API` | Bật API ở script.google.com/home/usersettings, chờ 1 phút |
| Web App trả về trang HTML đăng nhập thay vì JSON | Deploy lại với quyền truy cập "Bất kỳ ai" (xem Lab 1 bước 4) |
| Firebase `auth/unauthorized-domain` | Firebase Console → Authentication → Settings → Authorized domains → thêm domain |
| Firestore `Missing or insufficient permissions` | Rules chặn đúng như thiết kế, hoặc query thiếu `where('userId','==',uid)` |
