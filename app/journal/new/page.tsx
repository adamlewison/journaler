import { getJournals } from "@/lib/actions";
import NewEntryEditor from "@/components/NewEntryEditor";

export default async function NewEntryPage() {
  const journals = await getJournals();
  return <NewEntryEditor journals={journals} />;
}
