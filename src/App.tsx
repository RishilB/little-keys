import { useCallback, useEffect, useState } from 'react';
import { SettingsPanel } from './components/SettingsPanel';
import type { ContentId } from './data/characters';
import { narrator } from './lib/narrator';
import type { SequenceMode } from './lib/sequence';
import { sfx } from './lib/sfx';
import { useApp } from './state/AppContext';
import { FindSetup } from './screens/FindSetup';
import { FindTheKey } from './screens/FindTheKey';
import { Home } from './screens/Home';
import { Playground } from './screens/Playground';
import { ProfileForm } from './screens/ProfileForm';
import { Welcome } from './screens/Welcome';

type Screen =
  | { name: 'welcome' }
  | { name: 'profile'; mode: 'create' | 'edit'; returnTo: Screen | null }
  | { name: 'home' }
  | { name: 'find-setup' }
  | { name: 'find'; content: ContentId; sequence: SequenceMode; round: number }
  | { name: 'playground' };

export default function App() {
  const { profile } = useApp();
  const [screen, setScreen] = useState<Screen>(() =>
    profile ? { name: 'welcome' } : { name: 'profile', mode: 'create', returnTo: null },
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Deleting the profile sends the parent back to the setup form.
  useEffect(() => {
    if (!profile && !(screen.name === 'profile' && screen.mode === 'create')) {
      narrator.cancel();
      setScreen({ name: 'profile', mode: 'create', returnTo: null });
    }
  }, [profile, screen]);

  // Any tap or key counts as a user gesture that can unlock audio.
  useEffect(() => {
    const unlock = () => sfx.unlock();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const goHome = useCallback(() => setScreen({ name: 'home' }), []);
  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const editProfile = () => {
    setSettingsOpen(false);
    setScreen((current) => ({ name: 'profile', mode: 'edit', returnTo: current }));
  };

  let content;
  switch (screen.name) {
    case 'profile': {
      const back = () => setScreen(screen.returnTo ?? { name: 'welcome' });
      content = (
        <ProfileForm
          key={screen.mode}
          mode={screen.mode}
          onDone={screen.mode === 'create' ? () => setScreen({ name: 'welcome' }) : back}
          onCancel={screen.mode === 'edit' ? back : undefined}
        />
      );
      break;
    }
    case 'welcome':
      content = <Welcome onStart={goHome} />;
      break;
    case 'home':
      content = (
        <Home
          onFindTheKey={() => setScreen({ name: 'find-setup' })}
          onPlayground={() => setScreen({ name: 'playground' })}
          onOpenSettings={openSettings}
        />
      );
      break;
    case 'find-setup':
      content = (
        <FindSetup
          onStart={(c, s) => setScreen({ name: 'find', content: c, sequence: s, round: 0 })}
          onHome={goHome}
          onOpenSettings={openSettings}
        />
      );
      break;
    case 'find':
      content = (
        <FindTheKey
          key={screen.round}
          content={screen.content}
          sequence={screen.sequence}
          inputEnabled={!settingsOpen}
          onHome={goHome}
          onPlayAgain={() => setScreen({ ...screen, round: screen.round + 1 })}
          onOpenSettings={openSettings}
        />
      );
      break;
    case 'playground':
      content = <Playground inputEnabled={!settingsOpen} onHome={goHome} onOpenSettings={openSettings} />;
      break;
  }

  return (
    <>
      {content}
      {settingsOpen && <SettingsPanel onClose={closeSettings} onEditProfile={editProfile} />}
    </>
  );
}
