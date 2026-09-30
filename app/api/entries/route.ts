import { createEntry, listEntries } from "@/lib/entries";
import { errorResponse, readJson } from "@/lib/http";
import { parseNewEntry, parseSort } from "@/lib/validation";
import { readVoterId } from "@/lib/voter";

export async function GET(request: Request) {
  const sort = parseSort(new URL(request.url).searchParams.get("sort"));
  if (!sort.ok) return errorResponse(400, sort.error);
  return Response.json(await listEntries(await readVoterId(), sort.value));
}

export async function POST(request: Request) {
  const parsed = parseNewEntry(await readJson(request));
  if (!parsed.ok) return errorResponse(400, parsed.error);
  return Response.json(await createEntry(parsed.value), { status: 201 });
}
