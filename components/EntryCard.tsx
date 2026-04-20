"use client";

import Link from "next/link";
import { useState } from "react";
import { MoreHorizontal, Trash2, RotateCcw, X } from "lucide-react";
import { softDeleteEntry, restoreEntry, permanentlyDeleteEntry, type EntryRow } from "@/lib/actions";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

function preview(content: string, maxLen = 200) {
  return content.length > maxLen ? content.slice(0, maxLen) + "…" : content;
}

export default function EntryCard({
  entry,
  isDeleted = false,
}: {
  entry: EntryRow;
  isDeleted?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const lines = entry.content.split("\n").filter(Boolean);
  const headline = lines[0] ?? "";
  const body = lines.slice(1).join(" ");

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm relative group">
      {/* Entry content — clickable to edit (unless deleted) */}
      {isDeleted ? (
        <div className="pr-8">
          {headline && <p className="font-semibold text-[#1c1c1e] mb-1">{headline}</p>}
          {body && <p className="text-sm text-[#3c3c43] line-clamp-3">{preview(body)}</p>}
        </div>
      ) : (
        <Link href={`/journal/entry/${entry.id}`} className="block pr-8">
          {headline && <p className="font-semibold text-[#1c1c1e] mb-1">{headline}</p>}
          {body && <p className="text-sm text-[#3c3c43] line-clamp-3">{preview(body)}</p>}
          {!headline && !body && (
            <p className="text-sm text-[#8e8e93] italic">Empty entry</p>
          )}
        </Link>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <span
            className="w-3.5 h-3.5 rounded-full inline-block"
            style={{ backgroundColor: entry.journal_color }}
          />
          <span className="text-xs text-[#8e8e93]">{entry.journal_name}</span>
          <span className="text-xs text-[#8e8e93]">·</span>
          <span className="text-xs text-[#8e8e93]">{formatDate(entry.created_at)}</span>
        </div>
      </div>

      {/* Menu button */}
      <div className="absolute top-3 right-3">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="p-1 rounded-full text-[#c7c7cc] hover:text-[#8e8e93] hover:bg-[#f2f2f7] transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-7 z-10 bg-white rounded-xl shadow-lg border border-[#e5e5ea] py-1 min-w-[160px]">
            {isDeleted ? (
              <>
                <button
                  onClick={async () => {
                    await restoreEntry(entry.id);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#1c1c1e] hover:bg-[#f2f2f7] w-full text-left"
                >
                  <RotateCcw className="w-4 h-4" /> Restore
                </button>
                <button
                  onClick={async () => {
                    await permanentlyDeleteEntry(entry.id);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left"
                >
                  <X className="w-4 h-4" /> Delete Forever
                </button>
              </>
            ) : (
              <button
                onClick={async () => {
                  await softDeleteEntry(entry.id);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
