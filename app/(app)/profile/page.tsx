import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { getUserProfile } from "@/lib/user-profile";
import ProfileEditor from "./_components/ProfileEditor";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await getUserProfile(session.user.id);
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <ProfileEditor profile={profile} />
      </div>
    </div>
  );
}
