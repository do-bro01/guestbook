"use client";

import { useCallback, useEffect, useState } from "react";
import type { ListedEntry } from "@/lib/entries";
import type { ReactionSummary } from "@/lib/reaction";
import type { Sort } from "@/lib/validation";
import { type ApiResult, fetchEntries } from "./api";
import { EntryForm } from "./EntryForm";
import { EntryItem } from "./EntryItem";

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "likes", label: "좋아요순" },
];

export function Guestbook() {
  const [sort, setSort] = useState<Sort>("latest");
  const [entries, setEntries] = useState<ListedEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const applyListResult = useCallback((result: ApiResult<ListedEntry[]>) => {
    if (result.ok) {
      setEntries(result.data);
      setLoadError(null);
    } else {
      setLoadError(result.error);
    }
  }, []);

  const load = useCallback(
    async () => applyListResult(await fetchEntries(sort)),
    [applyListResult, sort],
  );

  const applyReaction = useCallback((id: number, summary: ReactionSummary) => {
    setEntries((prev) => prev?.map((e) => (e.id === id ? { ...e, ...summary } : e)) ?? prev);
  }, []);

  useEffect(() => {
    let active = true;
    fetchEntries(sort).then((result) => {
      if (active) applyListResult(result);
    });
    return () => {
      active = false;
    };
  }, [applyListResult, sort]);

  return (
    <div className="flex flex-col gap-6">
      <EntryForm onCreated={load} />
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">
            방명록 {entries ? `(${entries.length})` : ""}
          </h2>
          <div className="flex gap-1" role="group" aria-label="정렬">
            {SORT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={`chip ${sort === value ? "chip-on" : ""}`}
                aria-pressed={sort === value}
                onClick={() => setSort(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
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
            <EntryItem
              key={entry.id}
              entry={entry}
              onChanged={load}
              onReacted={applyReaction}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}
