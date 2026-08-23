import { useRef, useState } from 'react';
import { playSound } from '../utils/sound.js';

// Encostar o estetoscópio ao peito e segurar para ouvir o coração — revela a pulsação.
export default function Stethoscope({ onMeasure }) {
  const [progress, setProgress] = useState(0);
  const [hr, setHr] = useState(null);
  const timer = useRef(null);

  const finish = () => {
    const v = 60 + Math.floor(Math.random() * 45); // 60–104 bpm
    setHr(v);
    playSound('success');
    onMeasure(v);
  };

  const start = () => {
    if (hr != null || timer.current) return;
    timer.current = setInterval(() => {
      setProgress((p) => {
        const np = p + 4;
        if (np >= 100) {
          clearInterval(timer.current);
          timer.current = null;
          finish();
          return 100;
        }
        return np;
      });
    }, 45);
  };

  const stop = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    if (hr == null) setProgress(0);
  };

  const again = () => {
    setHr(null);
    setProgress(0);
  };

  const beating = progress > 0 && hr == null;

  return (
    <div className="text-center">
      <p className="mb-2 text-xs text-gray-500">👉 Encosta o estetoscópio ao peito e segura para ouvir.</p>
      <div
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        className="relative mx-auto flex h-28 w-28 cursor-pointer touch-none select-none items-center justify-center rounded-full bg-rose-100 text-6xl active:scale-95"
        title="Segura aqui"
      >
        <span className={beating ? 'animate-pulse-success' : ''}>{hr != null ? '❤️' : '🫀'}</span>
        <span className="absolute -right-1 bottom-3 text-3xl">🩺</span>
      </div>

      <div className="mx-auto mt-2 h-3 w-40 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-rose-400 transition-all" style={{ width: `${progress}%` }} />
      </div>

      {hr != null && (
        <div className="mt-2">
          <p className="text-lg font-bold">❤️ {hr} bpm</p>
          <button onClick={again} className="text-xs text-gray-400 hover:underline">
            ouvir outra vez
          </button>
        </div>
      )}
    </div>
  );
}
