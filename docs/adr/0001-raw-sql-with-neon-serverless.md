# Raw SQL over the Neon serverless HTTP driver, no ORM

Entries live in Neon Postgres and are read and written with hand-written SQL through `@neondatabase/serverless`'s `neon()` HTTP client, not an ORM. The app has one table and four queries, so an ORM would add a dependency, a migration tool and a code-generation step without removing any real complexity; the HTTP driver also needs no connection pool, which suits Vercel's serverless functions. The schema lives in `db/schema.sql` and is applied with `npm run db:setup`.
