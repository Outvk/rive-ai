/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };
    return config;
  },
  turbopack: {
    aliases: {
      '@': './src',
    },
  },
};

export default nextConfig;
