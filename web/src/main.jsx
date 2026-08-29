import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import Footer from './components/Footer.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';
import './index.css';

// Apanha o evento de instalação cedo (o Chrome dispara-o antes do React montar)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__deferredBip = e;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Footer />
    <InstallPrompt />
  </React.StrictMode>
);

// Regista o service worker (para a app ser instalável)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
