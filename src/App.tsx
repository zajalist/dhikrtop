import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { listen } from '@tauri-apps/api/event';
import { router } from './routes';
import { SetupWizard } from './components/setup/SetupWizard';
import { getPreferences } from './lib/store';

export default function App() {
  const [setupDone, setSetupDone] = useState<boolean | null>(null);
  const [uiScale, setUiScale] = useState(1);

  useEffect(() => {
    const done = localStorage.getItem('dhikr_setup_complete') === 'true';
    setSetupDone(done);
  }, []);

  useEffect(() => {
    const applyScale = async () => {
      try {
        const prefs = await getPreferences();
        const scale = Number.isFinite(prefs.uiScale) ? prefs.uiScale : 1;
        setUiScale(Math.min(1.35, Math.max(0.8, scale)));
      } catch {
        setUiScale(1);
      }
    };

    applyScale();
    const unlisten = listen('preferences-updated', () => {
      applyScale();
    });

    return () => {
      unlisten.then((fn) => fn()).catch(() => {});
    };
  }, []);

  // Loading state while checking localStorage
  if (setupDone === null) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: 'radial-gradient(ellipse at 20% 20%, #1a0508 0%, #0d0205 50%, #080105 100%)' }}
      >
        <div
          style={{
            fontFamily: 'Amiri, serif',
            fontSize: '3rem',
            color: '#DCA048',
            opacity: 0.5,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        >
          ذ
        </div>
      </div>
    );
  }

  if (!setupDone) {
    return (
      <div style={{ zoom: uiScale }}>
        <SetupWizard onComplete={() => setSetupDone(true)} />
      </div>
    );
  }

  return (
    <div style={{ zoom: uiScale }}>
      <RouterProvider router={router} />
    </div>
  );
}
