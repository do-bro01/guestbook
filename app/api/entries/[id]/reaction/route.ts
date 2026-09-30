import { findReaction, setReaction } from "@/lib/entries";
import { errorResponse, NOT_FOUND, readJson } from "@/lib/http";
import { nextReaction, parseReactionKind } from "@/lib/reaction";
import { parseEntryId } from "@/lib/validation";
import { ensureVoterId } from "@/lib/voter";

// Toggles the calling Voter's Reaction on an Entry (ADR-0006).
export async function POST(request: Request, ctx: RouteContext<"/api/entries/[id]/reaction">) {
  const pressed = parseReactionKind(await readJson(request));
  if (!pressed.ok) return errorResponse(400, pressed.error);

  const entryId = parseEntryId((await ctx.params).id);
  if (entryId === null) return errorResponse(404, NOT_FOUND);

  const voterId = await ensureVoterId();
  const current = await findReaction(entryId, voterId);
  if (current === undefined) return errorResponse(404, NOT_FOUND);

  return Response.json(await setReaction(entryId, voterId, nextReaction(current, pressed.value)));
}
