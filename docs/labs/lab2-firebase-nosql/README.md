# Lab 2 — NoSQL với Firebase: web bán thẻ có đăng nhập (55 phút)

**Kết quả cuối**: web bán thẻ demo public tại `https://<project-id>.web.app`, gồm:
- dữ liệu thẻ trên **Cloud Firestore**;
- đăng ký / đăng nhập bằng **Firebase Auth** (email và Google);
- yêu thích, giỏ hàng, đặt hàng giả lập lưu theo từng người dùng;
- **Security Rules** chặn người này đọc đơn của người khác.

Tất cả dùng gói **Spark (miễn phí, không cần thẻ)**. Ảnh thẻ vẫn nằm trong `public/` và được Hosting phục vụ, vì Cloud Storage yêu cầu gói Blaze.

```bash
# Clone bản mới, KHÔNG dùng lại thư mục Lab 1
git clone https://github.com/quocnguyenx99/poke-lab-db.git poke-lab2
cd poke-lab2
npm install
git checkout -b lab2
git fetch origin lab2-solution     # lời giải để dùng "Đường tắt"
```

| Bước | Thời gian | Nội dung |
|---|---|---|
| 1 | 5' | Thiết kế document model, so với ERD Lab 1 |
| 2 | 10' | Nạp 535 thẻ lên Firestore |
| 3 | 15' | Firebase Auth: đăng ký, đăng nhập, đăng xuất |
| 4 | 15' | Yêu thích, giỏ hàng, đặt hàng, xem đơn |
| 5 | 10' | Security Rules + deploy Firebase Hosting |

---

## Chuẩn bị (trước buổi học)

Làm trên <https://console.firebase.google.com>:
1. **Add project**, tên ví dụ `poke-lab-<tên>`. Tắt Google Analytics cho nhanh. Ghi lại **Project ID**.
2. **Build → Firestore Database → Create database**: chọn location `asia-southeast1` (Singapore) và **Start in production mode**.
3. **Build → Authentication → Get started**: bật **Email/Password** và **Google**.
4. **Project settings (⚙) → General → Your apps → Web (`</>`)**: đăng ký app (không tick Hosting), copy object `firebaseConfig`.
5. **Project settings → Service accounts → Generate new private key**: lưu file thành `secrets/service-account.json` trong repo. Thư mục `secrets/` đã có trong `.gitignore`. **Tuyệt đối không commit file này.**
6. Tạo `.env.local` từ `.env.example`, điền 6 biến `NEXT_PUBLIC_FIREBASE_*` từ `firebaseConfig`.

> API key trong `firebaseConfig` **không phải bí mật**: nó luôn lộ ra trình duyệt. Bảo vệ dữ liệu là việc của Security Rules (bước 5). Còn service account key thì **là bí mật**: có nó là có toàn quyền project.

---

## Bước 1 — Thiết kế document model (5')

**Prompt**
> Thiết kế mô hình dữ liệu Firestore cho web bán thẻ dựa trên `data/catalog/catalog.json` và `types/card.ts`. Collections: `cards/{listingId}` (nhúng `set`, `seller`, `priceRef`, `pop` vào trong document), `users/{uid}` với subcollection `favorites/{listingId}` và `cart/{listingId}`, `orders/{orderId}` (gồm `userId`, `items[]` chụp lại tên + giá lúc đặt, `totalUSD`, `status: 'pending'`, `createdAt`). Viết vào `docs/labs/lab2-firebase-nosql/model.md`: cây collection, một document mẫu của mỗi loại, và bảng so sánh với 6 bảng SQL của Lab 1 (cái gì nhúng, cái gì tham chiếu, vì sao).

**Giảng (2')**
- SQL tách `sellers` ra để không lặp. Firestore **nhúng** seller vào từng card, vì đọc 1 document là đủ thông tin, không có JOIN. Cái giá phải trả: đổi thông tin seller thì phải cập nhật 338 document.
- Firestore tính tiền theo **số lần đọc/ghi document**. Mô hình đúng là mô hình **khớp với cách màn hình đọc dữ liệu**.

**Đường tắt**: `git checkout origin/lab2-solution -- docs/labs/lab2-firebase-nosql/model.md`

---

## Bước 2 — Nạp 535 thẻ lên Firestore (10')

**Prompt**
> Cài `firebase-admin` làm devDependency. Viết `scripts/labs/seed-firestore.mjs`: đọc `.env.local` bằng `process.loadEnvFile`, khởi tạo Admin SDK bằng `secrets/service-account.json`, chuyển mỗi phần tử catalog thành document theo `model.md` (id document = `id` của thẻ), ghi bằng batch 400 document/lần, in tiến độ và tổng số. Chạy script.

```bash
node scripts/labs/seed-firestore.mjs
```

**Kết quả mong đợi**: `Đã ghi 535 document vào cards`.

**Tự kiểm tra**: Firebase Console → Firestore → `cards` → mở một document, thấy `seller`, `priceRef` là **map lồng bên trong**.

**Giảng**: Admin SDK bỏ qua Security Rules, vì vậy chỉ được chạy trên máy dev hoặc server, không bao giờ chạy ở trình duyệt. Gói Spark cho 20.000 lượt ghi/ngày, mỗi lần seed tốn 535.

**Đường tắt**: `git checkout origin/lab2-solution -- scripts/labs/seed-firestore.mjs package.json package-lock.json && npm install`

---

## Bước 3 — Đăng ký, đăng nhập (15')

**Prompt**
> Cài `firebase` (client SDK). Thêm đăng nhập cho app Next.js 16 (App Router), app sẽ build **static export** nên chỉ dùng client component cho phần auth:
> 1. `lib/firebase.ts`: khởi tạo app từ các biến `NEXT_PUBLIC_FIREBASE_*`, export `auth`, `db`, `googleProvider`.
> 2. `components/AuthProvider.tsx`: React context `{ user, loading }` dùng `onAuthStateChanged`, export hook `useAuth()`. Bọc `{children}` trong `app/layout.tsx`.
> 3. `app/login/page.tsx` và `app/register/page.tsx`: form email + mật khẩu và nút "Đăng nhập bằng Google" (popup). Lỗi hiển thị tiếng Việt. Thành công thì quay về `/`. Khi đăng ký, tạo document `users/{uid}` (`email`, `displayName`, `createdAt`).
> 4. `components/Header.tsx`: chưa đăng nhập thì hiện nút "Đăng nhập"; đã đăng nhập thì hiện email, "Giỏ hàng", "Đơn hàng", "Đăng xuất".
> 5. Thêm banner nhỏ trên cùng "Website demo phục vụ học tập — không bán hàng thật".
> Dùng class CSS có sẵn trong `app/globals.css` (`small-button`, biến `--sb-*`). Chạy `npx tsc --noEmit`.

**Tự kiểm tra** (`npm run dev`)
- Đăng ký `a@test.com`, thấy email trên header. Firebase Console → Authentication có user mới, Firestore có `users/{uid}`.
- Đăng xuất rồi đăng nhập bằng Google.
- Reload trang, vẫn giữ trạng thái đăng nhập.

**Đường tắt**: `git checkout origin/lab2-solution -- lib/firebase.ts components/AuthProvider.tsx app/login app/register app/layout.tsx components/Header.tsx package.json package-lock.json && npm install`

---

## Bước 4 — Yêu thích, giỏ hàng, đặt hàng (15')

**Prompt**
> Thêm tính năng mua hàng (giả lập, không thanh toán), tất cả gọi Firestore từ client:
> 1. `lib/shop.ts`: `toggleFavorite`, `subscribeFavorites`, `addToCart` (đọc giá từ document `cards/{id}` trên Firestore, **không** tin giá phía client), `removeFromCart`, `subscribeCart`, `placeOrder` (dùng `writeBatch`: tạo document `orders` với `items[]` chụp tên + giá + ảnh, `totalUSD`, `status:'pending'`, `serverTimestamp()`, rồi xóa giỏ), `getMyOrders` (query `where('userId','==',uid)`).
> 2. `components/Dashboard.tsx`: đã đăng nhập thì trái tim yêu thích đồng bộ Firestore; chưa đăng nhập thì giữ localStorage như cũ.
> 3. `components/CardItem.tsx`: thêm nút "＋ Giỏ" vào `actionline`; chưa đăng nhập thì chuyển tới `/login`.
> 4. `app/cart/page.tsx`: danh sách giỏ, tổng tiền (dùng `money()` trong `lib/utils.ts`, hiển thị VNĐ), nút "Đặt hàng". `app/orders/page.tsx`: lịch sử đơn, mới nhất trước (sắp xếp phía client).
> Chạy `npx tsc --noEmit`.

**Tự kiểm tra**
- Thêm 2 thẻ vào giỏ, vào `/cart`, đặt hàng. `/orders` có 1 đơn, giỏ trống.
- Firestore Console: `orders/<id>` có `items` là **mảng map** và `userId` đúng.
- Yêu thích 1 thẻ, mở trình duyệt khác và đăng nhập cùng tài khoản: thẻ vẫn được yêu thích (dữ liệu nằm trên cloud chứ không còn ở localStorage).

**Giảng**: vì sao `items[]` chép lại giá thay vì chỉ lưu `listingId`? (Giá đổi thì đơn cũ không được đổi theo. Đây là phi chuẩn hóa có chủ đích, giống `order_items.unit_price_usd` ở Lab 1.)

**Đường tắt**: `git checkout origin/lab2-solution -- lib/shop.ts components app/cart app/orders`

---

## Bước 5 — Security Rules + public lên Firebase Hosting (10')

**Prompt**
> 1. Viết `firestore.rules`: `cards` ai cũng đọc được, không ai ghi; `users/{uid}` và mọi subcollection chỉ chủ sở hữu đọc/ghi; `orders` chỉ được tạo khi `userId == request.auth.uid`, `status == 'pending'`, `items.size() > 0`; chỉ chủ đơn được đọc; không ai sửa/xóa.
> 2. Viết `firebase.json` (firestore rules + hosting `public: "out"`, `cleanUrls: true`) và `.firebaserc` với project `<PROJECT_ID>`.
> 3. Bật static export: `next.config.mjs` thêm `output: 'export'` và `images: { unoptimized: true }`; thêm `export const dynamic = 'force-static'` vào `app/api/catalog/route.ts` và `app/api/health/route.ts`. Chạy `npm run build`, kiểm tra thư mục `out/` có `index.html`, `login.html`, `cart.html`, `orders.html`.
> 4. Deploy: `npx firebase-tools@15.34.1 deploy --only firestore:rules,hosting`. In ra URL Hosting.

**Tự kiểm tra trên `https://<project-id>.web.app`**
- Đăng nhập, đặt hàng, thấy đơn.
- Đăng nhập tài khoản thứ hai: `/orders` **không** thấy đơn của tài khoản đầu.
- Firebase Console → Firestore → **Rules → Rules Playground**: giả lập `get /orders/<id>` với một uid khác → **Denied**.

**Giảng**
- Hosting miễn phí chỉ phục vụ file tĩnh, nên app phải build ra HTML/JS. Danh sách thẻ được "chụp" lúc build; dữ liệu theo người dùng thì trình duyệt gọi thẳng Firestore. Rules là **lớp bảo vệ duy nhất** giữa người dùng và database.
- Rules **không phải bộ lọc**: query không có `where('userId','==',uid)` sẽ bị từ chối toàn bộ, chứ không được trả về một phần.
- Lỗ hổng còn lại: `totalUSD` do client gửi lên, nên người dùng sửa được. Shop thật phải tính tiền ở server (Cloud Functions, cần gói Blaze). Bài về nhà: viết rule kiểm tra `totalUSD > 0`, và giải thích vì sao vẫn chưa đủ.

**Đường tắt**: `git checkout origin/lab2-solution -- firestore.rules firebase.json next.config.mjs app/api`

---

## Tổng kết: SQL hay NoSQL? (5')

| Tiêu chí | Lab 1 (SQL/Sheets) | Lab 2 (Firestore) |
|---|---|---|
| Thay đổi thông tin seller | Sửa 1 dòng | Sửa 338 document |
| Hiển thị 1 thẻ đầy đủ | JOIN 5 bảng | Đọc 1 document |
| Truy vấn tùy ý (GROUP BY, báo cáo) | Mạnh | Yếu, phải thiết kế trước |
| Ràng buộc dữ liệu | FOREIGN KEY, CHECK | Security Rules + code |
| Phân quyền theo người dùng | Tự viết ở API | Rules + Auth tích hợp sẵn |
| Realtime, mở rộng | Phải tự làm | Có sẵn |

## Bài về nhà
- Admin: thêm custom claim `admin` và rule cho phép admin sửa `cards`.
- Dùng tài khoản Blaze (hoặc của giảng viên) upload 20 ảnh lên Cloud Storage, lưu `imageUrl` vào document.
