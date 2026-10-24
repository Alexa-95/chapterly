import path from "node:path";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(".") },
};

export default nextConfig;

// Udostępnia bindingi Cloudflare (np. bazę D1) podczas `next dev`
initOpenNextCloudflareForDev();
