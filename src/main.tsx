import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then((success) => {
        if (success) {
          console.log('Service Worker desregistrado com sucesso para evitar conflitos de cache.');
        }
      });
    }
  });
  caches.keys().then((names) => {
    for (const name of names) {
      caches.delete(name);
    }
  });
}

