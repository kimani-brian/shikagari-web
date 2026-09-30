import type { NextConfig } from "next";

// Allow next/image to load vehicle photos served by the API
// (e.g. http://localhost:8080/uploads/...). The host is derived from
// NEXT_PUBLIC_API_URL so staging/production work without code changes.
function apiImagePattern() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1");
    return [
      {
        protocol: url.protocol.replace(":", "") as "http" | "https",
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: "/uploads/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: apiImagePattern(),
  },
};

export default nextConfig;
