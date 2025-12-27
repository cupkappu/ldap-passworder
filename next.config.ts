import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // 允许连接到外部LDAP服务器
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
