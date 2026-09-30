// Input rules for the Entry API (ADR-0005). Lengths count characters (code
// points) to match Postgres char_length() in the schema's CHECK constraints.

export const NAME_MAX = 20;
export const MESSAGE_MAX = 500;
export const PASSWORD_MIN = 4;

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export type NewEntryInput = { name: string; message: string; password: string };

type Body = Record<string, unknown>;

const charLength = (s: string) => Array.from(s).length;

function asBody(body: unknown): Body | null {
  return typeof body === "object" && body !== null && !Array.isArray(body)
    ? (body as Body)
    : null;
}

function readName(body: Body): Parsed<string> {
  if (typeof body.name !== "string") return fail("이름을 입력해 주세요.");
  const name = body.name.trim();
  if (charLength(name) < 1) return fail("이름을 입력해 주세요.");
  if (charLength(name) > NAME_MAX) return fail(`이름은 ${NAME_MAX}자 이하로 입력해 주세요.`);
  return { ok: true, value: name };
}

function readMessage(body: Body): Parsed<string> {
  if (typeof body.message !== "string") return fail("메시지를 입력해 주세요.");
  const message = body.message.trim();
  if (charLength(message) < 1) return fail("메시지를 입력해 주세요.");
  if (charLength(message) > MESSAGE_MAX)
    return fail(`메시지는 ${MESSAGE_MAX}자 이하로 입력해 주세요.`);
  return { ok: true, value: message };
}

function readPassword(body: Body): Parsed<string> {
  if (typeof body.password !== "string" || body.password.length === 0)
    return fail("비밀번호를 입력해 주세요.");
  if (charLength(body.password) < PASSWORD_MIN)
    return fail(`비밀번호는 ${PASSWORD_MIN}자 이상 입력해 주세요.`);
  return { ok: true, value: body.password };
}

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

const INVALID_BODY = fail("요청 형식이 올바르지 않습니다.");

export function parseNewEntry(input: unknown): Parsed<NewEntryInput> {
  const body = asBody(input);
  if (!body) return INVALID_BODY;
  const name = readName(body);
  if (!name.ok) return name;
  const message = readMessage(body);
  if (!message.ok) return message;
  const password = readPassword(body);
  if (!password.ok) return password;
  return {
    ok: true,
    value: { name: name.value, message: message.value, password: password.value },
  };
}
