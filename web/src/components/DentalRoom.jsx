import { useReducer, useRef, useState } from 'react';
import { makeMouth, TOOLS, mouthStory } from '../utils/teeth.js';
import { playSound, startDrill as drillSound, startBrush as brushSound, startLight as lightSound } from '../utils/sound.js';
import { speakTip } from '../utils/tts.js';

const SCRUB_PX = 320, WHITE = 3, DRILL = 3, PULL = 4;
const UPX = [60, 116, 172, 228, 284, 340];
const toothY = (row, idx) => (row === 'up' ? 110 - Math.abs(idx - 2.5) * 2 : 190 + Math.abs(idx - 2.5) * 2);

function hx(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function lerpColor(c1, c2, t) { const a = hx(c1), b = hx(c2); const m = (i) => Math.round(a[i] + (b[i] - a[i]) * t); return `rgb(${m(0)},${m(1)},${m(2)})`; }

export default function DentalRoom({ patient, onComplete, onBack }) {
  const teeth = useRef(
    makeMouth(patient.id).map((t) => ({ ...t, done: false, prog: 0, sub: 0, numb: false, removed: false, bleeding: false, cotton: false, lighting: false, rot: t.problem === 'crooked' ? (t.idx % 2 ? 15 : -15) : 0 }))
  );
  const crooked = teeth.current.find((t) => t.problem === 'crooked');
  const side = crooked ? (crooked.idx < 3 ? [0, 1, 2] : [3, 4, 5]) : null;
  const story = useRef(mouthStory(patient)).current;

  const [, force] = useReducer((x) => x + 1, 0);
  const [xray, setXray] = useState(false);
  const tool = useRef('limpar');
  const msg = useRef(null);
  const fx = useRef(null);
  const wrong = useRef(null);
  const braces = useRef({ placed: false, done: false });
  const gesture = useRef(null);

  const setMsg = (m) => { msg.current = m; };
  const flashWrong = (key, m) => { if (key) wrong.current = key; msg.current = m; playSound('error'); force(); if (key) setTimeout(() => { if (wrong.current === key) { wrong.current = null; force(); } }, 500); };
  const showFx = (key, kind) => { fx.current = { key, kind }; setTimeout(() => { if (fx.current?.key === key) { fx.current = null; force(); } }, 380); };
  const finish = (t, state) => { t.done = true; t.state = state; playSound('success'); };

  const othersDone = () => teeth.current.filter((t) => t.problem && t.problem !== 'crooked').every((t) => t.done);
  const problems = teeth.current.filter((t) => t.problem);
  const doneCount = problems.filter((t) => t.done).length;
  const allDone = othersDone() && (!crooked || braces.current.done);

  // ----- gestos -----
  const beginScrub = (t, e) => {
    if (gesture.current) gesture.current();
    const stop = brushSound();
    let last = { x: e.clientX, y: e.clientY };
    const cleanup = () => { stop(); window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); gesture.current = null; };
    const mv = (ev) => { t.prog += Math.abs(ev.clientX - last.x) + Math.abs(ev.clientY - last.y); last = { x: ev.clientX, y: ev.clientY }; if (t.prog >= SCRUB_PX && !t.done) { finish(t, 'clean'); cleanup(); } force(); };
    const up = () => cleanup();
    gesture.current = cleanup;
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    setMsg('Esfrega para cima e para baixo! 🪥'); force();
  };

  const beginDrill = (t) => {
    if (gesture.current) gesture.current();
    const stop = drillSound();
    const cleanup = () => { clearInterval(timer); stop(); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); gesture.current = null; };
    const up = () => cleanup();
    const timer = setInterval(() => { t.sub += 1; showFx(t.key, 'drill'); if (t.sub >= DRILL) { cleanup(); setMsg('Agora tapa com o chumbo! 🦷'); } force(); }, 450);
    gesture.current = cleanup;
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    setMsg('A furar… 🦷'); force();
  };

  const beginWhiten = (t) => {
    if (gesture.current) gesture.current();
    const stop = lightSound();
    t.lighting = true;
    const cleanup = () => { clearInterval(timer); stop(); t.lighting = false; window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); gesture.current = null; };
    const up = () => cleanup();
    const timer = setInterval(() => { t.prog += 1; showFx(t.key, 'white'); if (t.prog >= WHITE) { cleanup(); finish(t, 'white'); } force(); }, 400);
    gesture.current = cleanup;
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    setMsg('Luz azul a branquear… 💡✨'); force();
  };

  const placeCotton = (t) => { t.bleeding = false; t.cotton = true; t.done = true; t.state = 'gap'; playSound('pop'); setMsg('Boa! Já não sangra 🩹'); force(); };

  const tryBraces = () => {
    if (!crooked) return flashWrong(null, 'Não é preciso aparelho nesta boca. 🦾');
    if (braces.current.placed) return;
    if (!othersDone()) { setMsg('O aparelho é o último! Trata primeiro tudo o resto. 🦾'); playSound('error'); force(); return; }
    braces.current.placed = true;
    crooked.rot = 0;
    playSound('click'); playSound('success');
    setMsg('Aparelho colocado em todos os dentes do lado — a endireitar! 🦾');
    setTimeout(() => { braces.current.done = true; crooked.done = true; crooked.state = 'braces'; force(); }, 1200);
    force();
  };

  const handleDown = (t, e) => {
    if (t.removed) { if (t.bleeding) placeCotton(t); return; }
    if (t.done) return;
    const cur = tool.current, need = t.problem;
    switch (cur) {
      case 'limpar':
        if (need !== 'plaque') return flashWrong(t.key, 'Esse dente não precisa de limpeza. 🪥');
        beginScrub(t, e); break;
      case 'branquear':
        if (need !== 'yellow') return flashWrong(t.key, 'Esse dente não precisa de branqueamento. ✨');
        beginWhiten(t); break;
      case 'carie':
        if (need !== 'cavity') return flashWrong(t.key, 'Não há cárie nesse dente. 🦷');
        if (t.sub >= DRILL) { finish(t, 'filled'); setMsg('Cárie tapada! 👍'); force(); } else beginDrill(t); break;
      case 'anestesia':
        if (need !== 'extract') return flashWrong(t.key, 'Esse dente não precisa de anestesia. 💉');
        if (!t.numb) { t.numb = true; playSound('success'); setMsg('Dente adormecido 💤 — agora arranca!'); force(); } break;
      case 'arrancar':
        if (need !== 'extract') return flashWrong(t.key, 'Esse dente não se arranca. 🙂');
        if (!t.numb) return flashWrong(t.key, 'Primeiro adormece com a anestesia 💉');
        t.prog++; playSound('tap'); setMsg('Abana, abana… 🦷'); showFx(t.key, 'pull');
        if (t.prog >= PULL) { t.removed = true; t.bleeding = true; playSound('complete'); setMsg('Está a sangrar! Toca para pôr o algodão 🩹'); }
        force(); break;
      case 'aparelho':
        tryBraces(); break;
      default: break;
    }
  };

  const pickTool = (id) => { if (gesture.current) gesture.current(); tool.current = id; msg.current = null; force(); };
  const toggleXray = () => { if (gesture.current) gesture.current(); setXray((v) => !v); };
  const canBraces = !crooked || othersDone();
  const bracedActive = braces.current.placed && side;

  return (
    <div>
      <style>{`
        @keyframes toothwob{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
        .tooth-wob{animation:toothwob .16s linear infinite;transform-box:fill-box;transform-origin:center}
        @keyframes needp{0%,100%{opacity:.2}50%{opacity:.75}}
        .need-ring{animation:needp 1.1s ease-in-out infinite}
        @keyframes bpool{0%{transform:scale(.6)}100%{transform:scale(1.15)}}
        .bleed-pool{transform-box:fill-box;transform-origin:center;animation:bpool 1s ease-in-out infinite alternate}
        @keyframes drip{0%{opacity:0;transform:translateY(0)}20%{opacity:1}100%{opacity:0;transform:translateY(22px)}}
        .drip{animation:drip 1.1s linear infinite}
        @keyframes wglow{0%,100%{opacity:.25}50%{opacity:.65}}
        .wglow{animation:wglow .5s ease-in-out infinite}
      `}</style>

      {/* Feitio + historinha da boca */}
      <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-amber-50 p-2">
        <button onClick={() => speakTip(`${patient.name} ${story.cause}`)} className="flex min-w-0 items-center gap-2 text-left text-sm text-amber-900">
          <span className="text-xl">{story.feitio.emoji}</span>
          <span className="truncate"><b>{patient.name}</b> ({story.feitio.label}) — {story.cause} 🔊</span>
        </button>
        <button onClick={toggleXray} className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${xray ? 'bg-hospital-cyan text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200'}`}>
          {xray ? '🦷 Boca' : '🩻 Raio-X'}
        </button>
      </div>

      {!xray && (
        <div className="mb-2 rounded-xl bg-teal-50 p-2 text-center text-sm font-semibold text-teal-800">
          {msg.current || '👆 Escolhe a ferramenta e trata o dente certo.'}
        </div>
      )}

      {/* BOCA ou RAIO-X */}
      <div className="relative mx-auto touch-none select-none overflow-hidden rounded-2xl" style={{ background: xray ? 'radial-gradient(120% 90% at 50% 25%,#13306e,#081328 70%)' : 'radial-gradient(120% 90% at 50% 18%,#7a1420,#3c0a12)' }}>
        {xray ? (
          <Xray teeth={teeth.current} bracedSide={bracedActive ? side : null} />
        ) : (
          <svg viewBox="0 0 400 300" className="w-full">
            <ellipse cx="200" cy="150" rx="185" ry="135" fill="#e2566b" />
            <ellipse cx="200" cy="150" rx="165" ry="116" fill="#5c0e18" />
            <path d="M40 92 Q200 40 360 92 L360 120 Q200 78 40 120 Z" fill="#f58ea0" />
            <path d="M40 208 Q200 260 360 208 L360 180 Q200 222 40 180 Z" fill="#f58ea0" />
            <ellipse cx="200" cy="232" rx="95" ry="40" fill="#e26d78" />

            {bracedActive && ['up', 'low'].map((row) => (
              <polyline key={row} fill="none" stroke="#9aa6b2" strokeWidth="2.5" points={side.map((i) => `${UPX[i]},${toothY(row, i)}`).join(' ')} />
            ))}

            {teeth.current.map((t) => (
              <Tooth key={t.key} t={t} x={UPX[t.idx]} y={toothY(t.row, t.idx)}
                braced={!!(bracedActive && side.includes(t.idx))}
                ringColor={t.problem === 'crooked' && !othersDone() ? '#b7a9db' : wrong.current === t.key ? '#e5484d' : '#00D9FF'}
                fxOn={fx.current?.key === t.key ? fx.current.kind : null}
                onDown={(e) => handleDown(t, e)} />
            ))}
          </svg>
        )}
        {xray && <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-[#0b1c46cc] px-2 py-0.5 text-xs font-bold text-sky-100 ring-1 ring-sky-500">🩻 Raio-X dental</div>}
      </div>

      {xray ? (
        <p className="mt-3 text-center text-sm text-gray-500">Vê o que há a tratar e volta à <b>🦷 Boca</b> para começar.</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {TOOLS.map((tl) => {
              const locked = tl.id === 'aparelho' && !canBraces;
              return (
                <button key={tl.id} onClick={() => pickTool(tl.id)} className={`relative rounded-2xl border-2 px-2 py-2 text-center ${tool.current === tl.id ? 'border-hospital-cyan bg-cyan-50 shadow' : 'border-transparent bg-gray-50'} ${locked ? 'opacity-60' : ''}`}>
                  <div className="text-2xl leading-none">{tl.emoji}</div>
                  <div className="mt-0.5 text-xs font-bold text-gray-600">{tl.label}</div>
                  {locked && <span className="absolute right-1 top-1 text-xs">🔒</span>}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm font-bold text-gray-600">Boca</span>
            <div className="h-3.5 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full bg-gradient-to-r from-teal-400 to-hospital-cyan transition-all" style={{ width: `${problems.length ? (doneCount / problems.length) * 100 : 100}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-500">{doneCount}/{problems.length}</span>
          </div>
        </>
      )}

      <div className="mt-3 flex gap-3">
        <button onClick={onComplete} disabled={!allDone} className="btn flex-1 bg-gradient-to-r from-green-400 to-green-500 py-3 text-white hover:shadow-lg disabled:opacity-40">
          {allDone ? '✓ Boca saudável — dar alta' : 'Trata todos os dentes primeiro'}
        </button>
        <button onClick={onBack} className="btn bg-white px-4 py-3 text-gray-700 hover:bg-gray-100">↩ Voltar</button>
      </div>
    </div>
  );
}

function Tooth({ t, x, y, braced, ringColor, fxOn, onDown }) {
  if (t.removed) {
    return (
      <g transform={`translate(${x} ${y})`} onPointerDown={onDown} style={{ cursor: 'pointer' }}>
        <rect x={-20} y={-26} width={40} height={52} fill="transparent" />
        <rect x={-13} y={-10} width={26} height={22} rx={7} fill="#a8414e" />
        {t.bleeding ? (
          <>
            <ellipse className="bleed-pool" cx={0} cy={4} rx={10} ry={6} fill="#c0182a" />
            <circle className="drip" cx={-4} cy={8} r={3} fill="#c0182a" />
            <circle className="drip" cx={5} cy={10} r={2.5} fill="#c0182a" style={{ animationDelay: '.5s' }} />
          </>
        ) : (
          <circle cx={0} cy={-2} r={10} fill="#fff" />
        )}
      </g>
    );
  }

  const rotten = t.problem === 'extract' && !t.done;
  let fill = '#fdfdfb';
  if (rotten) fill = '#6a5a46';
  else if (t.problem === 'yellow' && !t.done) fill = lerpColor('#efe0a8', '#ffffff', t.prog / WHITE);

  const needRing = t.problem && !t.done;
  const wobble = t.problem === 'extract' && t.numb && t.prog > 0 && !t.done;
  const foam = t.problem === 'plaque' && !t.done && t.prog > 0;

  return (
    <g transform={`translate(${x} ${y})`} onPointerDown={onDown} style={{ cursor: 'pointer' }}>
      <rect x={-20} y={-26} width={40} height={52} fill="transparent" />
      {needRing && <rect className="need-ring" x={-18} y={-23} width={36} height={46} rx={12} fill="none" stroke={ringColor} strokeWidth={3} strokeDasharray="5 4" />}

      <g className={wobble ? 'tooth-wob' : ''} style={!wobble ? { transform: `rotate(${t.rot}deg)`, transition: 'transform .9s', transformBox: 'fill-box', transformOrigin: 'center' } : undefined}>
        <rect x={-14} y={-19} width={28} height={38} rx={9} fill={fill} stroke={rotten ? '#4a3c2c' : '#dfe3ea'} strokeWidth={1.5} />
        {!rotten && <rect x={-8} y={-14} width={6} height={24} rx={3} fill="#ffffff" opacity={0.6} />}

        {rotten && (
          <>
            <circle cx={-3} cy={-6} r={5} fill="#1c130a" />
            <circle cx={5} cy={4} r={4} fill="#120c06" />
            <circle cx={3} cy={-9} r={3} fill="#241812" />
            <path d="M0 -17 L-3 -4 L2 3" fill="none" stroke="#120c06" strokeWidth={1.6} />
          </>
        )}

        {t.problem === 'plaque' && !t.done && (
          <g opacity={1 - t.prog / SCRUB_PX}>
            <rect x={-14} y={6} width={28} height={12} rx={5} fill="#d9c36a" />
            <circle cx={-6} cy={10} r={3} fill="#c9b24f" /><circle cx={6} cy={9} r={3} fill="#c9b24f" />
          </g>
        )}
        {foam && (
          <g opacity={Math.min(0.95, t.prog / 120)} fill="#ffffff">
            <circle cx={-9} cy={-10} r={5} /><circle cx={-2} cy={-15} r={6} /><circle cx={6} cy={-11} r={5} /><circle cx={11} cy={-4} r={4} /><circle cx={-11} cy={-2} r={4} />
          </g>
        )}

        {t.problem === 'cavity' && (
          t.done
            ? <circle cx={2} cy={-2} r={7} fill="#cfd6de" />
            : <><circle cx={2} cy={-2} r={7} fill={t.sub >= DRILL ? '#6b4e2a' : '#2a1c0a'} />{t.sub < DRILL && <circle cx={2} cy={-2} r={3} fill="#120a04" />}</>
        )}

        {braced && <rect x={-5} y={-3} width={10} height={7} rx={2} fill="#c0c8d2" />}
        {t.done && (t.state === 'white' || t.state === 'clean') && <circle cx={7} cy={-10} r={2.5} fill="#fff" />}
      </g>

      {/* luz azul do branqueamento */}
      {t.lighting && (
        <>
          <circle className="wglow" cx={0} cy={-2} r={22} fill="#49b6ff" />
          <text x={0} y={-26} fontSize={16} textAnchor="middle">💡</text>
        </>
      )}

      {t.problem === 'extract' && t.numb && !t.done && <text x={10} y={-22} fontSize={14}>💤</text>}
      {fxOn === 'drill' && <text x={0} y={-24} fontSize={16} textAnchor="middle">✦✦</text>}
      {fxOn === 'white' && <text x={0} y={-24} fontSize={16} textAnchor="middle">✨</text>}
      {fxOn === 'pull' && <text x={12} y={-20} fontSize={14}>💥</text>}
    </g>
  );
}

// 🩻 Raio-X dental: dentes com raízes, cáries escuras e o dente podre bem escuro.
function Xray({ teeth, bracedSide }) {
  return (
    <svg viewBox="0 0 400 300" className="w-full">
      <rect x="0" y="0" width="400" height="300" fill="none" />
      {/* grelha de monitor */}
      <g opacity="0.12" stroke="#7fb0ff">
        {[60, 120, 180, 240].map((y) => <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} strokeWidth="1" />)}
        {[80, 160, 240, 320].map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" strokeWidth="1" />)}
      </g>
      {/* arco panorâmico */}
      <path d="M40 150 Q200 70 360 150" fill="none" stroke="#5a86c9" strokeWidth="1.5" opacity="0.5" />

      {teeth.map((t) => {
        const x = UPX[t.idx], y = toothY(t.row, t.idx);
        if (t.removed) return <g key={t.key} transform={`translate(${x} ${y})`}><rect x={-10} y={-8} width={20} height={16} rx={5} fill="#15325f" /></g>;
        const rootDir = t.row === 'up' ? -1 : 1;
        const rotten = t.problem === 'extract' && !t.done;
        const crown = rotten ? '#59667a' : '#dce9fc';
        const root = rotten ? '#45536b' : '#b7cff0';
        return (
          <g key={t.key} transform={`translate(${x} ${y})`} style={{ filter: 'drop-shadow(0 0 4px #bcd6ff66)' }}>
            <g style={{ transform: `rotate(${t.rot}deg)`, transformBox: 'fill-box', transformOrigin: 'center' }}>
              {/* raízes */}
              <line x1={-6} y1={rootDir * 11} x2={-9} y2={rootDir * 30} stroke={root} strokeWidth={5} strokeLinecap="round" />
              <line x1={6} y1={rootDir * 11} x2={9} y2={rootDir * 30} stroke={root} strokeWidth={5} strokeLinecap="round" />
              {/* coroa */}
              <rect x={-12} y={-13} width={24} height={26} rx={7} fill={crown} />
              {/* cárie escura */}
              {t.problem === 'cavity' && !t.done && <circle cx={2} cy={-2} r={6} fill="#0a1a33" />}
              {t.problem === 'cavity' && t.done && <circle cx={2} cy={-2} r={6} fill="#9fb6d6" />}
              {/* podre: manchas muito escuras */}
              {rotten && <><circle cx={-3} cy={-4} r={5} fill="#0a1426" /><circle cx={4} cy={4} r={4} fill="#0a1426" /></>}
            </g>
          </g>
        );
      })}
    </svg>
  );
}
