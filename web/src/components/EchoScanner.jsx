import { useEffect, useRef, useState } from 'react';

const FINDINGS = [
  { emoji: '🫄', result: 'Barriga normal', label: 'Normal' },
  { emoji: '🍔', result: 'Comeu demais 🍔', label: 'Comeu demais' },
  { emoji: '💨', result: 'Muitos gases 💨', label: 'Muitos gases' },
  { emoji: '🦋', result: 'Borboletas na barriga 🦋', label: 'Borboletas' },
  { emoji: '🎈', result: 'Engoliu ar 🎈', label: 'Engoliu ar' }
];

// Passar a sonda pela barriga para revelar o que lá está; depois decidir.
export default function EchoScanner({ patientId, onDecide }) {
  const ref = useRef(null);
  const [cw, setCw] = useState(300);
  const [x, setX] = useState(10);
  const [revealed, setRevealed] = useState(0);
  const W = 72;

  // achado estável para este doente
  const truth = FINDINGS[
    ((patientId || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % FINDINGS.length
  ];

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
      <p className="mb-2 text-xs text-gray-500">👉 Passa a sonda pela barriga para veres o que lá está.</p>

      <div
        ref={ref}
        onPointerDown={onDown}
        className="relative mx-auto h-[180px] w-full max-w-[320px] touch-none select-none overflow-hidden rounded-2xl border-2 border-gray-200 bg-rose-50"
      >
        {/* pele (barriga) */}
        <div className="absolute inset-0 flex items-center justify-center text-7xl">🧍</div>

        {/* ecografia revelada onde passa a sonda */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-[#0b1b2b]"
          style={{ clipPath: `inset(0px ${rightInset}px 0px ${x}px)` }}
        >
          <span className="text-7xl">{truth.emoji}</span>
        </div>

        {/* sonda */}
        <div
          className="absolute top-0 flex h-full items-center justify-center rounded-lg border-4 border-white/80 bg-white/10"
          style={{ left: `${x}px`, width: `${W}px` }}
        >
          <span className="text-2xl">📡</span>
        </div>
      </div>

      {podeDecidir ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FINDINGS.map((f) => (
            <button
              key={f.result}
              onClick={() => onDecide(f.result)}
              className="btn bg-white py-2 text-sm hover:bg-pink-50"
            >
              {f.emoji} {f.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-center text-xs text-gray-400">Continua a passar a sonda…</p>
      )}
    </div>
  );
}
