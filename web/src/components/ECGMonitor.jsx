import { useState } from 'react';

const SPEEDS = {
  slow: { dur: 2.6 },
  normal: { dur: 1.4 },
  fast: { dur: 0.75 }
};

// Monitor de ECG: o traçado anda à velocidade real do coração; a criança decide.
export default function ECGMonitor({ truth = 'normal', onDecide }) {
  const [on, setOn] = useState(false);
  const dur = (SPEEDS[truth] || SPEEDS.normal).dur;

  return (
    <div className="mt-3">
      <p className="mb-2 text-xs text-gray-500">👉 Liga o ECG e vê como bate o coração.</p>

      <div className="relative h-28 w-full overflow-hidden rounded-2xl bg-[#08131f]">
        {on ? (
          <div className="ecg-track flex h-full" style={{ width: '200%', animationDuration: `${dur}s` }}>
            <Wave />
            <Wave />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <button onClick={() => setOn(true)} className="btn bg-hospital-cyan px-4 py-2 text-white">
              ▶ Ligar ECG
            </button>
          </div>
        )}
        <span className="absolute right-2 top-2 text-2xl">{on ? '❤️' : '🖤'}</span>
      </div>

      {on && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button onClick={() => onDecide('Batimento devagar')} className="btn bg-white py-2 text-sm hover:bg-pink-50">
            🐢 Devagar
          </button>
          <button onClick={() => onDecide('Coração normal ❤️')} className="btn bg-white py-2 text-sm hover:bg-pink-50">
            ❤️ Normal
          </button>
          <button onClick={() => onDecide('Batimento acelerado')} className="btn bg-white py-2 text-sm hover:bg-pink-50">
            🐇 Acelerado
          </button>
        </div>
      )}
    </div>
  );
}

function Wave() {
  return (
    <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="h-full w-1/2">
      <polyline
        points="0,55 40,55 55,55 62,25 70,80 78,55 120,55 135,55 143,50 150,55 300,55"
        fill="none"
        stroke="#39ff88"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
