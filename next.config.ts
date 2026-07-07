import type { NextConfig } from "next";
import path from "path";

const REPO_NAME = "feeding-managment";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: isProd ? `/${REPO_NAME}` : "",
  assetPrefix: isProd ? `/${REPO_NAME}/` : undefined,
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
