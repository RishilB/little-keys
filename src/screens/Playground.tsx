import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Icon } from '../components/Icon';
import { OnScreenKeyboard } from '../components/OnScreenKeyboard';
import { ParentBar } from '../components/ParentBar';
import { KEYBOARD_ROWS, itemForChar } from '../data/characters';
import { phrases } from '../data/phrases';
import { useCharInput } from '../hooks/useCharInput';
import { narrator } from '../lib/narrator';
import { addChar, layoutFor, type PlacedChar } from '../lib/playground';
import { sfx } from '../lib/sfx';
import { useApp } from '../state/AppContext';

const FADE_MS = 700;
/** How long a new key stays big in the center before gliding to the side. */
const SPOTLIGHT_MS = 1100;
const ROWS = [KEYBOARD_ROWS.numbers[0], ...KEYBOARD_ROWS.letters];

interface Props {
  inputEnabled: boolean;
  onHome: () => void;
  onOpenSettings: () => void;
}

export function Playground({ inputEnabled, onHome, onOpenSettings }: Props) {
  const { settings, coarsePointer } = useApp();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [items, setItems] = useState<PlacedChar[]>([]);
  const itemsRef = useRef<PlacedChar[]>([]);
  const timers = useRef<number[]>([]);
  const [spotlightId, setSpotlightId] = useState<number | null>(null);
  const spotlightTimer = useRef<number | undefined>(undefined);

  const layout = layoutFor(size.w, size.h);

  const commit = (next: PlacedChar[]) => {
    itemsRef.current = next;
    setItems(next);
  };

  const removeLater = (ids: number[]) => {
    if (ids.length === 0) return;
    const gone = new Set(ids);
    timers.current.push(window.setTimeout(() => commit(itemsRef.current.filter((it) => !gone.has(it.id))), FADE_MS));
  };

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    narrator.speak(phrases.playgroundIntro());
    return () => {
      narrator.cancel();
      timers.current.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(spotlightTimer.current);
    };
  }, []);

  const handleChar = (char: string) => {
    const item = itemForChar(char);
    if (!item) return;
    sfx.pop();
    // Each press interrupts the previous name, so speech never queues up.
    narrator.speak(phrases.playgroundKey(item), { tag: 'playground' });
    const wasLeaving = new Set(itemsRef.current.filter((it) => it.leaving).map((it) => it.id));
    const next = addChar(itemsRef.current, item.char, layout);
    commit(next);
    removeLater(next.filter((it) => it.leaving && !wasLeaving.has(it.id)).map((it) => it.id));
    // The newest key takes the spotlight; any previous one glides to its spot right away.
    setSpotlightId(next[next.length - 1].id);
    window.clearTimeout(spotlightTimer.current);
    spotlightTimer.current = window.setTimeout(() => setSpotlightId(null), SPOTLIGHT_MS);
  };

  useCharInput(handleChar, inputEnabled);

  const clear = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    const current = itemsRef.current;
    setSpotlightId(null);
    commit(current.map((it) => ({ ...it, leaving: true })));
    removeLater(current.map((it) => it.id));
  };

  // Characters are drawn at spotlight size (crisp when big) and scaled down at rest.
  const spotPx = Math.max(96, layout.spotPx);
  const restScale = Math.max(40, layout.cellPx * 0.72) / spotPx;
  const spotlight = items.find((it) => it.id === spotlightId && !it.leaving);
  const isEmpty = items.every((it) => it.leaving);
  const showKeyboard = settings.onScreenKeyboard === 'show' || (settings.onScreenKeyboard === 'auto' && coarsePointer);

  return (
    <div className="screen">
      <ParentBar title="Keyboard Playground" onHome={onHome} onOpenSettings={onOpenSettings}>
        <button type="button" className="pbtn pbtn-accent" onClick={clear}>
          <Icon name="eraser" />
          <span className="pbtn-label keep">Clear</span>
        </button>
      </ParentBar>
      <main className="stage playground-stage">
        <div ref={canvasRef} className="canvas" aria-label="Playground canvas">
          {isEmpty && (
            <p className="canvas-hint" aria-hidden="true">
              Press a letter or number
            </p>
          )}
          {spotlight && (
            <span key={`halo-${spotlight.id}`} className="spot-halo" style={{ background: spotlight.color }} aria-hidden="true" />
          )}
          {items.map((it) => (
            <span
              key={it.id}
              className={`placed${it.leaving ? ' leaving' : ''}${it === spotlight ? ' spotlight' : ''}`}
              style={
                {
                  left: `${it.x}%`,
                  top: `${it.y}%`,
                  color: it.color,
                  fontSize: spotPx,
                  '--rot': `${it.rotate}deg`,
                  '--rest': restScale,
                  // Offset from the resting spot to the canvas center.
                  '--dx': `${((50 - it.x) / 100) * size.w}px`,
                  '--dy': `${((50 - it.y) / 100) * size.h}px`,
                } as CSSProperties
              }
            >
              {it.char}
            </span>
          ))}
          <div className="sr-only" aria-live="polite">
            {items.length > 0 ? items[items.length - 1].char : ''}
          </div>
        </div>
      </main>
      {showKeyboard && <OnScreenKeyboard rows={ROWS} onPress={handleChar} />}
    </div>
  );
}
