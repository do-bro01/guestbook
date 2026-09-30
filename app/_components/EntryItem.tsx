"use client";

import { useState } from "react";
import type { ListedEntry } from "@/lib/entries";
import type { ReactionSummary } from "@/lib/reaction";
import { MESSAGE_MAX } from "@/lib/validation";
import { deleteEntry, patchEntry } from "./api";
import { CharCounter, isOverLimit } from "./CharCounter";
import { ReactionButtons } from "./ReactionButtons";
import { WrittenAt } from "./WrittenAt";

type Mode = "view" | "edit" | "delete";

// [idle, busy] labels for the panel's submit button.
const SUBMIT_LABEL = {
  edit: ["수정 완료", "저장 중…"],
  delete: ["삭제", "삭제 중…"],
} as const;

type Props = {
  entry: ListedEntry;
  onChanged: () => void;
  onReacted: (id: number, summary: ReactionSummary) => void;
};

export function EntryItem({ entry, onChanged, onReacted }: Props) {
  const [mode, setMode] = useState<Mode>("view");
  const [message, setMessage] = useState(entry.message);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function open(next: Mode) {
    setMode(next);
    setMessage(entry.message);
    setPassword("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const result =
      mode === "edit"
        ? await patchEntry(entry.id, { message, password })
        : await deleteEntry(entry.id, { password });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMode("view");
    onChanged();
  }

  return (
    <li className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/15">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold">{entry.name}</span>
        <WrittenAt iso={entry.createdAt} />
      </div>

      {mode === "view" ? (
        <>
          <p className="whitespace-pre-wrap break-words">{entry.message}</p>
          <div className="flex items-center justify-between gap-2">
            <ReactionButtons entry={entry} onReacted={onReacted} />
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => open("edit")}>
                수정
              </button>
              <button className="btn-secondary" onClick={() => open("delete")}>
                삭제
              </button>
            </div>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {mode === "edit" ? (
            <>
              <textarea
                className="input min-h-20"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-label="수정할 메시지"
                required
              />
              <CharCounter value={message} max={MESSAGE_MAX} />
            </>
          ) : (
            <p className="text-sm">이 글을 삭제하려면 비밀번호를 입력하세요.</p>
          )}
          <input
            className="input"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-label="비밀번호"
            required
            autoFocus
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => open("view")}>
              취소
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={busy || (mode === "edit" && isOverLimit(message, MESSAGE_MAX))}
            >
              {SUBMIT_LABEL[mode][busy ? 1 : 0]}
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
