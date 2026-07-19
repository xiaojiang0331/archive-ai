import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tesseract starts a Node.js worker at runtime. Keep it external to the
  // Next.js server bundle so its worker files remain available to the route.
  serverExternalPackages: ["tesseract.js"],
};

export default nextConfig;
