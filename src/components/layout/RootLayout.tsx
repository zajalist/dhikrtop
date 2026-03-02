import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, BookOpen, Heart, Settings, Bell } from 'lucide-react';
import { BackgroundEffects } from '../shared/BackgroundEffects';
import { NotificationCenter } from '../notifications/FloatingNotification';
import { useEffect } from 'react';
import { trackActivity } from '../../lib/notifications';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/dhikr', icon: Heart, label: 'Dhikr' },
  { path: '/quran', icon: BookOpen, label: 'Quran' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function RootLayout() {
  const location = useLocation();

  // Track user activity for idle detection
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      trackActivity();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  return (
    <div
      className="fixed inset-0 flex overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <BackgroundEffects />
      <NotificationCenter maxNotifications={3} />

      {/* Sidebar — desktop */}
      <aside
        className="hidden md:flex flex-col z-20 relative"
        style={{
          width: '220px',
          background: 'rgba(15,2,5,0.7)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(220,160,72,0.12)',
        }}
      >
        {/* Logo */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #6a2428, #4a1518)',
                border: '1px solid rgba(220,160,72,0.4)',
                boxShadow: '0 4px 16px rgba(220,160,72,0.2)',
              }}
            >
              <span style={{ fontFamily: 'Amiri, serif', color: '#DCA048', fontSize: '1.9rem', lineHeight: 1, marginTop: '4px' }}>ذ</span>
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1 }}>Dhikr</div>
              <div style={{ color: '#CF9555', fontSize: '0.65rem', letterSpacing: '0.15em' }}>REMEMBRANCE</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <NavLink key={path} to={path}>
                <motion.div
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl relative overflow-hidden"
                  style={{
                    background: active ? 'rgba(220,160,72,0.15)' : 'transparent',
                    border: active ? '1px solid rgba(220,160,72,0.25)' : '1px solid transparent',
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                      style={{ background: '#DCA048' }}
                    />
                  )}
                  <Icon
                    size={18}
                    style={{ color: active ? '#DCA048' : 'rgba(215,194,159,0.6)' }}
                  />
                  <span style={{
                    color: active ? 'white' : 'rgba(215,194,159,0.6)',
                    fontSize: '0.9rem',
                    fontWeight: active ? 600 : 400,
                  }}>
                    {label}
                  </span>
                </motion.div>
              </NavLink>
            );
          })}
        </nav>

        {/* Notification indicator */}
        <div className="p-4">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(220,160,72,0.1)', border: '1px solid rgba(220,160,72,0.2)' }}
          >
            <div className="relative">
              <Bell size={16} style={{ color: '#DCA048' }} />
              <span
                className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                style={{ background: '#DCA048' }}
              />
            </div>
            <div>
              <div style={{ color: '#DCA048', fontSize: '0.75rem', fontWeight: 600 }}>Reminder Active</div>
              <div style={{ color: 'rgba(215,194,159,0.6)', fontSize: '0.65rem' }}>Smart detection on</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto pb-20 md:pb-6">
          <Outlet />
        </div>

        {/* Bottom nav — mobile */}
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-30"
          style={{
            background: 'rgba(10,1,5,0.85)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(220,160,72,0.15)',
          }}
        >
          <div className="flex items-center">
            {navItems.map(({ path, icon: Icon, label }) => {
              const active = location.pathname === path;
              return (
                <NavLink key={path} to={path} className="flex-1">
                  <div className="flex flex-col items-center py-3 gap-1">
                    <div className="relative">
                      <Icon size={20} style={{ color: active ? '#DCA048' : 'rgba(215,194,159,0.4)' }} />
                      {active && (
                        <motion.div
                          layoutId="mobile-nav-dot"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                          style={{ background: '#DCA048' }}
                        />
                      )}
                    </div>
                    <span style={{ color: active ? '#DCA048' : 'rgba(215,194,159,0.4)', fontSize: '0.65rem' }}>
                      {label}
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
