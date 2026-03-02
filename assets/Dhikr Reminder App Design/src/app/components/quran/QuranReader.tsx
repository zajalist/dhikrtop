import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, BookOpen, Eye, EyeOff, Info, Palette, Type, MessageSquare } from 'lucide-react';
import { surahs, tajweedColors, tajweedNames, tajweedDescriptions, TajweedRule, QuranVerse } from '../../data/quran';
import { GlowCard } from '../shared/BackgroundEffects';

const FONT_SIZE_MAP = { small: '1.4rem', medium: '1.8rem', large: '2.4rem' };

function TajweedBadge({ rule }: { rule: NonNullable<TajweedRule> }) {
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
      style={{ background: `${tajweedColors[rule]}22`, border: `1px solid ${tajweedColors[rule]}44` }}
    >
      <span className="w-2 h-2 rounded-full" style={{ background: tajweedColors[rule] }} />
      <span style={{ color: tajweedColors[rule], fontSize: '0.65rem', fontWeight: 600 }}>
        {tajweedNames[rule]}
      </span>
    </div>
  );
}

function TajweedLegend({ activatedRules }: { activatedRules: Set<NonNullable<TajweedRule>> }) {
  const [expanded, setExpanded] = useState(false);
  const rules = Array.from(activatedRules);

  if (rules.length === 0) return null;

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(106,36,40,0.5)', border: '1px solid rgba(220,160,72,0.15)', backdropFilter: 'blur(12px)' }}
    >
      <button
        className="w-full flex items-center justify-between p-4"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2">
          <Info size={16} style={{ color: '#DCA048' }} />
          <span style={{ color: '#DCA048', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Tajweed Rules
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {rules.slice(0, 4).map(r => (
              <span key={r} className="w-3 h-3 rounded-full" style={{ background: tajweedColors[r] }} />
            ))}
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
            <ChevronDown size={16} style={{ color: '#D7C29F' }} />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {rules.map(rule => (
                <div
                  key={rule}
                  className="flex items-start gap-3 rounded-xl p-3"
                  style={{ background: `${tajweedColors[rule]}11`, border: `1px solid ${tajweedColors[rule]}22` }}
                >
                  <span
                    className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0"
                    style={{ background: tajweedColors[rule] }}
                  />
                  <div>
                    <p style={{ color: tajweedColors[rule], fontSize: '0.78rem', fontWeight: 600 }}>
                      {tajweedNames[rule]}
                    </p>
                    <p style={{ color: '#D7C29F', fontSize: '0.7rem', lineHeight: 1.5 }}>
                      {tajweedDescriptions[rule]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VerseCard({
  verse, showTajweed, showTranslit, showTranslation, fontSize, isSelected, onClick,
}: {
  verse: QuranVerse;
  showTajweed: boolean;
  showTranslit: boolean;
  showTranslation: boolean;
  fontSize: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      layout
      onClick={onClick}
      whileHover={{ scale: 1.005 }}
      className="rounded-2xl overflow-hidden cursor-pointer transition-all"
      style={{
        background: isSelected ? 'rgba(220,160,72,0.12)' : 'rgba(106,36,40,0.4)',
        border: `1px solid ${isSelected ? 'rgba(220,160,72,0.4)' : 'rgba(220,160,72,0.1)'}`,
        backdropFilter: 'blur(12px)',
        boxShadow: isSelected ? '0 0 30px rgba(220,160,72,0.12)' : 'none',
      }}
    >
      <div className="p-5 space-y-4">
        {/* Verse number */}
        <div className="flex items-center justify-between">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(220,160,72,0.15)',
              border: '1px solid rgba(220,160,72,0.3)',
            }}
          >
            <span style={{ color: '#DCA048', fontSize: '0.75rem', fontWeight: 700 }}>{verse.number}</span>
          </div>
          {isSelected && (
            <div className="flex gap-1 flex-wrap justify-end">
              {verse.tajweed
                .filter(s => s.rule)
                .map(s => s.rule!)
                .filter((r, i, a) => a.indexOf(r) === i)
                .map(r => <TajweedBadge key={r} rule={r} />)
              }
            </div>
          )}
        </div>

        {/* Arabic with tajweed */}
        <p
          dir="rtl"
          className="text-right leading-[2.2]"
          style={{ fontFamily: 'Noto Naskh Arabic, Amiri, serif', fontSize }}
        >
          {showTajweed
            ? verse.tajweed.map((seg, i) => (
                <span
                  key={i}
                  style={{
                    color: seg.rule ? tajweedColors[seg.rule] : 'white',
                    textShadow: seg.rule ? `0 0 12px ${tajweedColors[seg.rule]}44` : undefined,
                    transition: 'color 0.3s',
                  }}
                >
                  {seg.text}
                </span>
              ))
            : <span style={{ color: 'white' }}>{verse.arabic}</span>
          }
        </p>

        {showTranslit && (
          <motion.p
            initial={false}
            style={{ color: '#CF9555', fontSize: '0.85rem', lineHeight: 1.8 }}
          >
            {verse.transliteration}
          </motion.p>
        )}

        {showTranslation && (
          <p style={{ color: '#D7C29F', fontSize: '0.82rem', lineHeight: 1.7, fontStyle: 'italic' }}>
            {verse.translation}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function SurahSelector({ selected, onChange }: { selected: number; onChange: (n: number) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-3 rounded-2xl px-5 py-3 w-full"
        style={{
          background: 'rgba(106,36,40,0.6)',
          border: '1px solid rgba(220,160,72,0.25)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <BookOpen size={18} style={{ color: '#DCA048' }} />
        <div className="flex-1 text-left">
          {(() => {
            const s = surahs.find(x => x.number === selected)!;
            return (
              <>
                <span style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{s.name}</span>
                <span style={{ color: '#D7C29F', fontSize: '0.78rem', marginLeft: 8 }}>{s.englishMeaning}</span>
              </>
            );
          })()}
        </div>
        <div dir="rtl" style={{ color: '#CF9555', fontFamily: 'Amiri, serif', fontSize: '1.1rem' }}>
          {surahs.find(x => x.number === selected)?.arabicName}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} style={{ color: '#D7C29F' }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full mt-2 left-0 right-0 z-50 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(20,4,8,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(220,160,72,0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div className="max-h-72 overflow-y-auto">
              {surahs.map(s => (
                <button
                  key={s.number}
                  onClick={() => { onChange(s.number); setOpen(false); }}
                  className="w-full flex items-center gap-4 px-5 py-3 transition-colors hover:bg-white/5"
                  style={{ borderBottom: '1px solid rgba(220,160,72,0.08)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: selected === s.number ? 'rgba(220,160,72,0.2)' : 'rgba(255,255,255,0.05)',
                      border: selected === s.number ? '1px solid rgba(220,160,72,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <span style={{ color: selected === s.number ? '#DCA048' : '#D7C29F', fontSize: '0.7rem', fontWeight: 700 }}>
                      {s.number}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <div style={{ color: selected === s.number ? 'white' : '#D7C29F', fontSize: '0.9rem', fontWeight: selected === s.number ? 600 : 400 }}>
                      {s.name}
                    </div>
                    <div style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.72rem' }}>
                      {s.englishMeaning} · {s.totalVerses} verses
                    </div>
                  </div>
                  <span dir="rtl" style={{ color: '#CF9555', fontFamily: 'Amiri, serif', fontSize: '1rem' }}>
                    {s.arabicName}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function QuranReader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initSurah = Number(searchParams.get('surah')) || 1;
  const [selectedSurah, setSelectedSurah] = useState(initSurah);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [showTajweed, setShowTajweed] = useState(true);
  const [showTranslit, setShowTranslit] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  const userData = (() => {
    try { return JSON.parse(localStorage.getItem('dhikr_user_data') || '{}'); } catch { return {}; }
  })();
  const fontSize = FONT_SIZE_MAP[userData.fontSize as keyof typeof FONT_SIZE_MAP] ?? '1.8rem';
  const tajweedMode = userData.tajweedDisplay ?? 'full';

  useEffect(() => {
    if (tajweedMode === 'none') setShowTajweed(false);
  }, [tajweedMode]);

  const surah = surahs.find(s => s.number === selectedSurah)!;

  const activatedRules = new Set<NonNullable<TajweedRule>>();
  surah.verses.forEach(v => v.tajweed.forEach(s => { if (s.rule) activatedRules.add(s.rule); }));

  const handleSurahChange = (n: number) => {
    setSelectedSurah(n);
    setSelectedVerse(null);
    setSearchParams({ surah: String(n) });
  };

  return (
    <div className="min-h-full p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <h1 className="text-white mb-1" style={{ fontWeight: 700, fontSize: '1.5rem' }}>Quran Reader</h1>
        <p style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.82rem' }}>
          Color-coded tajweed · Live pronunciation guide
        </p>
      </motion.div>

      {/* Surah selector */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
        <SurahSelector selected={selectedSurah} onChange={handleSurahChange} />
      </motion.div>

      {/* Surah info */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 }}>
        <GlowCard gold className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ color: '#DCA048', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                {surah.revelationType} Surah
              </p>
              <h2 className="text-white" style={{ fontWeight: 700, fontSize: '1.2rem' }}>{surah.name}</h2>
              <p style={{ color: '#D7C29F', fontSize: '0.8rem' }}>{surah.englishMeaning}</p>
            </div>
            <div
              dir="rtl"
              style={{ fontFamily: 'Amiri, serif', fontSize: '2rem', color: '#DCA048', textShadow: '0 0 20px rgba(220,160,72,0.4)' }}
            >
              {surah.arabicName}
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* Controls */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: 'Tajweed', icon: Palette, active: showTajweed, toggle: () => setShowTajweed(v => !v) },
            { label: 'Translit', icon: Type, active: showTranslit, toggle: () => setShowTranslit(v => !v) },
            { label: 'Translation', icon: MessageSquare, active: showTranslation, toggle: () => setShowTranslation(v => !v) },
          ].map(({ label, icon: BtnIcon, active, toggle }) => (
            <button
              key={label}
              onClick={toggle}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all"
              style={{
                background: active ? 'rgba(220,160,72,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? 'rgba(220,160,72,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: active ? 'white' : 'rgba(215,194,159,0.4)',
                fontSize: '0.78rem',
              }}
            >
              {active ? <Eye size={12} /> : <EyeOff size={12} />}
              <BtnIcon size={12} />
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tajweed legend */}
      <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.12 }}>
        {showTajweed && <TajweedLegend activatedRules={activatedRules} />}
      </motion.div>

      {/* Bismillah */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-center py-4"
      >
        <p
          dir="rtl"
          style={{
            fontFamily: 'Amiri, serif',
            fontSize: '1.8rem',
            color: '#DCA048',
            textShadow: '0 0 20px rgba(220,160,72,0.3)',
          }}
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
      </motion.div>

      {/* Verses */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSurah}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          {surah.verses.map((verse, i) => (
            <motion.div
              key={verse.number}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.06 }}
            >
              <VerseCard
                verse={verse}
                showTajweed={showTajweed}
                showTranslit={showTranslit}
                showTranslation={showTranslation}
                fontSize={fontSize}
                isSelected={selectedVerse === verse.number}
                onClick={() => setSelectedVerse(v => v === verse.number ? null : verse.number)}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Tajweed color reference footer */}
      {showTajweed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl p-4"
          style={{ background: 'rgba(106,36,40,0.3)', border: '1px solid rgba(220,160,72,0.08)' }}
        >
          <p style={{ color: 'rgba(215,194,159,0.4)', fontSize: '0.7rem', textAlign: 'center', marginBottom: 8 }}>
            Color reference
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {(Object.keys(tajweedColors) as NonNullable<TajweedRule>[]).map(rule => (
              <span key={rule} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: tajweedColors[rule] }} />
                <span style={{ color: tajweedColors[rule], fontSize: '0.65rem' }}>{tajweedNames[rule]}</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <div className="h-8" />
    </div>
  );
}