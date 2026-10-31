import { describe, expect, it } from 'vitest';
import { keyEventToChar } from '../lib/keys';
import { firstIndex, nextIndex, nextRandomIndex } from '../lib/sequence';
import { addChar, MAX_VISIBLE, type PlacedChar } from '../lib/playground';

const key = (key: string, code = '', mods: Partial<KeyboardEvent> = {}) =>
  keyEventToChar({ key, code, ctrlKey: false, metaKey: false, altKey: false, ...mods } as KeyboardEvent);

describe('keyEventToChar', () => {
  it('accepts letters in either case and returns uppercase', () => {
    expect(key('a', 'KeyA')).toBe('A');
    expect(key('Z', 'KeyZ')).toBe('Z');
  });
  it('accepts number row and numeric keypad', () => {
    expect(key('5', 'Digit5')).toBe('5');
    expect(key('7', 'Numpad7')).toBe('7');
    expect(key('Home', 'Numpad7')).toBe('7');
  });
  it('ignores punctuation, modifiers and shortcuts', () => {
    expect(key('!', 'Digit1')).toBeNull();
    expect(key(',', 'Comma')).toBeNull();
    expect(key('Shift', 'ShiftLeft')).toBeNull();
    expect(key('Enter', 'Enter')).toBeNull();
    expect(key('c', 'KeyC', { ctrlKey: true })).toBeNull();
    expect(key('r', 'KeyR', { metaKey: true })).toBeNull();
    expect(key('a', 'KeyA', { altKey: true })).toBeNull();
  });
});

describe('sequences', () => {
  it('runs in order and ends after the last item', () => {
    const seen = [firstIndex('order', 10)];
    let next = nextIndex('order', 10, seen[0]);
    while (next !== null) {
      seen.push(next);
      next = nextIndex('order', 10, next);
    }
    expect(seen).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('random never repeats the same item twice in a row and covers every item', () => {
    let prev = firstIndex('random', 26);
    const seen = new Set([prev]);
    for (let i = 0; i < 5000; i++) {
      const next = nextRandomIndex(26, prev);
      expect(next).not.toBe(prev);
      expect(next).toBeGreaterThanOrEqual(0);
      expect(next).toBeLessThan(26);
      seen.add(next);
      prev = next;
    }
    expect(seen.size).toBe(26);
  });
  it('random never ends', () => {
    expect(nextIndex('random', 10, 9)).not.toBeNull();
  });
});

describe('playground placement', () => {
  const grid = { cols: 5, rows: 3 };
  it('never overlaps cells and keeps the visible count bounded during long play', () => {
    let items: PlacedChar[] = [];
    for (let i = 0; i < 500; i++) {
      items = addChar(items, 'ABCDEFGHIJ0123456789'[i % 20], grid);
      const cells = items.map((it) => it.cell);
      expect(new Set(cells).size).toBe(cells.length);
      expect(items.filter((it) => !it.leaving).length).toBeLessThanOrEqual(MAX_VISIBLE);
      expect(items.length).toBeLessThanOrEqual(grid.cols * grid.rows);
      // Simulate the fade-out finishing every few presses.
      if (i % 4 === 0) items = items.filter((it) => !it.leaving);
    }
  });
  it('keeps characters inside the canvas', () => {
    let items: PlacedChar[] = [];
    for (let i = 0; i < 50; i++) items = addChar(items, 'Q', grid);
    for (const it of items) {
      expect(it.x).toBeGreaterThan(0);
      expect(it.x).toBeLessThan(100);
      expect(it.y).toBeGreaterThan(0);
      expect(it.y).toBeLessThan(100);
    }
  });
});
