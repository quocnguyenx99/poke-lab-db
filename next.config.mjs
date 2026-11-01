/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lab 2: build ra HTML/JS tĩnh trong out/ để Firebase Hosting (gói Spark) phục vụ — không có server Node lúc chạy
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
