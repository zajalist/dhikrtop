import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GlowCard } from '../shared/BackgroundEffects';
import {
  Sun, Moon, BookOpen, Bell, Heart, RotateCcw, CheckCircle,
  Volume2, Clock, Palette, User, ChevronRight, Info, Trash2, Type, MessageSquare
} from 'lucide-react';

interface UserData {
  name: string;
  language: string;
  showTransliteration: boolean;
  showTranslation: boolean;
  adhkarCategories: string[];
  reminderTriggers: string[];
  quietStart: string;
  quietEnd: string;
  tajweedDisplay: 'full' | 'minimal' | 'none';
  fontSize: 'small' | 'medium' | 'large';
  dailyGoal: number;
}

const defaultData: UserData = {
  name: '',
  language: 'en',
  showTransliteration: true,
  showTranslation: true,
  adhkarCategories: ['morning', 'evening', 'after-prayer'],
  reminderTriggers: ['prayer-based', 'morning', 'evening'],
  quietStart: '22:00',
  quietEnd: '06:00',
  tajweedDisplay: 'full',
  fontSize: 'medium',
  dailyGoal: 3,
};

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0"
      style={{
        background: value
          ? 'linear-gradient(135deg, #DCA048, #CF9555)'
          : 'rgba(255,255,255,0.15)',
      }}
    >
      <motion.div
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
        animate={{ left: value ? 26 : 2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      />
    </button>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={15} style={{ color: '#DCA048' }} />
      <span style={{ color: '#DCA048', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
        {title}
      </span>
    </div>
  );
}

export function SettingsPage() {
  const [data, setData] = useState<UserData>(defaultData);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('dhikr_user_data') || '{}');
      setData({ ...defaultData, ...stored });
    } catch { /* ignore */ }
  }, []);

  const save = (patch: Partial<UserData>) => {
    const updated = { ...data, ...patch };
    setData(updated);
    localStorage.setItem('dhikr_user_data', JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const resetSetup = () => {
    if (confirm('This will restart the setup wizard on next refresh. Continue?')) {
      localStorage.removeItem('dhikr_setup_complete');
      localStorage.removeItem('dhikr_user_data');
      window.location.reload();
    }
  };

  const toggleCategory = (cat: string) => {
    const cats = data.adhkarCategories.includes(cat)
      ? data.adhkarCategories.filter(c => c !== cat)
      : [...data.adhkarCategories, cat];
    save({ adhkarCategories: cats });
  };

  const toggleTrigger = (t: string) => {
    const trigs = data.reminderTriggers.includes(t)
      ? data.reminderTriggers.filter(r => r !== t)
      : [...data.reminderTriggers, t];
    save({ reminderTriggers: trigs });
  };

  return (
    <div className="min-h-full p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="flex items-center justify-between pt-2">
          <div>
            <h1 className="text-white" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Settings</h1>
            <p style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.82rem' }}>Personalize your dhikr experience</p>
          </div>
          <motion.div
            animate={{ opacity: saved ? 1 : 0, scale: saved ? 1 : 0.8 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(72,177,110,0.15)', border: '1px solid rgba(72,177,110,0.3)' }}
          >
            <CheckCircle size={12} style={{ color: '#48B16E' }} />
            <span style={{ color: '#48B16E', fontSize: '0.75rem' }}>Saved</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Profile */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
        <GlowCard className="p-5 space-y-4">
          <SectionHeader icon={User} title="Profile" />
          <div className="space-y-2">
            <label style={{ color: '#D7C29F', fontSize: '0.8rem' }}>Your Name</label>
            <input
              type="text"
              value={data.name}
              onChange={e => save({ name: e.target.value })}
              placeholder="Enter your name..."
              className="w-full rounded-xl px-4 py-2.5 outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(220,160,72,0.2)',
                color: 'white',
                fontSize: '0.9rem',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(220,160,72,0.5)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(220,160,72,0.2)')}
            />
          </div>
          <div className="space-y-2">
            <label style={{ color: '#D7C29F', fontSize: '0.8rem' }}>Language</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ code: 'en', label: 'English' }, { code: 'ar', label: 'العربية' }].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => save({ language: lang.code })}
                  className="rounded-xl py-2.5 transition-all"
                  style={{
                    background: data.language === lang.code ? 'rgba(220,160,72,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${data.language === lang.code ? 'rgba(220,160,72,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    color: data.language === lang.code ? 'white' : '#D7C29F',
                    fontSize: '0.88rem',
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* Display */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <GlowCard className="p-5 space-y-4">
          <SectionHeader icon={Palette} title="Display" />
          {[
            { key: 'showTransliteration', label: 'Transliteration', sub: 'Roman script pronunciation' },
            { key: 'showTranslation', label: 'Translation', sub: 'English meaning' },
          ].map(pref => (
            <div key={pref.key} className="flex items-center justify-between">
              <div>
                <p style={{ color: 'white', fontSize: '0.9rem' }}>{pref.label}</p>
                <p style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.75rem' }}>{pref.sub}</p>
              </div>
              <Toggle
                value={data[pref.key as keyof UserData] as boolean}
                onChange={v => save({ [pref.key]: v })}
              />
            </div>
          ))}

          <div className="pt-2 space-y-2">
            <label style={{ color: '#D7C29F', fontSize: '0.8rem' }}>Arabic Font Size</label>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => save({ fontSize: size })}
                  className="rounded-xl py-2 capitalize transition-all"
                  style={{
                    background: data.fontSize === size ? 'rgba(220,160,72,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${data.fontSize === size ? 'rgba(220,160,72,0.5)' : 'rgba(255,255,255,0.07)'}`,
                    color: data.fontSize === size ? 'white' : '#D7C29F',
                    fontFamily: 'Amiri, serif',
                    fontSize: size === 'small' ? '0.75rem' : size === 'medium' ? '0.85rem' : '1rem',
                  }}
                >
                  ص {size}
                </button>
              ))}
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* Quran / Tajweed */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.13 }}>
        <GlowCard className="p-5 space-y-4">
          <SectionHeader icon={BookOpen} title="Quran & Tajweed" />
          <div className="space-y-2">
            <label style={{ color: '#D7C29F', fontSize: '0.8rem' }}>Tajweed Color Coding</label>
            <div className="grid grid-cols-3 gap-2">
              {(['full', 'minimal', 'none'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => save({ tajweedDisplay: mode })}
                  className="rounded-xl py-2.5 text-center transition-all"
                  style={{
                    background: data.tajweedDisplay === mode ? 'rgba(220,160,72,0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${data.tajweedDisplay === mode ? 'rgba(220,160,72,0.5)' : 'rgba(255,255,255,0.07)'}`,
                    color: data.tajweedDisplay === mode ? 'white' : '#D7C29F',
                    fontSize: '0.82rem',
                  }}
                >
                  <div className="flex flex-col items-center gap-1.5 py-0.5">
                    {mode === 'full' ? <Palette size={13} style={{ color: data.tajweedDisplay === mode ? '#DCA048' : '#D7C29F' }} /> : mode === 'minimal' ? <Type size={13} style={{ color: data.tajweedDisplay === mode ? '#DCA048' : '#D7C29F' }} /> : <MessageSquare size={13} style={{ color: data.tajweedDisplay === mode ? '#DCA048' : '#D7C29F' }} />}
                    {mode === 'full' ? 'Full' : mode === 'minimal' ? 'Minimal' : 'Off'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* Adhkar Categories */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.16 }}>
        <GlowCard className="p-5 space-y-4">
          <SectionHeader icon={Heart} title="Adhkar Categories" />
          <div className="space-y-2">
            {[
              { id: 'morning', icon: Sun, label: 'Morning Adhkar', sub: 'Adhkar as-Sabah' },
              { id: 'evening', icon: Moon, label: 'Evening Adhkar', sub: 'Adhkar al-Masaʾ' },
              { id: 'after-prayer', icon: BookOpen, label: 'After Prayer', sub: 'Post-salah tasbih' },
              { id: 'general', icon: Heart, label: 'General Dhikr', sub: 'Throughout the day' },
            ].map(({ id, icon: Icon, label, sub }) => {
              const active = data.adhkarCategories.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleCategory(id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={{
                    background: active ? 'rgba(220,160,72,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? 'rgba(220,160,72,0.35)' : 'rgba(255,255,255,0.07)'}`,
                  }}
                >
                  <Icon size={16} style={{ color: active ? '#DCA048' : 'rgba(215,194,159,0.4)', flexShrink: 0 }} />
                  <div className="flex-1">
                    <p style={{ color: active ? 'white' : '#D7C29F', fontSize: '0.88rem', fontWeight: active ? 500 : 400 }}>{label}</p>
                    <p style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.73rem' }}>{sub}</p>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: active ? 'linear-gradient(135deg, #DCA048, #CF9555)' : 'rgba(255,255,255,0.08)',
                      border: active ? 'none' : '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {active && <CheckCircle size={12} className="text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </GlowCard>
      </motion.div>

      {/* Reminders */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.19 }}>
        <GlowCard className="p-5 space-y-4">
          <SectionHeader icon={Bell} title="Smart Reminders" />
          <div className="space-y-2">
            {[
              { id: 'prayer-based', label: 'After Prayer Times', sub: 'Fajr, Dhuhr, Asr, Maghrib, Isha' },
              { id: 'morning', label: 'Morning Schedule', sub: 'Reminder at sunrise' },
              { id: 'evening', label: 'Evening Schedule', sub: 'Reminder at sunset' },
            ].map(({ id, label, sub }) => {
              const active = data.reminderTriggers.includes(id);
              return (
                <div key={id} className="flex items-center justify-between">
                  <div>
                    <p style={{ color: 'white', fontSize: '0.88rem' }}>{label}</p>
                    <p style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.73rem' }}>{sub}</p>
                  </div>
                  <Toggle value={active} onChange={() => toggleTrigger(id)} />
                </div>
              );
            })}
          </div>

          <div
            className="rounded-xl p-4 space-y-3 mt-2"
            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(220,160,72,0.1)' }}
          >
            <p style={{ color: '#DCA048', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Quiet Hours
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <label style={{ color: '#D7C29F', fontSize: '0.73rem' }}>From</label>
                <input
                  type="time"
                  value={data.quietStart}
                  onChange={e => save({ quietStart: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(220,160,72,0.2)', color: 'white', fontSize: '0.88rem' }}
                />
              </div>
              <div style={{ color: '#D7C29F', paddingTop: '1.2rem' }}>—</div>
              <div className="flex-1 space-y-1">
                <label style={{ color: '#D7C29F', fontSize: '0.73rem' }}>To</label>
                <input
                  type="time"
                  value={data.quietEnd}
                  onChange={e => save({ quietEnd: e.target.value })}
                  className="w-full rounded-lg px-3 py-2 outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(220,160,72,0.2)', color: 'white', fontSize: '0.88rem' }}
                />
              </div>
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* Daily Goal */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.22 }}>
        <GlowCard className="p-5 space-y-4">
          <SectionHeader icon={Clock} title="Daily Goal" />
          <p style={{ color: 'rgba(215,194,159,0.6)', fontSize: '0.8rem' }}>
            Target number of dhikr sessions per day
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => save({ dailyGoal: Math.max(1, data.dailyGoal - 1) })}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#D7C29F' }}
            >
              −
            </button>
            <div
              className="flex-1 text-center rounded-xl py-2.5"
              style={{ background: 'rgba(220,160,72,0.1)', border: '1px solid rgba(220,160,72,0.3)' }}
            >
              <span style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>{data.dailyGoal}</span>
              <span style={{ color: '#DCA048', fontSize: '0.8rem', marginLeft: 6 }}>sessions</span>
            </div>
            <button
              onClick={() => save({ dailyGoal: Math.min(10, data.dailyGoal + 1) })}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#D7C29F' }}
            >
              +
            </button>
          </div>
        </GlowCard>
      </motion.div>

      {/* About & Reset */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
        <GlowCard className="p-5 space-y-3">
          <SectionHeader icon={Info} title="About" />
          <div
            className="rounded-xl p-4 space-y-2"
            style={{ background: 'rgba(220,160,72,0.06)', border: '1px solid rgba(220,160,72,0.12)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6a2428, #4a1518)', border: '1px solid rgba(220,160,72,0.4)' }}
              >
                <span style={{ fontFamily: 'Amiri, serif', color: '#DCA048', fontSize: '1.2rem' }}>ذ</span>
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 700 }}>Dhikr</div>
                <div style={{ color: '#CF9555', fontSize: '0.72rem', letterSpacing: '0.1em' }}>REMEMBRANCE · QURAN · GROWTH</div>
              </div>
            </div>
            <p
              dir="rtl"
              style={{ color: 'rgba(220,160,72,0.6)', fontFamily: 'Amiri, serif', fontSize: '1rem', marginTop: 8 }}
            >
              وَاذْكُرُوا اللَّهَ كَثِيرًا لَّعَلَّكُمْ تُفْلِحُونَ
            </p>
            <p style={{ color: 'rgba(215,194,159,0.4)', fontSize: '0.7rem', fontStyle: 'italic' }}>
              "And remember Allah much that you may succeed." — Quran 8:45
            </p>
          </div>

          <button
            onClick={resetSetup}
            className="w-full flex items-center justify-between p-4 rounded-xl transition-all hover:opacity-80"
            style={{ background: 'rgba(251,56,54,0.08)', border: '1px solid rgba(251,56,54,0.2)' }}
          >
            <div className="flex items-center gap-3">
              <Trash2 size={16} style={{ color: '#FB3836' }} />
              <div className="text-left">
                <p style={{ color: '#FB3836', fontSize: '0.88rem', fontWeight: 500 }}>Reset & Restart Setup</p>
                <p style={{ color: 'rgba(251,56,54,0.6)', fontSize: '0.72rem' }}>Clear all settings and restart the wizard</p>
              </div>
            </div>
            <ChevronRight size={14} style={{ color: '#FB3836' }} />
          </button>
        </GlowCard>
      </motion.div>

      <div className="h-6" />
    </div>
  );
}