"use client";

import { useState } from "react";
import { MESSAGE_MAX, NAME_MAX, PASSWORD_MIN } from "@/lib/validation";
import { postEntry } from "./api";
import { CharCounter, isOverLimit } from "./CharCounter";

export function EntryForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await postEntry({ name, message, password });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setName("");
    setMessage("");
    setPassword("");
    onCreated();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/15"
    >
      <h2 className="text-lg font-semibold">방명록 남기기</h2>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="input sm:flex-1"
          placeholder={`이름 (최대 ${NAME_MAX}자)`}
          value={name}
          maxLength={NAME_MAX}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="input sm:flex-1"
          type="password"
          placeholder={`비밀번호 (${PASSWORD_MIN}자 이상)`}
          value={password}
          minLength={PASSWORD_MIN}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
      </div>
      <textarea
        className="input min-h-24"
        placeholder={`메시지 (최대 ${MESSAGE_MAX}자)`}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <CharCounter value={message} max={MESSAGE_MAX} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="btn-primary self-end"
        disabled={submitting || isOverLimit(message, MESSAGE_MAX)}
      >
        {submitting ? "등록 중…" : "등록"}
      </button>
    </form>
  );
}
