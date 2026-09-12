import { useMemo, useRef, useState } from 'react';
import { playSound } from '../utils/sound.js';

// 💊🥄 Farmácia: a enfermeira PREPARA o medicamento antes de o dar.
// kind === 'count'  -> contar os comprimidos certos para o copo
// kind === 'measure'-> medir o xarope até à linha
// Sem servidor: é só um mini-jogo; ao acabar chama onDone() e a dose é dada.

function hash(str) {
  let h = 0;
  const s = String(str || 'x');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// ---- Contar comprimidos ----------------------------------------------------
function CountPills({ item, onDone, onCancel }) {
  // alvo estável por item+toma (2 a 5 comprimidos)
  const target = useMemo(() => 2 + (hash(`${item.name}${item.given || 0}`) % 4), [item]);
  const [cup, setCup] = useState(0);
  const done = useRef(false);

  const tooMany = cup > target;
  const certo = cup === target;

  const add = () => {
    if (done.current) return;
    playSound('tap');
    setCup((n) => n + 1);
  };
  const reset = () => {
    playSound('tap');
    setCup(0);
  };
  const confirmar = () => {
    if (done.current || !certo) return;
    done.current = true;
    playSound('success');
    setTimeout(() => onDone(), 300);
  };

  return (
    <div className="mt-1 text-center">
      <p className="mb-2 text-sm font-semibold text-gray-700">
        👉 Põe <span className="text-hospital-pink">{target}</span> comprimidos no copo.
      </p>

      {/* frasco -> clica para deitar um comprimido */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={add}
          className="flex flex-col items-center rounded-2xl bg-pink-50 px-4 py-3 active:scale-95"
          title="Deitar um comprimido"
        >
          <span className="text-5xl">💊</span>
          <span className="mt-1 text-xs font-semibold text-gray-500">Toca para deitar</span>
        </button>

        {/* copo com os comprimidos lá dentro */}
        <div
          className={`relative flex h-28 w-24 flex-wrap content-end justify-center gap-0.5 overflow-hidden rounded-b-2xl rounded-t-md border-4 p-1 ${
            tooMany ? 'border-hospital-danger bg-red-50' : certo ? 'border-green-400 bg-green-50' : 'border-sky-200 bg-sky-50'
          }`}
        >
          {Array.from({ length: cup }).map((_, i) => (
            <span key={i} className="text-xl leading-none">💊</span>
          ))}
          <span className="absolute left-1 top-1 text-xs font-bold text-gray-400">{cup}</span>
        </div>
      </div>

      <p className={`mt-2 text-sm font-semibold ${tooMany ? 'text-hospital-danger' : certo ? 'text-green-600' : 'text-gray-400'}`}>
        {tooMany ? `São demais! Tira alguns (precisas de ${target}).` : certo ? 'Certinho! 🎉' : `${cup} de ${target}`}
      </p>

      <div className="mt-2 flex justify-center gap-2">
        <button onClick={reset} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200">
          ↺ Esvaziar
        </button>
        <button
          onClick={confirmar}
          disabled={!certo}
          className="btn bg-gradient-to-r from-hospital-pink to-pink-500 px-4 py-1 text-sm text-white disabled:opacity-40"
        >
          ✓ Dar ao doente
        </button>
      </div>
      {onCancel && (
        <button onClick={onCancel} className="mt-2 block w-full text-xs text-gray-400 hover:underline">cancelar</button>
      )}
    </div>
  );
}

// ---- Medir o xarope --------------------------------------------------------
function MeasureSyrup({ item, onDone, onCancel }) {
  // linha-alvo estável (40% a 80% do copo)
  const targetPct = useMemo(() => 40 + (hash(`${item.name}${item.given || 0}`) % 5) * 10, [item]); // 40..80
  const [level, setLevel] = useState(0);
  const filling = useRef(null);
  const done = useRef(false);

  const TOL = 7; // tolerância generosa (±7%)
  const diff = Math.abs(level - targetPct);
  const certo = diff <= TOL;

  const start = () => {
    if (done.current || filling.current) return;
    filling.current = setInterval(() => {
      setLevel((v) => Math.min(100, v + 2));
    }, 60);
  };
  const stop = () => {
    if (filling.current) {
      clearInterval(filling.current);
      filling.current = null;
    }
  };
  const reset = () => {
    stop();
    playSound('tap');
    setLevel(0);
  };
  const confirmar = () => {
    if (done.current || !certo) return;
    done.current = true;
    playSound('success');
    setTimeout(() => onDone(), 300);
  };

  return (
    <div className="mt-1 text-center">
      <p className="mb-2 text-sm font-semibold text-gray-700">
        👉 Carrega no frasco e enche o copo <span className="text-hospital-cyan">até à linha</span>.
      </p>

      <div className="flex items-end justify-center gap-4">
        <button
          onPointerDown={start}
          onPointerUp={stop}
          onPointerLeave={stop}
          className="select-none rounded-2xl bg-amber-50 px-4 py-3 active:scale-95 touch-none"
          title="Carrega para verter o xarope"
        >
          <span className="text-5xl">🍯</span>
          <span className="mt-1 block text-xs font-semibold text-gray-500">Mantém premido</span>
        </button>

        {/* copo medidor */}
        <div className="relative h-32 w-20 overflow-hidden rounded-b-2xl rounded-t-md border-4 border-sky-200 bg-white">
          {/* xarope */}
          <div
            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-amber-500 to-amber-300 transition-[height] duration-75"
            style={{ height: `${level}%` }}
          />
          {/* linha-alvo */}
          <div className="absolute left-0 w-full border-t-2 border-dashed border-hospital-danger" style={{ bottom: `${targetPct}%` }}>
            <span className="absolute -top-4 right-0 text-[10px] font-bold text-hospital-danger">linha</span>
          </div>
        </div>
      </div>

      <p className={`mt-2 text-sm font-semibold ${certo ? 'text-green-600' : 'text-gray-400'}`}>
        {certo ? 'Na linha! 🎉' : level < targetPct ? 'Falta um bocadinho…' : 'Passou da linha — esvazia e tenta!'}
      </p>

      <div className="mt-2 flex justify-center gap-2">
        <button onClick={reset} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200">
          ↺ Esvaziar
        </button>
        <button
          onClick={confirmar}
          disabled={!certo}
          className="btn bg-gradient-to-r from-hospital-pink to-pink-500 px-4 py-1 text-sm text-white disabled:opacity-40"
        >
          ✓ Dar ao doente
        </button>
      </div>
      {onCancel && (
        <button onClick={onCancel} className="mt-2 block w-full text-xs text-gray-400 hover:underline">cancelar</button>
      )}
    </div>
  );
}

export default function Farmacia({ kind = 'count', item = {}, onDone, onCancel }) {
  return kind === 'measure'
    ? <MeasureSyrup item={item} onDone={onDone} onCancel={onCancel} />
    : <CountPills item={item} onDone={onDone} onCancel={onCancel} />;
}
