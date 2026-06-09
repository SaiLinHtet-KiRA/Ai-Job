import type { NextConfig } from "next";
import { withNextOpenApi } from "next-openapi-gen/next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default withNextOpenApi(nextConfig);
