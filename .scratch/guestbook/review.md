# Code review: 91a9a7b..e0a33d6

Both axes were reviewed inline, because sub-agents could not be launched (the auto-mode classifier was unavailable).

## Standards

- No documented-standard violations (AGENTS.md / Next 16 docs, GLOSSARY.md, ADR 0001–0005).
- Data Clumps (judgement call): the client API redeclared the request input shapes. **Fixed** by reusing `NewEntryInput`, `MessageUpdateInput` and `PasswordOnlyInput` from the validation module.
- Mysterious Name (judgement call): `apply` in the Guestbook component. **Fixed** by renaming it to `applyListResult`.
- Mysterious Name (judgement call): the client `deleteEntry` has the same name as the repository `deleteEntry`. **Kept**: the modules are separate and never import each other.
- Glossary (judgement call): the `createdAt` field vs the glossary term "Written at". **Kept**: it matches the API contract and the DB column.

## Spec

- Nothing missing or partial. Nothing incorrectly implemented. Scope creep: none of note (DB CHECK constraints are in the spec).
- Not verified in a real browser: the inline "비밀번호가 일치하지 않습니다" message was checked through the code path and the API responses only.
