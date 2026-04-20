import { getEntry, getJournals } from "@/lib/actions";
import { requireSession } from "@/lib/auth";
import EntryEditor from "@/components/EntryEditor";
import { notFound } from "next/navigation";

export default async function EntryPage({
  params,
}: {
  params: Promise<{ entryId: string }>;
}) {
  await requireSession();
  const { entryId } = await params;
  const [entry, journals] = await Promise.all([
    getEntry(Number(entryId)),
    getJournals(),
  ]);

  if (!entry) notFound();

  return <EntryEditor entry={entry} journals={journals} />;
}
