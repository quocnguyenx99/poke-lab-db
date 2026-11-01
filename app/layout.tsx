import type { Metadata } from 'next';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'SNORLAX / MUNCHLAX | PSA MARKET ATLAS',
  description: 'Bảng đầu tư thẻ Slab PSA cao cấp với phân hạng S–F, Population, PriceCharting và săn giá Buy It Now trên eBay & Fanatics Collect.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: extension trình duyệt (Grammarly, dịch trang, ví…) hay chèn thuộc tính vào <html>/<body>
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Source+Code+Pro:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <div className="demo-banner">Website demo phục vụ học tập — không bán hàng thật</div>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
