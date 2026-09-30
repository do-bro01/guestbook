# Password hash format and input normalisation

These details were not specified, so the simplest workable option was chosen for each.

- The hash is stored in one `password_hash` text column as `<salt hex>:<scrypt hash hex>`, with a 16-byte salt and a 64-byte key. One column keeps the schema and queries small. Changing the format later would need a re-hash on next use, so it is recorded here.
- Author name and Message are trimmed before their length is checked (name 1–20, message 1–500 characters). The password is used as typed, never trimmed, and must be at least 4 characters.
- A missing field, a wrong type and a length violation all return 400. Errors are checked in the order 400 → 404 → 403, so a malformed request never reveals whether an Entry exists or whether a password matched.
- An id that is not a positive integer is treated as a missing Entry (404).
