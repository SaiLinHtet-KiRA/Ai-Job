import { getRedis } from "./redis";

const CODE_TTL_SECONDS = 5 * 60; // 5 minutes
const PENDING_USER_TTL_SECONDS = 10 * 60; // 10 minutes (grace period over code)

export interface PendingUser {
  email: string;
  password: string;
  name: string | null;
}

function redisKey(type: "code" | "user", identifier: string) {
  return `verify:${type}:${identifier}`;
}

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function storeCode(email: string): Promise<string> {
  const redis = getRedis();
  const code = generateCode();
  const key = redisKey("code", email);
  await redis.set(key, code, { ex: CODE_TTL_SECONDS });
  return code;
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  const redis = getRedis();
  const key = redisKey("code", email);
  const stored = await redis.get(key);
  return String(stored) === code;
}

export async function deleteCode(email: string): Promise<void> {
  const redis = getRedis();
  const key = redisKey("code", email);
  await redis.del(key);
}

export async function storePendingUser(
  email: string,
  password: string,
  name: string | null,
): Promise<void> {
  const redis = getRedis();
  const key = redisKey("user", email);
  const pending: PendingUser = { email, password, name };
  await redis.set(key, JSON.stringify(pending), { ex: PENDING_USER_TTL_SECONDS });
}

export async function getPendingUser(email: string): Promise<PendingUser | null> {
  const redis = getRedis();
  const key = redisKey("user", email);
  const raw = await redis.get(key);
  if (!raw) return null;
  if (typeof raw === "object") return raw as PendingUser;
  try {
    return JSON.parse(String(raw)) as PendingUser;
  } catch {
    return null;
  }
}

export async function deletePendingUser(email: string): Promise<void> {
  const redis = getRedis();
  const key = redisKey("user", email);
  await redis.del(key);
}
