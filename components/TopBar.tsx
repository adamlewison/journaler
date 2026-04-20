"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSidebar } from "@/components/SidebarContext";
import { Menu, Plus, Search } from "lucide-react";

export default function TopBar({ title }: { title: string }) {
  const { toggle } = useSidebar();
  const searchParams = useSearchParams();
  const journalParam = searchParams.get("journal") ?? "all";
  const q = searchParams.get("q") ?? "";

  return (
    <div className="flex items-center gap-2 px-3 py-3 border-b border-[#e5e5ea] bg-[#f2f2f7] shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={toggle}
        className="md:hidden p-1.5 rounded-lg text-[#8e8e93] hover:bg-[#e5e5ea] transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-lg font-bold text-[#1c1c1e] flex-1 truncate">{title}</h1>

      <Link
        href="/journal/new"
        className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700 transition-colors shrink-0"
      >
        <Plus className="w-4 h-4" />
      </Link>

      <form method="GET" action="/journal" className="relative shrink-0">
        <input type="hidden" name="journal" value={journalParam} />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8e8e93] pointer-events-none" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search"
          className="pl-8 pr-3 py-1.5 rounded-full bg-[#e5e5ea] text-sm text-[#1c1c1e] placeholder:text-[#8e8e93] focus:outline-none focus:ring-2 focus:ring-violet-500 w-32 sm:w-40"
        />
      </form>
    </div>
  );
}
