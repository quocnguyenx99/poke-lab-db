# Dữ liệu (`data/`)

```text
data/
└── catalog/
    └── catalog.json    # Nguồn dữ liệu gốc: mảng 535 PokemonCard (xem types/card.ts)
```

- Mỗi phần tử là **một listing** của một thẻ đã chấm PSA: thông tin thẻ, set, seller, giá niêm yết, giá PriceCharting, population… gộp chung trong một object (dữ liệu **chưa chuẩn hóa**). Lab 1 sẽ tách nó thành các bảng quan hệ.
- Ảnh tương ứng nằm ở `public/assets/cards/{id}.webp`.
- Lab 1 sinh thêm `data/normalized/` (CSV/JSON đã chuẩn hóa) bằng `node scripts/labs/export-normalized.mjs`.
