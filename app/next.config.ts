import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["mailer.skygenesisenterprise.com", "192.168.1.3"],

  reactStrictMode: true,
  poweredByHeader: false,

  ...(isProduction && {
    output: "standalone",
    ...(process.env.ASSET_PREFIX && { assetPrefix: process.env.ASSET_PREFIX }),
  }),

  basePath: process.env.BASE_PATH || "",

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "mailer.skygenesisenterprise.com", pathname: "/**" },
      { protocol: "https", hostname: "api.dicebear.com", pathname: "/**" },
      { protocol: "https", hostname: "avatars.githubusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
    ],
  },

  async headers() {
    const headers = [{ key: "Referrer-Policy", value: "origin-when-cross-origin" }];

    if (isProduction) {
      headers.push(
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" }
      );
    }

    return [{ source: "/(.*)", headers }];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
    ];
  },
};

export default withNextIntl(nextConfig);
