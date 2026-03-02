import { useEffect, useState } from 'react';
import SetupWizard from './components/setup/SetupWizard';
import { RouterProvider } from 'react-router-dom';
import routes from './routes';

export default function App() {
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if setup is already complete
    const isDone = localStorage.getItem('dhikr_setup_complete') === 'true';
    setSetupComplete(isDone);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#1a0508] to-[#080105] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 animate-spin rounded-full border-4 border-[#DCA048] border-t-transparent"></div>
          <p className="text-[#CF9555] italic font-serif">Loading...</p>
        </div>
      </div>
    );
  }

  if (!setupComplete) {
    return <SetupWizard onSetupComplete={() => setSetupComplete(true)} />;
  }

  return <RouterProvider router={routes} />;
}
