import { useEffect, useReducer, useState } from 'react';
import { getPreferences, savePreferences } from '../../lib/store';
import type { Adhkar, Preferences } from '../../lib/types';
import styles from './SettingsWindow.module.css';

type Section = 'general' | 'adhkar' | 'appearance' | 'quran' | 'about';

type Action =
  | { type: 'SET'; payload: Preferences }
  | { type: 'TOGGLE_ENABLED' }
  | { type: 'SET_IDLE'; value: number }
  | { type: 'SET_INTERVAL'; value: number }
  | { type: 'TOGGLE_CATEGORY'; cat: Adhkar['category'] }
  | { type: 'SET_LANGUAGE'; lang: Preferences['language'] };

function reducer(state: Preferences, action: Action): Preferences {
  switch (action.type) {
    case 'SET': return action.payload;
    case 'TOGGLE_ENABLED': return { ...state, enabled: !state.enabled };
    case 'SET_IDLE': return { ...state, idleThresholdSec: action.value };
    case 'SET_INTERVAL': return { ...state, minIntervalSec: action.value };
    case 'TOGGLE_CATEGORY': {
      const has = state.categories.includes(action.cat);
      const cats = has
        ? state.categories.filter((c) => c !== action.cat)
        : [...state.categories, action.cat];
      return { ...state, categories: cats.length > 0 ? cats : state.categories };
    }
    case 'SET_LANGUAGE': return { ...state, language: action.lang };
    default: return state;
  }
}

const IDLE_OPTIONS = [
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '2 minutes', value: 120 },
  { label: '5 minutes', value: 300 },
  { label: '10 minutes', value: 600 },
];

const INTERVAL_OPTIONS = [
  { label: '5 minutes', value: 300 },
  { label: '10 minutes', value: 600 },
  { label: '20 minutes', value: 1200 },
  { label: '30 minutes', value: 1800 },
  { label: '1 hour', value: 3600 },
  { label: '2 hours', value: 7200 },
];

const CATEGORIES: Array<{ id: Adhkar['category']; label: string; emoji: string }> = [
  { id: 'morning', label: 'Morning (Ṣabāḥ)', emoji: '🌅' },
  { id: 'evening', label: 'Evening (Masāʾ)', emoji: '🌙' },
  { id: 'sleep', label: 'Sleep (Nawm)', emoji: '💤' },
  { id: 'general', label: 'General (ʿĀmm)', emoji: '✦' },
];

export default function SettingsWindow() {
  const [section, setSection] = useState<Section>('general');
  const [prefs, dispatch] = useReducer(reducer, {
    idleThresholdSec: 120,
    minIntervalSec: 600,
    categories: ['morning', 'evening', 'general', 'sleep'],
    language: 'all',
    enabled: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPreferences().then((p) => dispatch({ type: 'SET', payload: p }));
  }, []);

  const handleSave = async () => {
    await savePreferences(prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const NAV: Array<{ id: Section; label: string }> = [
    { id: 'general', label: 'General' },
    { id: 'adhkar', label: 'Adhkar' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'quran', label: 'Quran' },
    { id: 'about', label: 'About' },
  ];

  return (
    <div className={styles.root}>
      {/* Sidebar */}
      <nav className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoArabic}>ذكر</span>
          <span className={styles.logoText}>Dhikrtop</span>
        </div>
        <ul className={styles.navList}>
          {NAV.map((item) => (
            <li key={item.id}>
              <button
                className={`${styles.navBtn} ${section === item.id ? styles.active : ''}`}
                onClick={() => setSection(item.id)}
              >
                {item.label}
                {item.id === 'quran' && <span className={styles.badge}>Soon</span>}
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.sidebarFooter}>
          <label className={styles.toggle}>
            <span className={styles.toggleLabel}>
              {prefs.enabled ? 'Enabled' : 'Paused'}
            </span>
            <button
              className={`${styles.toggleSwitch} ${prefs.enabled ? styles.on : ''}`}
              onClick={() => dispatch({ type: 'TOGGLE_ENABLED' })}
              role="switch"
              aria-checked={prefs.enabled}
            />
          </label>
        </div>
      </nav>

      {/* Content */}
      <main className={styles.content}>
        {section === 'general' && (
          <Section title="General">
            <Field label="Display after idle" hint="How long you must be inactive before an adhkar appears">
              <select
                className={styles.select}
                value={prefs.idleThresholdSec}
                onChange={(e) => dispatch({ type: 'SET_IDLE', value: +e.target.value })}
              >
                {IDLE_OPTIONS.map(({ label, value }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>

            <Field label="Minimum interval" hint="Minimum time between two adhkar notifications">
              <select
                className={styles.select}
                value={prefs.minIntervalSec}
                onChange={(e) => dispatch({ type: 'SET_INTERVAL', value: +e.target.value })}
              >
                {INTERVAL_OPTIONS.map(({ label, value }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>
          </Section>
        )}

        {section === 'adhkar' && (
          <Section title="Adhkar">
            <Field label="Categories" hint="Select which categories of adhkar to display">
              <div className={styles.checkList}>
                {CATEGORIES.map(({ id, label, emoji }) => (
                  <label key={id} className={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={prefs.categories.includes(id)}
                      onChange={() => dispatch({ type: 'TOGGLE_CATEGORY', cat: id })}
                    />
                    <span className={styles.checkEmoji}>{emoji}</span>
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </Field>
          </Section>
        )}

        {section === 'appearance' && (
          <Section title="Appearance">
            <Field label="Language" hint="Which parts of the adhkar to show in the popup">
              <div className={styles.radioGroup}>
                {(['all', 'arabic', 'english'] as const).map((lang) => (
                  <label key={lang} className={styles.radioRow}>
                    <input
                      type="radio"
                      name="language"
                      checked={prefs.language === lang}
                      onChange={() => dispatch({ type: 'SET_LANGUAGE', lang })}
                    />
                    <span>
                      {lang === 'all' ? 'Arabic + Transliteration + English'
                        : lang === 'arabic' ? 'Arabic only'
                        : 'English only'}
                    </span>
                  </label>
                ))}
              </div>
            </Field>
          </Section>
        )}

        {section === 'quran' && (
          <Section title="Quran Memorisation">
            <div className={styles.stub}>
              <span className={styles.stubIcon}>📖</span>
              <h3>Coming soon</h3>
              <p>
                Track your memorised surahs, run recitation sessions with voice
                recognition, and measure your accuracy over time.
              </p>
              <p className={styles.stubNote}>
                The ML model that powers tajweed analysis is in development
                under <code>quranic_qiraat_ml/</code>.
              </p>
            </div>
          </Section>
        )}

        {section === 'about' && (
          <Section title="About">
            <div className={styles.about}>
              <p className={styles.aboutArabic}>بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
              <p><strong>Dhikrtop</strong> v0.1.0</p>
              <p className={styles.aboutDesc}>
                A minimal desktop app that reminds you to remember Allah during your
                day — appearing quietly when you take a break, then fading away.
              </p>
              <div className={styles.aboutLinks}>
                <a href="https://github.com/zajalist/dhikrtop" target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </div>
            </div>
          </Section>
        )}

        {/* Save button — shown in all sections except about */}
        {section !== 'about' && section !== 'quran' && (
          <div className={styles.footer}>
            <button className={styles.saveBtn} onClick={handleSave}>
              {saved ? '✓ Saved' : 'Save'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <div>
        <div className={styles.fieldLabel}>{label}</div>
        {hint && <div className={styles.fieldHint}>{hint}</div>}
      </div>
      <div className={styles.fieldControl}>{children}</div>
    </div>
  );
}
