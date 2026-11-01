import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Next.js chỉ thay biến NEXT_PUBLIC_* vào code trình duyệt khi viết đúng nguyên văn
// process.env.NEXT_PUBLIC_..., không đọc động kiểu process.env[name].
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Thiếu cấu hình Firebase: kiểm tra NEXT_PUBLIC_FIREBASE_* trong .env.local rồi khởi động lại npm run dev');
}

// Hot-reload khi dev có thể chạy lại file này; khởi tạo 2 lần sẽ báo lỗi "app already exists".
export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Client SDK: mọi đọc/ghi từ trình duyệt đều bị Security Rules (firestore.rules) kiểm tra
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
// Luôn hiện màn hình chọn tài khoản, tiện khi thử với nhiều tài khoản Google
googleProvider.setCustomParameters({ prompt: 'select_account' });
