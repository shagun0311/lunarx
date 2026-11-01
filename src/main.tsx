import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[LUNARX PWA] New mission control build available.');
  },
  onOfflineReady() {
    console.log('[LUNARX PWA] Application ready to work offline.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
