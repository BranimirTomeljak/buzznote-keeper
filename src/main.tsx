
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

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.error('ServiceWorker registration failed: ', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
