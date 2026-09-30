import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { isVoterId } from "./reaction";

// The anonymous Voter behind a browser, kept in an httpOnly cookie (ADR-0006).

const COOKIE = "voter_id";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function readVoterId(): Promise<string | null> {
  const value = (await cookies()).get(COOKIE)?.value;
  return isVoterId(value) ? value : null;
}

// Returns the Voter id, issuing a new cookie if the browser has none.
export async function ensureVoterId(): Promise<string> {
  const existing = await readVoterId();
  if (existing) return existing;
  const id = randomUUID();
  (await cookies()).set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return id;
}
