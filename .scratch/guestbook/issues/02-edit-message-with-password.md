# 02: Edit an Entry's Message with its Entry password

**What to build:** An Entry author clicks Edit on their Entry, sees the current Message pre-filled, types a new Message and the Entry password, and saves. On success the list shows the new Message, and Author name and Written at are unchanged. A wrong password is refused and "비밀번호가 일치하지 않습니다" appears under that Entry. Adds `PATCH /api/entries/{id}` and the inline edit panel. See `../spec.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [x] `PATCH /api/entries/{id}` with `{ message, password }` and the right password returns 200 with the updated Entry
- [x] A wrong password returns 403 `{ error: "비밀번호가 일치하지 않습니다" }` and the Message is unchanged
- [x] An unknown id or a non-positive-integer id returns 404, and invalid input returns 400, checked in the order 400 → 404 → 403
- [x] The UI edit panel can be cancelled, disables its button while saving, shows API errors inline and refreshes the list on success
- [x] `npm run build` succeeds

## Comments

- Done. Verified against `next dev`: PATCH 200 (message trimmed, Author name in the body ignored), 403 "비밀번호가 일치하지 않습니다" with the Message unchanged, 404 for an unknown id and for `abc`, and 400 for an empty message (400 wins over 404). 28 Vitest tests pass and `npm run build` succeeds.
