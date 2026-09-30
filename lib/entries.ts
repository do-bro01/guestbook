import { neon } from "@neondatabase/serverless";
import { hashPassword } from "./password";
import type { NewEntryInput } from "./validation";

// The only module that talks SQL (ADR-0001). Every read returns the public
// Entry shape; password_hash is never selected into it.

export type Entry = {
  id: number;
  name: string;
  message: string;
  createdAt: string;
};

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

export async function listEntries(): Promise<Entry[]> {
  const rows = (await db()`
    SELECT id, name, message, created_at
    FROM entries
    ORDER BY created_at DESC, id DESC
  `) as EntryRow[];
  return rows.map(toEntry);
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
