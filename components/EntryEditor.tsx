"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { autoSaveEntry, type EntryDetail } from "@/lib/actions";
import { ArrowLeft } from "lucide-react";

type Journal = { id: number; name: string; color: string };
type Entry = EntryDetail;

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EntryEditor({
  entry,
  journals,
}: {
  entry: Entry;
  journals: Journal[];
}) {
  const router = useRouter();

  const [content, setContent] = useState(entry.content);
  const [journalId, setJournalId] = useState(entry.journal_id);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (nextContent: string, nextJournalId: number) => {
      setSaveStatus("saving");
      const result = await autoSaveEntry(entry.id, nextContent, nextJournalId);
      setSaveStatus("error" in result ? "error" : "saved");
    },
    [entry.id],
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(val, journalId), 1000);
  };

  const handleJournalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setJournalId(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(content, val), 1000);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const statusLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "error"
          ? "Error saving"
          : null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1c1c1e]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e5e5ea] dark:border-[#38383a] shrink-0">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-violet-600 dark:text-violet-400 text-sm hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="flex-1 text-center">
          <div className="font-semibold text-[#1c1c1e] dark:text-[#f2f2f7] text-sm">Edit Entry</div>
          <div className="text-xs text-[#8e8e93] hidden sm:block">{formatDateTime(entry.created_at)}</div>
        </div>
        {statusLabel && (
          <span
            className={`text-xs ${saveStatus === "error" ? "text-red-500" : "text-[#8e8e93]"}`}
          >
            {statusLabel}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 min-h-0 p-4 gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-sm text-[#8e8e93] font-medium">Journal</label>
          <select
            value={journalId}
            onChange={handleJournalChange}
            className="text-sm text-[#1c1c1e] dark:text-[#f2f2f7] bg-[#f2f2f7] dark:bg-[#2c2c2e] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
          >
            {journals.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
        </div>

        <textarea
          autoFocus
          value={content}
          onChange={handleContentChange}
          className="flex-1 min-h-0 resize-none text-[#1c1c1e] dark:text-[#f2f2f7] bg-transparent text-base placeholder:text-[#c7c7cc] dark:placeholder:text-[#48484a] focus:outline-none leading-relaxed"
        />
      </div>
    </div>
  );
}
