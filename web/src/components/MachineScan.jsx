import { useRef, useState } from 'react';
import { playSound } from '../utils/sound.js';

// Máquina grande (TAC/RM): o doente entra, faz o exame e revela a imagem.
export default function MachineScan({ machineEmoji = '🍩', results = [], onDecide }) {
  const [phase, setPhase] = useState('idle'); // idle | scanning | done
  const [p, setP] = useState(0);
  const timer = useRef(null);

  const start = () => {
    if (phase !== 'idle') return;
    setPhase('scanning');
    timer.current = setInterval(() => {
      setP((v) => {
        const nv = v + 4;
        if (nv >= 100) {
          clearInterval(timer.current);
          timer.current = null;
          playSound('complete');
          setPhase('done');
          return 100;
        }
        return nv;
      });
    }, 60);
  };

  return (
    <div className="mt-3">
      <p className="mb-2 text-xs text-gray-500">👉 Põe o doente na máquina e faz o exame.</p>

      <div className="relative h-32 w-full overflow-hidden rounded-2xl bg-slate-100">
        {/* máquina */}
        <div className="absolute inset-y-0 right-6 flex items-center text-7xl">{machineEmoji}</div>
        {/* doente a entrar */}
        <div
          className="absolute top-1/2 -translate-y-1/2 text-5xl transition-all duration-100"
          style={{ left: `${8 + p * 0.5}%` }}
        >
          {phase === 'done' ? '🧠' : '🧑'}
        </div>
      </div>

      {phase !== 'done' && (
        <>
          <div className="mx-auto mt-2 h-3 w-40 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-hospital-cyan transition-all" style={{ width: `${p}%` }} />
          </div>
          {phase === 'idle' && (
            <button onClick={start} className="btn mt-3 w-full bg-hospital-cyan py-2 text-white">
              ▶ Fazer o exame
            </button>
          )}
        </>
      )}

      {phase === 'done' && (
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
