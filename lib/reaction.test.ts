import { describe, expect, it } from "vitest";
import { isVoterId, nextReaction, parseReactionKind } from "./reaction";

describe("nextReaction", () => {
  it("sets the pressed kind when the Voter has no Reaction", () => {
    expect(nextReaction(null, "like")).toBe("like");
    expect(nextReaction(null, "dislike")).toBe("dislike");
  });

  it("cancels the Reaction when the same kind is pressed again", () => {
    expect(nextReaction("like", "like")).toBeNull();
    expect(nextReaction("dislike", "dislike")).toBeNull();
  });

  it("switches to the other kind", () => {
    expect(nextReaction("like", "dislike")).toBe("dislike");
    expect(nextReaction("dislike", "like")).toBe("like");
  });
});

describe("parseReactionKind", () => {
  it("accepts like and dislike", () => {
    expect(parseReactionKind({ kind: "like" })).toEqual({ ok: true, value: "like" });
    expect(parseReactionKind({ kind: "dislike" })).toEqual({ ok: true, value: "dislike" });
  });

  it.each([null, {}, { kind: "love" }, { kind: 1 }, { kind: "LIKE" }])("rejects %j", (body) => {
    expect(parseReactionKind(body).ok).toBe(false);
  });
});

describe("isVoterId", () => {
  it("accepts a UUID", () => {
    expect(isVoterId("3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b")).toBe(true);
  });

  it.each([undefined, "", "not-a-uuid", "3f2b8c1e9a4d4e6f8b7a1c2d3e4f5a6b", "' OR 1=1 --"])(
    "rejects %j",
    (value) => {
      expect(isVoterId(value)).toBe(false);
    },
  );
});
