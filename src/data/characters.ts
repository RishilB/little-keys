/**
 * Learning content. Each set is a list of items the child can be asked to find.
 * Future content (animals, birds, flowers…) can be added as new sets with their
 * own `display`/`spoken` values and the keys that answer them.
 */

export type ContentId = 'numbers' | 'letters';

export interface LearningItem {
  /** The single uppercase character shown on screen and matched against input. */
  char: string;
  /** How the narrator should pronounce it. */
  spoken: string;
}

export interface ContentSet {
  id: ContentId;
  label: string;
  /** Range shown to parents, e.g. "0–9". */
  range: string;
  /** Word used in narration: "the number five", "the letter B". */
  noun: string;
  items: LearningItem[];
}

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

/**
 * Speech engines read most capital letters correctly on their own; "A" alone is
 * often read as the article "uh", so it gets an explicit spelling.
 */
const LETTER_PRONUNCIATION: Record<string, string> = { A: 'ay' };

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const CONTENT_SETS: Record<ContentId, ContentSet> = {
  numbers: {
    id: 'numbers',
    label: 'Numbers',
    range: '0–9',
    noun: 'number',
    items: NUMBER_WORDS.map((word, i) => ({ char: String(i), spoken: word })),
  },
  letters: {
    id: 'letters',
    label: 'Alphabets',
    range: 'A–Z',
    noun: 'letter',
    items: LETTERS.map((char) => ({ char, spoken: LETTER_PRONUNCIATION[char] ?? char })),
  },
};

const ALL_ITEMS = [...CONTENT_SETS.numbers.items, ...CONTENT_SETS.letters.items];
const BY_CHAR = new Map(ALL_ITEMS.map((item) => [item.char, item]));

export function itemForChar(char: string): LearningItem | undefined {
  return BY_CHAR.get(char.toUpperCase());
}

/** Soft but readable colors; each character always gets the same one. */
export const CHAR_COLORS = ['#E2546C', '#3D7BEA', '#1F9D8B', '#E0703F', '#8A5CD8', '#2E9E57', '#C9467F', '#C98A00'];

export function colorForChar(char: string): string {
  const index = ALL_ITEMS.findIndex((item) => item.char === char.toUpperCase());
  return CHAR_COLORS[(index < 0 ? 0 : index) % CHAR_COLORS.length];
}

/** On-screen keyboard rows, laid out like a physical keyboard. */
export const KEYBOARD_ROWS = {
  numbers: ['1234567890'],
  letters: ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'],
};
