import { useMemo, useRef, useState } from 'react';
import { playSound } from '../utils/sound.js';

// 💊🥄🎨 Farmácia: a enfermeira PREPARA o medicamento antes de o dar.
//  - 'count'  : contar os comprimidos certos de CADA tipo (cor/tamanho)
//  - 'measure': medir o xarope até à linha
//  - 'mix'    : misturar duas cores para fazer o xarope da cor certa
// Sem servidor: ao acabar chama onDone() e a dose é dada.

function hash(str) {
  let h = 0;
  const s = String(str || 'x');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// ---- Contar comprimidos (vários tipos: cor + tamanho) ----------------------
const PILL_KINDS = [
  { id: 'azul', label: 'azuis', color: '#4f86ff', big: true },
  { id: 'vermelho', label: 'vermelhos', color: '#ff5a5a', big: false },
  { id: 'amarelo', label: 'amarelos', color: '#ffc83d', big: true },
  { id: 'verde', label: 'verdes', color: '#4fcf6f', big: false },
  { id: 'roxo', label: 'roxos', color: '#9a5cff', big: false }
];

function buildRecipe(item) {
  const h = hash(`${item.name}${item.given || 0}`);
  const nTypes = [1, 2, 2, 3][h % 4]; // quase sempre 1 a 2 tipos; às vezes 3
  const start = h % PILL_KINDS.length;
  const types = [];
  for (let i = 0; i < nTypes; i++) {
    const kind = PILL_KINDS[(start + i) % PILL_KINDS.length];
    const target = 1 + (hash(`${item.name}${item.given}${kind.id}`) % 4); // 1..4
    types.push({ ...kind, target });
  }
  return types;
}

function Pill({ color, big }) {
  const s = big ? 22 : 16;
  return (
    <span
      className="inline-block rounded-full border border-black/10"
      style={{ width: s, height: s * 0.66, background: color }}
    />
  );
}

function CountPills({ item, onDone, onCancel }) {
  const recipe = useMemo(() => buildRecipe(item), [item]);
  const [cup, setCup] = useState({}); // id -> quantidade
  const done = useRef(false);

  const add = (id) => {
    if (done.current) return;
    playSound('tap');
    setCup((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  };
  const reset = () => {
    playSound('tap');
    setCup({});
  };

  const certo = recipe.every((t) => (cup[t.id] || 0) === t.target);
  const demais = recipe.some((t) => (cup[t.id] || 0) > t.target);

  const confirmar = () => {
    if (done.current || !certo) return;
    done.current = true;
    playSound('success');
    setTimeout(() => onDone(), 300);
  };

  return (
    <div className="mt-1 text-center">
      <p className="mb-2 text-sm font-semibold text-gray-700">👉 Põe no copo:</p>
      <div className="mb-2 flex flex-wrap justify-center gap-2 text-sm">
        {recipe.map((t) => (
          <span key={t.id} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
            <span className="font-bold text-hospital-pink">{t.target}</span>
            <Pill color={t.color} big={t.big} />
            <span className="text-gray-600">{t.label} {t.big ? '(grandes)' : '(pequenos)'}</span>
            <span className="text-gray-400">· {cup[t.id] || 0}</span>
          </span>
        ))}
      </div>

      <div className="flex items-end justify-center gap-4">
        {/* frascos de cada tipo */}
        <div className="flex flex-col gap-2">
          {recipe.map((t) => (
            <button
              key={t.id}
              onClick={() => add(t.id)}
              className="flex items-center gap-2 rounded-2xl bg-pink-50 px-3 py-2 active:scale-95"
            >
              <Pill color={t.color} big={t.big} />
              <span className="text-xs font-semibold text-gray-500">+ {t.label}</span>
            </button>
          ))}
        </div>

        {/* copo */}
        <div
          className={`relative flex h-28 w-24 flex-wrap content-end justify-center gap-0.5 overflow-hidden rounded-b-2xl rounded-t-md border-4 p-1 ${
            demais ? 'border-hospital-danger bg-red-50' : certo ? 'border-green-400 bg-green-50' : 'border-sky-200 bg-sky-50'
          }`}
        >
          {recipe.flatMap((t) =>
            Array.from({ length: cup[t.id] || 0 }).map((_, i) => <Pill key={`${t.id}${i}`} color={t.color} big={t.big} />)
          )}
        </div>
      </div>

      <p className={`mt-2 text-sm font-semibold ${demais ? 'text-hospital-danger' : certo ? 'text-green-600' : 'text-gray-400'}`}>
        {demais ? 'São demais! Esvazia e conta bem.' : certo ? 'Certinho! 🎉' : 'Conta com cuidado…'}
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
      {onCancel && <button onClick={onCancel} className="mt-2 block w-full text-xs text-gray-400 hover:underline">cancelar</button>}
    </div>
  );
}

// ---- Medir o xarope --------------------------------------------------------
function MeasureSyrup({ item, onDone, onCancel }) {
  const targetPct = useMemo(() => 40 + (hash(`${item.name}${item.given || 0}`) % 5) * 10, [item]); // 40..80
  const [level, setLevel] = useState(0);
  const filling = useRef(null);
  const done = useRef(false);

  const TOL = 7;
  const certo = Math.abs(level - targetPct) <= TOL;

  const start = () => {
    if (done.current || filling.current) return;
    filling.current = setInterval(() => setLevel((v) => Math.min(100, v + 2)), 60);
  };
  const stop = () => {
    if (filling.current) { clearInterval(filling.current); filling.current = null; }
  };
  const reset = () => { stop(); playSound('tap'); setLevel(0); };
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
          className="select-none touch-none rounded-2xl bg-amber-50 px-4 py-3 active:scale-95"
        >
          <span className="text-5xl">🍯</span>
          <span className="mt-1 block text-xs font-semibold text-gray-500">Mantém premido</span>
        </button>
        <div className="relative h-32 w-20 overflow-hidden rounded-b-2xl rounded-t-md border-4 border-sky-200 bg-white">
          <div
            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-amber-500 to-amber-300 transition-[height] duration-75"
            style={{ height: `${level}%` }}
          />
          <div className="absolute left-0 w-full border-t-2 border-dashed border-hospital-danger" style={{ bottom: `${targetPct}%` }}>
            <span className="absolute -top-4 right-0 text-[10px] font-bold text-hospital-danger">linha</span>
          </div>
        </div>
      </div>
      <p className={`mt-2 text-sm font-semibold ${certo ? 'text-green-600' : 'text-gray-400'}`}>
        {certo ? 'Na linha! 🎉' : level < targetPct ? 'Falta um bocadinho…' : 'Passou da linha — esvazia e tenta!'}
      </p>
      <div className="mt-2 flex justify-center gap-2">
        <button onClick={reset} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200">↺ Esvaziar</button>
        <button onClick={confirmar} disabled={!certo} className="btn bg-gradient-to-r from-hospital-pink to-pink-500 px-4 py-1 text-sm text-white disabled:opacity-40">✓ Dar ao doente</button>
      </div>
      {onCancel && <button onClick={onCancel} className="mt-2 block w-full text-xs text-gray-400 hover:underline">cancelar</button>}
    </div>
  );
}

// ---- Misturar cores --------------------------------------------------------
const BASE = {
  azul: { name: 'azul', color: '#4f86ff' },
  amarelo: { name: 'amarelo', color: '#ffd23f' },
  vermelho: { name: 'vermelho', color: '#ff5a5a' },
  branco: { name: 'branco', color: '#ffffff' }
};
const MIXES = {
  'amarelo+azul': { name: 'verde', color: '#4fcf6f' },
  'amarelo+vermelho': { name: 'laranja', color: '#ff9a3d' },
  'azul+vermelho': { name: 'roxo', color: '#9a5cff' },
  'branco+vermelho': { name: 'rosa', color: '#ff8fb3' },
  'azul+branco': { name: 'azul-claro', color: '#7fd0ff' }
};
const MIX_TARGETS = Object.entries(MIXES);

function mixOf(set) {
  if (set.size === 0) return null;
  if (set.size === 1) return BASE[[...set][0]];
  const key = [...set].sort().join('+');
  return MIXES[key] || { name: 'lama', color: '#8d6e63' };
}

function MixSyrup({ item, onDone, onCancel }) {
  const target = useMemo(() => MIX_TARGETS[hash(`${item.name}${item.given || 0}`) % MIX_TARGETS.length][1], [item]);
  const [set, setSet] = useState(() => new Set());
  const done = useRef(false);

  const preview = mixOf(set);
  const certo = preview && preview.name === target.name;

  const toggle = (id) => {
    if (done.current) return;
    playSound('tap');
    setSet((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const reset = () => { playSound('tap'); setSet(new Set()); };
  const confirmar = () => {
    if (done.current || !certo) return;
    done.current = true;
    playSound('success');
    setTimeout(() => onDone(), 300);
  };

  return (
    <div className="mt-1 text-center">
      <p className="mb-1 text-sm font-semibold text-gray-700">
        👉 Faz um xarope <span style={{ color: target.color }} className="font-bold drop-shadow-sm">{target.name}</span>! Junta as cores certas.
      </p>
      <div className="mb-3 flex items-center justify-center gap-3">
        <span className="text-xs text-gray-400">Queremos:</span>
        <span className="inline-block h-6 w-10 rounded-md border-2 border-black/10" style={{ background: target.color }} />
      </div>

      <div className="flex items-center justify-center gap-4">
        {/* frascos de cor */}
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(BASE).map((id) => (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={`flex items-center gap-2 rounded-2xl px-3 py-2 active:scale-95 ${set.has(id) ? 'ring-2 ring-hospital-cyan' : ''}`}
              style={{ background: '#f4f6fb' }}
            >
              <span className="inline-block h-5 w-5 rounded-full border border-black/15" style={{ background: BASE[id].color }} />
              <span className="text-xs font-semibold text-gray-600">{BASE[id].name}</span>
            </button>
          ))}
        </div>

        {/* copo com a mistura */}
        <div className="relative h-28 w-20 overflow-hidden rounded-b-2xl rounded-t-md border-4 border-sky-200 bg-white">
          <div className="absolute bottom-0 left-0 w-full transition-colors" style={{ height: preview ? '70%' : '0%', background: preview ? preview.color : 'transparent' }} />
        </div>
      </div>

      <p className={`mt-2 text-sm font-semibold ${certo ? 'text-green-600' : 'text-gray-400'}`}>
        {!preview ? 'Escolhe as cores…' : certo ? `Ficou ${preview.name}! 🎉` : preview.name === 'lama' ? 'Ups, ficou cor de lama! Limpa e tenta.' : `Ficou ${preview.name}… não é bem essa.`}
      </p>

      <div className="mt-2 flex justify-center gap-2">
        <button onClick={reset} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200">↺ Limpar</button>
        <button onClick={confirmar} disabled={!certo} className="btn bg-gradient-to-r from-hospital-pink to-pink-500 px-4 py-1 text-sm text-white disabled:opacity-40">✓ Dar ao doente</button>
      </div>
      {onCancel && <button onClick={onCancel} className="mt-2 block w-full text-xs text-gray-400 hover:underline">cancelar</button>}
    </div>
  );
}

export default function Farmacia({ kind = 'count', item = {}, onDone, onCancel }) {
  if (kind === 'measure') return <MeasureSyrup item={item} onDone={onDone} onCancel={onCancel} />;
  if (kind === 'mix') return <MixSyrup item={item} onDone={onDone} onCancel={onCancel} />;
  return <CountPills item={item} onDone={onDone} onCancel={onCancel} />;
}
