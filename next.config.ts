import type { NextConfig } from "next";
import { withNextOpenApi } from "next-openapi-gen/next";

const nextConfig: NextConfig = {};

export default withNextOpenApi(nextConfig);
