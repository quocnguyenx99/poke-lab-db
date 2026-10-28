# Nguyên tắc toàn vẹn dữ liệu (BẮT BUỘC)

App dùng để ra quyết định mua thẻ bằng tiền thật. Một con số sai làm người dùng mất tiền, nên các quy tắc dưới đây ưu tiên hơn mọi yêu cầu "làm cho đẹp/đầy đủ".

## 1. Không bịa giá (Zero Hallucination)
- Mọi giá (`listingPriceUSD`, `manualPrice`, `pricecharting`, `ebayItemPrice`) phải lấy từ nguồn thật (listing, PriceCharting). Không ước tính bằng công thức (ví dụ nhân giá PSA 10 với 0.4 để ra PSA 9).
- Không có listing → để `null` và UI hiển thị "Chưa niêm yết", kèm link tìm kiếm trên sàn. Không điền placeholder số.
- Giá PriceCharting phải **khớp đúng grade** của thẻ (PSA 9 dùng giá PSA 9, không dùng giá PSA 10).
- Không bịa population (`psa10pop`, `psaTotal`) hay thống kê seller. Lưu ý: `getPsaBreakdown` trong `lib/utils.ts` đang **ước tính** phân bố grade 1–9 từ tổng; nếu chạm vào phần này, UI phải ghi rõ là ước tính. `scripts/enrich_sellers.py` đang gán số giao dịch seller theo bảng tra cứu/mặc định — không mở rộng cách làm này cho seller chưa xác minh.

## 2. Chỉ Buy It Now / Fixed Price
- Không bao giờ dùng giá bid đấu giá làm giá thẻ. `listingType` chỉ được là `BUY_IT_NOW` (eBay) hoặc `BUY_NOW` (Fanatics).
- `Dashboard.tsx` lọc bỏ mọi thẻ có `listingType === 'AUCTION'`, `bids > 0` hoặc `sellerBadge` chứa "auction". Giữ nguyên bộ lọc này.
- Link tìm kiếm eBay luôn có `LH_BIN=1&LH_Auction=0`; link tìm kiếm Fanatics luôn có `type=FIXED` (không bao giờ `type=WEEKLY`).

## 3. Toàn vẹn link
- Thẻ Fanatics: `listingUrl` là link sản phẩm trực tiếp `https://www.fanaticscollect.com/buy-now/{id}/{slug}`.
- `ebayItemUrl` chỉ được gán khi listing đó **đúng thẻ, đúng grade**. Nghi ngờ → xóa field, để `ebayLink()` fallback sang link tìm kiếm.
- Từ khóa tìm kiếm phải sạch: bỏ `#`, không lặp tên nhân vật, không lẫn grade cũ (dùng `cleanCardKeyword`).
- Chỉ chấp nhận URL https thuộc domain thật (`ebay.com`, `fanaticscollect.com`, `pricecharting.com`) — xem cách `scripts/ebay-market.js` từ chối URL giả mạo.

## 4. Chỉ PSA
- `slabCompany` luôn là `'PSA'`. Không thêm thẻ CGC/BGS/SGC hoặc thẻ raw.
- Chỉ Snorlax và Munchlax (`character`). Cẩn thận từ khóa "Munch" kéo nhầm thẻ thể thao (Mike Munchak).

## 5. Ảnh
- Ảnh phải là ảnh thật của đúng thẻ/đúng slab. Không ghép, không dùng ảnh thẻ khác thay thế. Không có ảnh → để UI hiển thị placeholder.
