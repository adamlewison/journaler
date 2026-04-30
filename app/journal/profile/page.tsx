import { requireSession } from "@/lib/auth";
import ProfileForms from "@/components/ProfileForms";
import { CheckCircle } from "lucide-react";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [session, params] = await Promise.all([requireSession(), searchParams]);
  const saved = params.saved;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 py-3 border-b border-[#e5e5ea] dark:border-[#38383a]">
        <h1 className="text-base font-semibold text-[#1c1c1e] dark:text-[#f2f2f7]">Profile & Settings</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        {saved === "username" && (
          <div className="mx-4 mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Username updated successfully.
          </div>
        )}
        <ProfileForms username={session.username} />
      </div>
    </div>
  );
}
