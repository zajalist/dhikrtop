import { useState } from 'react';
import { motion } from 'motion/react';
import { BackgroundEffects } from '../shared/BackgroundEffects';
import { ChevronRight } from 'lucide-react';

interface SetupWizardProps {
  onComplete: () => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [name, setName] = useState('');

  const handleComplete = () => {
    localStorage.setItem('dhikr_setup_complete', 'true');
    localStorage.setItem('dhikr_user_data', JSON.stringify({ name }));
    onComplete();
  };

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <BackgroundEffects />

      <div className="relative z-10 flex flex-col h-full items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-8">
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
          >
            <h1 className="text-white" style={{ fontSize: '2rem', fontWeight: 700 }}>
              Welcome to Dhikr
            </h1>
            <p style={{ color: '#D7C29F', fontSize: '1rem', marginTop: 8 }}>
              Your companion for Islamic remembrance
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl p-6 space-y-4"
            style={{
              background: 'rgba(106,36,40,0.6)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(220,160,72,0.2)',
            }}
          >
            <div className="space-y-2 text-left">
              <label style={{ color: '#D7C29F', fontSize: '0.9rem' }}>What's your name?</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full rounded-xl px-4 py-3 outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(220,160,72,0.2)',
                  color: 'white',
                  fontSize: '1rem',
                }}
                autoFocus
              />
            </div>
          </motion.div>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={handleComplete}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-white mx-auto"
            style={{
              background: 'linear-gradient(135deg, #DCA048, #CF9555)',
              boxShadow: '0 4px 20px rgba(220,160,72,0.4)',
            }}
          >
            Get Started
            <ChevronRight size={18} />
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{ color: 'rgba(215,194,159,0.4)', fontSize: '0.75rem' }}
          >
            By continuing, you'll have access to adhkar, Quran, and more
          </motion.p>
        </div>
      </div>
    </div>
  );
}
