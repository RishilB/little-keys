type KeyLike = Pick<KeyboardEvent, 'key' | 'code' | 'ctrlKey' | 'metaKey' | 'altKey'>;

/**
 * Maps a keyboard event to an accepted character (A–Z, 0–9) or null.
 * Letters are returned uppercase. Number-row and numeric-keypad digits are both
 * accepted. Punctuation, modifier keys and shortcuts (Ctrl/Alt/Cmd + key) are ignored.
 */
export function keyEventToChar(e: KeyLike): string | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  const numpad = /^Numpad([0-9])$/.exec(e.code ?? '');
  if (numpad) return numpad[1];
  if (/^[0-9]$/.test(e.key)) return e.key;
  if (/^[a-zA-Z]$/.test(e.key)) return e.key.toUpperCase();
  return null;
}
