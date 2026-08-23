import { useRef, useState } from 'react';
import { playSound } from '../utils/sound.js';

// Encher o tubo/copo (análise de sangue ou urina): carregar e segurar até encher.
export default function FillTube({ variant = 'blood', results = [], onDecide }) {
  const [p, setP] = useState(0);
  const [full, setFull] = useState(false);
  const timer = useRef(null);

  const isBlood = variant === 'blood';
  const liquid = isBlood ? 'bg-red-500' : 'bg-yellow-400';
  const label = isBlood ? 'Enche o tubo de sangue' : 'Enche o copo';

  const start = () => {
    if (full || timer.current) return;
    timer.current = setInterval(() => {
      setP((v) => {
        const nv = v + 4;
        if (nv >= 100) {
          clearInterval(timer.current);
          timer.current = null;
          setFull(true);
          playSound('success');
          return 100;
        }
        return nv;
      });
    }, 45);
  };
  const stop = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    if (!full) setP(0);
  };

  return (
    <div className="mt-3 text-center">
      <p className="mb-2 text-xs text-gray-500">👉 {label} — carrega e segura.</p>

      <div
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        className="relative mx-auto flex h-40 w-20 cursor-pointer touch-none select-none items-end justify-center overflow-hidden rounded-b-2xl rounded-t-md border-4 border-gray-300 bg-white active:scale-95"
        title="Segura para encher"
      >
        <div className={`w-full ${liquid} transition-all`} style={{ height: `${p}%` }} />
        <span className="absolute top-1 text-xl">{isBlood ? '🩸' : '💧'}</span>
      </div>

      {!full ? (
        <div className="mx-auto mt-2 h-2 w-32 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-hospital-cyan" style={{ width: `${p}%` }} />
        </div>
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
