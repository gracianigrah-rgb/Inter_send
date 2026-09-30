import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for offline caching and instant native PWA installation
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nouveau contenu disponible sur Intersend');
  },
  onOfflineReady() {
    console.log('Intersend est prêt pour une utilisation hors-ligne');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
