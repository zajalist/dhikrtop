import { useCallback, useEffect, useRef, useState } from 'react';
import { listen } from '@tauri-apps/api/event';
import { pickRandom } from '../../lib/adhkarData';
import { getPreferences, openSettings } from '../../lib/store';
import type { Adhkar, Preferences } from '../../lib/types';
import { DEFAULT_PREFERENCES } from '../../lib/types';
import './AdhkarWindow.css';

type Phase = 'hidden' | 'peek' | 'jiggle' | 'expanded';

export default function AdhkarWindow() {
  const [adhkar, setAdhkar] = useState<Adhkar>(() => pickRandom(DEFAULT_PREFERENCES.categories));
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [phase, setPhase] = useState<Phase>('hidden');
  const [summon, setSummon] = useState(false);
  const summonTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    getPreferences().then((p) => {
      setPrefs(p);
      setAdhkar(pickRandom(p.categories));
    });
  }, []);

  useEffect(() => {
    const unlisten = listen('trigger-adhkar', () => {
      getPreferences().then((p) => {
        setPrefs(p);
        const newAdhkar = pickRandom(p.categories);
        setAdhkar(newAdhkar);
        // Always open fully expanded when summoned
        setPhase('expanded');
        if (!p.reduceMotion) {
          setSummon(true);
          if (summonTimerRef.current) window.clearTimeout(summonTimerRef.current);
          summonTimerRef.current = window.setTimeout(() => setSummon(false), 900);
        } else {
          setSummon(false);
        }
      });
    });
    return () => {
      if (summonTimerRef.current) window.clearTimeout(summonTimerRef.current);
      unlisten.then((fn) => fn());
    };
  }, []);

  // Phase state machine: peek ↔ jiggle cycle while minimised
  useEffect(() => {
    if (phase === 'peek') {
      // After 800 ms start first jiggle to attract attention
      const t = setTimeout(() => setPhase('jiggle'), 800);
      return () => clearTimeout(t);
    }
    if (phase === 'jiggle') {
      // Return to peek after animation, then re-jiggle every 6 s
      const t = setTimeout(() => setPhase('peek'), 2000);
      const interval = setInterval(() => {
        setPhase((prev) => (prev === 'peek' ? 'jiggle' : prev));
      }, 6000);
      return () => { clearTimeout(t); clearInterval(interval); };
    }
  }, [phase]);

  const handleMouseEnter = useCallback(() => {
    if (phase === 'peek' || phase === 'jiggle') {
      setPhase('expanded');
    }
  }, [phase]);

  // Mouse left the card area → collapse back to peek strip
  const handleMouseLeave = useCallback(() => {
    if (phase === 'expanded') {
      setPhase('peek');
    }
  }, [phase]);

  const handleClick = useCallback(() => {
    // Clicking the peek strip expands; clicking the expanded card does nothing
    if (phase === 'peek' || phase === 'jiggle') {
      setPhase('expanded');
    }
  }, [phase]);

  const handleSettings = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openSettings().catch(console.error);
  }, []);

  const nextAdhkar = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setAdhkar(pickRandom(prefs.categories));
  }, [prefs.categories]);

  const categoryLabel = adhkar.category === 'morning' ? 'ADHKAR AS-SABAH'
    : adhkar.category === 'evening' ? 'ADHKAR AL-MASA\''
    : adhkar.category === 'sleep' ? 'ADHKAR AN-NAWM'
    : 'ADHKAR';

  const phaseClass = phase;

  return (
    <div
      className={`adhkar-root ${phaseClass}${summon ? ' summon' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Peek strip — shown in peek/jiggle phase */}
      <div className="adhkar-peek-strip">
        <span className="peek-ornament">✦</span>
        <span className="peek-text">{adhkar.arabic.slice(0, 60)}{adhkar.arabic.length > 60 ? '…' : ''}</span>
        <span className="peek-ornament">✦</span>
      </div>

      {/* Full card — shown in expanded phase */}
      <div className="adhkar-card">
        {/* Decorative corner ornament */}
        <div className="card-ornament-br" aria-hidden="true">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" opacity="0.12">
            <path d="M40 0C40 22.09 58 40 80 40C58 40 40 58 40 80C40 58 22 40 0 40C22 40 40 22.09 40 0Z" fill="currentColor"/>
            <circle cx="40" cy="40" r="6" stroke="currentColor" strokeWidth="1" fill="none"/>
            <circle cx="40" cy="10" r="2" fill="currentColor"/>
            <circle cx="40" cy="70" r="2" fill="currentColor"/>
            <circle cx="10" cy="40" r="2" fill="currentColor"/>
            <circle cx="70" cy="40" r="2" fill="currentColor"/>
          </svg>
        </div>

        {/* Top ornament */}
        <div className="card-ornament-top" aria-hidden="true">✦</div>

        <div className="card-brand">
          <span className="brand-mark">ذ</span>
          <span className="brand-name">dhikr top</span>
        </div>

        {/* Header */}
        <div className="card-header">
          <span className="card-category">{categoryLabel}</span>
          <div className="card-header-actions">
            <button className="card-icon-btn" onClick={nextAdhkar} title="Next adhkar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              </svg>
            </button>
            <button className="card-icon-btn" onClick={handleSettings} title="Settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="card-content">
          <p className="card-arabic">{adhkar.arabic}</p>

          {prefs.language !== 'arabic' && adhkar.transliteration && (
            <p className="card-transliteration">{adhkar.transliteration}</p>
          )}

          {prefs.language !== 'arabic' && adhkar.english && (
            <p className="card-english">"{adhkar.english}"</p>
          )}

          <div className="card-source-row">
            <span className="card-source">{adhkar.source}</span>
            {adhkar.repeat && adhkar.repeat > 1 && (
              <span className="card-repeat">×{adhkar.repeat}</span>
            )}
          </div>
        </div>

        {/* Decorative lantern */}
        <div className="card-lantern" aria-hidden="true">
          <svg width="36" height="50" viewBox="0 0 36 50" fill="none" opacity="0.15">
            <path d="M18 2v4M14 6h8M12 10c0-2 2-4 6-4s6 2 6 4v2H12v-2z" stroke="currentColor" strokeWidth="1"/>
            <path d="M10 12h16v4c0 8-3 16-8 22-5-6-8-14-8-22v-4z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.05"/>
            <path d="M14 12v20M22 12v20M10 20h16M10 28h16" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
