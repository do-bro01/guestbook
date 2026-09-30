import { describe, expect, it } from "vitest";
import { parseNewEntry } from "./validation";

describe("parseNewEntry", () => {
  it("accepts a valid Entry and trims Author name and Message but not the password", () => {
    expect(
      parseNewEntry({ name: "  민수 ", message: " 안녕하세요\n반가워요 ", password: " abcd " }),
    ).toEqual({
      ok: true,
      value: { name: "민수", message: "안녕하세요\n반가워요", password: " abcd " },
    });
  });

  it("accepts the length boundaries", () => {
    const result = parseNewEntry({
      name: "가".repeat(20),
      message: "나".repeat(500),
      password: "1234",
    });
    expect(result.ok).toBe(true);
  });

  it.each([
    ["a non-object body", null],
    ["a missing name", { message: "hi", password: "1234" }],
    ["a missing message", { name: "a", password: "1234" }],
    ["a missing password", { name: "a", message: "hi" }],
    ["a non-string name", { name: 1, message: "hi", password: "1234" }],
    ["a whitespace-only name", { name: "   ", message: "hi", password: "1234" }],
    ["a name over 20 characters", { name: "가".repeat(21), message: "hi", password: "1234" }],
    ["a whitespace-only message", { name: "a", message: " \n ", password: "1234" }],
    ["a message over 500 characters", { name: "a", message: "나".repeat(501), password: "1234" }],
    ["a password under 4 characters", { name: "a", message: "hi", password: "123" }],
  ])("rejects %s", (_label, body) => {
    const result = parseNewEntry(body);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/\S/);
  });
});
