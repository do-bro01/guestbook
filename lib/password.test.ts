import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("Entry password", () => {
  it("verifies the password it was hashed from", async () => {
    const stored = await hashPassword("secret1");
    expect(await verifyPassword("secret1", stored)).toBe(true);
  });

  it("rejects a different password", async () => {
    const stored = await hashPassword("secret1");
    expect(await verifyPassword("secret2", stored)).toBe(false);
  });

  it("never stores the plain password, and salts each hash", async () => {
    const a = await hashPassword("secret1");
    const b = await hashPassword("secret1");
    expect(a).not.toContain("secret1");
    expect(a).not.toBe(b);
  });

  it("returns false instead of throwing for a malformed stored value", async () => {
    expect(await verifyPassword("secret1", "garbage")).toBe(false);
    expect(await verifyPassword("secret1", "zz:zz")).toBe(false);
  });
});
