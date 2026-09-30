// Applies db/schema.sql to the database in DATABASE_URL.
// Run with: npm run db:setup  (node --env-file=.env.local scripts/db-setup.mjs)
import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Add it to .env.local.");
  process.exit(1);
}

const sql = neon(url);
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");

// The HTTP driver runs one statement per call, so split the file on ";".
const statements = schema
  .replace(/--.*$/gm, "")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
  console.log("ok:", statement.split("\n")[0]);
}

const [{ count }] = await sql.query("SELECT count(*)::int AS count FROM entries");
console.log(`entries table ready (${count} rows)`);
