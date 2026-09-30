import { createEntry, listEntries } from "@/lib/entries";
import { errorResponse, readJson } from "@/lib/http";
import { parseNewEntry } from "@/lib/validation";
import { readVoterId } from "@/lib/voter";

export async function GET() {
  return Response.json(await listEntries(await readVoterId()));
}

export async function POST(request: Request) {
  const parsed = parseNewEntry(await readJson(request));
  if (!parsed.ok) return errorResponse(400, parsed.error);
  return Response.json(await createEntry(parsed.value), { status: 201 });
}
