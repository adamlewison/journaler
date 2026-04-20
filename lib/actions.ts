"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb, initDb } from "@/lib/db";
import {
  createSession,
  deleteSession,
  generateSalt,
  getSession,
  hashPin,
  requireSession,
} from "@/lib/auth";

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const pin = formData.get("pin") as string;

  if (!username || !pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
    return { error: "Username and a 6-digit PIN are required." };
  }

  await initDb();

  const result = await getDb().execute({
    sql: "SELECT * FROM users WHERE username = ?",
    args: [username],
  });

  if (result.rows.length === 0) {
    // Register new user
    const salt = generateSalt();
    const pinHash = hashPin(pin, salt);

    const insertUser = await getDb().execute({
      sql: "INSERT INTO users (username, pin_hash, pin_salt) VALUES (?, ?, ?)",
      args: [username, pinHash, salt],
    });
    const userId = Number(insertUser.lastInsertRowid);

    // Create default journals
    await getDb().execute({
      sql: "INSERT INTO journals (user_id, name, icon, color) VALUES (?, ?, ?, ?)",
      args: [userId, "Journal", "butterfly", "#7c6af7"],
    });

    await createSession({ userId, username });
  } else {
    const user = result.rows[0];
    const pinHash = hashPin(pin, user.pin_salt as string);
    if (pinHash !== user.pin_hash) {
      return { error: "Incorrect PIN." };
    }
    await createSession({
      userId: Number(user.id),
      username: user.username as string,
    });
  }

  redirect("/journal");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

// ── Journals ──────────────────────────────────────────────────────────────────

const JOURNAL_COLORS = [
  "#7c6af7",
  "#34c759",
  "#ff9500",
  "#ff3b30",
  "#5ac8fa",
  "#af52de",
  "#ff2d55",
];

export async function createJournal(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const session = await requireSession();
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Journal name is required." };

  // Pick a colour that isn't already used by this user's journals
  const existing = await getDb().execute({
    sql: "SELECT color FROM journals WHERE user_id = ?",
    args: [session.userId],
  });
  const usedColors = new Set(existing.rows.map((r) => r.color as string));
  const color =
    JOURNAL_COLORS.find((c) => !usedColors.has(c)) ??
    JOURNAL_COLORS[existing.rows.length % JOURNAL_COLORS.length];

  await getDb().execute({
    sql: "INSERT INTO journals (user_id, name, icon, color) VALUES (?, ?, ?, ?)",
    args: [session.userId, name, "book", color],
  });

  revalidatePath("/journal");
  return null;
}

// ── Entries ───────────────────────────────────────────────────────────────────

export async function createEntry(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const session = await requireSession();
  const content = formData.get("content") as string;
  const journalId = formData.get("journal_id") as string;

  if (!content?.trim()) return { error: "Entry cannot be empty." };

  await getDb().execute({
    sql: "INSERT INTO entries (user_id, journal_id, content) VALUES (?, ?, ?)",
    args: [session.userId, Number(journalId), content.trim()],
  });

  revalidatePath("/journal");
  redirect("/journal");
}

export async function updateEntry(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const session = await requireSession();
  const entryId = formData.get("entry_id") as string;
  const content = formData.get("content") as string;
  const journalId = formData.get("journal_id") as string;

  if (!content?.trim()) return { error: "Entry cannot be empty." };

  await getDb().execute({
    sql: "UPDATE entries SET content = ?, journal_id = ? WHERE id = ? AND user_id = ?",
    args: [content.trim(), Number(journalId), Number(entryId), session.userId],
  });

  revalidatePath("/journal");
  redirect("/journal");
}

export async function softDeleteEntry(entryId: number) {
  const session = await requireSession();
  await getDb().execute({
    sql: "UPDATE entries SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?",
    args: [entryId, session.userId],
  });
  revalidatePath("/journal");
}

export async function restoreEntry(entryId: number) {
  const session = await requireSession();
  await getDb().execute({
    sql: "UPDATE entries SET deleted_at = NULL WHERE id = ? AND user_id = ?",
    args: [entryId, session.userId],
  });
  revalidatePath("/journal");
}

export async function permanentlyDeleteEntry(entryId: number) {
  const session = await requireSession();
  await getDb().execute({
    sql: "DELETE FROM entries WHERE id = ? AND user_id = ?",
    args: [entryId, session.userId],
  });
  revalidatePath("/journal");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// libsql Row objects have methods and can't be passed to Client Components.
// Spread into a plain object to fix "Only plain objects" RSC error.
function plain<T>(row: object): T {
  return { ...row } as T;
}

// ── Data fetching helpers (used in Server Components) ─────────────────────────

export async function getJournals() {
  const session = await getSession();
  if (!session)
    return [] as Array<{
      id: number;
      name: string;
      icon: string;
      color: string;
    }>;
  const result = await getDb().execute({
    sql: "SELECT * FROM journals WHERE user_id = ? ORDER BY created_at ASC",
    args: [session.userId],
  });
  return result.rows.map((r) =>
    plain<{ id: number; name: string; icon: string; color: string }>(r),
  );
}

export type EntryRow = {
  id: number;
  user_id: number;
  journal_id: number;
  content: string;
  created_at: string;
  deleted_at: string | null;
  journal_name: string;
  journal_icon: string;
  journal_color: string;
};

export async function getEntries(journalId?: string): Promise<EntryRow[]> {
  const session = await getSession();
  if (!session) return [];

  let sql: string;
  const args: (string | number)[] = [session.userId];

  if (journalId === "recently-deleted") {
    sql =
      "SELECT e.*, j.name as journal_name, j.icon as journal_icon, j.color as journal_color FROM entries e JOIN journals j ON e.journal_id = j.id WHERE e.user_id = ? AND e.deleted_at IS NOT NULL ORDER BY e.deleted_at DESC";
  } else if (journalId && journalId !== "all") {
    sql =
      "SELECT e.*, j.name as journal_name, j.icon as journal_icon, j.color as journal_color FROM entries e JOIN journals j ON e.journal_id = j.id WHERE e.user_id = ? AND e.journal_id = ? AND e.deleted_at IS NULL ORDER BY e.created_at DESC";
    args.push(Number(journalId));
  } else {
    sql =
      "SELECT e.*, j.name as journal_name, j.icon as journal_icon, j.color as journal_color FROM entries e JOIN journals j ON e.journal_id = j.id WHERE e.user_id = ? AND e.deleted_at IS NULL ORDER BY e.created_at DESC";
  }

  const result = await getDb().execute({ sql, args });
  return result.rows.map((r) => plain<EntryRow>(r));
}

export async function getEntryCounts() {
  const session = await getSession();
  if (!session)
    return { all: 0, byJournal: {} as Record<number, number>, deleted: 0 };

  const [allResult, deletedResult, byJournalResult] = await Promise.all([
    getDb().execute({
      sql: "SELECT COUNT(*) as count FROM entries WHERE user_id = ? AND deleted_at IS NULL",
      args: [session.userId],
    }),
    getDb().execute({
      sql: "SELECT COUNT(*) as count FROM entries WHERE user_id = ? AND deleted_at IS NOT NULL",
      args: [session.userId],
    }),
    getDb().execute({
      sql: "SELECT journal_id, COUNT(*) as count FROM entries WHERE user_id = ? AND deleted_at IS NULL GROUP BY journal_id",
      args: [session.userId],
    }),
  ]);

  const byJournal: Record<number, number> = {};
  for (const row of byJournalResult.rows) {
    byJournal[Number(row.journal_id)] = Number(row.count);
  }

  return {
    all: Number(allResult.rows[0].count),
    byJournal,
    deleted: Number(deletedResult.rows[0].count),
  };
}

export async function getInsights() {
  const session = await getSession();
  if (!session)
    return { entriesThisYear: 0, daysJournaled: 0, wordsAllTime: 0 };

  const year = new Date().getFullYear();
  const [yearResult, daysResult, wordsResult] = await Promise.all([
    getDb().execute({
      sql: "SELECT COUNT(*) as count FROM entries WHERE user_id = ? AND deleted_at IS NULL AND strftime('%Y', created_at) = ?",
      args: [session.userId, String(year)],
    }),
    getDb().execute({
      sql: "SELECT COUNT(DISTINCT date(created_at)) as count FROM entries WHERE user_id = ? AND deleted_at IS NULL",
      args: [session.userId],
    }),
    getDb().execute({
      sql: "SELECT content FROM entries WHERE user_id = ? AND deleted_at IS NULL",
      args: [session.userId],
    }),
  ]);

  const wordsAllTime = wordsResult.rows.reduce((acc, row) => {
    const words = (row.content as string)
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    return acc + words;
  }, 0);

  return {
    entriesThisYear: Number(yearResult.rows[0].count),
    daysJournaled: Number(daysResult.rows[0].count),
    wordsAllTime,
  };
}

export type EntryDetail = {
  id: number;
  content: string;
  journal_id: number;
  journal_name: string;
  created_at: string;
};

export async function getEntry(entryId: number): Promise<EntryDetail | null> {
  const session = await getSession();
  if (!session) return null;
  const result = await getDb().execute({
    sql: "SELECT e.*, j.name as journal_name FROM entries e JOIN journals j ON e.journal_id = j.id WHERE e.id = ? AND e.user_id = ?",
    args: [entryId, session.userId],
  });
  if (!result.rows[0]) return null;
  return plain<EntryDetail>(result.rows[0]);
}
