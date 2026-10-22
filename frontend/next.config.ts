import type { NextConfig } from "next";

// The browser only ever talks to this Next.js origin. Requests to /api/* are proxied to the FastAPI
// backend so auth cookies stay first-party (HttpOnly, SameSite=Lax) and no CORS is needed.
// AUREX_API_URL is read when the config is evaluated (build time for `next build`).
// On Vercel the FastAPI service is routed to /api/* by vercel.json (Vercel Services), so no proxy is needed there.
const onVercel = Boolean(process.env.VERCEL);
const apiUrl = process.env.AUREX_API_URL ?? (onVercel ? null : "http://127.0.0.1:8000");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Standalone output is for the Docker image and launch.bat; Vercel builds its own output.
  output: onVercel ? undefined : "standalone",
  poweredByHeader: false,
  experimental: {
    // /api/* is proxied to FastAPI. The first analytics requests after a database start can be slow on a cold
    // cache; allow them up to two minutes instead of the default 30 s before the proxy gives up.
    proxyTimeout: 120_000,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return apiUrl ? [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }] : [];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
