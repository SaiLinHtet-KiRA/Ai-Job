import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day

function getSecret(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-secret";
}

async function hmacSign(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const verify = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === verify;
}

export async function createSession(email: string): Promise<string> {
  const ts = Date.now().toString();
  const payload = `${email}:${ts}`;
  const signature = await hmacSign(payload);
  return `${email}:${ts}:${signature}`;
}

export async function verifySession(token: string): Promise<string | null> {
  const parts = token.split(":");
  if (parts.length !== 3) return null;
  const [email, ts, signature] = parts;
  const payload = `${email}:${ts}`;
  const expected = await hmacSign(payload);
  if (signature !== expected) return null;
  return email;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  if (!session?.value) return null;
  return verifySession(session.value);
}

export async function isAuthenticated(): Promise<boolean> {
  const email = await getSessionEmail();
  if (!email) return false;

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("admins")
      .select("id")
      .eq("email", email)
      .single();
    return !!data;
  } catch {
    return false;
  }
}

export async function getCurrentAdminId(): Promise<number | null> {
  const email = await getSessionEmail();
  if (!email) return null;

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("admins")
      .select("id")
      .eq("email", email)
      .single();
    return data?.id ?? null;
  } catch {
    return null;
  }
}
