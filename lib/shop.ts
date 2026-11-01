// Giỏ hàng và đặt hàng giả lập (không thanh toán) — client SDK, mọi thao tác bị firestore.rules kiểm tra.
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CartItem, Order, OrderItem } from '@/types/shop';

export const MAX_ORDER_ITEMS = 20; // phải khớp với giới hạn trong firestore.rules

// Đọc giá hiện tại của listing từ Firestore. Chỉ dùng giá niêm yết Buy It Now (listingPriceUSD):
// manualPrice là giá tham khảo, không phải giá mua được.
const readListing = async (listingId: string): Promise<OrderItem> => {
  const snap = await getDoc(doc(db, 'cards', listingId));
  if (!snap.exists()) throw new Error('Thẻ không còn trong catalog.');
  const card = snap.data();
  const price = card.listingPriceUSD;
  if (typeof price !== 'number' || price <= 0) throw new Error('Thẻ này chưa niêm yết giá, không thể mua.');
  return {
    listingId,
    name: card.name,
    grade: card.grade,
    priceUSD: price,
    image: card.image ?? null,
  };
};

// Không tin giá phía client: luôn đọc lại từ cards/{id}
export const addToCart = async (uid: string, listingId: string): Promise<void> => {
  const item = await readListing(listingId);
  const { listingId: _id, ...data } = item;
  await setDoc(doc(db, 'users', uid, 'cart', listingId), { ...data, addedAt: serverTimestamp() });
};

export const removeFromCart = (uid: string, listingId: string): Promise<void> =>
  deleteDoc(doc(db, 'users', uid, 'cart', listingId));

export const subscribeCart = (
  uid: string,
  onChange: (items: CartItem[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    collection(db, 'users', uid, 'cart'),
    (snap) => {
      onChange(
        snap.docs.map((d) => ({
          listingId: d.id,
          name: d.get('name'),
          grade: d.get('grade'),
          priceUSD: d.get('priceUSD'),
          image: d.get('image') ?? null,
        })),
      );
    },
    onError,
  );

// Tạo đơn + xóa giỏ trong MỘT writeBatch: hoặc thành công cả hai, hoặc không gì thay đổi
// (giống transaction INSERT orders + order_items + DELETE cart_items trong SQL).
export const placeOrder = async (uid: string): Promise<string> => {
  const cartSnap = await getDocs(collection(db, 'users', uid, 'cart'));
  if (cartSnap.empty) throw new Error('Giỏ hàng đang trống.');
  if (cartSnap.size > MAX_ORDER_ITEMS) throw new Error(`Mỗi đơn tối đa ${MAX_ORDER_ITEMS} thẻ.`);

  // Đọc lại giá mới nhất lúc đặt, phòng khi giá đã đổi sau khi thêm vào giỏ
  const items = await Promise.all(cartSnap.docs.map((d) => readListing(d.id)));
  const totalUSD = Math.round(items.reduce((sum, it) => sum + it.priceUSD, 0) * 100) / 100;

  const orderRef = doc(collection(db, 'orders')); // tạo id ngẫu nhiên phía client
  const batch = writeBatch(db);
  batch.set(orderRef, {
    userId: uid,
    items,
    totalUSD,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  cartSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return orderRef.id;
};

// Rules không phải bộ lọc: query BẮT BUỘC có where userId == uid, nếu không sẽ bị từ chối toàn bộ.
// Sắp xếp phía client để khỏi phải tạo composite index (userId + createdAt).
export const getMyOrders = async (uid: string): Promise<Order[]> => {
  const snap = await getDocs(query(collection(db, 'orders'), where('userId', '==', uid)));
  return snap.docs
    .map((d) => ({
      id: d.id,
      userId: d.get('userId'),
      items: d.get('items') ?? [],
      totalUSD: d.get('totalUSD'),
      status: d.get('status'),
      createdAt: d.get('createdAt')?.toDate() ?? null,
    }))
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
};
