import { describe, expect, it } from "vitest";
import { formatRelative } from "./relative-time";

// All times are Korea Standard Time (UTC+9).
const now = new Date("2026-09-30T15:00:00+09:00");
const ago = (iso: string) => formatRelative(new Date(iso), now);

describe("formatRelative", () => {
  it("says 방금 전 under a minute, and for a clock slightly in the future", () => {
    expect(ago("2026-09-30T14:59:30+09:00")).toBe("방금 전");
    expect(ago("2026-09-30T15:00:20+09:00")).toBe("방금 전");
  });

  it("counts minutes under an hour", () => {
    expect(ago("2026-09-30T14:59:00+09:00")).toBe("1분 전");
    expect(ago("2026-09-30T14:01:00+09:00")).toBe("59분 전");
  });

  it("counts hours under a day", () => {
    expect(ago("2026-09-30T14:00:00+09:00")).toBe("1시간 전");
    expect(ago("2026-09-29T15:30:00+09:00")).toBe("23시간 전");
  });

  it("says 어제 for the previous calendar day in Korea once a day has passed", () => {
    expect(ago("2026-09-29T09:00:00+09:00")).toBe("어제");
  });

  it("counts days within a week", () => {
    expect(ago("2026-09-28T09:00:00+09:00")).toBe("2일 전");
    expect(ago("2026-09-24T09:00:00+09:00")).toBe("6일 전");
  });

  it("falls back to the date after a week", () => {
    expect(ago("2026-09-23T09:00:00+09:00")).toBe("2026. 9. 23.");
  });

  it("uses the Korean calendar day, not UTC", () => {
    // In UTC these are 09-28 00:30 and 09-29 23:30 (one day apart);
    // in Korea they are 09-28 and 09-30 (two days apart).
    const morning = new Date("2026-09-30T08:30:00+09:00");
    expect(formatRelative(new Date("2026-09-28T09:30:00+09:00"), morning)).toBe("2일 전");
  });
});
