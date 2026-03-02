import { useCallback, useEffect, useRef, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { pickRandom } from '../../lib/adhkarData';
import { getPreferences, hideAdhkar, openSettings } from '../../lib/store';
import type { Adhkar, Preferences } from '../../lib/types';
import { DEFAULT_PREFERENCES } from '../../lib/types';
import './AdhkarWindow.css';

type Phase = 'hidden' | 'peek' | 'jiggle' | 'expanded' | 'dismissing';

export default function AdhkarWindow() {
  const [adhkar, setAdhkar] = useState<Adhkar>(() => pickRandom(DEFAULT_PREFERENCES.categories));
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [phase, setPhase] = useState<Phase>('hidden');
  const [progress, setProgress] = useState(100);
  const startRef = useRef(Date.now());
  const rafRef = useRef<number | undefined>(undefined);
  const autoDismissSec = 25;

  // Load preferences
  useEffect(() => {
    getPreferences().then((p) => {
      setPrefs(p);
      setAdhkar(pickRandom(p.categories));
    });
  }, []);

  // Listen for trigger from Rust idle monitor
  useEffect(() => {
    const unlisten = listen('trigger-adhkar', () => {
      getPreferences().then((p) => {
        setPrefs(p);
        const newAdhkar = pickRandom(p.categories);
        setAdhkar(newAdhkar);
        setPhase('peek');
      });
    });
    return () => { unlisten.then((fn) => fn()); };
  }, []);

  // Phase state machine
  useEffect(() => {
    if (phase === 'peek') {
      const t = setTimeout(() => setPhase('jiggle'), 600);
      return () => clearTimeout(t);
    }
    if (phase === 'jiggle') {
      const t = setTimeout(() => setPhase('peek'), 2400);
      const interval = setInterval(() => {
        setPhase((prev) => prev === 'peek' ? 'jiggle' : prev);
      }, 5000);
      return () => { clearTimeout(t); clearInterval(interval); };
    }
  }, [phase]);

  // Auto-dismiss countdown
  useEffect(() => {
    if (phase !== 'expanded') {
      if (phase === 'peek' || phase === 'jiggle') {
        const t = setTimeout(() => dismiss(), 60000);
        return () => clearTimeout(t);
      }
      return;
    }
    startRef.current = Date.now();
    const duration = autoDismissSec * 1000;
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        dismiss();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  const dismiss = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPhase('dismissing');
    setTimeout(() => {
      setPhase('hidden');
      setProgress(100);
      hideAdhkar().catch(console.error);
    }, 300);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (phase === 'peek' || phase === 'jiggle') {
      setPhase('expanded');
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const handleMouseLeave = useCallback(() => {
    if (phase === 'expanded') {
      startRef.current = Date.now() - ((100 - progress) / 100) * autoDismissSec * 1000;
      const duration = autoDismissSec * 1000;
      const tick = () => {
        const elapsed = Date.now() - startRef.current;
        const pct = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(pct);
        if (pct > 0) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          dismiss();
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [phase, progress, dismiss]);

  const handleClick = useCallback(() => {
    if (phase === 'expanded') {
      dismiss();
    } else if (phase === 'peek' || phase === 'jiggle') {
      setPhase('expanded');
    }
  }, [phase, dismiss]);

  const handleSettings = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openSettings().catch(console.error);
  }, []);

  const nextAdhkar = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setAdhkar(pickRandom(prefs.categories));
    setProgress(100);
    startRef.current = Date.now();
  }, [prefs.categories]);

  // Start in peek mode on mount
  useEffect(() => {
    const t = setTimeout(() => {
      if (phase === 'hidden') setPhase('peek');
    }, 100);
    return () => clearTimeout(t);
  }, []);

  const phaseClass = phase === 'dismissing' ? 'hidden' : phase;

  return (
    <div
      className={`adhkar-root ${phaseClass}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Peek strip */}
      <div className="adhkar-peek-strip">
        <span className="peek-icon">☽</span>
        <span className="peek-text">{adhkar.arabic.slice(0, 50)}{adhkar.arabic.length > 50 ? '…' : ''}</span>
        <span className="peek-icon">☽</span>
      </div>

      {/* Expanded content */}
      <div className="adhkar-expanded">
        <div className="adhkar-progress">
          <div className="adhkar-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="adhkar-body">
          <span className="adhkar-category">{adhkar.category}</span>
          <p className="adhkar-arabic">{adhkar.arabic}</p>
          {prefs.language !== 'arabic' && (
            <p className="adhkar-transliteration">{adhkar.transliteration}</p>
          )}
          {prefs.language !== 'arabic' && (
            <p className="adhkar-english">{adhkar.english}</p>
          )}
          <div className="adhkar-meta">
            <span className="adhkar-source">{adhkar.source}</span>
            {adhkar.repeat && <span className="adhkar-repeat">× {adhkar.repeat}</span>}
          </div>
        </div>

        <div className="adhkar-actions">
          <button className="adhkar-btn" onClick={nextAdhkar} title="Next">↻</button>
          <button className="adhkar-btn" onClick={handleSettings} title="Settings">⚙</button>
          <div className="adhkar-spacer" />
          <button className="adhkar-btn adhkar-btn-dismiss" onClick={(e) => { e.stopPropagation(); dismiss(); }} title="Dismiss">✕</button>
        </div>
      </div>
    </div>
  );
}
