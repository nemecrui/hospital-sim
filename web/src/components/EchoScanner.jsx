import { useEffect, useRef, useState } from 'react';
import CameraLens from './CameraLens.jsx';

const FINDINGS = [
  { emoji: '🫄', result: 'Barriga normal', label: 'Normal' },
  { emoji: '🍔', result: 'Comeu demais 🍔', label: 'Comeu demais' },
  { emoji: '💨', result: 'Muitos gases 💨', label: 'Muitos gases' },
  { emoji: '🦋', result: 'Borboletas na barriga 🦋', label: 'Borboletas' },
  { emoji: '🎈', result: 'Engoliu ar 🎈', label: 'Engoliu ar' }
];

// Imagem tipo ultrassom (cone + "chuvinha") com o achado lá dentro
function EchoImage({ emoji }) {
  return (
    <svg viewBox="0 0 300 260" className="h-[92%] w-[92%]" preserveAspectRatio="xMidYMid meet">
      <defs>
        <clipPath id="echofan"><path d="M150 8 L292 252 L8 252 Z" /></clipPath>
        <radialGradient id="echobg" cx="50%" cy="6%" r="98%">
          <stop offset="0%" stopColor="#2b3b2f" /><stop offset="55%" stopColor="#0f1a14" /><stop offset="100%" stopColor="#05090a" />
        </radialGradient>
      </defs>
      <g clipPath="url(#echofan)">
        <rect x="0" y="0" width="300" height="260" fill="url(#echobg)" />
        <g stroke="#7dffb733" fill="none" strokeWidth="1.5">
          <path d="M40 100 Q150 50 260 100" /><path d="M32 160 Q150 100 268 160" /><path d="M26 220 Q150 160 274 220" />
        </g>
        <text x="150" y="175" fontSize="110" textAnchor="middle" opacity="0.9" style={{ filter: 'grayscale(1) brightness(1.4)' }}>{emoji}</text>
      </g>
      <text x="150" y="22" fontSize="20" textAnchor="middle">📡</text>
    </svg>
  );
}

export default function EchoScanner({ patientId, finding, onDecide }) {
  const truth =
    (finding && FINDINGS.find((f) => f.result === finding)) ||
    FINDINGS[((patientId || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % FINDINGS.length];

  const botoes = (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {FINDINGS.map((f) => (
        <button key={f.result} onClick={() => onDecide(f.result)} className="btn bg-white py-2 text-sm hover:bg-pink-50">{f.emoji} {f.label}</button>
      ))}
    </div>
  );

  return (
    <CameraLens
      badge="🫧 Ecografia"
      aim="Aponta a câmara à barriga e passa o gel 🫧"
      guide="🫃"
      facing="environment"
      filter="grayscale(1) contrast(1.2) brightness(.8)"
      captureLabel="📸 Tirar ecografia"
      reveal={<EchoImage emoji={truth.emoji} />}
      afterShot={botoes}
      fallback={<DrawEcho patientId={patientId} truth={truth} onDecide={onDecide} />}
    />
  );
}

// ----- Recurso: passar a sonda (arrastar) -----
function DrawEcho({ truth, onDecide }) {
  const ref = useRef(null);
  const [cw, setCw] = useState(300);
  const [x, setX] = useState(10);
  const [revealed, setRevealed] = useState(0);
  const W = 72;

  useEffect(() => { if (ref.current) setCw(ref.current.clientWidth); }, []);
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
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  };
  const rightInset = Math.max(0, cw - (x + W));
  const podeDecidir = revealed >= 0.55;

  return (
    <div className="mt-1">
      <p className="mb-2 text-xs text-gray-500">👉 Passa a sonda pela barriga para veres o que lá está.</p>
      <div ref={ref} onPointerDown={onDown} className="relative mx-auto h-[180px] w-full max-w-[320px] touch-none select-none overflow-hidden rounded-2xl border-2 border-gray-200 bg-rose-50">
        <div className="absolute inset-0 flex items-center justify-center text-7xl">🧍</div>
        <div className="absolute inset-0 flex items-center justify-center bg-[#0b1b2b]" style={{ clipPath: `inset(0px ${rightInset}px 0px ${x}px)` }}>
          <span className="text-7xl">{truth.emoji}</span>
        </div>
        <div className="absolute top-0 flex h-full items-center justify-center rounded-lg border-4 border-white/80 bg-white/10" style={{ left: `${x}px`, width: `${W}px` }}>
          <span className="text-2xl">📡</span>
        </div>
      </div>
      {podeDecidir ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FINDINGS.map((f) => (
            <button key={f.result} onClick={() => onDecide(f.result)} className="btn bg-white py-2 text-sm hover:bg-pink-50">{f.emoji} {f.label}</button>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-center text-xs text-gray-400">Continua a passar a sonda…</p>
      )}
    </div>
  );
}
