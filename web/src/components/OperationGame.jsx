import { useRef, useState } from 'react';
import { playSound } from '../utils/sound.js';

// 🔪 Sala de operações — a MÉDICA tira o objeto engolido com a pinça,
// arrastando-o até ao tabuleiro sem tocar nas paredes (as partes cor-de-rosa).
// Não se pode "perder": ao tocar na parede dá um aviso e conta um toque;
// no fim mostra estrelas conforme os toques. Puro cliente (sem servidor).

const W = 300;
const H = 280;
const OBJ_R = 24;
const TOP = 46; // chegar aqui em cima = objeto fora!

// Corredor seguro: centro e meia-largura conforme a altura (faz ziguezague).
function corridor(y) {
  if (y >= 60 && y <= 130) return { c: 188, half: 58 }; // empurra à direita
  if (y >= 160 && y <= 230) return { c: 112, half: 58 }; // empurra à esquerda
  return { c: 150, half: 96 };
}

export default function OperationGame({ object = { emoji: '🪙', label: 'moeda' }, onDone, onCancel }) {
  const box = useRef(null);
  const dragging = useRef(false);
  const done = useRef(false);
  const lastBuzz = useRef(0);
  const [pos, setPos] = useState({ x: 150, y: 250 });
  const [touches, setTouches] = useState(0);
  const [hit, setHit] = useState(false);
  const [won, setWon] = useState(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setWon(true);
    playSound('complete');
    setTimeout(() => onDone(), 1100);
  };

  const move = (clientX, clientY) => {
    if (done.current || !dragging.current) return;
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    let x = ((clientX - r.left) / r.width) * W;
    let y = ((clientY - r.top) / r.height) * H;
    y = Math.max(28, Math.min(H - OBJ_R, y));

    const { c, half } = corridor(y);
    const min = c - half + OBJ_R;
    const max = c + half - OBJ_R;
    let touched = false;
    if (x < min) { x = min; touched = true; }
    if (x > max) { x = max; touched = true; }

    if (touched) {
      const now = Date.now();
      if (now - lastBuzz.current > 400) {
        lastBuzz.current = now;
        setTouches((n) => n + 1);
        setHit(true);
        playSound('error');
        setTimeout(() => setHit(false), 180);
      }
    }

    setPos({ x, y });
    if (y <= TOP) finish();
  };

  const onDown = (e) => {
    if (done.current) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const mv = (ev) => move(ev.clientX, ev.clientY);
    const up = () => {
      dragging.current = false;
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  };

  const stars = Math.max(1, 3 - touches);

  return (
    <div className="mt-1 text-center">
      <p className="mb-2 text-sm font-semibold text-gray-700">
        {object.verb === 'cortar'
          ? `👉 Puxa a ${object.label} ${object.emoji} até ao tabuleiro para a cortar, sem tocar nas paredes cor-de-rosa.`
          : `👉 Arrasta a ${object.label} ${object.emoji} até ao tabuleiro lá em cima, sem tocar nas paredes cor-de-rosa.`}
      </p>

      <div
        ref={box}
        className={`relative mx-auto touch-none select-none overflow-hidden rounded-3xl border-4 ${
          hit ? 'animate-pulse border-hospital-danger' : 'border-rose-200'
        }`}
        style={{ width: '100%', maxWidth: W, aspectRatio: `${W} / ${H}`, background: '#FFF1F4' }}
      >
        {/* tabuleiro (saída) */}
        <div className="absolute left-1/2 top-1 -translate-x-1/2 text-center">
          <div className="text-2xl leading-none">🧺</div>
        </div>
        {/* abertura no topo */}
        <div className="absolute left-1/2 top-9 h-1.5 w-40 -translate-x-1/2 rounded-full bg-rose-200" />

        {/* paredes / "órgãos" que fazem o ziguezague */}
        <div
          className="absolute rounded-r-full bg-rose-300/80"
          style={{ left: 0, top: `${(60 / H) * 100}%`, width: `${(130 / W) * 100}%`, height: `${(70 / H) * 100}%` }}
        />
        <div
          className="absolute rounded-l-full bg-rose-300/80"
          style={{ right: 0, top: `${(160 / H) * 100}%`, width: `${(130 / W) * 100}%`, height: `${(70 / H) * 100}%` }}
        />

        {/* objeto a arrastar (ou a pinça a puxar) */}
        <div
          onPointerDown={onDown}
          className="absolute flex cursor-grab items-center justify-center rounded-full bg-white shadow-md ring-2 ring-rose-300 active:cursor-grabbing"
          style={{
            width: OBJ_R * 2,
            height: OBJ_R * 2,
            left: `${(pos.x / W) * 100}%`,
            top: `${(pos.y / H) * 100}%`,
            transform: 'translate(-50%, -50%)',
            fontSize: 26
          }}
        >
          {won ? '✨' : object.emoji}
        </div>

        {/* pinça acima do objeto */}
        {!won && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 text-2xl"
            style={{ left: `${(pos.x / W) * 100}%`, top: `calc(${(pos.y / H) * 100}% - ${OBJ_R + 14}px)` }}
          >
            🗜️
          </div>
        )}
      </div>

      {won ? (
        <p className="mt-2 text-sm font-bold text-green-600">
          {object.verb === 'cortar' ? 'Cortaste' : 'Tiraste'} a {object.label}! {'⭐'.repeat(stars)} A passar à enfermeira para coser…
        </p>
      ) : (
        <p className="mt-2 text-xs text-gray-400">Toques nas paredes: {touches}</p>
      )}

      {onCancel && !won && (
        <button onClick={onCancel} className="mt-2 text-xs text-gray-400 hover:underline">
          cancelar
        </button>
      )}
    </div>
  );
}
