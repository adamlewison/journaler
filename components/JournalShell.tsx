"use client";

import { useSidebar } from "@/components/SidebarContext";

export default function JournalShell({ children }: { children: React.ReactNode }) {
  const { open, close } = useSidebar();

  return (
    <div className="flex h-full bg-[#f2f2f7] relative">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={close}
        />
      )}
      {children}
    </div>
  );
}
