import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update capability
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('PWA: New content available, updating service worker...');
  },
  onOfflineReady() {
    console.log('PWA: Application cached and ready for offline use.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
