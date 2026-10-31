import type { ReactNode } from 'react';
import { useFullscreen } from '../hooks/useFullscreen';
import { useApp } from '../state/AppContext';
import { Icon } from './Icon';

interface Props {
  title?: string;
  onHome?: () => void;
  onOpenSettings: () => void;
  /** Activity-specific controls (e.g. Repeat, Clear). */
  children?: ReactNode;
}

/** Grown-up controls, kept in their own strip away from the learning area. */
export function ParentBar({ title, onHome, onOpenSettings, children }: Props) {
  const { settings, updateSettings } = useApp();
  const fullscreen = useFullscreen();

  return (
    <header className="parent-bar" aria-label="Grown-up controls">
      <div className="parent-bar-group">
        {onHome && (
          <button type="button" className="pbtn" onClick={onHome}>
            <Icon name="home" />
            <span className="pbtn-label">Home</span>
          </button>
        )}
        {title && <h1 className="parent-bar-title">{title}</h1>}
      </div>
      <div className="parent-bar-group">
        {children}
        <button
          type="button"
          className="pbtn"
          aria-pressed={settings.narration}
          onClick={() => updateSettings({ narration: !settings.narration })}
          title={settings.narration ? 'Turn voice off' : 'Turn voice on'}
        >
          <Icon name={settings.narration ? 'speaker' : 'speaker-off'} />
          <span className="pbtn-label">Voice {settings.narration ? 'on' : 'off'}</span>
        </button>
        <button
          type="button"
          className="pbtn"
          aria-pressed={settings.sfx}
          onClick={() => updateSettings({ sfx: !settings.sfx })}
          title={settings.sfx ? 'Turn sounds off' : 'Turn sounds on'}
        >
          <Icon name={settings.sfx ? 'music' : 'music-off'} />
          <span className="pbtn-label">Sounds {settings.sfx ? 'on' : 'off'}</span>
        </button>
        {fullscreen.supported && (
          <button type="button" className="pbtn" onClick={fullscreen.toggle}>
            <Icon name={fullscreen.isFullscreen ? 'shrink' : 'expand'} />
            <span className="pbtn-label">{fullscreen.isFullscreen ? 'Exit full screen' : 'Full screen'}</span>
          </button>
        )}
        <button type="button" className="pbtn" onClick={onOpenSettings}>
          <Icon name="settings" />
          <span className="pbtn-label">Settings</span>
        </button>
      </div>
    </header>
  );
}
