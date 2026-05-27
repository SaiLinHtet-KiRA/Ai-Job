export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureAdminUser } = await import("@/lib/seed-admin");
    await ensureAdminUser();
  }
}
