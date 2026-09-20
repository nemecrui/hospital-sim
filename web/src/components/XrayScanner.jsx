import { useEffect, useRef, useState } from 'react';

// 🩻 Raio-X: dois modos, com a MESMA decisão final (osso partido vs normal).
//  • CÂMARA ("Raio-X Mágico"): usa a câmara do tablet com um efeito de raio-X e,
//    ao "tirar", revela os ossos por cima da imagem. A câmara é SÓ para o efeito —
//    nada é guardado nem enviado; o stream é desligado ao sair.
//  • DESENHO: recurso automático (braço desenhado) quando não há câmara/permissão.
// `broken` = verdade (partido ou não). onDecide(resultString) devolve a escolha.
export default function XrayScanner({ broken, onDecide }) {
  const [mode, setMode] = useState('loading'); // loading | cam | draw
  const [shot, setShot] = useState(false); // já "tirou" o raio-x?
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  // Tentar ligar a câmara ao entrar
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMode('draw');
        return;
      }
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = s;
        setMode('cam');
      } catch {
        if (!cancelled) setMode('draw');
      }
    })();
    return () => {
      cancelled = true;
      stopCam();
    };
  }, []);

  // Ligar o stream ao <video> quando estamos em modo câmara
  useEffect(() => {
    if (mode === 'cam' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play?.().catch(() => {});
    }
  }, [mode]);

  const decidir = (r) => {
    stopCam();
    onDecide(r);
  };

  const tirar = () => {
    setShot(true);
    videoRef.current?.pause?.();
  };
  const repetir = () => {
    setShot(false);
    videoRef.current?.play?.().catch(() => {});
  };

  if (mode === 'draw') return <DrawXray broken={broken} onDecide={decidir} />;

  return (
    <div className="mt-3">
      <style>{`
        @keyframes rxscan{0%{top:-18%}50%{top:82%}100%{top:-18%}}
        .rx-beam{animation:rxscan 3s ease-in-out infinite}
      `}</style>

      <p className="mb-2 text-xs text-gray-500">
        🖐️ Aponta a câmara para a mão (ou para o peluche!) e carrega em <b>Tirar raio-X</b>.
      </p>

      <div
        className="relative mx-auto h-[260px] w-full max-w-[340px] overflow-hidden rounded-2xl border-2 border-[#123]"
        style={{ background: 'radial-gradient(120% 90% at 50% 30%, #0e1f52, #08122e 70%)' }}
      >
        {/* câmara com filtro de raio-x */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: 'grayscale(1) contrast(1.35) invert(1) brightness(.9) sepia(1) hue-rotate(150deg) saturate(6)' }}
        />
        {/* tinta azul */}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg,#0a2b6e55,#04143f66)', mixBlendMode: 'screen' }} />
        {/* grelha de monitor */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{ backgroundImage: 'linear-gradient(#3fa9ff44 1px,transparent 1px),linear-gradient(90deg,#3fa9ff44 1px,transparent 1px)', backgroundSize: '28px 28px' }}
        />

        {/* feixe de leitura (some depois de tirar) */}
        {!shot && <div className="rx-beam pointer-events-none absolute left-0 right-0 h-16" style={{ background: 'linear-gradient(180deg,transparent,#00e5ff33 45%,#7ffcffcc 50%,#00e5ff33 55%,transparent)', boxShadow: '0 0 30px #00e5ff88' }} />}

        {/* ossos revelados depois de tirar */}
        {shot && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Forearm broken={broken} />
          </div>
        )}

        {/* HUD */}
        <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-[#0b1c46cc] px-2 py-0.5 text-xs font-bold text-sky-100 ring-1 ring-sky-500">🩻 Raio-X</div>
        {!shot && (
          <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 text-xs font-bold text-red-300">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-400" /> LIVE
          </div>
        )}

        {/* vinheta */}
        <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 90px #000a' }} />
      </div>

      {!shot ? (
        <button
          onClick={tirar}
          className="btn mx-auto mt-3 block bg-gradient-to-b from-sky-300 to-hospital-cyan px-6 py-2 font-bold text-[#06253f] shadow-md"
        >
          📸 Tirar raio-X
        </button>
      ) : (
        <>
          <p className="mt-3 text-center text-sm font-semibold text-gray-600">
            {broken ? 'Olha bem para os ossos… o que achas? 🤔' : 'Vê só os ossos! Está tudo direitinho? 🤔'}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button onClick={() => decidir('Osso partido 🦴')} className="btn bg-gradient-to-r from-hospital-danger to-red-500 py-2 text-white">🦴 Osso partido</button>
            <button onClick={() => decidir('Ossos normais')} className="btn bg-gradient-to-r from-green-400 to-green-500 py-2 text-white">✅ Osso normal</button>
          </div>
          <button onClick={repetir} className="mx-auto mt-2 block text-xs text-gray-400 hover:underline">↻ tirar outra vez</button>
        </>
      )}

      <button onClick={() => { stopCam(); setMode('draw'); }} className="mx-auto mt-2 block text-xs text-gray-400 hover:underline">
        usar o modo desenho ✏️
      </button>
    </div>
  );
}

// Ossos do antebraço revelados por cima da foto (partido ou normal)
function Forearm({ broken }) {
  return (
    <svg viewBox="0 0 300 200" className="h-[70%] w-[80%]" style={{ filter: 'drop-shadow(0 0 8px #9fe4ff)' }}>
      {/* dois ossos do antebraço */}
      <rect x="40" y="118" width="180" height="10" rx="5" fill="#eaf6ff" />
      {broken ? (
        <>
          <rect x="40" y="80" width="82" height="10" rx="5" fill="#eaf6ff" />
          <rect x="132" y="86" width="88" height="10" rx="5" fill="#eaf6ff" />
          <path d="M122 74 L132 100" stroke="#ff5a7a" strokeWidth="3" />
          <text x="150" y="60" fontSize="20" textAnchor="middle" fill="#ff5a7a">💥</text>
        </>
      ) : (
        <rect x="40" y="82" width="180" height="10" rx="5" fill="#eaf6ff" />
      )}
      {/* mãozinha (carpo + dedos) */}
      <circle cx="238" cy="105" r="20" fill="none" stroke="#eaf6ff" strokeWidth="4" />
      <rect x="230" y="70" width="6" height="18" rx="3" fill="#eaf6ff" />
      <rect x="241" y="70" width="6" height="18" rx="3" fill="#eaf6ff" />
    </svg>
  );
}

// ----- Recurso: braço desenhado (arrasta o scanner) -----
function DrawXray({ broken, onDecide }) {
  const ref = useRef(null);
  const [cw, setCw] = useState(300);
  const [x, setX] = useState(10);
  const [revealed, setRevealed] = useState(0);
  const W = 72;

  useEffect(() => {
    if (ref.current) setCw(ref.current.clientWidth);
  }, []);

  const clamp = (v) => Math.max(0, Math.min(cw - W, v));
  const moveTo = (clientX) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = clamp(clientX - rect.left - W / 2);
    setX(nx);
    setRevealed((r) => Math.max(r, (nx + W) / cw));
  };
  const onDown = (e) => {
    moveTo(e.clientX);
    const mv = (ev) => moveTo(ev.clientX);
    const up = () => {
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  };

  const rightInset = Math.max(0, cw - (x + W));
  const podeDecidir = revealed >= 0.55;

  return (
    <div className="mt-3">
      <p className="mb-2 text-xs text-gray-500">👉 Passa o scanner pelo braço para veres os ossos.</p>
      <div
        ref={ref}
        onPointerDown={onDown}
        className="relative mx-auto h-[200px] w-full max-w-[320px] touch-none select-none overflow-hidden rounded-2xl border-2 border-gray-200 bg-sky-50"
      >
        <div className="absolute inset-0"><ArmSkin /></div>
        <div className="absolute inset-0" style={{ clipPath: `inset(0px ${rightInset}px 0px ${x}px)` }}>
          <ArmXray broken={broken} />
        </div>
        <div className="absolute top-0 flex h-full items-center justify-center rounded-lg border-4 border-white/80 bg-white/10 shadow-lg" style={{ left: `${x}px`, width: `${W}px` }}>
          <span className="text-2xl">🔦</span>
        </div>
      </div>

      {podeDecidir ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => onDecide('Osso partido 🦴')} className="btn bg-gradient-to-r from-hospital-danger to-red-500 py-2 text-white">🦴 Osso partido</button>
          <button onClick={() => onDecide('Ossos normais')} className="btn bg-gradient-to-r from-green-400 to-green-500 py-2 text-white">✅ Osso normal</button>
        </div>
      ) : (
        <p className="mt-2 text-center text-xs text-gray-400">Continua a passar o scanner…</p>
      )}
    </div>
  );
}

function ArmSkin() {
  return (
    <svg viewBox="0 0 300 200" className="h-full w-full">
      <rect x="0" y="62" width="44" height="76" rx="10" fill="#7EC8E3" />
      <rect x="24" y="72" width="205" height="58" rx="29" fill="#F3C9A0" />
      <circle cx="243" cy="101" r="34" fill="#F3C9A0" />
    </svg>
  );
}

function ArmXray({ broken }) {
  return (
    <svg viewBox="0 0 300 200" className="h-full w-full">
      <rect x="24" y="72" width="205" height="58" rx="29" fill="#10223a" />
      <circle cx="243" cy="101" r="34" fill="#10223a" />
      <rect x="44" y="112" width="165" height="9" rx="4" fill="#eaf2ff" />
      {broken ? (
        <>
          <rect x="44" y="86" width="78" height="9" rx="4" fill="#eaf2ff" />
          <rect x="130" y="90" width="79" height="9" rx="4" fill="#eaf2ff" />
          <path d="M122 84 L130 99" stroke="#ff6b6b" strokeWidth="2" />
        </>
      ) : (
        <rect x="44" y="88" width="165" height="9" rx="4" fill="#eaf2ff" />
      )}
      <circle cx="243" cy="101" r="18" fill="none" stroke="#eaf2ff" strokeWidth="3" />
      <rect x="236" y="70" width="5" height="16" rx="2" fill="#eaf2ff" />
      <rect x="246" y="70" width="5" height="16" rx="2" fill="#eaf2ff" />
    </svg>
  );
}
