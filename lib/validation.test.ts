import { describe, expect, it } from "vitest";
import {
  parseEntryId,
  parseMessageUpdate,
  parseNewEntry,
  parsePasswordOnly,
} from "./validation";

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

describe("parseMessageUpdate", () => {
  it("accepts a trimmed Message and the password as typed", () => {
    expect(parseMessageUpdate({ message: " 고친 글 ", password: "abcd" })).toEqual({
      ok: true,
      value: { message: "고친 글", password: "abcd" },
    });
  });

  it("ignores an Author name in the body, since only the Message can change", () => {
    const result = parseMessageUpdate({ name: "other", message: "hi", password: "abcd" });
    expect(result).toEqual({ ok: true, value: { message: "hi", password: "abcd" } });
  });

  it.each([
    ["a missing message", { password: "abcd" }],
    ["a message over 500 characters", { message: "나".repeat(501), password: "abcd" }],
    ["a missing password", { message: "hi" }],
    ["a password under 4 characters", { message: "hi", password: "abc" }],
  ])("rejects %s", (_label, body) => {
    expect(parseMessageUpdate(body).ok).toBe(false);
  });
});

describe("parseEntryId", () => {
  it.each([
    ["1", 1],
    ["42", 42],
  ])("accepts %s", (raw, id) => {
    expect(parseEntryId(raw)).toBe(id);
  });

  it.each(["0", "-1", "1.5", "abc", "1e3", "", "01", "99999999999"])("rejects %j", (raw) => {
    expect(parseEntryId(raw)).toBeNull();
  });
});

describe("parsePasswordOnly", () => {
  it("accepts a password as typed", () => {
    expect(parsePasswordOnly({ password: " abcd" })).toEqual({
      ok: true,
      value: { password: " abcd" },
    });
  });

  it.each([
    ["a missing body", null],
    ["a missing password", {}],
    ["a password under 4 characters", { password: "abc" }],
  ])("rejects %s", (_label, body) => {
    expect(parsePasswordOnly(body).ok).toBe(false);
  });
});
