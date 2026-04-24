import { requireSession } from "@/lib/auth";
import ProfileForms from "@/components/ProfileForms";

export default async function ProfilePage() {
  const session = await requireSession();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-4 py-3 border-b border-[#e5e5ea] dark:border-[#38383a]">
        <h1 className="text-base font-semibold text-[#1c1c1e] dark:text-[#f2f2f7]">Profile & Settings</h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ProfileForms username={session.username} />
      </div>
    </div>
  );
}
