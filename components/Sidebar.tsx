"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useActionState, useRef, useEffect, useState } from "react";
import { logout, createJournal } from "@/lib/actions";
import { useSidebar } from "@/components/SidebarContext";
import {
  LayoutGrid,
  Trash2,
  LogOut,
  Bike,
  BookOpen,
  X,
} from "lucide-react";

type Journal = { id: number; name: string; icon: string; color: string };
type Counts = { all: number; byJournal: Record<number, number>; deleted: number };

function JournalIcon({ icon, color }: { icon: string; color: string }) {
  const cls = "w-4 h-4";
  if (icon === "bike") return <Bike className={cls} style={{ color }} />;
  return <BookOpen className={cls} style={{ color }} />;
}

export default function Sidebar({
  journals,
  counts,
}: {
  journals: Journal[];
  counts: Counts;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { open, close } = useSidebar();
  const currentJournal = searchParams.get("journal") ?? "all";

  const [addingJournal, setAddingJournal] = useState(false);
  const [createState, createAction, createPending] = useActionState(createJournal, null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingJournal) inputRef.current?.focus();
  }, [addingJournal]);

  const prevPending = useRef(false);
  useEffect(() => {
    if (prevPending.current && !createPending && !createState?.error) {
      setAddingJournal(false);
    }
    prevPending.current = createPending;
  }, [createPending, createState]);

  function navClass(journal: string) {
    const active = currentJournal === journal;
    return `flex items-center justify-between px-2 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
      active
        ? "bg-[#e8e8ed] text-[#1c1c1e] font-medium"
        : "text-[#1c1c1e] hover:bg-[#e8e8ed]"
    }`;
  }

  function navTo(href: string) {
    close();
    router.push(href);
  }

  return (
    <aside
      className={[
        // Base: fixed drawer on mobile, static on desktop
        "fixed md:static inset-y-0 left-0 z-30",
        "w-72 md:w-64 shrink-0",
        "flex flex-col gap-3 p-3",
        "bg-[#f2f2f7] overflow-y-auto",
        // Mobile slide transition
        "transition-transform duration-250 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
      ].join(" ")}
    >
      {/* Mobile close button */}
      <div className="flex items-center justify-between md:hidden mb-1">
        <span className="text-base font-semibold text-[#1c1c1e]">Menu</span>
        <button
          onClick={close}
          className="p-1.5 rounded-lg text-[#8e8e93] hover:bg-[#e5e5ea] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Journals */}
      <div className="flex-1">
        <div className="flex items-center justify-between px-2 mb-1">
          <span className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">
            Journals
          </span>
          <button
            onClick={() => setAddingJournal((v) => !v)}
            className="w-5 h-5 flex items-center justify-center text-[#8e8e93] hover:text-violet-600 transition-colors"
            title="New Journal"
          >
            {addingJournal ? (
              <X className="w-3.5 h-3.5" />
            ) : (
              <span className="text-lg leading-none">+</span>
            )}
          </button>
        </div>

        {addingJournal && (
          <form action={createAction} className="mb-1 px-2">
            <div className="flex items-center gap-1 bg-[#e8e8ed] rounded-lg px-2 py-1.5">
              <input
                ref={inputRef}
                name="name"
                placeholder="Journal name"
                maxLength={40}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setAddingJournal(false);
                }}
                className="flex-1 bg-transparent text-sm text-[#1c1c1e] placeholder:text-[#8e8e93] focus:outline-none"
              />
              <button
                type="submit"
                disabled={createPending}
                className="text-xs font-semibold text-violet-600 disabled:opacity-40"
              >
                Add
              </button>
            </div>
            {createState?.error && (
              <p className="text-xs text-red-500 mt-1">{createState.error}</p>
            )}
          </form>
        )}

        <nav className="space-y-0.5">
          <button onClick={() => navTo("/journal?journal=all")} className={`w-full text-left ${navClass("all")}`}>
            <span className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-violet-600" />
              All Entries
            </span>
            <span className="text-xs text-[#8e8e93]">{counts.all}</span>
          </button>

          {journals.map((j) => (
            <button
              key={j.id}
              onClick={() => navTo(`/journal?journal=${j.id}`)}
              className={`w-full text-left ${navClass(String(j.id))}`}
            >
              <span className="flex items-center gap-2">
                <JournalIcon icon={j.icon} color={j.color} />
                {j.name}
              </span>
              <span className="text-xs text-[#8e8e93]">{counts.byJournal[j.id] ?? 0}</span>
            </button>
          ))}

          <button
            onClick={() => navTo("/journal?journal=recently-deleted")}
            className={`w-full text-left ${navClass("recently-deleted")}`}
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#8e8e93]" />
              Recently Deleted
            </span>
            <span className="text-xs text-[#8e8e93]">{counts.deleted}</span>
          </button>
        </nav>
      </div>

      {/* Logout */}
      <form action={logout}>
        <button
          type="submit"
          className="flex items-center gap-2 px-2 py-2 w-full rounded-lg text-sm text-[#8e8e93] hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </form>
    </aside>
  );
}
