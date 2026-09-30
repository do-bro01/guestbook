import type { Entry } from "@/lib/entries";

// Browser-side client for the Entry API (ADR-0003). Every call resolves to
// either data or a user-facing error message; it never throws.

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function call<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json" },
    });
    if (res.status === 204) return { ok: true, data: undefined as T };
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, error: body?.error ?? `요청에 실패했습니다. (${res.status})` };
    }
    return { ok: true, data: body as T };
  } catch {
    return { ok: false, error: "서버에 연결할 수 없습니다." };
  }
}

export function fetchEntries() {
  return call<Entry[]>("/api/entries", { cache: "no-store" });
}

export function postEntry(input: { name: string; message: string; password: string }) {
  return call<Entry>("/api/entries", { method: "POST", body: JSON.stringify(input) });
}

export function patchEntry(id: number, input: { message: string; password: string }) {
  return call<Entry>(`/api/entries/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}
