# 05: Message counter, relative Written at, and sort by Likes

**What to build:** While writing or editing, a visitor sees how many of the 500 characters they have used. Each Entry shows how long ago it was written, with the exact time on hover. The list can be switched between newest first (default) and most Liked. See the counter/time/sorting addendum in `../spec.md`.

**Blocked by:** 04

**Status:** ready-for-agent

- [x] `n / 500` counter under the Message field in the write form and the edit panel, counted by code points like the server. Over the limit it is flagged and submit is disabled.
- [x] Written at shows "방금 전 / N분 전 / N시간 전 / 어제 / N일 전 / date" in Korean time, refreshes every minute, and shows the full time on hover
- [x] 최신순 / 좋아요순 toggles, backed by `GET /api/entries?sort=latest|likes`. Missing means latest, and an invalid value returns 400.
- [x] Vitest covers the relative-time rules (including a Korea-vs-UTC day boundary), sort parsing and character counting
- [x] `npm run build` succeeds

## Comments

- Done. The sort `curl` check (5) passed: default and `latest` are newest first, `likes` is 2 → 1 → 0 Likes, and a bad sort returns 400. The v1 (19) and reaction (16) regression runs still pass. 65 Vitest tests pass, lint is clean and `npm run build` succeeds.
