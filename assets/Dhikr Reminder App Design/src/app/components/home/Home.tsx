import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Info, XCircle, X, Bell, Sun, Moon, Star, Zap, TrendingUp, Award, ChevronRight } from 'lucide-react';
import { GlowCard } from '../shared/BackgroundEffects';
import { morningAdhkar, eveningAdhkar, afterPrayerAdhkar, getSmartReminderType, prayerTimes } from '../../data/dhikr';
import { surahs } from '../../data/quran';

interface NotifCard {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  subtitle: string;
}

const mockNotifs: NotifCard[] = [
  { id: '1', type: 'success', title: 'You have completed your daily goal', subtitle: 'Today 10:30PM' },
  { id: '2', type: 'info', title: 'Daily Adhkar Reminder', subtitle: 'Today 10:30PM' },
  { id: '3', type: 'error', title: 'Missed Evening Adhkar', subtitle: 'Yesterday 7:00PM' },
];

const stats = [
  { label: 'Day Streak', value: '14', icon: TrendingUp, color: '#DCA048' },
  { label: 'This Week', value: '89', icon: Star, color: '#CF9555' },
  { label: 'Total Dhikr', value: '2,340', icon: Award, color: '#48B16E' },
];

function PrayerCountdown() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const prayers = Object.entries(prayerTimes).map(([name, time]) => {
    const [h, m] = time.split(':').map(Number);
    const dt = new Date(now);
    dt.setHours(h, m, 0, 0);
    return { name, time, dt, ms: dt.getTime() - now.getTime() };
  });

  const next = prayers.filter(p => p.ms > 0).sort((a, b) => a.ms - b.ms)[0];
  if (!next) return null;

  const totalMs = next.ms;
  const hrs = Math.floor(totalMs / 3_600_000);
  const mins = Math.floor((totalMs % 3_600_000) / 60_000);
  const secs = Math.floor((totalMs % 60_000) / 1_000);

  return (
    <GlowCard className="p-5" gold>
      <div className="flex items-center justify-between">
        <div>
          <p style={{ color: '#DCA048', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Next Prayer
          </p>
          <p className="text-white capitalize" style={{ fontWeight: 700, fontSize: '1.3rem', marginTop: 2 }}>
            {next.name}
          </p>
          <p style={{ color: '#CF9555', fontSize: '0.85rem' }}>at {next.time}</p>
        </div>
        <div className="text-right">
          <div
            className="rounded-xl px-4 py-2"
            style={{ background: 'rgba(220,160,72,0.15)', border: '1px solid rgba(220,160,72,0.3)' }}
          >
            <span style={{ color: 'white', fontWeight: 700, fontSize: '1.4rem', fontVariantNumeric: 'tabular-nums' }}>
              {String(hrs).padStart(2, '0')}:{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </div>
          <p style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.65rem', marginTop: 4 }}>remaining</p>
        </div>
      </div>

      {/* Prayer timeline */}
      <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-1">
        {prayers.map(({ name, ms }) => (
          <div key={name} className="flex-1 min-w-0 text-center">
            <div
              className="h-1 rounded-full mb-1"
              style={{
                background: ms <= 0
                  ? 'rgba(72,177,110,0.8)'
                  : name === next.name
                    ? 'linear-gradient(90deg, #DCA048, #CF9555)'
                    : 'rgba(255,255,255,0.1)',
              }}
            />
            <span style={{ color: ms <= 0 ? '#48B16E' : name === next.name ? '#DCA048' : 'rgba(215,194,159,0.4)', fontSize: '0.6rem', textTransform: 'capitalize' }}>
              {name.charAt(0).toUpperCase() + name.slice(1, 3)}
            </span>
          </div>
        ))}
      </div>
    </GlowCard>
  );
}

function SmartReminderBanner() {
  const reminder = getSmartReminderType();
  const navigate = useNavigate();
  if (!reminder) return null;

  const Icon = reminder.type === 'morning' ? Sun : reminder.type === 'evening' ? Moon : Star;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="overflow-hidden rounded-2xl cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, rgba(220,160,72,0.2) 0%, rgba(106,36,40,0.6) 100%)',
        border: '1px solid rgba(220,160,72,0.4)',
        boxShadow: '0 0 30px rgba(220,160,72,0.2)',
      }}
      onClick={() => navigate('/dhikr')}
    >
      <div className="p-4 flex items-center gap-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(220,160,72,0.2)', border: '1px solid rgba(220,160,72,0.4)' }}
        >
          <Icon size={22} style={{ color: '#DCA048' }} />
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Zap size={12} style={{ color: '#DCA048' }} />
            <span style={{ color: '#DCA048', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Smart Reminder
            </span>
          </div>
          <p style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>{reminder.label}</p>
          <p style={{ color: '#D7C29F', fontSize: '0.78rem' }}>{reminder.description}</p>
        </div>
        <ChevronRight size={18} style={{ color: '#DCA048' }} />
      </div>
    </motion.div>
  );
}

function DailyProgressRing({ done, total }: { done: number; total: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? done / total : 0;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none"
          stroke="url(#goldGrad)" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DCA048" />
            <stop offset="100%" stopColor="#CF9555" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{ color: 'white', fontWeight: 700, fontSize: '1.6rem', lineHeight: 1 }}>{done}</span>
        <span style={{ color: '#D7C29F', fontSize: '0.7rem' }}>of {total}</span>
        <span style={{ color: '#DCA048', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>today</span>
      </div>
    </div>
  );
}

function NotificationToast({ notif, onClose }: { notif: NotifCard; onClose: () => void }) {
  const config = {
    success: { icon: CheckCircle, color: '#48B16E', bg: 'rgba(72,177,110,0.15)' },
    info: { icon: Info, color: '#DCA048', bg: 'rgba(220,160,72,0.15)' },
    error: { icon: XCircle, color: '#FB3836', bg: 'rgba(251,56,54,0.15)' },
  }[notif.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0, height: 0, marginBottom: 0 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(106,36,40,0.7)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(220,160,72,0.15)',
      }}
    >
      <div className="p-4 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: config.bg }}
        >
          <Icon size={16} style={{ color: config.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ color: 'white', fontSize: '0.9rem', fontWeight: 500 }}>{notif.title}</p>
          <p style={{ color: '#D7C29F', fontSize: '0.75rem' }}>{notif.subtitle}</p>
        </div>
        <button onClick={onClose} className="flex-shrink-0 p-1">
          <X size={14} style={{ color: '#DCA048' }} />
        </button>
      </div>
      {/* Arabic calligraphy decoration */}
      <div
        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none"
        style={{ fontFamily: 'Amiri, serif', fontSize: '3rem', color: '#CF9555' }}
        dir="rtl"
      >
        ذ
      </div>
    </motion.div>
  );
}

export function Home() {
  const [notifs, setNotifs] = useState<NotifCard[]>(mockNotifs);
  const [completedDhikr, setCompletedDhikr] = useState(2);
  const navigate = useNavigate();

  const userData = (() => {
    try { return JSON.parse(localStorage.getItem('dhikr_user_data') || '{}'); } catch { return {}; }
  })();

  const totalDhikr = morningAdhkar.length + eveningAdhkar.length;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-full p-4 md:p-6 space-y-5 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-start justify-between pt-2"
      >
        <div>
          <p style={{ color: '#DCA048', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            {greeting}
          </p>
          <h1 className="text-white" style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.1 }}>
            {userData.name || 'Bismillah'}
          </h1>
          <p style={{ color: 'rgba(215,194,159,0.6)', fontSize: '0.85rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="relative">
          <Bell size={22} style={{ color: 'rgba(215,194,159,0.5)' }} />
          {notifs.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white"
              style={{ background: '#DCA048', fontSize: '0.55rem', fontWeight: 700 }}>
              {notifs.length}
            </span>
          )}
        </div>
      </motion.div>

      {/* Smart Reminder */}
      <SmartReminderBanner />

      {/* Prayer countdown */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <PrayerCountdown />
      </motion.div>

      {/* Daily Progress + Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <GlowCard className="p-5">
          <p style={{ color: '#DCA048', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Daily Progress
          </p>
          <DailyProgressRing done={completedDhikr} total={totalDhikr} />
          <div className="mt-4 text-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dhikr')}
              className="px-5 py-2 rounded-xl text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #DCA048, #CF9555)' }}
            >
              {completedDhikr < totalDhikr ? 'Continue Dhikr' : 'View Adhkar'}
            </motion.button>
          </div>
        </GlowCard>

        <div className="space-y-3">
          {stats.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.07 }}
            >
              <GlowCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ color: 'rgba(215,194,159,0.6)', fontSize: '0.75rem' }}>{label}</p>
                    <p style={{ color: 'white', fontWeight: 700, fontSize: '1.4rem', lineHeight: 1 }}>{value}</p>
                  </div>
                  <Icon size={22} style={{ color }} />
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quran snippet */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
        <GlowCard className="overflow-hidden">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span style={{ color: '#DCA048', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                  ADHKAR AS-SABAH
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button className="opacity-70 hover:opacity-100 transition-opacity">
                  <Bell size={16} style={{ color: '#DCA048' }} />
                </button>
                <button className="opacity-70 hover:opacity-100 transition-opacity">
                  <Star size={16} style={{ color: '#DCA048' }} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p
                dir="rtl"
                className="text-white leading-loose text-right"
                style={{ fontFamily: 'Noto Naskh Arabic, Amiri, serif', fontSize: '1.2rem' }}
              >
                {morningAdhkar[0].arabic}
              </p>
              <p style={{ color: '#CF9555', fontSize: '0.85rem', lineHeight: 1.6 }}>
                {morningAdhkar[0].transliteration}
              </p>
              <p style={{ color: '#D7C29F', fontSize: '0.8rem', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{morningAdhkar[0].translation}"
              </p>
              <p style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.7rem' }}>{morningAdhkar[0].source}</p>
            </div>

            <button
              onClick={() => navigate('/dhikr')}
              className="flex items-center gap-2 text-sm"
              style={{ color: '#DCA048' }}
            >
              Start Session <ChevronRight size={14} />
            </button>
          </div>
        </GlowCard>
      </motion.div>

      {/* Quick Quran access */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ color: 'white', fontWeight: 600 }}>Quick Surahs</h3>
          <button onClick={() => navigate('/quran')} style={{ color: '#DCA048', fontSize: '0.8rem' }}>
            View all
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {surahs.map((s, i) => (
            <motion.button
              key={s.number}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => navigate(`/quran?surah=${s.number}`)}
              className="rounded-xl p-4 text-left"
              style={{
                background: 'rgba(106,36,40,0.4)',
                border: '1px solid rgba(220,160,72,0.12)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                style={{ background: 'rgba(220,160,72,0.15)' }}
              >
                <span style={{ color: '#DCA048', fontSize: '0.75rem', fontWeight: 700 }}>{s.number}</span>
              </div>
              <div style={{ color: 'white', fontSize: '0.85rem', fontWeight: 500 }}>{s.name}</div>
              <div dir="rtl" style={{ color: '#CF9555', fontSize: '0.9rem', fontFamily: 'Amiri, serif' }}>
                {s.arabicName}
              </div>
              <div style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.65rem' }}>{s.totalVerses} verses</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
        <h3 style={{ color: 'white', fontWeight: 600, marginBottom: 12 }}>Recent Notifications</h3>
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {notifs.map(n => (
              <NotificationToast
                key={n.id}
                notif={n}
                onClose={() => setNotifs(prev => prev.filter(x => x.id !== n.id))}
              />
            ))}
          </div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}