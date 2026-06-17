import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { getUserProfile } from "@/lib/user-profile";
import CVManager from "../../components/CVManager";

async function getUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const profile = await getUserProfile(session.user.id);
  if (!profile) return null;

  return {
    id: profile.user_id,
    email: profile.email,
  };
}

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-white">Profile</h1>
              <p className="mt-1 text-[14px] text-[#8898aa]">{user.email}</p>
            </div>
          </div>

        {/* CV Section */}
        <div className="mt-10">
          <CVManager />
        </div>

        {/* Coming Soon Sections */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 opacity-60">
            <h3 className="text-[14px] font-semibold text-white">Work Experience</h3>
            <p className="mt-1 text-[12px] text-[#8898aa]">Auto-extracted from your CV</p>
            <span className="mt-3 inline-block rounded-full bg-white/10 px-2 py-1 text-[11px] text-[#8898aa]">
              Coming soon
            </span>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 opacity-60">
            <h3 className="text-[14px] font-semibold text-white">Skills & Preferences</h3>
            <p className="mt-1 text-[12px] text-[#8898aa]">Edit your target roles</p>
            <span className="mt-3 inline-block rounded-full bg-white/10 px-2 py-1 text-[11px] text-[#8898aa]">
              Coming soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
