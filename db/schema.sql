-- Guestbook schema. Apply with `npm run db:setup` (idempotent).

CREATE TABLE IF NOT EXISTS entries (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 20),
  message       text        NOT NULL CHECK (char_length(message) BETWEEN 1 AND 500),
  password_hash text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS entries_created_at_idx ON entries (created_at DESC, id DESC);

-- One Reaction per (Entry, Voter); deleted with its Entry (ADR-0006).
CREATE TABLE IF NOT EXISTS reactions (
  entry_id   integer     NOT NULL REFERENCES entries (id) ON DELETE CASCADE,
  voter_id   uuid        NOT NULL,
  kind       text        NOT NULL CHECK (kind IN ('like', 'dislike')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entry_id, voter_id)
);
