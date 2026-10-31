import { useEffect, useRef } from 'react';
import { keyEventToChar } from '../lib/keys';

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el || !el.tagName) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

/**
 * Listens on the window, so input works immediately without clicking the play area.
 * Each physical press counts once: auto-repeat from a held key is ignored, as is
 * a second keydown for a key that hasn't been released yet.
 */
export function useCharInput(onChar: (char: string) => void, enabled = true): void {
  const handler = useRef(onChar);
  handler.current = onChar;

  useEffect(() => {
    if (!enabled) return;
    const held = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const char = keyEventToChar(e);
      const id = e.code || e.key;
      if (e.repeat || held.has(id)) {
        if (char) e.preventDefault();
        return;
      }
      held.add(id);
      if (!char) return;
      e.preventDefault();
      handler.current(char);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      held.delete(e.code || e.key);
    };
    const reset = () => held.clear();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', reset);
    };
  }, [enabled]);
}
