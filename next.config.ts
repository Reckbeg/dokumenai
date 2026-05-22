
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Avoid Next.js/Turbopack accidentally selecting /home/ubuntu as the
  // workspace root when another package-lock.json exists above this project.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
