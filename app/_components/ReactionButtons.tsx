"use client";

import { useState } from "react";
import type { ListedEntry } from "@/lib/entries";
import type { ReactionKind, ReactionSummary } from "@/lib/reaction";
import { postReaction } from "./api";

const BUTTONS: { kind: ReactionKind; emoji: string; label: string; count: keyof ReactionSummary }[] = [
  { kind: "like", emoji: "👍", label: "좋아요", count: "likes" },
  { kind: "dislike", emoji: "👎", label: "싫어요", count: "dislikes" },
];

type Props = {
  entry: ListedEntry;
  onReacted: (id: number, summary: ReactionSummary) => void;
};

// Grayscale 👍/👎 toggles. Pressing your current choice again cancels it (ADR-0006).
export function ReactionButtons({ entry, onReacted }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function react(kind: ReactionKind) {
    setBusy(true);
    setError(null);
    const result = await postReaction(entry.id, kind);
    setBusy(false);
    if (result.ok) onReacted(entry.id, result.data);
    else setError(result.error);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {BUTTONS.map(({ kind, emoji, label, count }) => {
        const pressed = entry.myReaction === kind;
        return (
          <button
            key={kind}
            type="button"
            onClick={() => react(kind)}
            disabled={busy}
            aria-pressed={pressed}
            title={pressed ? `${label} 취소` : label}
            className={`chip ${pressed ? "chip-on" : ""}`}
          >
            <span className="grayscale" aria-hidden>
              {emoji}
            </span>
            <span>{label}</span>
            <span className="tabular-nums">{entry[count]}</span>
          </button>
        );
      })}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
