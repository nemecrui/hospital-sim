import { useRef, useState } from 'react';

// Gesto de medicação: injeção (carregar no êmbolo) ou xarope (encher a colher).
export default function MedGesture({ kind = 'injection', onDone, onCancel }) {
  const [p, setP] = useState(0);
  const timer = useRef(null);
  const done = useRef(false);
  const inj = kind === 'injection';

  const start = () => {
    if (done.current || timer.current) return;
    timer.current = setInterval(() => {
      setP((v) => {
        const nv = v + (inj ? 3 : 4);
        if (nv >= 100) {
          clearInterval(timer.current);
          timer.current = null;
          done.current = true;
          setTimeout(() => onDone(), 300);
          return 100;
        }
        return nv;
      });
    }, 50);
  };
  const stop = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    if (!done.current) setP(0);
  };

  const titulo = inj ? 'Carrega devagar no êmbolo até ao fim.' : 'Enche a colher para dar o xarope.';

  return (
    <div className="mt-1 text-center">
      <p className="mb-2 text-xs text-gray-500">👉 {titulo}</p>

      <div
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        className="relative mx-auto flex h-28 w-full max-w-[280px] cursor-pointer touch-none select-none items-center justify-center overflow-hidden rounded-2xl border-2 border-gray-200 bg-sky-50 active:scale-95"
      >
        <span className="text-6xl">{inj ? '💉' : '🥄'}</span>
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-2 bg-hospital-cyan"
          style={{ width: `${p}%` }}
        />
      </div>

      <div className="mx-auto mt-2 h-3 w-40 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-hospital-cyan transition-all" style={{ width: `${p}%` }} />
      </div>

      {onCancel && (
        <button onClick={onCancel} className="mt-2 text-xs text-gray-400 hover:underline">
          cancelar
        </button>
      )}
    </div>
  );
}
