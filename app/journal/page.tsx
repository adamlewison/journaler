import Link from "next/link";
import { getEntries, getJournals, type EntryRow } from "@/lib/actions";
import EntryCard from "@/components/EntryCard";
import TopBar from "@/components/TopBar";
import { Suspense } from "react";

function groupByDate(entries: EntryRow[]): Record<string, EntryRow[]> {
  const groups: Record<string, EntryRow[]> = {};
  const today = new Date();
  const todayStr = today.toDateString();
  const yesterdayStr = new Date(today.getTime() - 86400000).toDateString();

  for (const entry of entries) {
    const d = new Date(entry.created_at);
    const ds = d.toDateString();
    let label: string;
    if (ds === todayStr) label = "Today";
    else if (ds === yesterdayStr) label = "Yesterday";
    else {
      label = d.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    if (!groups[label]) groups[label] = [];
    groups[label].push(entry);
  }
  return groups;
}

function sectionTitle(journalParam: string, journals: { id: number; name: string }[]) {
  if (journalParam === "all") return "All Entries";
  if (journalParam === "recently-deleted") return "Recently Deleted";
  const j = journals.find((j) => String(j.id) === journalParam);
  return j?.name ?? "Entries";
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ journal?: string; q?: string }>;
}) {
  const params = await searchParams;
  const journalParam = params.journal ?? "all";
  const query = params.q?.toLowerCase() ?? "";

  const [rawEntries, journals] = await Promise.all([
    getEntries(journalParam),
    getJournals(),
  ]);

  let entries = rawEntries;
  if (query) {
    entries = entries.filter((e) => e.content.toLowerCase().includes(query));
  }

  const isDeleted = journalParam === "recently-deleted";
  const title = sectionTitle(journalParam, journals);
  const grouped = groupByDate(entries);

  return (
    <div className="flex flex-col h-full">
      <Suspense>
        <TopBar title={title} />
      </Suspense>

      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-6">
        {Object.keys(grouped).length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-[#8e8e93]">
            <p className="text-lg font-medium">No entries</p>
            {!isDeleted && (
              <Link
                href="/journal/new"
                className="mt-3 text-sm text-violet-600 hover:underline"
              >
                Write your first entry →
              </Link>
            )}
          </div>
        )}

        {Object.entries(grouped).map(([dateLabel, dayEntries]) => (
          <section key={dateLabel}>
            <h2 className="text-sm font-semibold text-[#1c1c1e] mb-2">{dateLabel}</h2>
            <div className="space-y-3">
              {dayEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} isDeleted={isDeleted} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
