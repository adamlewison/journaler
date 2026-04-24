import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const result = await getDb().execute({
    sql: `SELECT e.content, e.created_at, j.name as journal_name
          FROM entries e
          JOIN journals j ON e.journal_id = j.id
          WHERE e.user_id = ? AND e.deleted_at IS NULL
          ORDER BY e.created_at DESC`,
    args: [session.userId],
  });

  function escapeCSV(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  const lines = [
    ["Date", "Journal", "Content"].map(escapeCSV).join(","),
    ...result.rows.map((row) =>
      [
        escapeCSV(row.created_at as string),
        escapeCSV(row.journal_name as string),
        escapeCSV(row.content as string),
      ].join(","),
    ),
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="journal-export.csv"`,
    },
  });
}
