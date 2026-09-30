"use client";

import { useCallback, useEffect, useState } from "react";
import type { Entry } from "@/lib/entries";
import { type ApiResult, fetchEntries } from "./api";
import { EntryForm } from "./EntryForm";
import { EntryItem } from "./EntryItem";

export function Guestbook() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const applyListResult = useCallback((result: ApiResult<Entry[]>) => {
    if (result.ok) {
      setEntries(result.data);
      setLoadError(null);
    } else {
      setLoadError(result.error);
    }
  }, []);

  const load = useCallback(async () => applyListResult(await fetchEntries()), [applyListResult]);

  useEffect(() => {
    let active = true;
    fetchEntries().then((result) => {
      if (active) applyListResult(result);
    });
    return () => {
      active = false;
    };
  }, [applyListResult]);

  return (
    <div className="flex flex-col gap-6">
      <EntryForm onCreated={load} />
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          방명록 {entries ? `(${entries.length})` : ""}
        </h2>
        {loadError && (
          <p className="text-sm text-red-600">
            목록을 불러오지 못했습니다: {loadError}{" "}
            <button className="underline" onClick={load}>
              다시 시도
            </button>
          </p>
        )}
        {!entries && !loadError && <p className="text-sm text-zinc-500">불러오는 중…</p>}
        {entries?.length === 0 && (
          <p className="text-sm text-zinc-500">아직 글이 없습니다. 첫 글을 남겨 보세요!</p>
        )}
        <ul className="flex flex-col gap-3">
          {entries?.map((entry) => (
            <EntryItem key={entry.id} entry={entry} onChanged={load} />
          ))}
        </ul>
      </section>
    </div>
  );
}
