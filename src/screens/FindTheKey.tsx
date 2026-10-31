import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Avatar } from '../components/Avatar';
import { Confetti, StarMascot } from '../components/Celebration';
import { Icon } from '../components/Icon';
import { OnScreenKeyboard } from '../components/OnScreenKeyboard';
import { ParentBar } from '../components/ParentBar';
import { CONTENT_SETS, KEYBOARD_ROWS, colorForChar, type ContentId } from '../data/characters';
import { labels, phrases } from '../data/phrases';
import { useCharInput } from '../hooks/useCharInput';
import { narrator } from '../lib/narrator';
import { firstIndex, nextIndex, type SequenceMode } from '../lib/sequence';
import { sfx } from '../lib/sfx';
import { useApp } from '../state/AppContext';

type Phase = 'asking' | 'success' | 'tryagain' | 'done';

/** Pause between the end of the praise and the next target. */
const ADVANCE_PAUSE_MS = 700;
const TRY_AGAIN_RESET_MS = 2200;

interface Props {
  content: ContentId;
  sequence: SequenceMode;
  inputEnabled: boolean;
  onHome: () => void;
  onPlayAgain: () => void;
  onOpenSettings: () => void;
}

export function FindTheKey({ content, sequence, inputEnabled, onHome, onPlayAgain, onOpenSettings }: Props) {
  const { profile, settings, reducedMotion, coarsePointer } = useApp();
  const set = CONTENT_SETS[content];
  const name = profile?.name ?? 'friend';

  const [index, setIndex] = useState(() => firstIndex(sequence, set.items.length));
  const [phase, setPhaseState] = useState<Phase>('asking');
  const [pulse, setPulse] = useState(0); // bumps to replay feedback animations
  const [praiseLabel, setPraiseLabel] = useState(labels.praise[0]);

  // Refs hold the authoritative state so rapid key presses never act on stale values.
  const indexRef = useRef(index);
  const phaseRef = useRef<Phase>('asking');
  const timers = useRef<number[]>([]);

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const present = (i: number, intro?: string) => {
    indexRef.current = i;
    setIndex(i);
    setPhase('asking');
    const prompt = phrases.prompt(set, set.items[i]);
    narrator.speak(intro ? `${intro} ${prompt}` : prompt, { tag: 'prompt' });
  };

  const advance = () => {
    const next = nextIndex(sequence, set.items.length, indexRef.current);
    if (next === null) {
      setPhase('done');
      sfx.celebrate();
      narrator.speak(phrases.finished(name));
      return;
    }
    present(next);
  };

  useEffect(() => {
    // Make sure no button keeps focus, so key presses go straight to the game.
    (document.activeElement as HTMLElement | null)?.blur?.();
    present(indexRef.current, phrases.findIntro());
    return () => {
      narrator.cancel();
      clearTimers();
    };
  }, []);

  const handleChar = (char: string) => {
    const current = phaseRef.current;
    // Locked while celebrating, so extra presses can't skip the next target.
    if (current === 'success' || current === 'done') return;
    const target = set.items[indexRef.current];
    clearTimers();
    setPulse((p) => p + 1);

    if (char === target.char) {
      setPhase('success');
      setPraiseLabel(labels.praise[Math.floor(Math.random() * labels.praise.length)]);
      sfx.success();
      narrator.speak(phrases.praise(target), { onEnd: () => later(advance, ADVANCE_PAUSE_MS) });
      return;
    }

    setPhase('tryagain');
    sfx.gentle();
    // Don't restart the same encouragement on every mash; let it finish once.
    if (!narrator.isSpeaking('tryagain')) narrator.speak(phrases.tryAgain(target), { tag: 'tryagain' });
    later(() => {
      if (phaseRef.current === 'tryagain') setPhase('asking');
    }, TRY_AGAIN_RESET_MS);
  };

  useCharInput(handleChar, inputEnabled && phase !== 'done');

  const repeat = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur();
    if (phaseRef.current === 'success' || phaseRef.current === 'done') return;
    sfx.unlock();
    narrator.speak(phrases.repeatPrompt(set, set.items[indexRef.current]), { tag: 'prompt' });
  };

  const item = set.items[index];
  const color = colorForChar(item.char);
  const showKeyboard = settings.onScreenKeyboard === 'show' || (settings.onScreenKeyboard === 'auto' && coarsePointer);

  return (
    <div className="screen">
      <ParentBar title={`Find the Key · ${set.label}`} onHome={onHome} onOpenSettings={onOpenSettings}>
        {phase !== 'done' && (
          <button type="button" className="pbtn pbtn-accent" onClick={repeat} disabled={phase === 'success'}>
            <Icon name="replay" />
            <span className="pbtn-label keep">Repeat instruction</span>
          </button>
        )}
      </ParentBar>

      {phase === 'done' ? (
        <main className="stage done-stage">
          {!reducedMotion && <Confetti count={24} />}
          <div className="done-art">
            {profile && <Avatar id={profile.avatar} size={150} className="bounce" />}
            <StarMascot size={110} className="bounce delay" />
          </div>
          <h2 className="done-title" role="status">
            You did it, {name}!
          </h2>
          <div className="btn-row center">
            <button type="button" className="btn btn-primary btn-xl" onClick={onPlayAgain}>
              <Icon name="replay" size={26} /> Play again
            </button>
            <button type="button" className="btn btn-soft btn-xl" onClick={onHome}>
              <Icon name="home" size={26} /> Home
            </button>
          </div>
        </main>
      ) : (
        <main className="stage find-stage">
          <div className="target-wrap">
            <div key={`target-${index}`} className={`target-card is-${phase}`} style={{ color }}>
              <span
                key={pulse}
                className={`target-char${phase === 'tryagain' ? ' wiggle' : ''}${phase === 'success' ? ' celebrate' : ''}`}
                aria-label={`${set.noun} ${item.char}`}
              >
                {item.char}
              </span>
            </div>
            {phase === 'success' && !reducedMotion && <Confetti key={`confetti-${pulse}`} />}
          </div>

          <div className="feedback" aria-live="polite">
            {phase === 'success' && (
              <div key={`success-${pulse}`} className="feedback-msg success">
                <StarMascot size={84} className="bounce" />
                <span>{praiseLabel}</span>
              </div>
            )}
            {phase === 'tryagain' && (
              <div key={`tryagain-${pulse}`} className="feedback-msg tryagain">
                {profile && <Avatar id={profile.avatar} size={76} className="nudge" />}
                <span>
                  {labels.tryAgain} <span className="soft">Find</span> <strong style={{ color }}>{item.char}</strong>
                </span>
              </div>
            )}
            {phase === 'asking' && (
              <div className="feedback-msg hint">
                Find the {set.noun} <strong style={{ color }}>{item.char}</strong>
              </div>
            )}
          </div>
        </main>
      )}

      {showKeyboard && phase !== 'done' && <OnScreenKeyboard rows={KEYBOARD_ROWS[content]} onPress={handleChar} />}
    </div>
  );
}
