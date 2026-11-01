// Đọc/ghi dữ liệu riêng của từng người dùng trên Firestore (client SDK).
// Cấu trúc: users/{uid} và subcollection users/{uid}/favorites/{listingId}
// — xem docs/firebase-guide/01-phan-tich-usecase-erd.md §4.
import type { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Tạo users/{uid} ở lần đăng nhập đầu tiên (đăng ký email hoặc Google). Tốn 1 lượt đọc mỗi lần mở app.
export const ensureUserProfile = async (user: User): Promise<void> => {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.get('createdAt')) return;
  // merge + chỉ ghi displayName khi có: chạy trước hay sau saveDisplayName đều không ghi đè mất tên
  await setDoc(
    ref,
    {
      email: user.email,
      ...(user.displayName ? { displayName: user.displayName } : {}),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
};

// Đăng ký email: tên hiển thị được đặt sau khi tài khoản đã tạo, nên cập nhật riêng (merge giữ các field khác)
export const saveDisplayName = (uid: string, displayName: string): Promise<void> =>
  setDoc(doc(db, 'users', uid), { displayName }, { merge: true });

// Lắng nghe realtime: gọi callback ngay lần đầu và mỗi khi favorites thay đổi (kể cả từ thiết bị khác)
export const subscribeFavorites = (
  uid: string,
  onChange: (favorites: Record<string, boolean>) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    collection(db, 'users', uid, 'favorites'),
    (snap) => {
      const next: Record<string, boolean> = {};
      snap.forEach((d) => {
        next[d.id] = true;
      });
      onChange(next);
    },
    onError,
  );

// id document = listingId → yêu thích 2 lần vẫn chỉ có 1 document (giống khóa chính ghép trong SQL)
export const setFavorite = (uid: string, listingId: string, on: boolean): Promise<void> => {
  const ref = doc(db, 'users', uid, 'favorites', listingId);
  return on ? setDoc(ref, { addedAt: serverTimestamp() }) : deleteDoc(ref);
};
