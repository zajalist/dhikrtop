import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Bell, CheckCircle, Zap, Filter } from 'lucide-react';

interface NotificationPreferences {
  enabled: boolean;
  idleThresholdSec: number;
  minIntervalSec: number;
  categories: string[];
  language: string;
}

interface SystemPreferences {
  autostart: boolean;
}

export function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState('');
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    enabled: true,
    idleThresholdSec: 120,
    minIntervalSec: 600,
    categories: ['morning', 'evening', 'general', 'sleep'],
    language: 'all',
  });
  const [system, setSystem] = useState<SystemPreferences>({
    autostart: false,
  });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('dhikr_user_data') || '{}');
      setName(stored.name || '');
    } catch { /* ignore */ }

    // Load preferences from Tauri
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      const { invoke } = (window as any).__TAURI__.core;
      
      invoke('get_preferences').then((prefs: NotificationPreferences) => {
        setNotifications(prefs);
      }).catch(() => {});

      invoke('get_startup_status').then((enabled: boolean) => {
        setSystem({ autostart: enabled });
      }).catch(() => {});
    }
  }, []);

  const save = async () => {
    const updated = { name };
    localStorage.setItem('dhikr_user_data', JSON.stringify(updated));

    // Save to Tauri store
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      const { invoke } = (window as any).__TAURI__.core;
      
      try {
        await invoke('save_preferences', { preferences: notifications });
        await invoke('set_startup', { enabled: system.autostart });
      } catch (err) {
        console.error('Save failed:', err);
      }
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const categoryOptions = [
    { id: 'morning', label: 'Morning Adhkar' },
    { id: 'evening', label: 'Evening Adhkar' },
    { id: 'general', label: 'General Remembrance' },
    { id: 'sleep', label: 'Before Sleep' },
  ];

  const toggleCategory = (id: string) => {
    setNotifications(prev => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter(c => c !== id)
        : [...prev.categories, id]
    }));
  };

  return (
    <div className="min-h-full p-4 md:p-6 space-y-6 max-w-3xl mx-auto pb-8">
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

      {/* Profile Section */}
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
      </div>

      {/* Notification Settings */}
      <div
        className="rounded-2xl p-5 space-y-5"
        style={{
          background: 'rgba(106,36,40,0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(220,160,72,0.15)',
        }}
      >
        <div className="flex items-center gap-2">
          <Bell size={15} style={{ color: '#DCA048' }} />
          <span style={{ color: '#DCA048', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
            Smart Notifications
          </span>
        </div>

        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div>
            <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>Enable Notifications</div>
            <div style={{ color: 'rgba(215,194,159,0.6)', fontSize: '0.75rem' }}>
              Receive dhikr reminders based on your activity
            </div>
          </div>
          <button
            onClick={() => setNotifications(prev => ({ ...prev, enabled: !prev.enabled }))}
            className="relative w-12 h-6 rounded-full transition-colors"
            style={{
              background: notifications.enabled ? '#48B16E' : 'rgba(255,255,255,0.1)',
            }}
          >
            <motion.div
              animate={{ x: notifications.enabled ? 24 : 2 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-white"
            />
          </button>
        </div>

        {/* Idle Threshold */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label style={{ color: '#D7C29F', fontSize: '0.8rem' }}>Idle Time Trigger</label>
            <span style={{ color: '#DCA048', fontSize: '0.75rem', fontWeight: 600 }}>
              {Math.floor(notifications.idleThresholdSec / 60)} min
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="600"
            step="30"
            value={notifications.idleThresholdSec}
            onChange={e => setNotifications(prev => ({ ...prev, idleThresholdSec: parseInt(e.target.value) }))}
            className="w-full"
            style={{
              accentColor: '#DCA048',
            }}
          />
          <p style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.7rem' }}>
            Show notification after being idle for this duration
          </p>
        </div>

        {/* Minimum Interval */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label style={{ color: '#D7C29F', fontSize: '0.8rem' }}>Minimum Interval</label>
            <span style={{ color: '#DCA048', fontSize: '0.75rem', fontWeight: 600 }}>
              {Math.floor(notifications.minIntervalSec / 60)} min
            </span>
          </div>
          <input
            type="range"
            min="300"
            max="3600"
            step="300"
            value={notifications.minIntervalSec}
            onChange={e => setNotifications(prev => ({ ...prev, minIntervalSec: parseInt(e.target.value) }))}
            className="w-full"
            style={{
              accentColor: '#DCA048',
            }}
          />
          <p style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.7rem' }}>
            Wait at least this long between notifications
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Filter size={13} style={{ color: '#D7C29F' }} />
            <label style={{ color: '#D7C29F', fontSize: '0.8rem' }}>Notification Categories</label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categoryOptions.map(opt => {
              const selected = notifications.categories.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleCategory(opt.id)}
                  className="px-3 py-2 rounded-lg text-left text-sm transition-all"
                  style={{
                    background: selected ? 'rgba(220,160,72,0.2)' : 'rgba(255,255,255,0.03)',
                    border: selected ? '1px solid rgba(220,160,72,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    color: selected ? '#DCA048' : 'rgba(215,194,159,0.6)',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div
        className="rounded-2xl p-5 space-y-4"
        style={{
          background: 'rgba(106,36,40,0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(220,160,72,0.15)',
        }}
      >
        <div className="flex items-center gap-2">
          <Zap size={15} style={{ color: '#DCA048' }} />
          <span style={{ color: '#DCA048', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
            System
          </span>
        </div>

        {/* Autostart */}
        <div className="flex items-center justify-between">
          <div>
            <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}>Launch at Startup</div>
            <div style={{ color: 'rgba(215,194,159,0.6)', fontSize: '0.75rem' }}>
              Start Dhikrtop when you log in
            </div>
          </div>
          <button
            onClick={() => setSystem(prev => ({ ...prev, autostart: !prev.autostart }))}
            className="relative w-12 h-6 rounded-full transition-colors"
            style={{
              background: system.autostart ? '#48B16E' : 'rgba(255,255,255,0.1)',
            }}
          >
            <motion.div
              animate={{ x: system.autostart ? 24 : 2 }}
              className="absolute top-1 w-4 h-4 rounded-full bg-white"
            />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={save}
        className="w-full px-6 py-3 rounded-xl text-white font-semibold"
        style={{ background: 'linear-gradient(135deg, #DCA048, #CF9555)' }}
      >
        Save All Changes
      </button>

    </div>
  );
}
