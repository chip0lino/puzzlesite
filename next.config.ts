// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Основные настройки
  reactStrictMode: true,
  swcMinify: true,
  
  // КРИТИЧЕСКИ ВАЖНО для Railway deployment
  output: 'standalone',
  
  // ESLint настройки
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript настройки
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Экспериментальные функции
  experimental: {
    largePageDataBytes: 128 * 100000, // Увеличиваем лимит для больших данных
  },
  
  // Настройки изображений для внешних доменов
  images: {
    domains: [
      'mc-heads.net',
      'crafatar.com',
      'cdn.discordapp.com'
    ],
    unoptimized: true, // Важно для Railway
  },
  
  // Переменные окружения
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Настройки безопасности
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Перенаправления (если нужны)
  async redirects() {
    return [];
  },
  
  // Настройки webpack для дополнительной совместимости
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Исправления для серверного рендеринга
    if (isServer) {
      config.externals = config.externals || [];
    }
    
    return config;
  },
  
  // Настройки для статических файлов
  trailingSlash: false,
  
  // Настройки для API routes
  async rewrites() {
    return [];
  },
};

export default nextConfig;