export type SequenceMode = 'order' | 'random';

/** Picks a random index in [0, length) that differs from `previous` (when length > 1). */
export function nextRandomIndex(length: number, previous: number | null, rand: () => number = Math.random): number {
  if (length <= 1) return 0;
  if (previous === null || previous < 0 || previous >= length) return Math.floor(rand() * length);
  const i = Math.floor(rand() * (length - 1));
  return i >= previous ? i + 1 : i;
}

/** Returns the next index for a sequence, or null when an ordered run is finished. */
export function nextIndex(mode: SequenceMode, length: number, current: number, rand?: () => number): number | null {
  if (mode === 'order') return current + 1 < length ? current + 1 : null;
  return nextRandomIndex(length, current, rand);
}

export function firstIndex(mode: SequenceMode, length: number, rand?: () => number): number {
  return mode === 'order' ? 0 : nextRandomIndex(length, null, rand);
}
