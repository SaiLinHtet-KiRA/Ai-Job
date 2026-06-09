import type { NextConfig } from "next";
import { withNextOpenApi } from "next-openapi-gen/next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfjs-dist"],
};

export default withNextOpenApi(nextConfig);
