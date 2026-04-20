"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createEntry } from "@/lib/actions";
import { ArrowLeft } from "lucide-react";

type Journal = { id: number; name: string; color: string };

export default function NewEntryEditor({ journals }: { journals: Journal[] }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createEntry, null);

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
        <button
          form="new-entry-form"
          type="submit"
          disabled={pending}
          className="text-violet-600 text-sm font-semibold hover:opacity-70 disabled:opacity-40 transition-opacity"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>

      <form id="new-entry-form" action={action} className="flex flex-col flex-1 min-h-0 p-4 gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-sm text-[#8e8e93] font-medium">Journal</label>
          <select
            name="journal_id"
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
          name="content"
          autoFocus
          placeholder="Start writing…"
          className="flex-1 min-h-0 resize-none text-[#1c1c1e] text-base placeholder:text-[#c7c7cc] focus:outline-none leading-relaxed"
        />
      </form>
    </div>
  );
}
