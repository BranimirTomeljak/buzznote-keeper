
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getLanguage } from './utils/translations.ts';

// Initialize language from localStorage or set default
const initLanguage = () => {
  if (!localStorage.getItem('language')) {
    localStorage.setItem('language', 'hr'); // Set Croatian as default
  }
  return getLanguage();
};

// Initialize language before rendering
initLanguage();

// Render the App component
createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Check for updates when the page loads
      if (registration.active) {
        registration.update();
      }
      
      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[ServiceWorker] New content available, please refresh.');
            }
          });
        }
      });
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
    }
  });
}
