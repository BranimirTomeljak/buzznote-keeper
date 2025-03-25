
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/src/service-worker.ts', { type: 'module' })
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
