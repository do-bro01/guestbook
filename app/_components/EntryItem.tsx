"use client";

import type { Entry } from "@/lib/entries";

const writtenAtFormat = new Intl.DateTimeFormat("ko-KR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Seoul",
});

export function EntryItem({ entry }: { entry: Entry; onChanged: () => void }) {
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-black/10 p-4 dark:border-white/15">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold">{entry.name}</span>
        <time className="text-xs text-zinc-500" dateTime={entry.createdAt}>
          {writtenAtFormat.format(new Date(entry.createdAt))}
        </time>
      </div>
      <p className="whitespace-pre-wrap break-words">{entry.message}</p>
    </li>
  );
}
