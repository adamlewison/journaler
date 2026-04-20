"use client";

import { useActionState, useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateEntry, autoSaveEntry, type EntryDetail } from "@/lib/actions";
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
  const [state, action, pending] = useActionState(updateEntry, null);

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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e5e5ea] shrink-0">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1 text-violet-600 text-sm hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <div className="flex-1 text-center">
          <div className="font-semibold text-[#1c1c1e] text-sm">Edit Entry</div>
          <div className="text-xs text-[#8e8e93] hidden sm:block">{formatDateTime(entry.created_at)}</div>
        </div>
        {statusLabel && (
          <span
            className={`text-xs ${saveStatus === "error" ? "text-red-500" : "text-[#8e8e93]"}`}
          >
            {statusLabel}
          </span>
        )}
        <button
          form="edit-entry-form"
          type="submit"
          disabled={pending}
          className="text-violet-600 text-sm font-semibold hover:opacity-70 disabled:opacity-40 transition-opacity"
        >
          {pending ? "Saving…" : "Done"}
        </button>
      </div>

      <form id="edit-entry-form" action={action} className="flex flex-col flex-1 min-h-0 p-4 gap-3">
        <input type="hidden" name="entry_id" value={entry.id} />
        <input type="hidden" name="content" value={content} />
        <input type="hidden" name="journal_id" value={journalId} />

        <div className="flex items-center gap-2 shrink-0">
          <label className="text-sm text-[#8e8e93] font-medium">Journal</label>
          <select
            value={journalId}
            onChange={handleJournalChange}
            className="text-sm text-[#1c1c1e] bg-[#f2f2f7] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {journals.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
        </div>

        {state?.error && <p className="text-sm text-red-500 shrink-0">{state.error}</p>}

        <textarea
          autoFocus
          value={content}
          onChange={handleContentChange}
          className="flex-1 min-h-0 resize-none text-[#1c1c1e] text-base placeholder:text-[#c7c7cc] focus:outline-none leading-relaxed"
        />
      </form>
    </div>
  );
}
