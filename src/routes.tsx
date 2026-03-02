import { createBrowserRouter } from 'react-router-dom';
import RootLayout from './components/layout/RootLayout';
import Home from './components/home/Home';
import DhikrSession from './components/dhikr/DhikrSession';
import QuranReader from './components/quran/QuranReader';
import SettingsPage from './components/settings/SettingsPage';

const routes = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/dhikr', element: <DhikrSession /> },
      { path: '/quran', element: <QuranReader /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
]);

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#1a0508] to-[#080105]">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-[#DCA048] mb-4">404</h1>
        <p className="text-[#CF9555]">Page not found</p>
      </div>
    </div>
  );
}

export default routes;
