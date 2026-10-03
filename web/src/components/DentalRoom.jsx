import { useReducer, useRef } from 'react';
import { makeMouth, TOOLS } from '../utils/teeth.js';
import { playSound } from '../utils/sound.js';

const CLEAN = 3, WHITE = 3, DRILL = 3, PULL = 4;

const UPX = [60, 116, 172, 228, 284, 340];
const needTool = { plaque: 'limpar', yellow: 'branquear', cavity: 'carie', crooked: 'aparelho', extract: 'arrancar' };

function hx(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function lerpColor(c1, c2, t) { const a = hx(c1), b = hx(c2); const m = (i) => Math.round(a[i] + (b[i] - a[i]) * t); return `rgb(${m(0)},${m(1)},${m(2)})`; }

export default function DentalRoom({ patient, onComplete, onBack }) {
  const teeth = useRef(
    makeMouth(patient.id).map((t) => ({ ...t, done: false, prog: 0, sub: 0, numb: false, removed: false, placed: false, rot: t.problem === 'crooked' ? (t.idx % 2 ? 15 : -15) : 0 }))
  );
  const [, force] = useReducer((x) => x + 1, 0);
  const tool = useRef('limpar');
  const msg = useRef(null);
  const fx = useRef(null); // { key, kind }
  const wrong = useRef(null);

  const setMsg = (m) => { msg.current = m; };
  const flashWrong = (key, m) => { wrong.current = key; msg.current = m; playSound('error'); force(); setTimeout(() => { if (wrong.current === key) { wrong.current = null; force(); } }, 500); };
  const showFx = (key, kind) => { fx.current = { key, kind }; setTimeout(() => { fx.current = null; force(); }, 380); };

  const problems = teeth.current.filter((t) => t.problem);
  const doneCount = problems.filter((t) => t.done).length;
  const allDone = problems.length > 0 && doneCount === problems.length;

  const finish = (t, state) => { t.done = true; t.state = state; playSound('success'); };

  const tap = (t) => {
    if (t.done || t.removed) return;
    const need = t.problem;
    const cur = tool.current;
    switch (cur) {
      case 'limpar':
        if (need !== 'plaque') return flashWrong(t.key, 'Esse dente não precisa de limpeza. 🪥');
        t.prog++; playSound('tap'); showFx(t.key, 'clean'); if (t.prog >= CLEAN) finish(t, 'clean'); break;
      case 'branquear':
        if (need !== 'yellow') return flashWrong(t.key, 'Esse dente não precisa de branqueamento. ✨');
        t.prog++; playSound('tap'); showFx(t.key, 'white'); setMsg('Mais brilho! ✨'); if (t.prog >= WHITE) finish(t, 'white'); break;
      case 'carie':
        if (need !== 'cavity') return flashWrong(t.key, 'Não há cárie nesse dente. 🦷');
        if (t.sub < DRILL) { t.sub++; playSound('tap'); showFx(t.key, 'drill'); setMsg(t.sub >= DRILL ? 'Agora tapa com o chumbo! 🦷' : 'A furar… 🦷'); }
        else { finish(t, 'filled'); setMsg('Cárie tapada! 👍'); }
        break;
      case 'aparelho':
        if (need !== 'crooked') return flashWrong(t.key, 'Esse dente não precisa de aparelho. 🦾');
        if (t.placed) break;
        t.placed = true; t.rot = 0; playSound('success'); setMsg('Aparelho colocado — a endireitar! 🦾');
        setTimeout(() => { finish(t, 'braces'); force(); }, 1100); break;
      case 'anestesia':
        if (need !== 'extract') return flashWrong(t.key, 'Esse dente não precisa de anestesia. 💉');
        if (t.numb) break;
        t.numb = true; playSound('success'); setMsg('Dente adormecido 💤 — agora arranca!'); break;
      case 'arrancar':
        if (need !== 'extract') return flashWrong(t.key, 'Esse dente não se arranca. 🙂');
        if (!t.numb) return flashWrong(t.key, 'Primeiro adormece com a anestesia 💉');
        t.prog++; playSound('tap'); setMsg('Abana, abana… 🦷'); showFx(t.key, 'pull');
        if (t.prog >= PULL) { t.removed = true; finish(t, 'gap'); playSound('complete'); setMsg('Saiu! Põe um algodãozinho 🩹'); }
        break;
      default: break;
    }
    force();
  };

  const pickTool = (id) => { tool.current = id; msg.current = null; force(); };

  return (
    <div>
      <style>{`
        @keyframes toothwob{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
        .tooth-wob{animation:toothwob .16s linear infinite;transform-box:fill-box;transform-origin:center}
        @keyframes needp{0%,100%{opacity:.2}50%{opacity:.75}}
        .need-ring{animation:needp 1.1s ease-in-out infinite}
      `}</style>

      <div className="mb-2 rounded-xl bg-teal-50 p-2 text-center text-sm font-semibold text-teal-800">
        {msg.current || '👆 Escolhe a ferramenta e toca no dente que precisa.'}
      </div>

      {/* BOCA */}
      <div className="relative mx-auto overflow-hidden rounded-2xl" style={{ background: 'radial-gradient(120% 90% at 50% 18%,#7a1420,#3c0a12)' }}>
        <svg viewBox="0 0 400 300" className="w-full">
          <ellipse cx="200" cy="150" rx="185" ry="135" fill="#e2566b" />
          <ellipse cx="200" cy="150" rx="165" ry="116" fill="#5c0e18" />
          <path d="M40 92 Q200 40 360 92 L360 120 Q200 78 40 120 Z" fill="#f58ea0" />
          <path d="M40 208 Q200 260 360 208 L360 180 Q200 222 40 180 Z" fill="#f58ea0" />
          <ellipse cx="200" cy="232" rx="95" ry="40" fill="#e26d78" />

          {teeth.current.map((t) => {
            const x = UPX[t.idx];
            const y = t.row === 'up' ? 110 - Math.abs(t.idx - 2.5) * 2 : 190 + Math.abs(t.idx - 2.5) * 2;
            return <Tooth key={t.key} t={t} x={x} y={y} fxOn={fx.current?.key === t.key ? fx.current.kind : null} wrongOn={wrong.current === t.key} onTap={() => tap(t)} />;
          })}
        </svg>
      </div>

      {/* FERRAMENTAS */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {TOOLS.map((tl) => (
          <button key={tl.id} onClick={() => pickTool(tl.id)} className={`rounded-2xl border-2 px-2 py-2 text-center ${tool.current === tl.id ? 'border-hospital-cyan bg-cyan-50 shadow' : 'border-transparent bg-gray-50'}`}>
            <div className="text-2xl leading-none">{tl.emoji}</div>
            <div className="mt-0.5 text-xs font-bold text-gray-600">{tl.label}</div>
          </button>
        ))}
      </div>

      {/* PROGRESSO + ALTA */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm font-bold text-gray-600">Boca</span>
        <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full bg-gradient-to-r from-teal-400 to-hospital-cyan transition-all" style={{ width: `${problems.length ? (doneCount / problems.length) * 100 : 100}%` }} />
        </div>
        <span className="text-xs font-semibold text-gray-500">{doneCount}/{problems.length}</span>
      </div>

      <div className="mt-3 flex gap-3">
        <button onClick={onComplete} disabled={!allDone} className="btn flex-1 bg-gradient-to-r from-green-400 to-green-500 py-3 text-white hover:shadow-lg disabled:opacity-40">
          {allDone ? '✓ Boca saudável — dar alta' : 'Trata todos os dentes primeiro'}
        </button>
        <button onClick={onBack} className="btn bg-white px-4 py-3 text-gray-700 hover:bg-gray-100">↩ Voltar</button>
      </div>
    </div>
  );
}

function Tooth({ t, x, y, fxOn, wrongOn, onTap }) {
  // dente arrancado → espaço + algodão + pinguinho
  if (t.removed) {
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x={-13} y={-10} width={26} height={22} rx={7} fill="#c76b78" />
        <circle cx={0} cy={2} r={3} fill="#e5484d" />
        <circle cx={0} cy={-4} r={9} fill="#fff" />
      </g>
    );
  }

  // cor base (amarelo a branquear se for o caso)
  let fill = '#fdfdfb';
  if (t.problem === 'yellow' && !t.done) fill = lerpColor('#efe0a8', '#ffffff', t.prog / WHITE);

  const needRing = t.problem && !t.done; // pulsa onde falta trabalhar
  const wobble = t.problem === 'extract' && t.numb && t.prog > 0 && !t.done;

  return (
    <g transform={`translate(${x} ${y})`} onPointerDown={onTap} style={{ cursor: 'pointer' }}>
      {needRing && <rect className="need-ring" x={-18} y={-23} width={36} height={46} rx={12} fill="none" stroke={wrongOn ? '#e5484d' : '#00D9FF'} strokeWidth={3} strokeDasharray="5 4" />}
      {wrongOn && !needRing && <rect x={-18} y={-23} width={36} height={46} rx={12} fill="none" stroke="#e5484d" strokeWidth={3} />}

      <g className={wobble ? 'tooth-wob' : ''} style={!wobble ? { transform: `rotate(${t.rot}deg)`, transition: 'transform .9s', transformBox: 'fill-box', transformOrigin: 'center' } : undefined}>
        <rect x={-14} y={-19} width={28} height={38} rx={9} fill={fill} stroke="#dfe3ea" strokeWidth={1.5} />
        <rect x={-8} y={-14} width={6} height={24} rx={3} fill="#ffffff" opacity={0.6} />

        {/* tártaro */}
        {t.problem === 'plaque' && !t.done && (
          <g opacity={1 - t.prog / CLEAN}>
            <rect x={-14} y={6} width={28} height={12} rx={5} fill="#d9c36a" />
            <circle cx={-6} cy={10} r={3} fill="#c9b24f" /><circle cx={6} cy={9} r={3} fill="#c9b24f" />
          </g>
        )}
        {/* cárie: buraco → tapado */}
        {t.problem === 'cavity' && (
          t.done
            ? <circle cx={2} cy={-2} r={7} fill="#cfd6de" />
            : <><circle cx={2} cy={-2} r={7} fill={t.sub >= DRILL ? '#6b4e2a' : '#2a1c0a'} />{t.sub < DRILL && <circle cx={2} cy={-2} r={3} fill="#120a04" />}</>
        )}
        {/* aparelho: bracket + fio */}
        {t.problem === 'crooked' && t.placed && (
          <>
            <rect x={-5} y={-3} width={10} height={7} rx={2} fill="#c0c8d2" />
            <line x1={-14} y1={0} x2={14} y2={0} stroke="#9aa6b2" strokeWidth={2} />
          </>
        )}
        {/* branqueado: brilho */}
        {t.done && (t.state === 'white' || t.state === 'clean') && <circle cx={7} cy={-10} r={2.5} fill="#fff" />}
      </g>

      {/* anestesia zzz */}
      {t.problem === 'extract' && t.numb && !t.done && <text x={10} y={-22} fontSize={14}>💤</text>}
      {/* efeitos */}
      {fxOn === 'drill' && <text x={0} y={-24} fontSize={16} textAnchor="middle">✦✦</text>}
      {(fxOn === 'clean' || fxOn === 'white') && <text x={0} y={-24} fontSize={16} textAnchor="middle">✨</text>}
      {fxOn === 'pull' && <text x={12} y={-20} fontSize={14}>💥</text>}
    </g>
  );
}
