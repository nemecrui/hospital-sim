import { useEffect, useRef, useState } from 'react';

// Gesto de cuidar: esfregar (curativo) ou enrolar (gesso).
// Acumula o movimento do dedo/rato até encher; depois chama onDone().
export default function CareGesture({ kind = 'rub', onDone, onCancel }) {
  const [p, setP] = useState(0);
  const last = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    if (p >= 100 && !done.current) {
      done.current = true;
      setTimeout(() => onDone(), 300);
    }
  }, [p, onDone]);

  const move = (x, y) => {
    if (last.current) {
      const d = Math.abs(x - last.current.x) + Math.abs(y - last.current.y);
      setP((v) => Math.min(100, v + d * 0.2));
    }
    last.current = { x, y };
  };
  const onDown = (e) => {
    last.current = { x: e.clientX, y: e.clientY };
    const mv = (ev) => move(ev.clientX, ev.clientY);
    const up = () => {
      last.current = null;
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  };

  const isWrap = kind === 'wrap';
  const titulo = isWrap ? 'Esfrega à volta do braço para pôr o gesso!' : 'Esfrega para limpar e pôr o penso!';
  const emojiBase = isWrap ? '💪' : '🩹';
  const emojiFim = isWrap ? '🦿' : '🩹';

  return (
    <div className="mt-3">
      <p className="mb-2 text-xs text-gray-500">👉 {titulo}</p>
      <div
        onPointerDown={onDown}
        className="relative mx-auto flex h-40 w-full max-w-[320px] touch-none select-none items-center justify-center overflow-hidden rounded-2xl border-2 border-gray-200 bg-sky-50"
      >
        <span className="text-7xl">{p >= 100 ? emojiFim : emojiBase}</span>
        {/* camada branca do gesso / penso a "encher" */}
        <div
          className="pointer-events-none absolute inset-0 bg-white/80"
          style={{ clipPath: `inset(${100 - p}% 0 0 0)` }}
        />
        <span className="pointer-events-none absolute bottom-2 text-3xl">{isWrap ? '🧻' : '🧽'}</span>
      </div>

      <div className="mx-auto mt-2 h-3 w-40 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-hospital-cyan transition-all" style={{ width: `${p}%` }} />
      </div>

      {onCancel && (
        <button onClick={onCancel} className="mt-2 w-full text-xs text-gray-400 hover:underline">
          cancelar
        </button>
      )}
    </div>
  );
}
