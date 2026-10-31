import { colorForChar } from '../data/characters';

export interface PlacedChar {
  id: number;
  char: string;
  color: string;
  cell: number;
  /** Center position as a percentage of the canvas. */
  x: number;
  y: number;
  rotate: number;
  leaving: boolean;
}

export interface Grid {
  cols: number;
  rows: number;
}

/** Visible characters before the oldest start fading out. */
export const MAX_VISIBLE = 9;

export function gridFor(width: number, height: number): Grid {
  if (width <= 0 || height <= 0) return { cols: 5, rows: 3 };
  const ratio = width / height;
  if (ratio > 1.9) return { cols: 6, rows: 3 };
  if (ratio > 1.15) return { cols: 5, rows: 3 };
  if (ratio > 0.8) return { cols: 4, rows: 4 };
  return { cols: 3, rows: 5 };
}

let nextId = 1;

/**
 * Adds a character in a free grid cell (so characters never overlap) and marks
 * the oldest visible ones as leaving once more than MAX_VISIBLE are on screen.
 * Pure apart from the id counter; `rand` is injectable for tests.
 */
export function addChar(items: PlacedChar[], char: string, grid: Grid, rand: () => number = Math.random): PlacedChar[] {
  const total = grid.cols * grid.rows;
  // Items from a previous, larger grid (after a resize) may sit outside this one.
  let list = items.filter((it) => it.cell < total || it.leaving);
  const used = new Set(list.map((it) => it.cell));
  let free = Array.from({ length: total }, (_, i) => i).filter((i) => !used.has(i));
  while (free.length === 0 && list.length > 0) {
    // Every cell is busy (very fast typing): drop the oldest item immediately.
    const [oldest, ...rest] = list;
    list = rest;
    if (oldest.cell < total) free = [oldest.cell];
  }
  const cell = free[Math.floor(rand() * free.length)];
  const col = cell % grid.cols;
  const row = Math.floor(cell / grid.cols);
  const jitter = () => (rand() - 0.5) * 0.16;
  const placed: PlacedChar = {
    id: nextId++,
    char,
    color: colorForChar(char),
    cell,
    x: ((col + 0.5 + jitter()) / grid.cols) * 100,
    y: ((row + 0.5 + jitter()) / grid.rows) * 100,
    rotate: Math.round((rand() - 0.5) * 16),
    leaving: false,
  };
  const next = [...list, placed];
  let visible = next.filter((it) => !it.leaving).length;
  return next.map((it) => {
    if (visible > MAX_VISIBLE && !it.leaving) {
      visible--;
      return { ...it, leaving: true };
    }
    return it;
  });
}
