import type { Parsed } from "./validation";

// Reaction rules (ADR-0006). A Voter holds at most one Reaction per Entry.

export const REACTION_KINDS = ["like", "dislike"] as const;
export type ReactionKind = (typeof REACTION_KINDS)[number];

export type ReactionSummary = {
  likes: number;
  dislikes: number;
  myReaction: ReactionKind | null;
};

// Pressing the same kind again cancels; pressing the other kind switches.
export function nextReaction(
  current: ReactionKind | null,
  pressed: ReactionKind,
): ReactionKind | null {
  return current === pressed ? null : pressed;
}

export function parseReactionKind(input: unknown): Parsed<ReactionKind> {
  const kind = (input as { kind?: unknown } | null)?.kind;
  return REACTION_KINDS.includes(kind as ReactionKind)
    ? { ok: true, value: kind as ReactionKind }
    : { ok: false, error: "좋아요 또는 싫어요만 선택할 수 있습니다." };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isVoterId(value: string | undefined): value is string {
  return value !== undefined && UUID.test(value);
}
