import { requireSession } from "@/lib/auth";
import { getJournals, getEntryCounts } from "@/lib/actions";
import Sidebar from "@/components/Sidebar";
import JournalShell from "@/components/JournalShell";
import { SidebarProvider } from "@/components/SidebarContext";
import SessionGuard from "@/components/SessionGuard";
import { Suspense } from "react";

export default async function JournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSession();
  const [journals, counts] = await Promise.all([
    getJournals(),
    getEntryCounts(),
  ]);

  return (
    <SidebarProvider>
      <SessionGuard />
      <JournalShell>
        <Suspense>
          <Sidebar journals={journals} counts={counts} />
        </Suspense>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </main>
      </JournalShell>
    </SidebarProvider>
  );
}
