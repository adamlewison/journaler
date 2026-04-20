"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createDraftEntry, autoSaveEntry } from "@/lib/actions";
import { ArrowLeft } from "lucide-react";

type Journal = { id: number; name: string; color: string };

export default function NewEntryEditor({ journals }: { journals: Journal[] }) {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [journalId, setJournalId] = useState(journals[0]?.id ?? 0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const draftIdRef = useRef<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContentRef = useRef(content);
  const latestJournalIdRef = useRef(journalId);

  const save = useCallback(async (nextContent: string, nextJournalId: number) => {
    if (!nextContent.trim()) return;
    setSaveStatus("saving");
    let result: { error: string } | { id: number } | { ok: true };
    if (draftIdRef.current === null) {
      result = await createDraftEntry(nextContent, nextJournalId);
      if ("id" in result) draftIdRef.current = result.id;
    } else {
      result = await autoSaveEntry(draftIdRef.current, nextContent, nextJournalId);
    }
    setSaveStatus("error" in result ? "error" : "saved");
  }, []);

  const scheduleAutosave = (nextContent: string, nextJournalId: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(nextContent, nextJournalId), 1000);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    latestContentRef.current = val;
    scheduleAutosave(val, latestJournalIdRef.current);
  };

  const handleJournalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = Number(e.target.value);
    setJournalId(val);
    latestJournalIdRef.current = val;
    scheduleAutosave(latestContentRef.current, val);
  };

  const handleDone = async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (latestContentRef.current.trim()) {
      await save(latestContentRef.current, latestJournalIdRef.current);
    }
    router.push("/journal");
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
        <span className="flex-1 text-center font-semibold text-[#1c1c1e]">New Entry</span>
        {statusLabel && (
          <span
            className={`text-xs ${saveStatus === "error" ? "text-red-500" : "text-[#8e8e93]"}`}
          >
            {statusLabel}
          </span>
        )}
        <button
          type="button"
          onClick={handleDone}
          className="text-violet-600 text-sm font-semibold hover:opacity-70 transition-opacity"
        >
          Done
        </button>
      </div>

      <div className="flex flex-col flex-1 min-h-0 p-4 gap-3">
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

        <textarea
          autoFocus
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing…"
          className="flex-1 min-h-0 resize-none text-[#1c1c1e] text-base placeholder:text-[#c7c7cc] focus:outline-none leading-relaxed"
        />
      </div>
    </div>
  );
}
