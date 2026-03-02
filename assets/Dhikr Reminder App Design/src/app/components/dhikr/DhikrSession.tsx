import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle, Star, Volume2, Info, Sun, Moon, BookOpen, Sparkles } from 'lucide-react';
import { morningAdhkar, eveningAdhkar, afterPrayerAdhkar, generalDhikr, Dhikr } from '../../data/dhikr';

const CATEGORIES = [
  { id: 'morning', label: 'Morning', Icon: Sun, dhikr: morningAdhkar },
  { id: 'evening', label: 'Evening', Icon: Moon, dhikr: eveningAdhkar },
  { id: 'after-prayer', label: 'After Prayer', Icon: BookOpen, dhikr: afterPrayerAdhkar },
  { id: 'general', label: 'General', Icon: Sparkles, dhikr: generalDhikr },
];

const FONT_SIZE_MAP = { small: '1.3rem', medium: '1.6rem', large: '2rem' };

function PulsingOrb({ intensity = 1 }: { intensity?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
      <motion.div
        className="absolute inset-0 rounded-3xl"
        animate={{
          background: [
            'radial-gradient(ellipse at 50% 100%, rgba(220,160,72,0.06) 0%, transparent 70%)',
            `radial-gradient(ellipse at 50% 100%, rgba(220,160,72,${0.06 + intensity * 0.1}) 0%, transparent 70%)`,
            'radial-gradient(ellipse at 50% 100%, rgba(220,160,72,0.06) 0%, transparent 70%)',
          ],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function CounterButton({
  count, target, onTap, complete
}: {
  count: number; target: number; onTap: () => void; complete: boolean;
}) {
  const pct = target > 0 ? Math.min(count / target, 1) : 1;
  const r = 68;
  const circ = 2 * Math.PI * r;

  return (
    <motion.button
      onClick={onTap}
      disabled={complete}
      whileTap={{ scale: 0.93 }}
      className="relative flex items-center justify-center mx-auto"
      style={{ width: 160, height: 160 }}
    >
      {/* Ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <motion.circle
          cx="80" cy="80" r={r}
          fill="none"
          stroke={complete ? '#48B16E' : 'url(#btnGrad)'}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        />
        <defs>
          <linearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DCA048" />
            <stop offset="100%" stopColor="#CF9555" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center circle */}
      <motion.div
        className="relative z-10 w-28 h-28 rounded-full flex flex-col items-center justify-center"
        style={{
          background: complete
            ? 'linear-gradient(135deg, rgba(72,177,110,0.3), rgba(72,177,110,0.1))'
            : 'linear-gradient(135deg, rgba(106,36,40,0.8), rgba(74,21,24,0.9))',
          border: `2px solid ${complete ? 'rgba(72,177,110,0.6)' : 'rgba(220,160,72,0.3)'}`,
          boxShadow: complete
            ? '0 0 40px rgba(72,177,110,0.3)'
            : '0 0 40px rgba(220,160,72,0.2)',
        }}
        animate={complete ? {} : { boxShadow: ['0 0 20px rgba(220,160,72,0.15)', '0 0 40px rgba(220,160,72,0.3)', '0 0 20px rgba(220,160,72,0.15)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {complete ? (
          <CheckCircle size={36} style={{ color: '#48B16E' }} />
        ) : (
          <>
            <motion.span
              key={count}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ color: 'white', fontWeight: 700, fontSize: '2rem', lineHeight: 1 }}
            >
              {count}
            </motion.span>
            <span style={{ color: '#DCA048', fontSize: '0.7rem' }}>/ {target}</span>
          </>
        )}
      </motion.div>
    </motion.button>
  );
}

function InfoPanel({ dhikr, onClose }: { dhikr: Dhikr; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="rounded-2xl p-5 space-y-3"
      style={{ background: 'rgba(106,36,40,0.7)', border: '1px solid rgba(220,160,72,0.2)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center justify-between">
        <span style={{ color: '#DCA048', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Source</span>
        <button onClick={onClose} style={{ color: '#D7C29F', fontSize: '0.8rem' }}>Close</button>
      </div>
      <p style={{ color: 'white', fontSize: '0.9rem', fontWeight: 500 }}>{dhikr.source}</p>
      {dhikr.benefit && (
        <div className="rounded-xl p-3" style={{ background: 'rgba(220,160,72,0.08)', border: '1px solid rgba(220,160,72,0.15)' }}>
          <p style={{ color: '#D7C29F', fontSize: '0.82rem', lineHeight: 1.6 }}>{dhikr.benefit}</p>
        </div>
      )}
    </motion.div>
  );
}

export function DhikrSession() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<string[]>([]);

  const category = CATEGORIES[activeCategory];
  const dhikrList = category.dhikr;
  const current = dhikrList[currentIndex];
  const currentCount = counts[current?.id] ?? 0;
  const isComplete = currentCount >= current?.targetCount;

  const userData = (() => {
    try { return JSON.parse(localStorage.getItem('dhikr_user_data') || '{}'); } catch { return {}; }
  })();
  const fontSize = FONT_SIZE_MAP[userData.fontSize as keyof typeof FONT_SIZE_MAP] ?? '1.6rem';
  const showTranslit = userData.showTransliteration !== false;
  const showTranslation = userData.showTranslation !== false;

  const tap = useCallback(() => {
    if (!current || isComplete) return;
    setCounts(prev => {
      const next = (prev[current.id] ?? 0) + 1;
      return { ...prev, [current.id]: next };
    });
  }, [current, isComplete]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); tap(); }
      if (e.code === 'ArrowRight') goNext();
      if (e.code === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tap]);

  const goNext = () => {
    if (currentIndex < dhikrList.length - 1) {
      setDirection(1);
      setCurrentIndex(i => i + 1);
      setShowInfo(false);
    } else {
      setCompletedSessions(prev => [...new Set([...prev, category.id])]);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(i => i - 1);
      setShowInfo(false);
    }
  };

  const resetCurrent = () => {
    if (!current) return;
    setCounts(prev => ({ ...prev, [current.id]: 0 }));
  };

  const allDone = dhikrList.every(d => (counts[d.id] ?? 0) >= d.targetCount);

  return (
    <div className="min-h-full flex flex-col p-4 md:p-6 max-w-2xl mx-auto">
      {/* Category tabs */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6">
        <h1 className="text-white mb-3" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Dhikr Session</h1>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat, i) => {
            const done = cat.dhikr.every(d => (counts[d.id] ?? 0) >= d.targetCount);
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(i); setCurrentIndex(0); setShowInfo(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: activeCategory === i ? 'rgba(220,160,72,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeCategory === i ? 'rgba(220,160,72,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: activeCategory === i ? 'white' : 'rgba(215,194,159,0.5)',
                  fontSize: '0.85rem',
                }}
              >
                <cat.Icon size={14} style={{ color: activeCategory === i ? '#DCA048' : 'rgba(215,194,159,0.5)' }} />
                {cat.label}
                {done && <CheckCircle size={12} style={{ color: '#48B16E' }} />}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* All done celebration */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="rounded-2xl p-6 text-center mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(72,177,110,0.2), rgba(106,36,40,0.6))', border: '1px solid rgba(72,177,110,0.4)' }}
          >
            <CheckCircle size={40} style={{ color: '#48B16E', margin: '0 auto 12px' }} />
            <p className="text-white" style={{ fontWeight: 700, fontSize: '1.1rem' }}>
              Alhamdulillah! Session Complete
            </p>
            <p style={{ color: '#D7C29F', fontSize: '0.85rem', marginTop: 4 }}>
              May Allah accept your dhikr
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mb-6">
        {dhikrList.map((d, i) => {
          const done = (counts[d.id] ?? 0) >= d.targetCount;
          return (
            <button key={d.id} onClick={() => setCurrentIndex(i)}>
              <motion.div
                className="rounded-full"
                animate={{
                  width: i === currentIndex ? 24 : 8,
                  background: done ? '#48B16E' : i === currentIndex ? '#DCA048' : 'rgba(255,255,255,0.2)',
                }}
                style={{ height: 8 }}
                transition={{ duration: 0.3 }}
              />
            </button>
          );
        })}
      </div>

      {/* Main dhikr card */}
      {current && (
        <div className="flex-1 flex flex-col gap-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              initial={{ x: direction > 0 ? 80 : -80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -80 : 80, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative rounded-3xl overflow-hidden p-6 space-y-5"
              style={{
                background: 'rgba(106,36,40,0.55)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(220,160,72,0.2)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                minHeight: 260,
              }}
            >
              <PulsingOrb intensity={currentCount / Math.max(current.targetCount, 1)} />

              {/* Category label */}
              <div className="flex items-center justify-between">
                <span style={{ color: '#DCA048', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  {category.label} Adhkar · {currentIndex + 1}/{dhikrList.length}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowInfo(v => !v)} className="opacity-60 hover:opacity-100">
                    <Info size={15} style={{ color: '#DCA048' }} />
                  </button>
                  <button onClick={resetCurrent} className="opacity-60 hover:opacity-100">
                    <RotateCcw size={15} style={{ color: '#DCA048' }} />
                  </button>
                </div>
              </div>

              {/* Arabic text */}
              <p
                dir="rtl"
                className="text-white text-right leading-loose"
                style={{ fontFamily: 'Noto Naskh Arabic, Amiri, serif', fontSize }}
              >
                {current.arabic}
              </p>

              {showTranslit && (
                <p style={{ color: '#CF9555', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {current.transliteration}
                </p>
              )}

              {showTranslation && (
                <p style={{ color: '#D7C29F', fontSize: '0.82rem', lineHeight: 1.7, fontStyle: 'italic' }}>
                  "{current.translation}"
                </p>
              )}

              <p style={{ color: 'rgba(215,194,159,0.4)', fontSize: '0.7rem' }}>
                {current.source}
              </p>

              {/* Arabic decoration */}
              <div
                className="absolute right-3 bottom-3 opacity-[0.06] pointer-events-none select-none"
                style={{ fontFamily: 'Amiri, serif', fontSize: '8rem', color: '#CF9555', lineHeight: 1 }}
                dir="rtl"
              >
                ذ
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Info panel */}
          <AnimatePresence>
            {showInfo && <InfoPanel dhikr={current} onClose={() => setShowInfo(false)} />}
          </AnimatePresence>

          {/* Counter */}
          <div className="space-y-4">
            <CounterButton
              count={currentCount}
              target={current.targetCount}
              onTap={tap}
              complete={isComplete}
            />

            <p className="text-center" style={{ color: 'rgba(215,194,159,0.4)', fontSize: '0.72rem' }}>
              {isComplete ? 'SubhanAllah! Tap next to continue' : 'Tap or press Space to count'}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all disabled:opacity-30"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#D7C29F', fontSize: '0.85rem' }}
              >
                <ChevronLeft size={16} />
                Prev
              </button>

              <div className="flex items-center gap-2">
                {isComplete && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Star size={16} style={{ color: '#DCA048' }} />
                  </motion.div>
                )}
                <span style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.78rem' }}>
                  {currentCount}/{current.targetCount}
                </span>
              </div>

              <button
                onClick={goNext}
                disabled={currentIndex === dhikrList.length - 1}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all disabled:opacity-30"
                style={{
                  background: isComplete ? 'linear-gradient(135deg, #DCA048, #CF9555)' : 'rgba(255,255,255,0.05)',
                  border: isComplete ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  color: isComplete ? 'white' : '#D7C29F',
                  fontSize: '0.85rem',
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Keyboard hint */}
          <p className="text-center hidden md:block" style={{ color: 'rgba(215,194,159,0.3)', fontSize: '0.68rem' }}>
            Space to count · ← → to navigate
          </p>
        </div>
      )}
    </div>
  );
}