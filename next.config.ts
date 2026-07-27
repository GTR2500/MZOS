import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/MZOS",
  assetPrefix: "/MZOS",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
