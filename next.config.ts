import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: '/cubix-sim',
  output: "export",
  distDir: 'out',
  reactStrictMode: true,
};

export default nextConfig;
