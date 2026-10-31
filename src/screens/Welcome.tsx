import { Avatar } from '../components/Avatar';
import { FloatingFriends } from '../components/FloatingFriends';
import { Icon } from '../components/Icon';
import { phrases } from '../data/phrases';
import { narrator } from '../lib/narrator';
import { sfx } from '../lib/sfx';
import { useApp } from '../state/AppContext';

/** Browsers only allow audio after a user gesture, so a grown-up starts each visit here. */
export function Welcome({ onStart }: { onStart: () => void }) {
  const { profile, settings, updateSettings } = useApp();
  if (!profile) return null;

  const startWithSound = () => {
    sfx.unlock();
    if (!settings.narration || !settings.sfx) {
      updateSettings({ narration: true, sfx: true });
      narrator.enabled = true;
      sfx.enabled = true;
    }
    narrator.speak(phrases.greeting(profile.name));
    sfx.success();
    onStart();
  };

  const startQuietly = () => {
    updateSettings({ narration: false, sfx: false });
    onStart();
  };

  return (
    <main className="page welcome">
      <FloatingFriends />
      <div className="welcome-inner">
        <Avatar id={profile.avatar} size={180} className="welcome-avatar" />
        <h1 className="welcome-title">Let’s play, {profile.name}!</h1>
        <div className="welcome-actions">
          <button type="button" className="btn btn-primary btn-xl" onClick={startWithSound} autoFocus>
            <Icon name="speaker" size={28} /> Start with sound
          </button>
          <button type="button" className="btn btn-link" onClick={startQuietly}>
            Start without sound
          </button>
        </div>
      </div>
    </main>
  );
}
