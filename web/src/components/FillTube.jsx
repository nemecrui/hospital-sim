import { useMemo, useRef, useState } from 'react';
import { playSound } from '../utils/sound.js';
import { sayAs } from '../utils/tts.js';

// Cor do líquido + partículas ("achados") conforme o resultado da análise.
const CFG = {
  blood: {
    normal: { liquid: '#e11d2e', parts: [] },
    iron: { liquid: '#f2808f', parts: [] }, // sangue mais pálido = falta de ferro
    infection: { liquid: '#c81d2e', parts: [{ c: '#8ff04a', n: 6 }, { c: '#c6f88a', n: 3 }] }, // bichinhos
    sugar: { liquid: '#e11d2e', parts: [{ c: '#ffffff', n: 7, spark: true }] } // cristais de açúcar
  },
  urine: {
    normal: { liquid: '#facc15', parts: [{ c: '#ffffff', n: 3, bubble: true }] },
    dehydration: { liquid: '#d97706', parts: [] }, // escura = bebeu pouca água
    infection: { liquid: '#c9be6a', cloudy: true, parts: [{ c: '#8f9a5a', n: 7 }] }, // turva
    sugar: { liquid: '#fde047', parts: [{ c: '#ffffff', n: 7, spark: true }] }
  }
};

const BLOOD_LINES = [
  'Buááá… não gosto de picas!',
  'Aaai…',
  'Hmmm, tenho um bocadinho de medo…',
  'Não quero ver, não quero ver!',
  'Nem senti nada. Já acabou?',
  'Ai, uma pica não!'
];

export default function FillTube({ variant = 'blood', finding = 'normal', results = [], patient, mode, onDecide }) {
  const [p, setP] = useState(0);
  const [full, setFull] = useState(false);
  const timer = useRef(null);
  const played = useRef(false);

  const isBlood = variant === 'blood';
  const cfg = (CFG[variant] && CFG[variant][finding]) || CFG[variant].normal;
  const label = isBlood ? 'Enche o tubo de sangue' : 'Enche o copo';

  // Posições estáveis das partículas
  const particles = useMemo(() => {
    const out = [];
    (cfg.parts || []).forEach((grp, gi) => {
      for (let i = 0; i < grp.n; i++) {
        out.push({
          key: `${gi}-${i}`,
          c: grp.c,
          spark: grp.spark,
          bubble: grp.bubble,
          left: 14 + Math.random() * 64,
          bottom: 6 + Math.random() * 66,
          size: 5 + Math.random() * 4,
          delay: Math.random() * 1.5
        });
      }
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, finding]);

  const reactStart = () => {
    if (played.current) return;
    played.current = true;
    if (variant === 'urine') {
      playSound('pee');
    } else {
      sayAs(patient, mode, BLOOD_LINES[Math.floor(Math.random() * BLOOD_LINES.length)]);
    }
  };

  const start = () => {
    if (full || timer.current) return;
    reactStart();
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
        {/* líquido */}
        <div className="w-full transition-all" style={{ height: `${p}%`, backgroundColor: cfg.liquid }} />
        {/* turvação (infeção na urina) */}
        {cfg.cloudy && <div className="pointer-events-none absolute inset-x-0 bottom-0" style={{ height: `${p}%`, background: 'rgba(255,255,255,0.28)' }} />}
        {/* achados a boiar */}
        {particles.map((pt) => (
          <span
            key={pt.key}
            className="pointer-events-none absolute anim-float"
            style={{
              left: `${pt.left}%`,
              bottom: `${Math.min(pt.bottom, Math.max(0, p - 4))}%`,
              width: pt.size,
              height: pt.size,
              borderRadius: '50%',
              backgroundColor: pt.bubble ? 'transparent' : pt.c,
              border: pt.bubble ? '1.5px solid rgba(255,255,255,0.8)' : 'none',
              boxShadow: pt.spark ? `0 0 4px ${pt.c}` : 'none',
              opacity: p > 8 ? 0.95 : 0,
              animationDelay: `${pt.delay}s`
            }}
          />
        ))}
        <span className="absolute top-1 text-xl">{isBlood ? '🩸' : '💧'}</span>
      </div>

      {!full ? (
        <div className="mx-auto mt-2 h-2 w-32 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-hospital-cyan" style={{ width: `${p}%` }} />
        </div>
      ) : (
        <div className="mt-3">
          <p className="mb-2 text-xs text-gray-500">🔎 Olha bem para a amostra e escolhe o resultado:</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {results.map((r) => (
              <button key={r} onClick={() => onDecide(r)} className="btn bg-white py-2 text-sm hover:bg-pink-50">
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
