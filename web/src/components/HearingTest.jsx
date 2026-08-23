import { useState } from 'react';
import { beep } from '../utils/sound.js';

// Audiograma: tocar alguns sons (agudos/graves) e depois decidir.
export default function HearingTest({ results = [], onDecide }) {
  const [played, setPlayed] = useState(false);
  const [i, setI] = useState(0);

  const tones = [523, 880, 300, 1200, 440];

  const tocar = () => {
    tones.forEach((f, idx) => {
      setTimeout(() => {
        beep(f, 0.35, 0.18);
        setI(idx + 1);
        if (idx === tones.length - 1) setPlayed(true);
      }, idx * 500);
    });
  };

  return (
    <div className="mt-3 text-center">
      <p className="mb-2 text-xs text-gray-500">👉 Toca os sons e ouve com atenção.</p>

      <div className="relative flex h-28 items-center justify-center rounded-2xl bg-indigo-50">
        <span className="text-6xl">🎧</span>
        {i > 0 && !played && <span className="absolute right-6 animate-pulse-success text-4xl">🔊</span>}
      </div>

      {!played ? (
        <button onClick={tocar} className="btn mt-3 w-full bg-hospital-cyan py-2 text-white">
          ▶ Tocar sons
        </button>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {results.map((r) => (
            <button key={r} onClick={() => onDecide(r)} className="btn bg-white py-2 text-sm hover:bg-pink-50">
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
