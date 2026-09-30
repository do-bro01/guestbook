"use client";

import { useEffect, useState } from "react";
import { formatRelative, fullDateTime } from "@/lib/relative-time";

// Relative Written at ("3분 전"); hovering shows the exact time. Re-renders
// every minute so the label stays current.
export function WrittenAt({ iso }: { iso: string }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const date = new Date(iso);
  return (
    <time className="text-xs text-zinc-500" dateTime={iso} title={fullDateTime.format(date)}>
      {formatRelative(date, now)}
    </time>
  );
}
