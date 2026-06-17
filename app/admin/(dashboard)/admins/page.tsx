import { getSupabaseAdmin } from "@/lib/supabase";
import { AdminListClient } from "./AdminListClient";

export const dynamic = "force-dynamic";

interface Admin {
  id: number;
  email: string;
  created_at: string;
}

export default async function AdminAdminsPage() {
  let admins: Admin[] = [];
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("admins")
      .select("id, email, created_at")
      .order("created_at", { ascending: false });
    admins = data ?? [];
  } catch {
    // table may not exist yet
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Admin Accounts
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage admin users
          </p>
        </div>
        <a
          href="/admin/admins/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary/25 transition-all hover:from-primary-dark hover:to-primary-dark"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Admin
        </a>
      </div>

      <AdminListClient initialAdmins={admins} />
    </div>
  );
}
