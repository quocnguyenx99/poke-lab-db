# Lộ trình: đưa app lên Firebase từng bước

Làm lần lượt từng bước, xong bước nào thì đánh dấu `[x]`. Mỗi bước có phần **Tự kiểm tra**: phải tự nhìn thấy kết quả rồi mới sang bước sau.

Trước khi bắt đầu, đọc [01-phan-tich-usecase-erd.md](01-phan-tich-usecase-erd.md) để nắm mô hình dữ liệu.

## Chi phí (đọc trước)

| Dịch vụ | Gói Spark (miễn phí, không cần thẻ) | Ghi chú |
|---|---|---|
| Authentication (email, Google) | ✓ | |
| Cloud Firestore | ✓ 1 GiB lưu; mỗi ngày 50.000 đọc, 20.000 ghi, 20.000 xóa | Seed 535 thẻ tốn 535 lượt ghi |
| Hosting `*.web.app` / `*.firebaseapp.com` | ✓ 10 GB lưu, 360 MB tải/ngày | 535 ảnh khoảng 47 MB, nên lưu lượng/ngày là giới hạn cần để ý |
| Cloud Storage | ✗ **cần gói Blaze** | Blaze có hạn mức miễn phí nhưng bắt buộc gắn thẻ thanh toán. Sẽ quyết định ở Giai đoạn 4 |

## Giai đoạn 0 — Chuẩn bị

- [x] 0.1 Tạo branch làm việc `firebase-lab`
- [x] 0.2 Tạo Firebase project trên Console (gói Spark)
- [x] 0.3 Đăng ký Web app, lấy `firebaseConfig`, tạo `.env.local`
- [x] 0.4 Cài và đăng nhập Firebase CLI

## Giai đoạn 1 — Authentication

- [x] 1.1 Bật Email/Password và Google trên Console
- [x] 1.2 Cài `firebase` SDK, tạo `lib/firebase.ts`
- [x] 1.3 `AuthProvider` + hook `useAuth()`
- [x] 1.4 Trang `/login`, `/register`; Header hiện trạng thái đăng nhập

## Giai đoạn 2 — Cloud Firestore

- [x] 2.1 Tạo database (production mode, `asia-southeast1`)
- [x] 2.2 Service account + script seed 535 thẻ bằng Admin SDK
- [x] 2.3 Tạo `users/{uid}` khi đăng ký; yêu thích đồng bộ cloud
- [x] 2.4 Giỏ hàng, đặt hàng (`writeBatch`), lịch sử đơn
- [x] 2.5 Security Rules + thử bằng Rules Playground

## Giai đoạn 3 — Hosting (domain miễn phí)

- [x] 3.1 Bật static export cho Next.js, build ra `out/`
- [x] 3.2 `firebase.json`, `.firebaserc`
- [x] 3.3 Deploy, thêm domain vào Authorized domains, thử trên `https://<project-id>.web.app`

## Giai đoạn 4 — Ảnh trên Cloud Storage (tùy chọn, cần Blaze)

- [ ] 4.1 Quyết định: giữ ảnh trên Hosting, hay nâng Blaze + đặt cảnh báo ngân sách
- [ ] 4.2 Tạo bucket, Storage Rules (ai cũng đọc, chỉ admin ghi)
- [ ] 4.3 Script upload ảnh, ghi `imagePath` vào `cards`
- [ ] 4.4 UI lấy ảnh qua `getDownloadURL`

> Vì sao Hosting làm trước Storage: Hosting miễn phí hoàn toàn và cho bạn một sản phẩm public sớm. Storage là phần duy nhất cần quyết định về thanh toán.
