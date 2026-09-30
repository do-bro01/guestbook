# The page is a Client Component that uses the public JSON API

The `/` page is a Client Component that talks to `GET/POST /api/entries` and `PATCH/DELETE /api/entries/[id]` with `fetch`, instead of reading the database in a Server Component and mutating through Server Actions. The four HTTP endpoints are a required deliverable, so having the UI use the same endpoints means one code path to build and verify. It also keeps `next build` from touching the database, because nothing is prerendered from it.
