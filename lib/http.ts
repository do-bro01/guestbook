// Shared helpers for the Entry Route Handlers.

export function errorResponse(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

// Invalid or missing JSON is treated as an empty body, so validation
// rejects it with 400 like any other bad input.
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export const NOT_FOUND = "글을 찾을 수 없습니다.";
export const WRONG_PASSWORD = "비밀번호가 일치하지 않습니다";
