import { Avatar } from '../components/Avatar';
import { ParentBar } from '../components/ParentBar';
import { colorForChar } from '../data/characters';
import { useApp } from '../state/AppContext';

interface Props {
  onFindTheKey: () => void;
  onPlayground: () => void;
  onOpenSettings: () => void;
}

function KeyCap({ char, tilt = 0 }: { char: string; tilt?: number }) {
  return (
    <span className="keycap" style={{ color: colorForChar(char), transform: `rotate(${tilt}deg)` }}>
      {char}
    </span>
  );
}

export function Home({ onFindTheKey, onPlayground, onOpenSettings }: Props) {
  const { profile } = useApp();

  return (
    <div className="screen">
      <ParentBar onOpenSettings={onOpenSettings} />
      <main className="page home">
        {profile && (
          <div className="home-greeting">
            <Avatar id={profile.avatar} size={72} />
            <h1>Hi, {profile.name}!</h1>
          </div>
        )}
        <div className="activity-grid">
          <button type="button" className="activity-card find" onClick={onFindTheKey}>
            <span className="activity-art" aria-hidden="true">
              <KeyCap char="A" tilt={-6} />
              <span className="find-arrow">→</span>
              <KeyCap char="3" tilt={5} />
            </span>
            <span className="activity-name">Find the Key</span>
            <span className="activity-desc">Match the one you see</span>
          </button>
          <button type="button" className="activity-card playground" onClick={onPlayground}>
            <span className="activity-art scatter" aria-hidden="true">
              <KeyCap char="B" tilt={-10} />
              <KeyCap char="7" tilt={8} />
              <KeyCap char="M" tilt={-4} />
            </span>
            <span className="activity-name">Keyboard Playground</span>
            <span className="activity-desc">Press any key and see</span>
          </button>
        </div>
      </main>
    </div>
  );
}
