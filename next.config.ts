import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Run Prisma and bcryptjs in the Node.js runtime, not the Edge runtime
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
};

export default nextConfig;
