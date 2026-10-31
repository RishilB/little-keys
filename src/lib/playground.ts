import { colorForChar } from '../data/characters';

export interface PlacedChar {
  id: number;
  char: string;
  color: string;
  /** Index into the layout's side cells. */
  cell: number;
  /** Resting center position as a percentage of the canvas. */
  x: number;
  y: number;
  rotate: number;
  leaving: boolean;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * The canvas is split into a central spotlight, where each new key appears
 * large, and side cells where keys come to rest: left/right columns on wide
 * screens, top/bottom bands on tall ones.
 */
export interface Layout {
  /** Centers of the resting cells, as percentages of the canvas. */
  cells: Point[];
  /** Size of one resting cell in px. */
  cellPx: number;
  /** Font size of a character in the spotlight, in px. */
  spotPx: number;
  orientation: 'sides' | 'bands';
  /** Canvas size the layout was computed for, in px. */
  width: number;
  height: number;
}

/** Visible characters before the oldest start fading out. */
export const MAX_VISIBLE = 9;
/** Share of the canvas given to each side column (or band). */
const SIDE_SHARE = 0.27;

export function layoutFor(width: number, height: number): Layout {
  const w = width > 0 ? width : 1000;
  const h = height > 0 ? height : 600;
  const cells: Point[] = [];

  if (w >= h * 0.9) {
    const colW = (w * SIDE_SHARE) / 2;
    const rows = Math.max(2, Math.round(h / colW));
    const rowH = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < 2; c++) {
        const x = ((c + 0.5) * colW) / w;
        const y = (r + 0.5) / rows;
        cells.push({ x: x * 100, y: y * 100 }, { x: (1 - x) * 100, y: y * 100 });
      }
    }
    return {
      cells,
      cellPx: Math.min(colW, rowH),
      spotPx: Math.min(w * (1 - 2 * SIDE_SHARE), h) * 0.78,
      orientation: 'sides',
      width: w,
      height: h,
    };
  }

  const rowH = (h * SIDE_SHARE) / 2;
  const cols = Math.max(2, Math.round(w / rowH));
  const colW = w / cols;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c + 0.5) / cols;
      const y = ((r + 0.5) * rowH) / h;
      cells.push({ x: x * 100, y: y * 100 }, { x: x * 100, y: (1 - y) * 100 });
    }
  }
  return {
    cells,
    cellPx: Math.min(colW, rowH),
    spotPx: Math.min(w, h * (1 - 2 * SIDE_SHARE)) * 0.78,
    orientation: 'bands',
    width: w,
    height: h,
  };
}

let nextId = 1;

/**
 * Adds a character in a free side cell (so characters never overlap) and marks
 * the oldest visible ones as leaving once too many are on screen.
 * Pure apart from the id counter; `rand` is injectable for tests.
 */
export function addChar(items: PlacedChar[], char: string, layout: Layout, rand: () => number = Math.random): PlacedChar[] {
  const total = layout.cells.length;
  const maxVisible = Math.min(MAX_VISIBLE, Math.max(1, total - 2));
  // Items from a previous, larger layout (after a resize) may sit outside this one.
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
  const center = layout.cells[cell];
  // A little wobble so the sides look playful rather than gridded.
  const jitter = () => (rand() - 0.5) * 0.16 * layout.cellPx;
  const placed: PlacedChar = {
    id: nextId++,
    char,
    color: colorForChar(char),
    cell,
    x: center.x + (jitter() / layout.width) * 100,
    y: center.y + (jitter() / layout.height) * 100,
    rotate: Math.round((rand() - 0.5) * 16),
    leaving: false,
  };
  const next = [...list, placed];
  let visible = next.filter((it) => !it.leaving).length;
  return next.map((it) => {
    if (visible > maxVisible && !it.leaving) {
      visible--;
      return { ...it, leaving: true };
    }
    return it;
  });
}
