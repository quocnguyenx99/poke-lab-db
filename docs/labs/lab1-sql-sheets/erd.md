# ERD — Catalog thẻ PSA (sau chuẩn hóa)

## Từ 1 bảng phẳng thành 6 bảng

Mỗi object trong `data/catalog/catalog.json` trộn lẫn nhiều thực thể. Ví dụ, thông tin seller "Official PSA Store" bị lặp lại ở **338 dòng**. Khi cần sửa số giao dịch của seller này, ta phải sửa 338 chỗ (**update anomaly**).

| Nhóm field trong JSON | Phụ thuộc vào | Bảng |
|---|---|---|
| `set` | tên set | `sets` |
| `character`, `name`, `variant`, `year` | bản in thẻ | `cards` |
| `seller`, `sellerHref`, `sellerBadge`, `sellerTransactions`, `sellerFeedback` | người bán | `sellers` |
| `id`, `grade`, `listingPriceUSD`, `listingUrl`, `image`, `tierScore`… | tin đăng bán | `listings` |
| `pricecharting`, `priceChartingUrl` | (thẻ, grade) | `price_references` |
| `psa10pop`, `psaTotal` | thẻ | `pop_reports` |
| `tier`, `diffPercent`, `dealRating` | **tính ra được** từ các cột khác | không lưu, dùng VIEW `v_listing_deals` |

Lưu ý: `year` thuộc bảng `cards` chứ không thuộc `sets`, vì cùng tên set "Jungle" có cả bản Nhật 1996 và bản Mỹ 1999. Đây là một phụ thuộc hàm (functional dependency) mà ta chỉ phát hiện được khi nhìn vào dữ liệu thật.

## Sơ đồ

```mermaid
erDiagram
    sets ||--o{ cards : "có"
    cards ||--o{ listings : "được bán qua"
    sellers ||--o{ listings : "đăng"
    cards ||--o{ price_references : "giá tham chiếu theo grade"
    cards ||--o| pop_reports : "population"

    sets {
        TEXT set_id PK
        TEXT set_name
    }
    cards {
        TEXT card_id PK
        TEXT character "Snorlax | Munchlax"
        TEXT set_id FK
        TEXT card_name
        TEXT variant
        INTEGER year
    }
    sellers {
        TEXT seller_id PK
        TEXT seller_name
        TEXT store_url
        TEXT badge
        INTEGER transactions
        REAL feedback_pct
    }
    listings {
        TEXT listing_id PK
        TEXT card_id FK
        TEXT seller_id FK
        TEXT marketplace "ebay | fanatics"
        TEXT listing_type "BUY_IT_NOW | BUY_NOW"
        REAL grade
        REAL price_usd
        TEXT listing_url
        TEXT image_path
        INTEGER tier_score
    }
    price_references {
        TEXT card_id PK, FK
        REAL grade PK
        TEXT source PK
        REAL price_usd
        TEXT url
    }
    pop_reports {
        TEXT card_id PK, FK
        INTEGER psa10_pop
        INTEGER psa_total
    }
```

## Mở rộng cho website bán thẻ

```mermaid
erDiagram
    users ||--o{ favorites : "thích"
    listings ||--o{ favorites : "được thích"
    users ||--o{ orders : "đặt"
    orders ||--|{ order_items : "gồm"
    listings ||--o{ order_items : "được mua"

    users {
        TEXT user_id PK
        TEXT email
        TEXT display_name
        TEXT created_at
    }
    favorites {
        TEXT user_id PK, FK
        TEXT listing_id PK, FK
        TEXT created_at
    }
    orders {
        TEXT order_id PK
        TEXT user_id FK
        TEXT status "pending | paid | cancelled"
        REAL total_usd
        TEXT created_at
    }
    order_items {
        TEXT order_id PK, FK
        TEXT listing_id PK, FK
        INTEGER quantity
        REAL unit_price_usd "giá tại thời điểm đặt"
    }
```

- `favorites` là bảng nối của quan hệ **n–n** giữa `users` và `listings`.
- `order_items.unit_price_usd` lưu **bản sao giá lúc đặt hàng**. Đây là phi chuẩn hóa có chủ đích: giá listing đổi về sau thì đơn cũ vẫn phải giữ đúng số tiền đã đặt.
