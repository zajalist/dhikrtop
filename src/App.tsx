import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { SetupWizard } from './components/setup/SetupWizard';

export default function App() {
  const [setupDone, setSetupDone] = useState<boolean | null>(null);

  useEffect(() => {
    const done = localStorage.getItem('dhikr_setup_complete') === 'true';
    setSetupDone(done);
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
    return <SetupWizard onComplete={() => setSetupDone(true)} />;
  }

  return <RouterProvider router={router} />;
}
