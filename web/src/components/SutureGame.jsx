import { useState } from 'react';
import { playSound } from '../utils/sound.js';

// 🪡 A ENFERMEIRA cose os pontos (toca em cada um) e depois põe o penso.
// Forgiving: os pontos podem ser tocados por qualquer ordem. Só cliente.

const POINTS = [
  { x: 70, y: 100 },
  { x: 112, y: 100 },
  { x: 154, y: 100 },
  { x: 196, y: 100 },
  { x: 238, y: 100 }
];

export default function SutureGame({ onDone, onCancel }) {
  const [stitched, setStitched] = useState([]); // índices por ordem de toque
  const [step, setStep] = useState('sew'); // 'sew' | 'penso' | 'done'

  const allDone = stitched.length === POINTS.length;

  const tap = (i) => {
    if (stitched.includes(i)) return;
    playSound('success');
    const next = [...stitched, i];
    setStitched(next);
    if (next.length === POINTS.length) {
      setTimeout(() => setStep('penso'), 400);
    }
  };

  const porPenso = () => {
    if (step !== 'penso') return;
    playSound('complete');
    setStep('done');
    setTimeout(() => onDone(), 900);
  };

  return (
    <div className="mt-1 text-center">
      <p className="mb-2 text-sm font-semibold text-gray-700">
        {step === 'sew' && `👉 Toca em cada ponto para coser (${stitched.length}/${POINTS.length}).`}
        {step === 'penso' && '👉 Agora põe o penso por cima! 🩹'}
        {step === 'done' && 'Tudo coberto e cosidinho! 💗'}
      </p>

      <svg viewBox="0 0 300 200" className="mx-auto w-full max-w-[320px] touch-none select-none">
        {/* pele */}
        <rect x="20" y="40" width="260" height="120" rx="24" fill="#FDE1D3" />

        {/* corte (fica vermelho enquanto não está todo cosido) */}
        <line
          x1="62" y1="100" x2="246" y2="100"
          stroke={allDone ? '#E8A598' : '#E5484D'}
          strokeWidth={allDone ? 4 : 6}
          strokeLinecap="round"
        />

        {/* linha (fio) a ligar os pontos pela ordem em que foram cosidos */}
        {stitched.length > 1 && (
          <polyline
            points={stitched.map((i) => `${POINTS[i].x},${POINTS[i].y}`).join(' ')}
            fill="none"
            stroke="#6D4AFF"
            strokeWidth="2.5"
            strokeDasharray="4 3"
          />
        )}

        {/* pontos de sutura */}
        {POINTS.map((p, i) => {
          const on = stitched.includes(i);
          return (
            <g key={i} onPointerDown={() => step === 'sew' && tap(i)} style={{ cursor: step === 'sew' ? 'pointer' : 'default' }}>
              {/* área de toque generosa */}
              <circle cx={p.x} cy={p.y} r="18" fill="transparent" />
              {on ? (
                <>
                  <line x1={p.x - 9} y1={p.y - 9} x2={p.x + 9} y2={p.y + 9} stroke="#6D4AFF" strokeWidth="3.5" strokeLinecap="round" />
                  <line x1={p.x + 9} y1={p.y - 9} x2={p.x - 9} y2={p.y + 9} stroke="#6D4AFF" strokeWidth="3.5" strokeLinecap="round" />
                </>
              ) : (
                <circle cx={p.x} cy={p.y} r="7" fill="#fff" stroke="#E5484D" strokeWidth="2.5" className="animate-pulse" />
              )}
            </g>
          );
        })}

        {/* penso por cima no fim */}
        {step === 'done' && (
          <g>
            <rect x="70" y="78" width="160" height="44" rx="12" fill="#FFD9A6" stroke="#E0B84A" strokeWidth="2" transform="rotate(-4 150 100)" />
            <rect x="120" y="86" width="60" height="28" rx="8" fill="#FFF3DD" transform="rotate(-4 150 100)" />
          </g>
        )}
      </svg>

      {step === 'penso' && (
        <button
          onClick={porPenso}
          className="btn mt-1 bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-2 text-white hover:shadow-lg"
        >
          🩹 Pôr o penso
        </button>
      )}

      {onCancel && step !== 'done' && (
        <button onClick={onCancel} className="mt-2 block w-full text-xs text-gray-400 hover:underline">
          cancelar
        </button>
      )}
    </div>
  );
}
