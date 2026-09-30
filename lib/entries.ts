import { neon } from "@neondatabase/serverless";
import { hashPassword } from "./password";
import type { ReactionKind, ReactionSummary } from "./reaction";
import type { NewEntryInput } from "./validation";

// The only module that talks SQL (ADR-0001). Every read returns the public
// Entry shape; password_hash is never selected into it.

export type Entry = {
  id: number;
  name: string;
  message: string;
  createdAt: string;
};

// An Entry as listed, with its Reaction counts for the calling Voter.
export type ListedEntry = Entry & ReactionSummary;

type EntryRow = {
  id: number;
  name: string;
  message: string;
  created_at: string | Date;
};

let client: ReturnType<typeof neon> | null = null;

// Created lazily so `next build` does not need DATABASE_URL.
function db() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    client = neon(url);
  }
  return client;
}

function toEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    name: row.name,
    message: row.message,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

type SummaryRow = { likes: number; dislikes: number; my_reaction: ReactionKind | null };

function toSummary(row: SummaryRow): ReactionSummary {
  return { likes: row.likes, dislikes: row.dislikes, myReaction: row.my_reaction };
}

// voterId is null for a browser that has never reacted.
export async function listEntries(voterId: string | null): Promise<ListedEntry[]> {
  const rows = (await db()`
    SELECT e.id, e.name, e.message, e.created_at,
           count(r.kind) FILTER (WHERE r.kind = 'like')::int    AS likes,
           count(r.kind) FILTER (WHERE r.kind = 'dislike')::int AS dislikes,
           max(r.kind)   FILTER (WHERE r.voter_id = ${voterId}::uuid) AS my_reaction
    FROM entries e
    LEFT JOIN reactions r ON r.entry_id = e.id
    GROUP BY e.id
    ORDER BY e.created_at DESC, e.id DESC
  `) as (EntryRow & SummaryRow)[];
  return rows.map((row) => ({ ...toEntry(row), ...toSummary(row) }));
}

export async function createEntry(input: NewEntryInput): Promise<Entry> {
  const passwordHash = await hashPassword(input.password);
  const rows = (await db()`
    INSERT INTO entries (name, message, password_hash)
    VALUES (${input.name}, ${input.message}, ${passwordHash})
    RETURNING id, name, message, created_at
  `) as EntryRow[];
  return toEntry(rows[0]);
}

// Used only to check an Entry password; the hash never leaves the server.
export async function findPasswordHash(id: number): Promise<string | null> {
  const rows = (await db()`
    SELECT password_hash FROM entries WHERE id = ${id}
  `) as { password_hash: string }[];
  return rows[0]?.password_hash ?? null;
}

// Returns null if the Entry was deleted in the meantime.
export async function updateMessage(id: number, message: string): Promise<Entry | null> {
  const rows = (await db()`
    UPDATE entries SET message = ${message}
    WHERE id = ${id}
    RETURNING id, name, message, created_at
  `) as EntryRow[];
  return rows[0] ? toEntry(rows[0]) : null;
}

export async function deleteEntry(id: number): Promise<void> {
  await db()`DELETE FROM entries WHERE id = ${id}`;
}

// The Voter's current Reaction on an Entry, or undefined if the Entry does not exist.
export async function findReaction(
  entryId: number,
  voterId: string,
): Promise<ReactionKind | null | undefined> {
  const rows = (await db()`
    SELECT r.kind
    FROM entries e
    LEFT JOIN reactions r ON r.entry_id = e.id AND r.voter_id = ${voterId}::uuid
    WHERE e.id = ${entryId}
  `) as { kind: ReactionKind | null }[];
  return rows.length ? rows[0].kind : undefined;
}

// Stores the Voter's Reaction (null removes it) and returns the new summary.
export async function setReaction(
  entryId: number,
  voterId: string,
  kind: ReactionKind | null,
): Promise<ReactionSummary> {
  if (kind === null) {
    await db()`DELETE FROM reactions WHERE entry_id = ${entryId} AND voter_id = ${voterId}::uuid`;
  } else {
    await db()`
      INSERT INTO reactions (entry_id, voter_id, kind)
      VALUES (${entryId}, ${voterId}::uuid, ${kind})
      ON CONFLICT (entry_id, voter_id) DO UPDATE SET kind = EXCLUDED.kind
    `;
  }
  const rows = (await db()`
    SELECT count(*) FILTER (WHERE kind = 'like')::int    AS likes,
           count(*) FILTER (WHERE kind = 'dislike')::int AS dislikes,
           ${kind}::text AS my_reaction
    FROM reactions
    WHERE entry_id = ${entryId}
  `) as SummaryRow[];
  return toSummary(rows[0]);
}
