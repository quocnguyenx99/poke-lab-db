// Firebase Auth trả lỗi dạng { code: 'auth/...' }. Dịch sang tiếng Việt để hiển thị.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
  'auth/invalid-email': 'Email không hợp lệ.',
  'auth/missing-password': 'Vui lòng nhập mật khẩu.',
  'auth/user-disabled': 'Tài khoản này đã bị vô hiệu hóa.',
  'auth/email-already-in-use': 'Email này đã được đăng ký. Hãy đăng nhập.',
  'auth/weak-password': 'Mật khẩu quá yếu, cần ít nhất 6 ký tự.',
  'auth/too-many-requests': 'Thử sai quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.',
  'auth/network-request-failed': 'Lỗi mạng. Kiểm tra kết nối Internet.',
  'auth/popup-blocked': 'Trình duyệt đã chặn cửa sổ đăng nhập Google. Hãy cho phép popup.',
  'auth/unauthorized-domain': 'Domain này chưa được phép đăng nhập. Thêm vào Firebase Console → Authentication → Settings → Authorized domains.',
  'auth/operation-not-allowed': 'Phương thức đăng nhập này chưa được bật trên Firebase Console.',
  'auth/account-exists-with-different-credential': 'Email này đã đăng ký bằng phương thức khác. Hãy đăng nhập bằng email và mật khẩu.',
};

// Người dùng tự đóng popup Google: không coi là lỗi
const SILENT_CODES = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

export const getAuthErrorMessage = (error: unknown): string | null => {
  const code = (error as { code?: string })?.code ?? '';
  if (SILENT_CODES.has(code)) return null;
  return AUTH_ERROR_MESSAGES[code] ?? `Đã có lỗi xảy ra (${code || 'không rõ'}). Vui lòng thử lại.`;
};
