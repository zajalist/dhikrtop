import { createBrowserRouter } from 'react-router';
import { RootLayout } from './components/layout/RootLayout';
import { Home } from './components/home/Home';
import { DhikrSession } from './components/dhikr/DhikrSession';
import { QuranReader } from './components/quran/QuranReader';
import { SettingsPage } from './components/settings/SettingsPage';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
      <div style={{ fontFamily: 'Amiri, serif', fontSize: '4rem', color: '#DCA048', opacity: 0.3 }}>ذ</div>
      <p style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem', marginTop: 16 }}>Page Not Found</p>
      <p style={{ color: 'rgba(215,194,159,0.5)', fontSize: '0.85rem', marginTop: 4 }}>
        Return to home to continue your dhikr journey
      </p>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: 'dhikr', Component: DhikrSession },
      { path: 'quran', Component: QuranReader },
      { path: 'settings', Component: SettingsPage },
      { path: '*', Component: NotFound },
    ],
  },
]);
