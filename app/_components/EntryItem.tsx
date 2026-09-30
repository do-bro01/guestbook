"use client";

import { useState } from "react";
import type { Entry } from "@/lib/entries";
import { MESSAGE_MAX } from "@/lib/validation";
import { patchEntry } from "./api";

const writtenAtFormat = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

type Mode = "view" | "edit";

export function EntryItem({ entry, onChanged }: { entry: Entry; onChanged: () => void }) {
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
    const result = await patchEntry(entry.id, { message, password });
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
        <time className="text-xs text-zinc-500" dateTime={entry.createdAt}>
          {writtenAtFormat.format(new Date(entry.createdAt))}
        </time>
      </div>

      {mode === "view" ? (
        <>
          <p className="whitespace-pre-wrap break-words">{entry.message}</p>
          <div className="flex justify-end gap-2">
            <button className="btn-secondary" onClick={() => open("edit")}>
              수정
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            className="input min-h-20"
            value={message}
            maxLength={MESSAGE_MAX}
            onChange={(e) => setMessage(e.target.value)}
            aria-label="수정할 메시지"
            required
          />
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
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "저장 중…" : "수정 완료"}
            </button>
          </div>
        </form>
      )}
    </li>
  );
}
