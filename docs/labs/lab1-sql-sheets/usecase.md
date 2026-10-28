# Sơ đồ Use Case — Website tra cứu & bán thẻ PSA

```mermaid
flowchart LR
    guest([Khách])
    member([Thành viên])
    admin([Quản trị viên])

    subgraph Hệ thống
        UC1(Tra cứu / tìm kiếm thẻ)
        UC2(Lọc theo tier, grade, nhân vật)
        UC3(Xem chi tiết & so sánh giá PriceCharting)
        UC4(Đăng ký tài khoản)
        UC5(Đăng nhập / đăng xuất)
        UC6(Lưu thẻ yêu thích)
        UC7(Thêm vào giỏ hàng)
        UC8(Đặt hàng)
        UC9(Xem lịch sử đơn hàng)
        UC10(Cập nhật giá / listing)
        UC11(Nạp dữ liệu catalog)
    end

    guest --> UC1 & UC2 & UC3 & UC4 & UC5
    member --> UC6 & UC7 & UC8 & UC9
    member -. kế thừa .-> guest
    admin --> UC10 & UC11
    UC8 -. include .-> UC5
    UC6 -. include .-> UC5
```

| Use case | Actor | Bảng đọc | Bảng ghi |
|---|---|---|---|
| Tra cứu, lọc, xem chi tiết | Khách | listings, cards, sets, sellers, price_references, pop_reports | — |
| Đăng ký / đăng nhập | Khách | users | users |
| Yêu thích | Thành viên | favorites | favorites |
| Giỏ hàng, đặt hàng | Thành viên | listings | orders, order_items |
| Lịch sử đơn | Thành viên | orders, order_items | — |
| Cập nhật giá, nạp catalog | Quản trị viên | — | listings, price_references, … |

Bài tập: mỗi use case cần những câu SQL nào? Hãy viết ít nhất 1 câu cho UC2, UC6, UC8 (gợi ý: UC8 cần `INSERT` vào 2 bảng, nên đặt trong một **transaction**).
