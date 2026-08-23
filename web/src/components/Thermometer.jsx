import { useRef, useState } from 'react';
import { playSound } from '../utils/sound.js';

// Encostar o termómetro à testa e segurar até ao "bip" — revela a temperatura.
export default function Thermometer({ onMeasure }) {
  const [progress, setProgress] = useState(0);
  const [temp, setTemp] = useState(null);
  const timer = useRef(null);

  const finish = () => {
    const t = (36 + Math.random() * 3.2).toFixed(1); // 36.0 – 39.2 °C
    setTemp(t);
    playSound('success');
    onMeasure(t);
  };

  const start = () => {
    if (temp != null || timer.current) return;
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
    if (temp == null) setProgress(0);
  };

  const again = () => {
    setTemp(null);
    setProgress(0);
  };

  return (
    <div className="text-center">
      <p className="mb-2 text-xs text-gray-500">👉 Encosta o termómetro à testa e segura até ao “bip”.</p>
      <div
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={stop}
        className="relative mx-auto flex h-28 w-28 cursor-pointer touch-none select-none items-center justify-center rounded-full bg-amber-100 text-6xl active:scale-95"
        title="Segura aqui"
      >
        {temp != null ? '🤒' : '🧒'}
        <span className="absolute -right-1 bottom-3 text-3xl">🌡️</span>
      </div>

      <div className="mx-auto mt-2 h-3 w-40 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-hospital-danger transition-all" style={{ width: `${progress}%` }} />
      </div>

      {temp != null && (
        <div className="mt-2">
          <p className="text-lg font-bold">🌡️ {temp} °C</p>
          <button onClick={again} className="text-xs text-gray-400 hover:underline">
            medir outra vez
          </button>
        </div>
      )}
    </div>
  );
}
