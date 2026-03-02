import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Palette, CheckCircle } from 'lucide-react';

export function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('dhikr_user_data') || '{}');
      setName(stored.name || '');
    } catch { /* ignore */ }
  }, []);

  const save = () => {
    const updated = { name };
    localStorage.setItem('dhikr_user_data', JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="min-h-full p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
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

      <div
        className="rounded-2xl p-5 space-y-4"
        style={{
          background: 'rgba(106,36,40,0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(220,160,72,0.15)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <User size={15} style={{ color: '#DCA048' }} />
          <span style={{ color: '#DCA048', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
            Profile
          </span>
        </div>
        <div className="space-y-2">
          <label style={{ color: '#D7C29F', fontSize: '0.8rem' }}>Your Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full rounded-xl px-4 py-2.5 outline-none"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(220,160,72,0.2)',
              color: 'white',
              fontSize: '0.9rem',
            }}
          />
        </div>
        <button
          onClick={save}
          className="px-4 py-2 rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg, #DCA048, #CF9555)' }}
        >
          Save Changes
        </button>
      </div>

      <p style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.85rem', textAlign: 'center' }}>
        More settings will be available soon. Full settings page with all preferences is being implemented.
      </p>
    </div>
  );
}
