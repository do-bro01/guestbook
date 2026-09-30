# 01: Write an Entry and see the guestbook

**What to build:** A visitor opens `/`, fills in Author name, Message and Entry password, submits, and sees their Entry at the top of a newest-first list showing Author name, Message and Written at. The page shows the Developer credit. This slice creates the `entries` table in Neon via `npm run db:setup`, adds the password module (scrypt + salt, `timingSafeEqual`) and the validation module with Vitest tests, adds `GET` and `POST /api/entries`, and builds the page's write form and list. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] `npm run db:setup` creates the `entries` table in the real Neon DB from the checked-in schema SQL, using `.env.local`, and is safe to re-run
- [x] `POST /api/entries` with valid input returns 201 and the Entry (`id, name, message, createdAt`), with no password data
- [x] `POST /api/entries` with a missing, wrongly typed or out-of-range field (name 1–20, message 1–500, password ≥ 4, after trimming name and message) returns 400 `{ error }`, and invalid JSON also returns 400
- [x] `GET /api/entries` returns 200 with all Entries newest first and never includes `password_hash`
- [x] The Entry password is stored only as `salt:hash`, never in plain text
- [x] The page shows the write form, the list (with an empty-state message and a load-error message) and "개발자: <name> (202404193)"
- [x] Vitest tests cover the password module and the validation module, and `npm test` passes
- [x] `npm run build` succeeds

## Comments

- Done. Verified against `next dev`: POST 201 (name trimmed), POST 400 for missing name, short password and invalid JSON, GET 200 newest first without password data. Stored hashes are `salt:hash` (161 chars), with no plain text. 16 Vitest tests pass, and `npm run build` succeeds with `/api/entries` dynamic.
