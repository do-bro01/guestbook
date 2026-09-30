# 04: Like and Dislike an Entry

**What to build:** Every Entry shows grayscale 👍 and 👎 buttons with counts. A visitor presses one to react. Pressing the same button again cancels the Reaction, and pressing the other switches it. The visitor's own choice is shown as pressed. Another visitor cannot cancel it. See the Reactions addendum in `../spec.md` and ADR-0006.

**Blocked by:** 01

**Status:** ready-for-agent

- [x] `npm run db:setup` adds the `reactions` table (one row per Entry and Voter, cascade on Entry delete) and stays idempotent
- [x] `POST /api/entries/{id}/reaction` toggles as specified and returns `{ likes, dislikes, myReaction }`, sets an httpOnly `voter_id` cookie on first use, returns 400 for a bad kind and 404 for a missing Entry
- [x] `GET /api/entries` includes `likes`, `dislikes` and `myReaction` for the calling Voter
- [x] A second Voter pressing the same button adds their own Reaction and does not cancel the first Voter's
- [x] The UI shows grayscale 👍/👎 with counts, marks the Voter's current choice, and disables the buttons while a request is in flight
- [x] Vitest covers the toggle rule, kind validation and Voter-id validation, and `npm test` passes
- [x] `npm run build` succeeds

## Comments

- Done. A `curl` run with two cookie jars (16 checks) passed. A like, then B like gives 2. A pressing like again cancels only A's. B pressing dislike switches. GET shows each Voter's own `myReaction`, and an anonymous request gets null. A bad kind returns 400, a missing or bad id returns 404, and a forged cookie is treated as a new Voter. Deleting the Entry cascades its Reactions. The v1 regression run (19 checks) still passes, 51 Vitest tests pass and `npm run build` succeeds.
