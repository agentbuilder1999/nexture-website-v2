/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // AI-generated PNGs are large; disable built-in size limit warning
    dangerouslyAllowSVG: false,
  },
};

export default nextConfig;
