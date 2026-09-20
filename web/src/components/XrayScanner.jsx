import { useEffect, useRef, useState } from 'react';

// 🩻 Raio-X com ZONA do corpo: mão, braço, pé ou perna.
//  • CÂMARA ("Raio-X Mágico"): diz qual a parte a apontar e, ao "tirar", revela
//    um esqueleto próprio dessa zona (com a fratura no sítio certo). A câmara é
//    só para o efeito — nada é guardado nem enviado; o stream desliga ao sair.
//  • DESENHO: recurso automático (arrasta o scanner) quando não há câmara.
// Props: region ('mao'|'braco'|'pe'|'perna'), broken (bool), onDecide(result).

const ZONAS = {
  mao: { label: 'a MÃO', emoji: '🖐️' },
  braco: { label: 'o BRAÇO', emoji: '💪' },
  pe: { label: 'o PÉ', emoji: '🦶' },
  perna: { label: 'a PERNA', emoji: '🦵' }
};

// --------- desenho dos ossos (glow + branco), por zona ----------
function Seg({ x1, y1, x2, y2, w }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#7fe0ff" strokeWidth={w + 7} strokeLinecap="round" opacity="0.35" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#eaf6ff" strokeWidth={w} strokeLinecap="round" />
    </g>
  );
}
function Knob({ x, y, r }) {
  return <circle cx={x} cy={y} r={r} fill="#eaf6ff" />;
}
function Broken({ bone }) {
  const [x1, y1, x2, y2, w] = bone;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  let dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len; // ao longo do osso
  const px = -uy, py = ux; // perpendicular
  const g = 6, o = 7; // afastamento e "salto" lateral
  return (
    <g>
      <Seg x1={x1} y1={y1} x2={mx - ux * g + px * o} y2={my - uy * g + py * o} w={w} />
      <Seg x1={mx + ux * g - px * o} y1={my + uy * g - py * o} x2={x2} y2={y2} w={w} />
      <line x1={mx - px * 8} y1={my - py * 8} x2={mx + px * 8} y2={my + py * 8} stroke="#ff5a7a" strokeWidth="3" />
      <text x={mx} y={my - 10} fontSize="22" textAnchor="middle">💥</text>
    </g>
  );
}

// cada zona: bones = [[x1,y1,x2,y2,w], ...]; o índice `bi` é o osso que "parte"
const SK = {
  mao: {
    bi: 0,
    bones: [
      [110, 212, 114, 150, 14], [130, 212, 126, 150, 14], // antebraço (rádio parte)
      [116, 150, 100, 112, 12], [120, 148, 116, 104, 12], [124, 148, 134, 106, 12], [128, 150, 150, 116, 12], // metacarpos
      [108, 156, 86, 150, 12], // metacarpo polegar
      [100, 112, 96, 80, 11], [96, 80, 94, 58, 10], // indicador
      [116, 104, 114, 70, 11], [114, 70, 112, 46, 10], // médio
      [134, 106, 140, 74, 11], [140, 74, 146, 52, 10], // anelar
      [150, 116, 160, 92, 10], [160, 92, 168, 74, 9], // mindinho
      [86, 150, 70, 132, 11], [70, 132, 60, 118, 10] // polegar
    ]
  },
  braco: {
    bi: 2,
    bones: [
      [120, 20, 120, 108, 16], // úmero
      [112, 110, 108, 200, 13], // cúbito
      [128, 110, 132, 200, 13], // rádio (parte)
      [108, 200, 96, 220, 10], [116, 202, 112, 224, 10], [124, 202, 130, 224, 10], [132, 200, 146, 218, 10] // mãozinha
    ]
  },
  pe: {
    bi: 5,
    bones: [
      [118, 18, 120, 74, 15], // tíbia
      [134, 22, 134, 74, 10], // perónio
      [110, 96, 150, 92, 16], // calcâneo/tarso (traço grosso do calcanhar)
      [150, 92, 130, 96, 12], // tarso
      [130, 92, 176, 84, 11], // 1º metatarso
      [132, 96, 182, 96, 11], // 2º metatarso (parte)
      [134, 100, 180, 108, 10], [136, 104, 174, 120, 10], [138, 108, 168, 130, 9], // metatarsos
      [176, 84, 198, 82, 9], [198, 82, 210, 81, 8], // dedos
      [182, 96, 202, 96, 9], [180, 108, 200, 110, 9], [174, 120, 192, 126, 8], [168, 130, 184, 138, 8]
    ]
  },
  perna: {
    bi: 1,
    bones: [
      [120, 16, 122, 104, 17], // fémur
      [116, 112, 112, 204, 15], // tíbia (parte)
      [134, 114, 132, 204, 10], // perónio
      [112, 204, 150, 214, 12], [150, 214, 178, 212, 10], // pé
      [178, 212, 196, 210, 8]
    ]
  }
};

function Bones({ region = 'braco', broken }) {
  const sk = SK[region] || SK.braco;
  const knobs = [];
  sk.bones.forEach(([x1, y1, x2, y2, w], i) => {
    if (i === sk.bi && broken) return; // esse é desenhado partido
    knobs.push([x1, y1, Math.max(5, w * 0.55)], [x2, y2, Math.max(5, w * 0.55)]);
  });
  return (
    <svg viewBox="0 0 240 235" className="h-[86%] w-[86%]" style={{ filter: 'drop-shadow(0 0 8px #9fe4ff)' }} preserveAspectRatio="xMidYMid meet">
      {sk.bones.map((b, i) => (i === sk.bi && broken ? <Broken key={i} bone={b} /> : <Seg key={i} x1={b[0]} y1={b[1]} x2={b[2]} y2={b[3]} w={b[4]} />))}
      {knobs.map(([x, y, r], i) => <Knob key={`k${i}`} x={x} y={y} r={r} />)}
    </svg>
  );
}

// ==================== componente principal ====================
export default function XrayScanner({ region = 'braco', broken, onDecide }) {
  const zona = ZONAS[region] || ZONAS.braco;
  const [mode, setMode] = useState('loading'); // loading | cam | draw
  const [shot, setShot] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stopCam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setMode('draw');
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        streamRef.current = s;
        setMode('cam');
      } catch {
        if (!cancelled) setMode('draw');
      }
    })();
    return () => { cancelled = true; stopCam(); };
  }, []);

  useEffect(() => {
    if (mode === 'cam' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play?.().catch(() => {});
    }
  }, [mode]);

  const decidir = (r) => { stopCam(); onDecide(r); };
  const tirar = () => { setShot(true); videoRef.current?.pause?.(); };
  const repetir = () => { setShot(false); videoRef.current?.play?.().catch(() => {}); };

  if (mode === 'draw') return <DrawXray region={region} zona={zona} broken={broken} onDecide={decidir} />;

  return (
    <div className="mt-3">
      <style>{`@keyframes rxscan{0%{top:-18%}50%{top:82%}100%{top:-18%}} .rx-beam{animation:rxscan 3s ease-in-out infinite}`}</style>

      <div className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-sky-50 p-2 text-sm font-semibold text-sky-800">
        <span className="text-2xl">{zona.emoji}</span> Aponta a câmara para {zona.label}!
      </div>

      <div className="relative mx-auto h-[260px] w-full max-w-[340px] overflow-hidden rounded-2xl border-2 border-[#123]" style={{ background: 'radial-gradient(120% 90% at 50% 30%, #0e1f52, #08122e 70%)' }}>
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" style={{ filter: 'grayscale(1) contrast(1.35) invert(1) brightness(.9) sepia(1) hue-rotate(150deg) saturate(6)' }} />
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(180deg,#0a2b6e55,#04143f66)', mixBlendMode: 'screen' }} />
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#3fa9ff44 1px,transparent 1px),linear-gradient(90deg,#3fa9ff44 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

        {!shot && <div className="rx-beam pointer-events-none absolute left-0 right-0 h-16" style={{ background: 'linear-gradient(180deg,transparent,#00e5ff33 45%,#7ffcffcc 50%,#00e5ff33 55%,transparent)', boxShadow: '0 0 30px #00e5ff88' }} />}
        {/* guia da parte a apontar (antes de tirar) */}
        {!shot && <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[110px] opacity-25">{zona.emoji}</div>}
        {/* ossos revelados */}
        {shot && <div className="absolute inset-0 flex items-center justify-center"><Bones region={region} broken={broken} /></div>}

        <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-[#0b1c46cc] px-2 py-0.5 text-xs font-bold text-sky-100 ring-1 ring-sky-500">🩻 Raio-X · {zona.emoji}</div>
        {!shot && <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 text-xs font-bold text-red-300"><span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-400" /> LIVE</div>}
        <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 90px #000a' }} />
      </div>

      {!shot ? (
        <button onClick={tirar} className="btn mx-auto mt-3 block bg-gradient-to-b from-sky-300 to-hospital-cyan px-6 py-2 font-bold text-[#06253f] shadow-md">📸 Tirar raio-X</button>
      ) : (
        <>
          <p className="mt-3 text-center text-sm font-semibold text-gray-600">Olha bem para os ossos… o que achas? 🤔</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button onClick={() => decidir('Osso partido 🦴')} className="btn bg-gradient-to-r from-hospital-danger to-red-500 py-2 text-white">🦴 Osso partido</button>
            <button onClick={() => decidir('Ossos normais')} className="btn bg-gradient-to-r from-green-400 to-green-500 py-2 text-white">✅ Osso normal</button>
          </div>
          <button onClick={repetir} className="mx-auto mt-2 block text-xs text-gray-400 hover:underline">↻ tirar outra vez</button>
        </>
      )}

      <button onClick={() => { stopCam(); setMode('draw'); }} className="mx-auto mt-2 block text-xs text-gray-400 hover:underline">usar o modo desenho ✏️</button>
    </div>
  );
}

// ----- Recurso: arrasta o scanner para revelar os ossos da zona -----
function DrawXray({ region, zona, broken, onDecide }) {
  const ref = useRef(null);
  const [cw, setCw] = useState(320);
  const [x, setX] = useState(10);
  const [revealed, setRevealed] = useState(0);
  const W = 72;

  useEffect(() => { if (ref.current) setCw(ref.current.clientWidth); }, []);

  const clamp = (v) => Math.max(0, Math.min(cw - W, v));
  const moveTo = (clientX) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = clamp(clientX - rect.left - W / 2);
    setX(nx);
    setRevealed((r) => Math.max(r, (nx + W) / cw));
  };
  const onDown = (e) => {
    moveTo(e.clientX);
    const mv = (ev) => moveTo(ev.clientX);
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  };

  const rightInset = Math.max(0, cw - (x + W));
  const podeDecidir = revealed >= 0.55;

  return (
    <div className="mt-3">
      <div className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-sky-50 p-2 text-sm font-semibold text-sky-800">
        <span className="text-2xl">{zona.emoji}</span> Passa o scanner para veres os ossos d{region === 'mao' || region === 'perna' ? 'a' : 'o'} {zona.label.toLowerCase()}.
      </div>
      <div ref={ref} onPointerDown={onDown} className="relative mx-auto h-[240px] w-full max-w-[340px] touch-none select-none overflow-hidden rounded-2xl border-2 border-[#123]" style={{ background: 'radial-gradient(120% 90% at 50% 30%, #0e1f52, #08122e 70%)' }}>
        {/* guia */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[110px] opacity-15">{zona.emoji}</div>
        {/* ossos revelados só onde o scanner passou */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ clipPath: `inset(0px ${rightInset}px 0px ${x}px)` }}>
          <Bones region={region} broken={broken} />
        </div>
        {/* moldura do scanner */}
        <div className="absolute top-0 flex h-full items-center justify-center rounded-lg border-4 border-white/70 bg-white/10 shadow-lg" style={{ left: `${x}px`, width: `${W}px` }}>
          <span className="text-2xl">🔦</span>
        </div>
      </div>

      {podeDecidir ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => onDecide('Osso partido 🦴')} className="btn bg-gradient-to-r from-hospital-danger to-red-500 py-2 text-white">🦴 Osso partido</button>
          <button onClick={() => onDecide('Ossos normais')} className="btn bg-gradient-to-r from-green-400 to-green-500 py-2 text-white">✅ Osso normal</button>
        </div>
      ) : (
        <p className="mt-2 text-center text-xs text-gray-400">Continua a passar o scanner…</p>
      )}
    </div>
  );
}
