import { useEffect, useRef, useState } from 'react';

// Braço em raio-X: arrasta o scanner para revelar os ossos e decide se está partido.
// `broken` = verdade (partido ou não). onDecide(resultString) devolve a escolha.
export default function XrayScanner({ broken, onDecide }) {
  const ref = useRef(null);
  const [cw, setCw] = useState(300);
  const [x, setX] = useState(10);
  const [revealed, setRevealed] = useState(0);
  const W = 72; // largura do scanner

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
      <p className="mb-2 text-xs text-gray-500">
        👉 Passa o scanner pelo braço para veres os ossos.
      </p>

      <div
        ref={ref}
        onPointerDown={onDown}
        className="relative mx-auto h-[200px] w-full max-w-[320px] touch-none select-none overflow-hidden rounded-2xl border-2 border-gray-200 bg-sky-50"
      >
        {/* Camada pele (braço normal) */}
        <div className="absolute inset-0">
          <ArmSkin />
        </div>

        {/* Camada raio-X, revelada só onde o scanner passa */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0px ${rightInset}px 0px ${x}px)` }}
        >
          <ArmXray broken={broken} />
        </div>

        {/* Moldura do scanner */}
        <div
          className="absolute top-0 flex h-full items-center justify-center rounded-lg border-4 border-white/80 bg-white/10 shadow-lg"
          style={{ left: `${x}px`, width: `${W}px` }}
        >
          <span className="text-2xl">🔦</span>
        </div>
      </div>

      {podeDecidir ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => onDecide('Osso partido 🦴')}
            className="btn bg-gradient-to-r from-hospital-danger to-red-500 py-2 text-white"
          >
            🦴 Osso partido
          </button>
          <button
            onClick={() => onDecide('Ossos normais')}
            className="btn bg-gradient-to-r from-green-400 to-green-500 py-2 text-white"
          >
            ✅ Osso normal
          </button>
        </div>
      ) : (
        <p className="mt-2 text-center text-xs text-gray-400">
          Continua a passar o scanner…
        </p>
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
      {/* corpo do braço em raio-X (escuro) */}
      <rect x="24" y="72" width="205" height="58" rx="29" fill="#10223a" />
      <circle cx="243" cy="101" r="34" fill="#10223a" />

      {/* osso de baixo (inteiro) */}
      <rect x="44" y="112" width="165" height="9" rx="4" fill="#eaf2ff" />

      {/* osso de cima: inteiro ou partido */}
      {broken ? (
        <>
          <rect x="44" y="86" width="78" height="9" rx="4" fill="#eaf2ff" />
          <rect x="130" y="90" width="79" height="9" rx="4" fill="#eaf2ff" />
          {/* fenda */}
          <path d="M122 84 L130 99" stroke="#ff6b6b" strokeWidth="2" />
        </>
      ) : (
        <rect x="44" y="88" width="165" height="9" rx="4" fill="#eaf2ff" />
      )}

      {/* ossos da mão */}
      <circle cx="243" cy="101" r="18" fill="none" stroke="#eaf2ff" strokeWidth="3" />
      <rect x="236" y="70" width="5" height="16" rx="2" fill="#eaf2ff" />
      <rect x="246" y="70" width="5" height="16" rx="2" fill="#eaf2ff" />
    </svg>
  );
}
