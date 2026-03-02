import React from 'react';
import ReactDOM from 'react-dom/client';
import AdhkarWindow from './windows/adhkar/AdhkarWindow';
import SettingsWindow from './windows/settings/SettingsWindow';
import SetupWindow from './windows/setup/SetupWindow';
import './styles/globals.css';

// Route based on the URL path — each Tauri window gets its own URL
const path = window.location.pathname;

const root = document.getElementById('root')!;

if (path === '/setup') {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <SetupWindow />
    </React.StrictMode>
  );
} else if (path === '/settings') {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <SettingsWindow />
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <AdhkarWindow />
    </React.StrictMode>
  );
}
