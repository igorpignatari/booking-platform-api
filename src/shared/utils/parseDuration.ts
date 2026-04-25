const UNIT_TO_MS = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;

type Unit = keyof typeof UNIT_TO_MS;

/**
 * Parses a duration string like "15m", "7d", "500ms" into milliseconds.
 * @throws if the format is invalid (should never happen if env is validated).
 */
export function parseDuration(input: string): number {
  const match = input.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) {
    throw new Error(`Invalid duration format: "${input}"`);
  }

  const [, amount, unit] = match;
  return Number(amount) * UNIT_TO_MS[unit as Unit];
}
