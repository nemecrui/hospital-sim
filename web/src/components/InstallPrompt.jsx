import { useEffect, useRef, useState } from 'react';

const DISMISS_KEY = 'pwaInstallDismissed';
const DISMISS_DAYS = 5;

export function isStandalone() {
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

// Aviso para instalar como app: botão nativo no Android/Chrome, instruções no iOS/outros.
export default function InstallPrompt() {
  const [mode, setMode] = useState(null); // 'android' | 'ios' | 'other'
  const [deferred, setDeferred] = useState(null);
  const [show, setShow] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    const computeMode = () => (window.__deferredBip ? 'android' : isIOS && isSafari ? 'ios' : 'other');

    const onBIP = (e) => {
      e.preventDefault();
      window.__deferredBip = e;
      setDeferred(e);
      setMode('android');
      if (!isStandalone() && !recentlyDismissed()) {
        timers.current.push(setTimeout(() => setShow(true), 1200));
      }
    };
    const onInstalled = () => {
      setShow(false);
      remember();
    };
    // Aberto a partir do rodapé — mostra sempre (ignora "não incomodar")
    const onOpen = () => {
      setDeferred(window.__deferredBip || null);
      setMode(computeMode());
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('open-install', onOpen);

    // Auto-aviso (só no browser e sem incomodar)
    if (!isStandalone() && !recentlyDismissed()) {
      if (window.__deferredBip) {
        setDeferred(window.__deferredBip);
        setMode('android');
        timers.current.push(setTimeout(() => setShow(true), 1200));
      } else if (isIOS && isSafari) {
        setMode('ios');
        timers.current.push(setTimeout(() => setShow(true), 2500));
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('open-install', onOpen);
      timers.current.forEach(clearTimeout);
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
            ) : mode === 'ios' ? (
              <p className="text-sm text-gray-600">
                Toca em <strong>Partilhar</strong> <span className="whitespace-nowrap">⬆️</span> lá em baixo e depois em{' '}
                <strong>«Adicionar ao ecrã principal»</strong>.
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                No menu do teu browser (⋮), escolhe <strong>«Instalar aplicação»</strong> ou{' '}
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
