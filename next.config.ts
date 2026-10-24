import path from "node:path";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(".") },
};

export default nextConfig;

// Exposes Cloudflare bindings (e.g. the D1 database) during `next dev`
initOpenNextCloudflareForDev();
