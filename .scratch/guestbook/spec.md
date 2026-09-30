# Spec: Mini Guestbook

Status: ready-for-agent

## Problem Statement

Visitors want a single public page where they can leave a short note for the site owner and everyone else, read what others wrote, and fix or take back their own note later. They do not want to sign up or log in for something this small, but they also do not want strangers to change or delete what they wrote.

## Solution

One page at `/` shows a form for writing an Entry (Author name, Message, Entry password) and, below it, every Entry, newest first, showing its Author name, Message and Written at time. Each Entry has Edit and Delete buttons. Both ask for the Entry password. Edit also lets the visitor change the Message. A wrong password is refused and the page says "비밀번호가 일치하지 않습니다". The page shows the Developer credit "개발자: <name> (202404193)". Everything is served by a small JSON API backed by Neon Postgres and deployed on Vercel.

## User Stories

1. As a visitor, I want to type an Author name, a Message and an Entry password and submit them, so that my Entry appears in the guestbook.
2. As a visitor, I want my new Entry to appear at the top of the list right after I submit, so that I can see it was saved.
3. As a visitor, I want the form to clear after a successful submit, so that I don't post the same Entry twice by accident.
4. As a visitor, I want to be told when my Author name is empty or longer than 20 characters, so that I can correct it.
5. As a visitor, I want to be told when my Message is empty or longer than 500 characters, so that I can correct it.
6. As a visitor, I want to be told when my Entry password is shorter than 4 characters, so that I choose one I can use later.
7. As a visitor, I want leading and trailing spaces in my Author name and Message ignored, so that an Entry of only spaces is not accepted.
8. As a visitor, I want to see every Entry with its Author name, Message and Written at time, so that I can read the guestbook.
9. As a visitor, I want Entries ordered newest first, so that recent notes are easy to find.
10. As a visitor, I want Written at shown in Korean local time, so that the times make sense to me.
11. As a visitor, I want line breaks in a Message preserved when displayed, so that multi-line notes stay readable.
12. As a visitor, I want a clear message when the guestbook is empty, so that I know the page loaded correctly.
13. As a visitor, I want a clear message when the list fails to load, so that I know to retry.
14. As an Entry author, I want to click Edit on my Entry, enter my Entry password and a new Message, so that I can fix what I wrote.
15. As an Entry author, I want Edit to change only the Message, so that the Author name and Written at stay as they were.
16. As an Entry author, I want the edit box pre-filled with my current Message, so that I only change what I need.
17. As an Entry author, I want to be told "비밀번호가 일치하지 않습니다" when my password is wrong on Edit, so that I know why nothing changed.
18. As an Entry author, I want to click Delete on my Entry and enter my Entry password, so that my Entry is removed.
19. As an Entry author, I want to be told "비밀번호가 일치하지 않습니다" when my password is wrong on Delete, so that I know why it was not removed.
20. As an Entry author, I want the list to refresh after a successful Edit or Delete, so that I see the result immediately.
21. As an Entry author, I want to cancel an Edit or Delete I started, so that I can back out without changes.
22. As a visitor, I want to be told when the Entry I tried to change no longer exists, so that I understand someone already deleted it.
23. As a visitor, I want the submit and confirm buttons disabled while a request is in progress, so that I don't send it twice.
24. As a visitor, I want my Entry password never shown back to me or others, so that it stays secret.
25. As an Entry author, I want my Entry password stored only in a form that cannot be reversed, so that a database leak does not expose it.
26. As an API client, I want `GET /api/entries` to return all Entries without any password data, so that I can build my own view safely.
27. As an API client, I want `POST /api/entries` to return 201 with the created Entry, so that I know its id and Written at.
28. As an API client, I want `PATCH /api/entries/{id}` to return 200 with the updated Entry, so that I can show the new Message.
29. As an API client, I want `DELETE /api/entries/{id}` to return 204, so that I know the Entry is gone.
30. As an API client, I want 400 with a reason for missing or invalid input, so that I can fix my request.
31. As an API client, I want 404 for an Entry that doesn't exist or an id that isn't a positive integer, so that I can tell a missing Entry apart from bad input.
32. As an API client, I want 403 with "비밀번호가 일치하지 않습니다" for a wrong Entry password, so that I can show the reason.
33. As a grader, I want to see "개발자: <name> (202404193)" on the page, so that I can identify who built it.
34. As the developer, I want to create the database table with one npm command using `.env.local`, so that setup is repeatable.
35. As the developer, I want `npm run build` to succeed without a database connection, so that Vercel deploys reliably.

## Implementation Decisions

- **Stack**: Next.js 16 App Router with TypeScript, Route Handlers for the API, and Neon Postgres through `@neondatabase/serverless`'s `neon()` HTTP client with raw SQL and no ORM (ADR-0001). Next 16 specifics: the dynamic route context's `params` is a Promise and is typed with the global `RouteContext<'/api/entries/[id]'>` helper. GET Route Handlers are not cached by default.
- **Schema**: one `entries` table: `id` integer identity primary key, `name` text, `message` text, `password_hash` text, and `created_at` timestamptz defaulting to now(). Length limits are also enforced by CHECK constraints. The table is created by a checked-in schema SQL file, run by a Node script (`node --env-file=.env.local`) that the npm script `db:setup` invokes. The script splits the file on `;` because the HTTP driver runs one statement per call. The schema is idempotent (`IF NOT EXISTS`).
- **Modules**:
  - *Password module*: `hashPassword(plain) → Promise<string>` and `verifyPassword(plain, stored) → Promise<boolean>`. It uses scrypt with a random 16-byte salt and a 64-byte key, stores `salt:hash` in hex, and compares with `timingSafeEqual`. A malformed stored value returns false (ADR-0002, ADR-0005).
  - *Validation module*: pure functions that take an unknown JSON body and return either the cleaned input or a Korean error message. `parseNewEntry`, `parseMessageUpdate` (message + password) and `parsePasswordOnly` cover the three request types, and `parseEntryId` turns a route param into a positive integer or null. Names and Messages are trimmed and passwords are not. Limits: name 1–20, message 1–500, password ≥ 4 (ADR-0005).
  - *Entries repository*: `listEntries()`, `createEntry(input)`, `findPasswordHash(id)`, `updateMessage(id, message)` and `deleteEntry(id)`. These are the only place SQL lives. Every read returns the public shape `Entry = { id: number; name: string; message: string; createdAt: string }` (ISO string), and no query that feeds a response selects `password_hash`.
  - *Route Handlers*: they read the JSON body (invalid JSON is treated as 400), validate, then for PATCH and DELETE check existence (404) and the password (403) before acting. Errors are checked in the order 400 → 404 → 403. Error bodies are `{ "error": "<message>" }`.
- **API contract**:
  - `GET /api/entries` → 200 `Entry[]`, ordered `created_at DESC, id DESC`.
  - `POST /api/entries` body `{ name, message, password }` → 201 `Entry` | 400.
  - `PATCH /api/entries/{id}` body `{ message, password }` → 200 `Entry` | 400 | 404 | 403.
  - `DELETE /api/entries/{id}` body `{ password }` → 204 | 400 | 404 | 403 (the password goes in the JSON body, ADR-0004).
  - The 403 message is exactly "비밀번호가 일치하지 않습니다".
- **Page**: `/` is a Client Component that uses only the API above (ADR-0003). It has a write form, the Entry list, and a per-Entry inline panel in mode `edit` (textarea + password) or `delete` (password), with at most one panel open per Entry. Errors from the API are shown inline at the form or the Entry that caused them. The Developer credit comes from a single constant, and the developer's real name must be filled in there. Styling uses the Tailwind setup that is already present.

## Testing Decisions

- Tests check behaviour through the public function interface only (inputs → outputs), never internal details such as the salt length or SQL text.
- **Tested with Vitest** (the only new dev dependency):
  - Password module: hash then verify with the right password is true and with a wrong password is false. The same password hashed twice gives different stored values. A garbage stored value verifies false and does not throw.
  - Validation module: valid input is trimmed and accepted, and each rule (missing, wrong type, too short, too long, whitespace-only) is rejected with a message. `parseEntryId` accepts only positive integers.
- **Not unit-tested**: the repository and the Route Handlers, which need a live database. They are verified by hand against `next dev` with `curl` for create, list, update, delete, wrong-password update and wrong-password delete (403), a missing id (404) and bad input (400).
- No Playwright or E2E tests, per the exam constraints. There is no prior art for tests in the repo, so these are the first.
- `npm run build` must succeed.

## Out of Scope

Pagination, admin tools, comments, images, accounts and login, password recovery, editing the Author name, edit history or an "updated at" time, rate limiting and spam protection.

## Addendum: Reactions (added after v1)

Requested by the developer after the first release, which reverses the original "likes are out of scope" line.

- Each Entry shows a 👍 Like count and a 👎 Dislike count as grayscale buttons that match the monochrome design.
- A Voter holds at most one Reaction per Entry. Pressing the same button again cancels it, and pressing the other one switches it. Only the Voter who reacted can cancel or switch that Reaction (ADR-0006).
- `POST /api/entries/{id}/reaction` with body `{ kind: "like" | "dislike" }` returns 200 `{ likes, dislikes, myReaction }`. An invalid kind returns 400 and a missing Entry returns 404. It sets the `voter_id` cookie on first use.
- `GET /api/entries` adds `likes`, `dislikes` and `myReaction` (`"like" | "dislike" | null`, for the calling Voter) to each Entry.
- Tested with Vitest: the toggle rule (same → cancel, other → switch, none → set), reaction-kind validation and Voter-id validation. The route and SQL are verified by hand with `curl` using two cookie jars.

## Further Notes

- `DATABASE_URL` must be set in Vercel project settings for the deployed app. `.env.local` is never committed (already covered by `.env*` in `.gitignore`).
- The developer's real name is not known to the agent. The Developer credit constant must be updated by the developer before submission.
