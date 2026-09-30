import { charLength } from "@/lib/validation";

// "123 / 500" under a text field, counted the same way the server counts.
export function CharCounter({ value, max }: { value: string; max: number }) {
  const count = charLength(value);
  const over = count > max;
  return (
    <p
      className={`self-end text-xs tabular-nums ${over ? "font-semibold text-red-600" : "text-zinc-500"}`}
      aria-live="polite"
    >
      {count} / {max}
      {over && " (글자 수 초과)"}
    </p>
  );
}

export function isOverLimit(value: string, max: number): boolean {
  return charLength(value) > max;
}
