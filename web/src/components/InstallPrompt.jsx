import { useEffect, useState } from 'react';

const DISMISS_KEY = 'pwaInstallDismissed';
const DISMISS_DAYS = 5;

function isStandalone() {
  return (
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true
  );
}
function recentlyDismissed() {
  try {
    const t = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return t && Date.now() - t < DISMISS_DAYS * 86400000;
  } catch {
    return false;
  }
}
function remember() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

// Aviso para instalar como app: botão nativo no Android/Chrome, instruções no iOS.
export default function InstallPrompt() {
  const [mode, setMode] = useState(null); // 'android' | 'ios'
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const ua = navigator.userAgent || '';
    const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);

    // Evento nativo (pode ter sido apanhado antes de montar — ver main.jsx)
    if (window.__deferredBip) {
      setDeferred(window.__deferredBip);
      setMode('android');
      const t0 = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(t0);
    }

    const onBIP = (e) => {
      e.preventDefault();
      setDeferred(e);
      setMode('android');
      setTimeout(() => setShow(true), 1200);
    };
    window.addEventListener('beforeinstallprompt', onBIP);

    const onInstalled = () => {
      setShow(false);
      remember();
    };
    window.addEventListener('appinstalled', onInstalled);

    // iOS Safari não dispara o evento → mostrar instruções
    let t;
    if (isIOS && isSafari) {
      setMode('ios');
      t = setTimeout(() => setShow(true), 2500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
      if (t) clearTimeout(t);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    remember();
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      /* ignore */
    }
    setDeferred(null);
    window.__deferredBip = null;
    setShow(false);
  };

  if (!show || !mode) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3">
      <div className="mx-auto max-w-md rounded-2xl border-2 border-hospital-pink/40 bg-white p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <img src="/icon-192.png" alt="" className="h-12 w-12 shrink-0 rounded-xl" />
          <div className="flex-1">
            <p className="font-bold text-gray-800">📲 Instala como aplicação!</p>
            {mode === 'android' ? (
              <p className="text-sm text-gray-600">Fica com o ícone no telemóvel e jogas sem abrir o browser.</p>
            ) : (
              <p className="text-sm text-gray-600">
                Toca em <strong>Partilhar</strong> <span className="whitespace-nowrap">⬆️</span> lá em baixo e depois em{' '}
                <strong>«Adicionar ao ecrã principal»</strong>.
              </p>
            )}
          </div>
          <button onClick={dismiss} className="shrink-0 text-lg text-gray-300 hover:text-gray-500" aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          {mode === 'android' ? (
            <>
              <button
                onClick={install}
                className="btn flex-1 bg-gradient-to-r from-hospital-pink to-pink-500 py-2 font-bold text-white"
              >
                Instalar
              </button>
              <button onClick={dismiss} className="btn bg-white px-4 py-2 text-gray-600">
                Agora não
              </button>
            </>
          ) : (
            <button
              onClick={dismiss}
              className="btn w-full bg-gradient-to-r from-hospital-cyan to-blue-400 py-2 font-bold text-white"
            >
              Percebi! 👍
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
