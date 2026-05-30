import { getSupabaseAdmin } from "@/lib/supabase";
import { ApplicationListClient } from "./ApplicationListClient";

interface Application {
  id: number;
  name: string;
  email: string;
  position: string;
  type: string;
  salary: number;
  resume_url: string;
  created_at: string;
}

interface PaginatedResponse {
  data: Application[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(sp.limit ?? "10", 10) || 10));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let initial: PaginatedResponse = { data: [], page, limit, total: 0, totalPages: 1 };

  try {
    const supabase = getSupabaseAdmin();
    const [{ data, error }, { count: total }] = await Promise.all([
      supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, to),
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true }),
    ]);

    if (!error) {
      initial = {
        data: data ?? [],
        page,
        limit,
        total: total ?? 0,
        totalPages: Math.max(1, Math.ceil((total ?? 0) / limit)),
      };
    }
  } catch {
    // table may not exist yet
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Applications
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            View all submitted job applications
          </p>
        </div>
      </div>

      <ApplicationListClient initial={initial} />
    </div>
  );
}
