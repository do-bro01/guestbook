# 03: Delete an Entry with its Entry password

**What to build:** An Entry author clicks Delete on their Entry, types the Entry password and confirms. On success the Entry disappears from the list. A wrong password is refused and "비밀번호가 일치하지 않습니다" appears under that Entry. Adds `DELETE /api/entries/{id}` (password in the JSON body, ADR-0004) and the inline delete panel. Finishes with a full manual API run against `next dev`. See `../spec.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] `DELETE /api/entries/{id}` with `{ password }` and the right password returns 204 and the Entry is gone from `GET`
- [ ] A wrong password returns 403 `{ error: "비밀번호가 일치하지 않습니다" }` and the Entry remains
- [ ] An unknown id or a non-positive-integer id returns 404, and a missing or short password returns 400
- [ ] The UI delete panel can be cancelled, disables its button while deleting, shows API errors inline and refreshes the list on success
- [ ] Manual `curl` verification against `next dev` covers create, list, edit, delete, wrong-password edit and delete (403), 404 and 400
- [ ] `npm run build` succeeds
