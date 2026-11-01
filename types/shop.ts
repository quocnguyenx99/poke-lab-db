// Dữ liệu mua hàng (giả lập) lưu trên Firestore — xem docs/firebase-guide/01-phan-tich-usecase-erd.md §4.

// users/{uid}/cart/{listingId}
export interface CartItem {
  listingId: string;
  name: string;
  grade: number;
  priceUSD: number; // đọc từ cards/{id} trên Firestore lúc thêm, không lấy từ client
  image: string | null;
}

// Phần tử của orders/{orderId}.items[] — bản chụp lúc đặt, không đổi theo giá mới
export interface OrderItem {
  listingId: string;
  name: string;
  grade: number;
  priceUSD: number;
  image: string | null;
}

export type OrderStatus = 'pending';

// orders/{orderId}
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalUSD: number;
  status: OrderStatus;
  createdAt: Date | null; // null trong tích tắc trước khi serverTimestamp được server điền
}
