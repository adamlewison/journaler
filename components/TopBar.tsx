"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSidebar } from "@/components/SidebarContext";
import { deleteAllTrashed } from "@/lib/actions";
import { Menu, Plus, Search, Trash2 } from "lucide-react";

export default function TopBar({ title }: { title: string }) {
  const { toggle } = useSidebar();
  const searchParams = useSearchParams();
  const journalParam = searchParams.get("journal") ?? "all";
  const q = searchParams.get("q") ?? "";
  const isRecentlyDeleted = journalParam === "recently-deleted";

  async function handleDeleteAll() {
    if (!window.confirm("Permanently delete all items in Recently Deleted? This cannot be undone.")) return;
    await deleteAllTrashed();
  }

  return (
    <div className="flex items-center gap-2 px-3 py-3 border-b border-[#e5e5ea] dark:border-[#38383a] bg-[#f2f2f7] dark:bg-[#1c1c1e] shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={toggle}
        className="md:hidden p-1.5 rounded-lg text-[#8e8e93] hover:bg-[#e5e5ea] dark:hover:bg-[#38383a] transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-lg font-bold text-[#1c1c1e] dark:text-[#f2f2f7] flex-1 truncate">{title}</h1>

      {isRecentlyDeleted ? (
        <button
          onClick={handleDeleteAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete All
        </button>
      ) : (
        <Link
          href="/journal/new"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 dark:bg-violet-500 text-white hover:bg-violet-700 dark:hover:bg-violet-400 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Link>
      )}

      <form method="GET" action="/journal" className="relative shrink-0">
        <input type="hidden" name="journal" value={journalParam} />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8e8e93] pointer-events-none" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search"
          className="pl-8 pr-3 py-1.5 rounded-full bg-[#e5e5ea] dark:bg-[#38383a] text-sm text-[#1c1c1e] dark:text-[#f2f2f7] placeholder:text-[#8e8e93] focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 w-32 sm:w-40"
        />
      </form>
    </div>
  );
}
