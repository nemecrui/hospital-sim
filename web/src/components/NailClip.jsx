import { useEffect, useRef, useState } from 'react';
import { beep } from '../utils/sound.js';

// Cortar as unhas: uma patinha com 5 garras; toca em cada uma para cortar.
const NAILS = [0, 1, 2, 3, 4];

export default function NailClip({ onDone, onCancel }) {
  const [clipped, setClipped] = useState([]);
  const done = useRef(false);

  const cut = (i) => {
    if (clipped.includes(i)) return;
    try {
      beep(660, 0.06);
    } catch {
      /* som opcional */
    }
    setClipped((c) => [...c, i]);
  };

  useEffect(() => {
    if (clipped.length >= NAILS.length && !done.current) {
      done.current = true;
      setTimeout(() => onDone(), 400);
    }
  }, [clipped, onDone]);

  return (
    <div className="mt-1">
      <p className="mb-2 text-xs text-gray-500">👉 Toca em cada garra para cortar as unhas! ✂️</p>

      <div className="relative mx-auto flex h-44 w-full max-w-[320px] touch-none select-none items-end justify-center rounded-2xl border-2 border-gray-200 bg-amber-50 pb-3">
        {/* almofada da pata */}
        <span className="pointer-events-none absolute bottom-6 text-7xl">🐾</span>

        {/* garras clicáveis por cima dos dedos */}
        <div className="relative z-10 flex gap-2">
          {NAILS.map((i) => {
            const isCut = clipped.includes(i);
            return (
              <button
                key={i}
                onClick={() => cut(i)}
                className={`flex h-12 w-9 items-center justify-center rounded-t-full border-2 text-xl transition ${
                  isCut
                    ? 'border-green-300 bg-green-100 text-green-500'
                    : 'animate-pulse border-amber-300 bg-white text-amber-600 hover:scale-110'
                }`}
                title={isCut ? 'Cortada!' : 'Cortar'}
              >
                {isCut ? '✅' : '✂️'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-2 h-3 w-40 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full bg-hospital-cyan transition-all"
          style={{ width: `${(clipped.length / NAILS.length) * 100}%` }}
        />
      </div>
      <p className="mt-1 text-center text-xs text-gray-400">
        {clipped.length}/{NAILS.length} unhas cortadas
      </p>

      {onCancel && (
        <button onClick={onCancel} className="mt-2 w-full text-xs text-gray-400 hover:underline">
          cancelar
        </button>
      )}
    </div>
  );
}
