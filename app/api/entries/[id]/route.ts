import { findPasswordHash, updateMessage } from "@/lib/entries";
import { errorResponse, NOT_FOUND, readJson, WRONG_PASSWORD } from "@/lib/http";
import { verifyPassword } from "@/lib/password";
import { parseEntryId, parseMessageUpdate } from "@/lib/validation";

type Ctx = RouteContext<"/api/entries/[id]">;

// Resolves the Entry id and checks its password, in the order 404 → 403.
// Returns the id on success or the error Response to send.
async function authorize(ctx: Ctx, password: string): Promise<number | Response> {
  const id = parseEntryId((await ctx.params).id);
  if (id === null) return errorResponse(404, NOT_FOUND);
  const stored = await findPasswordHash(id);
  if (stored === null) return errorResponse(404, NOT_FOUND);
  if (!(await verifyPassword(password, stored))) return errorResponse(403, WRONG_PASSWORD);
  return id;
}

export async function PATCH(request: Request, ctx: Ctx) {
  const parsed = parseMessageUpdate(await readJson(request));
  if (!parsed.ok) return errorResponse(400, parsed.error);

  const id = await authorize(ctx, parsed.value.password);
  if (id instanceof Response) return id;

  const entry = await updateMessage(id, parsed.value.message);
  if (!entry) return errorResponse(404, NOT_FOUND);
  return Response.json(entry);
}
