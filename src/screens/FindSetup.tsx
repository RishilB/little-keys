import { useState } from 'react';
import { Icon } from '../components/Icon';
import { ParentBar } from '../components/ParentBar';
import { CONTENT_SETS, type ContentId } from '../data/characters';
import type { SequenceMode } from '../lib/sequence';
import { useApp } from '../state/AppContext';

interface Props {
  onStart: (content: ContentId, sequence: SequenceMode) => void;
  onHome: () => void;
  onOpenSettings: () => void;
}

const SEQUENCES: { value: SequenceMode; label: string; desc: string; art: string }[] = [
  { value: 'order', label: 'In Order', desc: 'One after another', art: '1 2 3' },
  { value: 'random', label: 'Random', desc: 'Surprise each time', art: '3 1 2' },
];

export function FindSetup({ onStart, onHome, onOpenSettings }: Props) {
  const { settings, updateSettings } = useApp();
  const [content, setContent] = useState<ContentId>(settings.lastContent);
  const [sequence, setSequence] = useState<SequenceMode>(settings.lastSequence);

  const start = () => {
    updateSettings({ lastContent: content, lastSequence: sequence });
    onStart(content, sequence);
  };

  return (
    <div className="screen">
      <ParentBar title="Find the Key" onHome={onHome} onOpenSettings={onOpenSettings} />
      <main className="page setup">
        <p className="eyebrow">For grown-ups</p>
        <h1>What shall we find?</h1>

        <div className="choice-group" role="radiogroup" aria-label="Content">
          {(Object.keys(CONTENT_SETS) as ContentId[]).map((id) => {
            const set = CONTENT_SETS[id];
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={content === id}
                className={content === id ? 'choice active' : 'choice'}
                onClick={() => setContent(id)}
              >
                <span className="choice-art">{id === 'numbers' ? '1 2 3' : 'A B C'}</span>
                <span className="choice-label">{set.label}</span>
                <span className="choice-desc">{set.range}</span>
              </button>
            );
          })}
        </div>

        <h2 className="setup-subtitle">In what order?</h2>
        <div className="choice-group" role="radiogroup" aria-label="Sequence">
          {SEQUENCES.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={sequence === s.value}
              className={sequence === s.value ? 'choice active' : 'choice'}
              onClick={() => setSequence(s.value)}
            >
              <span className="choice-art">{content === 'numbers' ? s.art : s.art.replace(/\d/g, (d) => 'ABC'[Number(d) - 1])}</span>
              <span className="choice-label">{s.label}</span>
              <span className="choice-desc">{s.desc}</span>
            </button>
          ))}
        </div>

        <button type="button" className="btn btn-primary btn-xl start-btn" onClick={start}>
          <Icon name="play" size={26} /> Start
        </button>
      </main>
    </div>
  );
}
