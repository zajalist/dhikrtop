import { useCallback, useEffect, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import AdhkarCard from '../../components/AdhkarCard';
import { pickRandom } from '../../lib/adhkarData';
import { getPreferences, hideAdhkar, openSettings } from '../../lib/store';
import type { Adhkar, Preferences } from '../../lib/types';
import { DEFAULT_PREFERENCES } from '../../lib/types';

export default function AdhkarWindow() {
  const [adhkar, setAdhkar] = useState<Adhkar>(() => pickRandom(DEFAULT_PREFERENCES.categories));
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);

  // Load preferences
  useEffect(() => {
    getPreferences().then((p) => {
      setPrefs(p);
      setAdhkar(pickRandom(p.categories));
    });
  }, []);

  // Listen for trigger from Rust idle monitor — pick a fresh adhkar
  useEffect(() => {
    const unlisten = listen('trigger-adhkar', () => {
      getPreferences().then((p) => {
        setPrefs(p);
        setAdhkar(pickRandom(p.categories));
      });
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const dismiss = useCallback(() => {
    hideAdhkar().catch(console.error);
  }, []);

  const like = useCallback(() => {
    // TODO: persist liked adhkar
    hideAdhkar().catch(console.error);
  }, []);

  const dislike = useCallback(() => {
    // TODO: persist disliked adhkar, skip it in rotation
    setAdhkar(pickRandom(prefs.categories));
    hideAdhkar().catch(console.error);
  }, [prefs.categories]);

  const snooze = useCallback(() => {
    hideAdhkar().catch(console.error);
    // The Rust idle monitor will reshow after minInterval; snooze extends that
    // by emitting a "snoozed" event — future enhancement
  }, []);

  const handleSettings = useCallback(() => {
    openSettings().catch(console.error);
  }, []);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        padding: '8px',
        background: 'transparent',
      }}
    >
      <AdhkarCard
        adhkar={adhkar}
        onDismiss={dismiss}
        onLike={like}
        onDislike={dislike}
        onSnooze={snooze}
        onSettings={handleSettings}
        autoDismissSec={30}
      />
    </div>
  );
}
