import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BackgroundEffects } from '../shared/BackgroundEffects';
import {
  Moon, Sun, BookOpen, CheckCircle, Star, Sparkles,
  ChevronRight, ChevronLeft, Heart, Clock, MapPin, Cpu, Palette, Type, MessageSquare
} from 'lucide-react';

interface SetupData {
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

const defaultSetup: SetupData = {
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

interface SetupWizardProps {
  onComplete: () => void;
}

const TOTAL_STEPS = 6;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0 }),
};

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState<SetupData>(defaultSetup);

  const goNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setDir(1);
      setStep(s => s + 1);
    } else {
      handleComplete();
    }
  };

  const goBack = () => {
    if (step > 0) {
      setDir(-1);
      setStep(s => s - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('dhikr_setup_complete', 'true');
    localStorage.setItem('dhikr_user_data', JSON.stringify(data));
    onComplete();
  };

  const toggleCategory = (cat: string) => {
    setData(d => ({
      ...d,
      adhkarCategories: d.adhkarCategories.includes(cat)
        ? d.adhkarCategories.filter(c => c !== cat)
        : [...d.adhkarCategories, cat],
    }));
  };

  const toggleTrigger = (t: string) => {
    setData(d => ({
      ...d,
      reminderTriggers: d.reminderTriggers.includes(t)
        ? d.reminderTriggers.filter(r => r !== t)
        : [...d.reminderTriggers, t],
    }));
  };

  const steps = [
    <StepWelcome key="welcome" data={data} setData={setData} />,
    <StepProfile key="profile" data={data} setData={setData} />,
    <StepAdhkar key="adhkar" data={data} toggleCategory={toggleCategory} />,
    <StepReminders key="reminders" data={data} setData={setData} toggleTrigger={toggleTrigger} />,
    <StepQuran key="quran" data={data} setData={setData} />,
    <StepComplete key="complete" data={data} />,
  ];

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <BackgroundEffects />

      <div className="relative z-10 flex flex-col h-full">
        {/* Progress bar */}
        {step > 0 && step < TOTAL_STEPS - 1 && (
          <div className="p-6 flex items-center gap-4">
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #DCA048, #CF9555)' }}
                animate={{ width: `${((step) / (TOTAL_STEPS - 2)) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <span style={{ color: '#DCA048', fontSize: '0.75rem' }}>
              {step} / {TOTAL_STEPS - 2}
            </span>
          </div>
        )}

        {/* Step content */}
        <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-2xl"
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="p-6 flex items-center justify-between max-w-2xl mx-auto w-full">
          {step > 0 && step < TOTAL_STEPS - 1 ? (
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#D7C29F',
              }}
            >
              <ChevronLeft size={16} />
              Back
            </button>
          ) : <div />}

          {step < TOTAL_STEPS - 1 && (
            <motion.button
              onClick={goNext}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-7 py-3 rounded-xl text-white"
              style={{
                background: 'linear-gradient(135deg, #DCA048, #CF9555)',
                boxShadow: '0 4px 20px rgba(220,160,72,0.4)',
              }}
            >
              {step === 0 ? 'Begin Setup' : 'Continue'}
              <ChevronRight size={16} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 0: Welcome ──────────────────────────────────────────────────────────
function StepWelcome({ data: _data, setData: _setData }: { data: SetupData; setData: React.Dispatch<React.SetStateAction<SetupData>> }) {
  return (
    <div className="text-center space-y-8">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
        className="mx-auto w-24 h-24 rounded-3xl flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #6a2428, #4a1518)',
          border: '2px solid rgba(220,160,72,0.5)',
          boxShadow: '0 8px 40px rgba(220,160,72,0.3)',
        }}
      >
        <div
          style={{ fontFamily: 'Amiri, serif', color: '#DCA048', fontSize: '5rem', lineHeight: 1, marginTop: '8px' }}
        >
          ذ
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <h1 className="text-white" style={{ fontSize: '2.8rem', fontWeight: 700, lineHeight: 1.1 }}>
          Dhikr
        </h1>
        <p style={{ color: '#DCA048', fontSize: '1rem', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          Remembrance · Quran · Growth
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mx-auto max-w-md space-y-4"
      >
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(106,36,40,0.5)',
            border: '1px solid rgba(220,160,72,0.2)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <p style={{ color: '#D7C29F', lineHeight: 1.7, fontSize: '1rem' }}>
            Your companion for daily dhikr, smart reminders, and beautiful Quran recitation with live tajweed guidance.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Moon, label: 'Smart Reminders' },
            { icon: BookOpen, label: 'Tajweed Quran' },
            { icon: Heart, label: 'Daily Dhikr' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-xl p-3 text-center space-y-2"
              style={{
                background: 'rgba(106,36,40,0.4)',
                border: '1px solid rgba(220,160,72,0.15)',
              }}
            >
              <Icon size={20} style={{ color: '#DCA048', margin: '0 auto' }} />
              <p style={{ color: '#D7C29F', fontSize: '0.7rem' }}>{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <p
          className="text-center"
          style={{ fontFamily: 'Amiri, serif', color: 'rgba(220,160,72,0.7)', fontSize: '1.2rem' }}
          dir="rtl"
        >
          وَاذْكُرُوا اللَّهَ كَثِيرًا لَّعَلَّكُمْ تُفْلِحُونَ
        </p>
        <p style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
          "And remember Allah much that you may succeed." — Quran 8:45
        </p>
      </motion.div>
    </div>
  );
}

// ── Step 1: Profile ──────────────────────────────────────────────────────────
function StepProfile({ data, setData }: { data: SetupData; setData: React.Dispatch<React.SetStateAction<SetupData>> }) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-white" style={{ fontSize: '2rem', fontWeight: 700 }}>Your Profile</h2>
        <p style={{ color: '#D7C29F' }}>Let's personalize your experience</p>
      </div>

      <div
        className="rounded-2xl p-6 space-y-6"
        style={{
          background: 'rgba(106,36,40,0.5)',
          border: '1px solid rgba(220,160,72,0.2)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="space-y-2">
          <label style={{ color: '#DCA048', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Your Name
          </label>
          <input
            type="text"
            placeholder="Enter your name..."
            value={data.name}
            onChange={e => setData(d => ({ ...d, name: e.target.value }))}
            className="w-full rounded-xl px-4 py-3 outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(220,160,72,0.2)',
              color: 'white',
              fontSize: '1rem',
            }}
            onFocus={e => (e.target.style.borderColor = 'rgba(220,160,72,0.6)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(220,160,72,0.2)')}
          />
        </div>

        <div className="space-y-2">
          <label style={{ color: '#DCA048', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Preferred Language
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { code: 'en', label: 'English', sub: 'English translations' },
              { code: 'ar', label: 'العربية', sub: 'Arabic only' },
            ].map(lang => (
              <button
                key={lang.code}
                onClick={() => setData(d => ({ ...d, language: lang.code }))}
                className="rounded-xl p-4 text-left transition-all"
                style={{
                  background: data.language === lang.code ? 'rgba(220,160,72,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${data.language === lang.code ? 'rgba(220,160,72,0.6)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <div style={{ color: 'white', fontWeight: 500 }}>{lang.label}</div>
                <div style={{ color: '#D7C29F', fontSize: '0.75rem' }}>{lang.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label style={{ color: '#DCA048', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Display Preferences
          </label>
          {[
            { key: 'showTransliteration', label: 'Show Transliteration', sub: 'Roman script pronunciation guide' },
            { key: 'showTranslation', label: 'Show Translation', sub: 'English meaning of adhkar' },
          ].map(pref => (
            <div
              key={pref.key}
              className="flex items-center justify-between rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div>
                <div style={{ color: 'white', fontSize: '0.9rem' }}>{pref.label}</div>
                <div style={{ color: '#D7C29F', fontSize: '0.75rem' }}>{pref.sub}</div>
              </div>
              <button
                onClick={() => setData(d => ({ ...d, [pref.key]: !d[pref.key as keyof SetupData] }))}
                className="relative w-12 h-6 rounded-full transition-all duration-300"
                style={{
                  background: (data[pref.key as keyof SetupData] as boolean)
                    ? 'linear-gradient(135deg, #DCA048, #CF9555)'
                    : 'rgba(255,255,255,0.15)',
                }}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                  animate={{ left: (data[pref.key as keyof SetupData] as boolean) ? 26 : 2 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Adhkar ────────────────────────────────────────────────────────────
function StepAdhkar({ data, toggleCategory }: { data: SetupData; toggleCategory: (c: string) => void }) {
  const options = [
    { id: 'morning', icon: Sun, label: 'Morning Adhkar', sub: 'Adhkar as-Sabah — after Fajr', count: '5 adhkar' },
    { id: 'evening', icon: Moon, label: 'Evening Adhkar', sub: 'Adhkar al-Masaʾ — after Asr', count: '4 adhkar' },
    { id: 'after-prayer', icon: Star, label: 'After Prayer', sub: 'Post-salah tasbih & dua', count: '5 adhkar' },
    { id: 'general', icon: Heart, label: 'General Dhikr', sub: 'Throughout the day', count: '3 adhkar' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-white" style={{ fontSize: '2rem', fontWeight: 700 }}>Choose Your Adhkar</h2>
        <p style={{ color: '#D7C29F' }}>Select which adhkar collections to include</p>
      </div>

      <div className="space-y-3">
        {options.map(({ id, icon: Icon, label, sub, count }) => {
          const selected = data.adhkarCategories.includes(id);
          return (
            <motion.button
              key={id}
              onClick={() => toggleCategory(id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
              style={{
                background: selected ? 'rgba(220,160,72,0.15)' : 'rgba(106,36,40,0.4)',
                border: `1px solid ${selected ? 'rgba(220,160,72,0.5)' : 'rgba(255,255,255,0.08)'}`,
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: selected ? 'rgba(220,160,72,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selected ? 'rgba(220,160,72,0.4)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <Icon size={20} style={{ color: selected ? '#DCA048' : '#D7C29F' }} />
              </div>
              <div className="flex-1">
                <div style={{ color: selected ? 'white' : '#D7C29F', fontWeight: 600, fontSize: '0.95rem' }}>{label}</div>
                <div style={{ color: 'rgba(215,194,159,0.7)', fontSize: '0.78rem' }}>{sub}</div>
              </div>
              <div className="flex items-center gap-3">
                <span style={{ color: '#CF9555', fontSize: '0.75rem' }}>{count}</span>
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background: selected ? 'linear-gradient(135deg, #DCA048, #CF9555)' : 'transparent',
                    border: selected ? 'none' : '2px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {selected && <CheckCircle size={12} className="text-white" />}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div
        className="rounded-xl p-4 text-center"
        style={{ background: 'rgba(220,160,72,0.08)', border: '1px solid rgba(220,160,72,0.15)' }}
      >
        <p style={{ color: '#D7C29F', fontSize: '0.85rem' }}>
          {data.adhkarCategories.length === 0
            ? 'Select at least one category'
            : `${data.adhkarCategories.length} collection${data.adhkarCategories.length !== 1 ? 's' : ''} selected`}
        </p>
      </div>
    </div>
  );
}

// ── Step 3: Reminders ─────────────────────────────────────────────────────────
function StepReminders({
  data, setData, toggleTrigger
}: {
  data: SetupData;
  setData: React.Dispatch<React.SetStateAction<SetupData>>;
  toggleTrigger: (t: string) => void;
}) {
  const triggers = [
    { id: 'prayer-based', icon: Clock, label: 'After Prayer Times', sub: 'Smart detection after Fajr, Dhuhr, Asr, Maghrib, Isha' },
    { id: 'morning', icon: Sun, label: 'Morning Schedule', sub: 'Reminder at sunrise for morning adhkar' },
    { id: 'evening', icon: Moon, label: 'Evening Schedule', sub: 'Reminder at sunset for evening adhkar' },
    { id: 'idle', icon: Cpu, label: 'Idle Detection', sub: 'Remind when device has been idle — opportune moment' },
    { id: 'location', icon: MapPin, label: 'Mosque Detection', sub: 'Remind after visiting a mosque (GPS)' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-white" style={{ fontSize: '2rem', fontWeight: 700 }}>Smart Reminders</h2>
        <p style={{ color: '#D7C29F' }}>When should we remind you to make dhikr?</p>
      </div>

      <div className="space-y-3">
        {triggers.map(({ id, icon: Icon, label, sub }) => {
          const active = data.reminderTriggers.includes(id);
          return (
            <motion.button
              key={id}
              onClick={() => toggleTrigger(id)}
              whileHover={{ scale: 1.01 }}
              className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
              style={{
                background: active ? 'rgba(220,160,72,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? 'rgba(220,160,72,0.4)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              <Icon size={18} style={{ color: active ? '#DCA048' : '#D7C29F', flexShrink: 0 }} />
              <div className="flex-1">
                <div style={{ color: active ? 'white' : '#D7C29F', fontSize: '0.9rem', fontWeight: 500 }}>{label}</div>
                <div style={{ color: 'rgba(215,194,159,0.6)', fontSize: '0.75rem' }}>{sub}</div>
              </div>
              <div
                className="w-5 h-5 rounded-full flex-shrink-0"
                style={{
                  background: active ? 'linear-gradient(135deg, #DCA048, #CF9555)' : 'rgba(255,255,255,0.1)',
                  border: active ? 'none' : '1px solid rgba(255,255,255,0.2)',
                }}
              />
            </motion.button>
          );
        })}
      </div>

      <div
        className="rounded-xl p-4 space-y-3"
        style={{ background: 'rgba(106,36,40,0.4)', border: '1px solid rgba(220,160,72,0.15)' }}
      >
        <p style={{ color: '#DCA048', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Quiet Hours
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1">
            <label style={{ color: '#D7C29F', fontSize: '0.75rem' }}>From</label>
            <input
              type="time"
              value={data.quietStart}
              onChange={e => setData(d => ({ ...d, quietStart: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(220,160,72,0.2)', color: 'white', fontSize: '0.9rem' }}
            />
          </div>
          <div style={{ color: '#D7C29F', paddingTop: '1.2rem' }}>—</div>
          <div className="flex-1 space-y-1">
            <label style={{ color: '#D7C29F', fontSize: '0.75rem' }}>To</label>
            <input
              type="time"
              value={data.quietEnd}
              onChange={e => setData(d => ({ ...d, quietEnd: e.target.value }))}
              className="w-full rounded-lg px-3 py-2 outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(220,160,72,0.2)', color: 'white', fontSize: '0.9rem' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Quran ─────────────────────────────────────────────────────────────
function StepQuran({ data, setData }: { data: SetupData; setData: React.Dispatch<React.SetStateAction<SetupData>> }) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-white" style={{ fontSize: '2rem', fontWeight: 700 }}>Quran Settings</h2>
        <p style={{ color: '#D7C29F' }}>Customize your Quran reading experience</p>
      </div>

      <div
        className="rounded-2xl p-6 space-y-6"
        style={{
          background: 'rgba(106,36,40,0.5)',
          border: '1px solid rgba(220,160,72,0.2)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="space-y-2">
          <label style={{ color: '#DCA048', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Tajweed Color Coding
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['full', 'minimal', 'none'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setData(d => ({ ...d, tajweedDisplay: mode }))}
                className="rounded-xl p-3 text-center transition-all capitalize"
                style={{
                  background: data.tajweedDisplay === mode ? 'rgba(220,160,72,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${data.tajweedDisplay === mode ? 'rgba(220,160,72,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: data.tajweedDisplay === mode ? 'white' : '#D7C29F',
                  fontSize: '0.85rem',
                }}
              >
                <div className="flex flex-col items-center gap-1.5">
                  {mode === 'full' ? <Palette size={14} style={{ color: data.tajweedDisplay === mode ? '#DCA048' : '#D7C29F' }} /> : mode === 'minimal' ? <Type size={14} style={{ color: data.tajweedDisplay === mode ? '#DCA048' : '#D7C29F' }} /> : <MessageSquare size={14} style={{ color: data.tajweedDisplay === mode ? '#DCA048' : '#D7C29F' }} />}
                  {mode === 'full' ? 'Full' : mode === 'minimal' ? 'Minimal' : 'Off'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label style={{ color: '#DCA048', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Arabic Font Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={size}
                onClick={() => setData(d => ({ ...d, fontSize: size }))}
                className="rounded-xl p-3 text-center transition-all capitalize"
                style={{
                  background: data.fontSize === size ? 'rgba(220,160,72,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${data.fontSize === size ? 'rgba(220,160,72,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: data.fontSize === size ? 'white' : '#D7C29F',
                  fontSize: size === 'small' ? '0.75rem' : size === 'medium' ? '0.85rem' : '1rem',
                  fontFamily: 'Amiri, serif',
                }}
              >
                {size === 'small' ? 'ص Small' : size === 'medium' ? 'ص Medium' : 'ص Large'}
              </button>
            ))}
          </div>
        </div>

        {/* Tajweed preview */}
        <div
          className="rounded-xl p-4 space-y-2"
          style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p style={{ color: '#DCA048', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Preview</p>
          <p
            dir="rtl"
            style={{
              fontFamily: 'Noto Naskh Arabic, Amiri, serif',
              fontSize: data.tajweedDisplay === 'none' ? '1.4rem' : '1.4rem',
              lineHeight: 2,
              textAlign: 'right',
            }}
          >
            <span style={{ color: data.tajweedDisplay !== 'none' ? '#ef4444' : 'white' }}>قُلْ </span>
            <span style={{ color: 'white' }}>هُوَ اللَّهُ </span>
            <span style={{ color: data.tajweedDisplay === 'full' ? '#3b82f6' : data.tajweedDisplay === 'minimal' ? '#94a3b8' : 'white' }}>أَحَدٌ</span>
          </p>
          {data.tajweedDisplay !== 'none' && (
            <div className="flex gap-3 flex-wrap">
              {[['#ef4444', 'Qalqalah'], ['#3b82f6', 'Madd'], ['#22c55e', 'Idgham']].map(([color, name]) => (
                <span key={name} className="flex items-center gap-1" style={{ color: '#D7C29F', fontSize: '0.7rem' }}>
                  <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 5: Complete ──────────────────────────────────────────────────────────
function StepComplete({ data }: { data: SetupData }) {
  return (
    <div className="text-center space-y-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
        className="mx-auto w-24 h-24 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(220,160,72,0.3), rgba(106,36,40,0.8))',
          border: '2px solid rgba(220,160,72,0.6)',
          boxShadow: '0 0 60px rgba(220,160,72,0.4)',
        }}
      >
        <Sparkles size={40} style={{ color: '#DCA048' }} />
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        <h2 className="text-white" style={{ fontSize: '2.2rem', fontWeight: 700 }}>
          {data.name ? `Bismillah, ${data.name}!` : 'Bismillah!'}
        </h2>
        <p style={{ color: '#D7C29F', marginTop: '0.5rem' }}>
          Your dhikr journey begins now. May Allah make it easy for you.
        </p>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
        <div
          className="rounded-2xl p-6 space-y-3 text-left"
          style={{ background: 'rgba(106,36,40,0.5)', border: '1px solid rgba(220,160,72,0.2)' }}
        >
          <p style={{ color: '#DCA048', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Summary</p>
          <div className="space-y-2">
            {[
              ['Collections', `${data.adhkarCategories.length} selected`],
              ['Reminders', `${data.reminderTriggers.length} triggers active`],
              ['Tajweed', `${data.tajweedDisplay} color coding`],
              ['Quiet Hours', `${data.quietStart} — ${data.quietEnd}`],
            ].map(([key, val]) => (
              <div key={key} className="flex justify-between">
                <span style={{ color: '#D7C29F', fontSize: '0.85rem' }}>{key}</span>
                <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
        <p
          style={{ fontFamily: 'Amiri, serif', color: '#DCA048', fontSize: '1.3rem' }}
          dir="rtl"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الر-حِيمِ
        </p>
      </motion.div>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          localStorage.setItem('dhikr_setup_complete', 'true');
          localStorage.setItem('dhikr_user_data', JSON.stringify(data));
          window.location.reload();
        }}
        className="px-10 py-4 rounded-2xl text-white"
        style={{
          background: 'linear-gradient(135deg, #DCA048, #CF9555)',
          boxShadow: '0 4px 30px rgba(220,160,72,0.5)',
          fontSize: '1rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
      >
        Enter the App
      </motion.button>
    </div>
  );
}
