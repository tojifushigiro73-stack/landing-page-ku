/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hapus trailingSlash untuk memastikan routing kembali ke standar dasar
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
