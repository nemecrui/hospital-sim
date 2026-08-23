import { useEffect, useRef, useState } from 'react';

// Configuração do gesto de esfregar por tipo de cuidado.
const CFG = {
  Gesso: { wrap: true, msg: 'Esfrega à volta do braço para pôr o gesso!', base: '💪', end: '🦴', overlay: 'bg-white/85' },
  Penso: { msg: 'Esfrega para limpar e pôr o penso!', base: '🩹', end: '🩹', overlay: 'bg-white/70' },
  'Creme para comichão': { msg: 'Espalha o creme para a comichão passar!', base: '🧴', end: '✨', overlay: 'bg-pink-200/60' },
  Gelo: { msg: 'Esfrega o gelo para desinchar!', base: '🧊', end: '❄️', overlay: 'bg-sky-200/70' },
  'Banho quente': { msg: 'Esfrega para dar o banho quentinho!', base: '🛁', end: '🫧', overlay: 'bg-blue-200/60' },
  'Beijinho de melhoras': { msg: 'Esfrega com carinho — um beijinho de melhoras!', base: '😘', end: '💗', overlay: 'bg-pink-200/60' }
};
const DEFAULT = { msg: 'Esfrega o ecrã para aplicar!', base: '🧴', end: '✨', overlay: 'bg-white/70' };

// Esfregar o ecrã: acumula o movimento do dedo/rato até encher; depois onDone().
export default function CareGesture({ name, emoji, onDone, onCancel }) {
  const cfg = CFG[name] || { ...DEFAULT, base: emoji || DEFAULT.base };
  const [p, setP] = useState(0);
  const last = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    if (p >= 100 && !done.current) {
      done.current = true;
      setTimeout(() => onDone(), 300);
    }
  }, [p, onDone]);

  const move = (x, y) => {
    if (last.current) {
      const d = Math.abs(x - last.current.x) + Math.abs(y - last.current.y);
      setP((v) => Math.min(100, v + d * 0.2));
    }
    last.current = { x, y };
  };
  const onDown = (e) => {
    last.current = { x: e.clientX, y: e.clientY };
    const mv = (ev) => move(ev.clientX, ev.clientY);
    const up = () => {
      last.current = null;
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  };

  return (
    <div className="mt-1">
      <p className="mb-2 text-xs text-gray-500">👉 {cfg.msg}</p>
      <div
        onPointerDown={onDown}
        className="relative mx-auto flex h-40 w-full max-w-[320px] touch-none select-none items-center justify-center overflow-hidden rounded-2xl border-2 border-gray-200 bg-sky-50"
      >
        <span className="text-7xl">{p >= 100 ? cfg.end : cfg.base}</span>
        {/* camada a "encher" enquanto esfrega */}
        <div
          className={`pointer-events-none absolute inset-0 ${cfg.overlay}`}
          style={{ clipPath: `inset(${100 - p}% 0 0 0)` }}
        />
        <span className="pointer-events-none absolute bottom-2 text-3xl">🧽</span>
      </div>

      <div className="mx-auto mt-2 h-3 w-40 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-hospital-cyan transition-all" style={{ width: `${p}%` }} />
      </div>

      {onCancel && (
        <button onClick={onCancel} className="mt-2 w-full text-xs text-gray-400 hover:underline">
          cancelar
        </button>
      )}
    </div>
  );
}
