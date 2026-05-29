import type { NextConfig } from "next";
import { withNextOpenApi } from "next-openapi-gen/next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextOpenApi(nextConfig);
