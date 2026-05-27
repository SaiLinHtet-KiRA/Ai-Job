import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

export async function rateLimit(
  identifier: string,
  opts: { limit: number; duration: number } = { limit: 10, duration: 10 },
) {
  const redis = getRedis();
  if (!redis) return null;

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(opts.limit, `${opts.duration} s`),
    analytics: true,
    prefix: "rl",
  });

  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      },
    );
  }

  return null;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
