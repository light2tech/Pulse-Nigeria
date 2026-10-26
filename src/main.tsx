import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const isBrowserExtensionError = (text: string) =>
  text.includes('chrome-extension://') ||
  text.includes('moz-extension://') ||
  text.includes('safari-extension://') ||
  text.includes('Failed to connect to MetaMask') ||
  text.includes('nkbihfbeogaeaoehlefnkodbefgpgknn');

window.addEventListener(
  'error',
  (event) => {
    const details = `${event.message || ''} ${event.filename || ''} ${event.error?.stack || ''}`;
    if (isBrowserExtensionError(details)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },
  true,
);

window.addEventListener(
  'unhandledrejection',
  (event) => {
    const reason = event.reason;
    const details = `${typeof reason === 'string' ? reason : reason?.message || ''} ${reason?.stack || ''}`;
    if (isBrowserExtensionError(details)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },
  true,
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
