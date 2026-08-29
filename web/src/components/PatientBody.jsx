import { useEffect, useId, useRef, useState } from 'react';
import { avatarFor, moodFor, bodyStateFor, appearanceFor } from '../utils/characters.js';
import { speakAs } from '../utils/tts.js';

const PANTS = '#42506B';
const CAST = '#EDEEF2';
const CASTL = '#C9CDD6';
const SPOT = '#E5484D';
const CHEEK = '#FF7A9A';
const LINE = '#00000022';

// Expressão (olhos, boca, sobrancelhas) + braços por estado
function expr(state) {
  switch (state) {
    case 'healthy': return { eyes: 'happy', mouth: 'big', brows: 'up', arms: 'down' };
    case 'broken': return { eyes: 'open', mouth: 'frown', brows: 'worry', arms: 'down', tear: true };
    case 'fever': return { eyes: 'tired', mouth: 'open', brows: 'worry', arms: 'down' };
    case 'belly': return { eyes: 'squeeze', mouth: 'wavy', brows: 'worry', arms: 'belly' };
    case 'allergy': return { eyes: 'open', mouth: 'frown', brows: 'worry', arms: 'down' };
    case 'cold': return { eyes: 'tired', mouth: 'frown', brows: 'worry', arms: 'down' };
    case 'ear': return { eyes: 'squeeze', mouth: 'frown', brows: 'worry', arms: 'ear' };
    case 'tooth': return { eyes: 'squeeze', mouth: 'frown', brows: 'worry', arms: 'cheek' };
    case 'headache': return { eyes: 'squeeze', mouth: 'frown', brows: 'worry', arms: 'head' };
    case 'wound': return { eyes: 'open', mouth: 'frown', brows: 'worry', arms: 'down' };
    default: return { eyes: 'open', mouth: 'frown', brows: 'flat', arms: 'down' };
  }
}

function Hair({ style, color }) {
  switch (style) {
    case 'buzz':
      return <path d="M43 50 q27 -26 54 0 q-6 -10 -27 -10 q-21 0 -27 10z" fill={color} opacity="0.9" />;
    case 'side':
      return (
        <>
          <path d="M40 50 q30 -34 60 0 q-6 -16 -30 -16 q-24 0 -30 16z" fill={color} />
          <path d="M44 34 q18 -10 40 6 q-16 -4 -40 -6z" fill={color} />
        </>
      );
    case 'ponytail':
      return (
        <>
          <ellipse cx="102" cy="60" rx="8" ry="14" fill={color} />
          <path d="M40 50 q30 -34 60 0 q-6 -16 -30 -16 q-24 0 -30 16z" fill={color} />
        </>
      );
    case 'curly':
      return (
        <>
          {[[46, 34], [58, 27], [70, 25], [82, 27], [94, 34]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="10" fill={color} />
          ))}
          <path d="M40 50 q30 -20 60 0 q0 -14 -30 -14 q-30 0 -30 14z" fill={color} />
        </>
      );
    default: // short
      return <path d="M40 50 q30 -36 60 0 q-8 -18 -30 -18 q-22 0 -30 18z" fill={color} />;
  }
}

function Brows({ kind, color }) {
  const s = { stroke: color, strokeWidth: 2.6, fill: 'none', strokeLinecap: 'round' };
  if (kind === 'up')
    return (
      <>
        <path d="M53 46 q6 -4 12 -1" {...s} />
        <path d="M75 45 q6 -3 12 1" {...s} />
      </>
    );
  if (kind === 'worry')
    return (
      <>
        <path d="M53 45 l11 3" {...s} />
        <path d="M87 45 l-11 3" {...s} />
      </>
    );
  return (
    <>
      <path d="M53 46 h11" {...s} />
      <path d="M76 46 h11" {...s} />
    </>
  );
}

function Mouth({ kind }) {
  if (kind === 'frown') return <path d="M62 73 q8 -7 16 0" stroke="#b5546a" strokeWidth="3" fill="none" strokeLinecap="round" />;
  if (kind === 'open') return <ellipse cx="70" cy="73" rx="6" ry="7" fill="#b5546a" />;
  if (kind === 'wavy') return <path d="M60 73 q5 5 10 0 q5 -5 10 0" stroke="#b5546a" strokeWidth="3" fill="none" strokeLinecap="round" />;
  if (kind === 'big') return <path d="M58 70 q12 12 24 0 q-12 5 -24 0z" fill="#b5546a" />;
  return <path d="M60 71 q10 9 20 0" stroke="#b5546a" strokeWidth="3" fill="none" strokeLinecap="round" />;
}

function Arms({ mode, skin }) {
  if (mode === 'belly')
    return (
      <>
        <path d="M46 102 q-14 20 22 30" stroke={skin} strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M94 102 q14 20 -22 30" stroke={skin} strokeWidth="14" fill="none" strokeLinecap="round" />
      </>
    );
  if (mode === 'head')
    return (
      <>
        <path d="M46 102 q-16 -18 4 -36" stroke={skin} strokeWidth="13" fill="none" strokeLinecap="round" />
        <path d="M94 102 q16 -18 -4 -36" stroke={skin} strokeWidth="13" fill="none" strokeLinecap="round" />
      </>
    );
  if (mode === 'ear')
    return (
      <>
        <rect x="30" y="100" width="13" height="50" rx="6.5" fill={skin} />
        <path d="M94 102 q18 -12 -2 -42" stroke={skin} strokeWidth="13" fill="none" strokeLinecap="round" />
      </>
    );
  if (mode === 'cheek')
    return (
      <>
        <rect x="30" y="100" width="13" height="50" rx="6.5" fill={skin} />
        <path d="M94 102 q16 -6 -6 -32" stroke={skin} strokeWidth="13" fill="none" strokeLinecap="round" />
      </>
    );
  return (
    <>
      <rect x="30" y="100" width="13" height="50" rx="6.5" fill={skin} />
      <rect x="97" y="100" width="13" height="50" rx="6.5" fill={skin} />
    </>
  );
}

function Overlay({ state, skin }) {
  switch (state) {
    case 'broken':
      return (
        <>
          <rect x="53" y="152" width="18" height="46" rx="8" fill={CAST} stroke={CASTL} strokeWidth="2" />
          <line x1="55" y1="164" x2="69" y2="164" stroke={CASTL} strokeWidth="2" />
          <line x1="55" y1="174" x2="69" y2="174" stroke={CASTL} strokeWidth="2" />
          <line x1="55" y1="184" x2="69" y2="184" stroke={CASTL} strokeWidth="2" />
        </>
      );
    case 'fever':
      return (
        <>
          <circle cx="55" cy="64" r="6" fill={CHEEK} opacity="0.75" />
          <circle cx="85" cy="64" r="6" fill={CHEEK} opacity="0.75" />
          <circle cx="94" cy="40" r="4" fill="#7ec8f2" className="anim-float" />
          <rect x="70" y="70" width="26" height="6" rx="3" fill="#C9CDD6" transform="rotate(12 70 72)" />
          <circle cx="95" cy="80" r="5" fill="#E5484D" />
        </>
      );
    case 'belly':
      return <circle cx="70" cy="54" r="30" fill="#BFE3B0" opacity="0.3" />;
    case 'allergy':
      return (
        <>
          {[[58, 62], [82, 60], [70, 68], [50, 54], [90, 52], [63, 50], [77, 50]].map(([x, y], i) => (
            <circle key={`f${i}`} cx={x} cy={y} r="3.2" fill={SPOT} opacity="0.85" />
          ))}
          {[[36, 112], [38, 126], [104, 114], [102, 128]].map(([x, y], i) => (
            <circle key={`a${i}`} cx={x} cy={y} r="3" fill={SPOT} opacity="0.85" />
          ))}
        </>
      );
    case 'cold':
      return (
        <>
          <circle cx="70" cy="66" r="5" fill="#FF7A6B" />
          <circle cx="55" cy="64" r="5" fill={CHEEK} opacity="0.55" />
          <circle cx="85" cy="64" r="5" fill={CHEEK} opacity="0.55" />
        </>
      );
    case 'ear':
      return (
        <>
          <path d="M96 52 q8 4 0 12" stroke="#E5484D" strokeWidth="3" fill="none" strokeLinecap="round" />
          <text x="99" y="42" fontSize="12" fontWeight="700" fill="#E5484D">!</text>
        </>
      );
    case 'tooth':
      return <circle cx="86" cy="72" r="7" fill={skin} />;
    case 'headache':
      return (
        <>
          <path d="M40 34 l-6 -6 M44 30 l-4 -8" stroke="#E5484D" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M100 34 l6 -6 M96 30 l4 -8" stroke="#E5484D" strokeWidth="2.5" strokeLinecap="round" />
        </>
      );
    case 'wound':
      return (
        <g transform="rotate(-20 62 172)">
          <rect x="55" y="167" width="14" height="10" rx="2" fill="#FFE08A" stroke="#E0B84A" strokeWidth="1" />
          <line x1="62" y1="167" x2="62" y2="177" stroke="#E0B84A" strokeWidth="1" />
        </g>
      );
    case 'healthy':
      return <path d="M56 168 h12 v9 h-12 z" fill="#FFE08A" stroke="#E0B84A" strokeWidth="1" transform="rotate(-20 62 172)" />;
    default:
      return null;
  }
}

// Boneco de corpo inteiro (humanos). Nos animais, usa a cabeça grande (emoji).
export default function PatientBody({ patient, mode, size = 150, speakOnTap = true, bump = 0 }) {
  const mood = moodFor(patient);
  const uid = useId().replace(/[:]/g, '');
  const wrapRef = useRef(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });

  const onTap = speakOnTap
    ? (e) => {
        e.stopPropagation();
        speakAs(patient, mode);
      }
    : undefined;

  // Olhos seguem o dedo/rato (subtil), exceto no modo veterinário ou reduced-motion
  useEffect(() => {
    if (mode === 'vet') return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = wrapRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.3;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const len = Math.hypot(dx, dy) || 1;
        const max = 2.4;
        setPupil({ x: (dx / len) * max, y: (dy / len) * max });
      });
    };
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mode]);

  // Modo veterinário: mantém a cara grande do animal
  if (mode === 'vet') {
    const avatar = avatarFor(patient, mode);
    return (
      <div
        ref={wrapRef}
        className={`relative shrink-0 ${speakOnTap ? 'cursor-pointer' : ''}`}
        style={{ width: size * 0.75, height: size }}
        onClick={onTap}
        role={speakOnTap ? 'button' : undefined}
        title={speakOnTap ? 'Toca para ouvir' : mood.label}
      >
        <div className={`flex h-full w-full items-center justify-center anim-${mood.anim}`} style={{ fontSize: size * 0.6 }}>
          {avatar}
        </div>
        <span className="absolute bottom-1 right-1 drop-shadow-sm" style={{ fontSize: size * 0.22 }}>
          {mood.badge}
        </span>
      </div>
    );
  }

  const ap = appearanceFor(patient);
  const e = expr(bodyStateFor(patient));
  const w = Math.round(size * (140 / 220));

  return (
    <div
      ref={wrapRef}
      className={`relative shrink-0 ${speakOnTap ? 'cursor-pointer' : ''}`}
      style={{ width: w, height: size }}
      onClick={onTap}
      role={speakOnTap ? 'button' : undefined}
      title={speakOnTap ? 'Toca para ouvir' : mood.label}
    >
      <div key={bump} className={bump ? 'anim-hop' : ''}>
        <svg viewBox="0 0 140 220" width={w} height={size} className={`anim-${mood.anim}`}>
          <defs>
            <radialGradient id={`hl${uid}`} cx="34%" cy="26%" r="72%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="62%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* sombra no chão */}
          <ellipse cx="70" cy="212" rx="33" ry="6" fill="#000000" opacity="0.08" />

          {/* pernas + pés */}
          <rect x="55" y="152" width="14" height="48" rx="7" fill={PANTS} />
          <rect x="71" y="152" width="14" height="48" rx="7" fill={PANTS} />
          <ellipse cx="62" cy="202" rx="10" ry="6" fill={ap.skin} />
          <ellipse cx="78" cy="202" rx="10" ry="6" fill={ap.skin} />

          {/* tronco */}
          <rect x="44" y="94" width="52" height="62" rx="20" fill={ap.shirt} />
          <rect x="44" y="94" width="52" height="62" rx="20" fill={`url(#hl${uid})`} />
          <Arms mode={e.arms} skin={ap.skin} />

          {/* pescoço */}
          <rect x="63" y="82" width="14" height="12" rx="4" fill={ap.skin} />

          {/* orelhas + cabeça */}
          <circle cx="41" cy="56" r="5" fill={ap.skin} />
          <circle cx="99" cy="56" r="5" fill={ap.skin} />
          <circle cx="70" cy="55" r="30" fill={ap.skin} />
          <circle cx="70" cy="55" r="30" fill={`url(#hl${uid})`} />
          <Hair style={ap.style} color={ap.hair} />

          {/* bochechas suaves (quando não há estado a mandar) */}
          {(e.eyes === 'open' || e.eyes === 'happy') && (
            <>
              <circle cx="55" cy="66" r="4.5" fill={CHEEK} opacity="0.28" />
              <circle cx="85" cy="66" r="4.5" fill={CHEEK} opacity="0.28" />
            </>
          )}

          {/* nariz */}
          <ellipse cx="70" cy="61" rx="2.6" ry="2" fill="#00000012" />

          <Brows kind={e.brows} color={ap.hair} />

          {/* olhos */}
          {e.eyes === 'open' && (
            <g className="anim-blink" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
              <ellipse cx="60" cy="55" rx="5" ry="6" fill="#fff" stroke={LINE} />
              <ellipse cx="80" cy="55" rx="5" ry="6" fill="#fff" stroke={LINE} />
              <circle cx={60 + pupil.x} cy={55 + pupil.y} r="3" fill="#3b3b4d" />
              <circle cx={80 + pupil.x} cy={55 + pupil.y} r="3" fill="#3b3b4d" />
            </g>
          )}
          {e.eyes === 'tired' && (
            <>
              <path d="M54 55 q6 4 12 0" stroke="#3b3b4d" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M74 55 q6 4 12 0" stroke="#3b3b4d" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          )}
          {e.eyes === 'squeeze' && (
            <>
              <path d="M54 53 l11 4" stroke="#3b3b4d" strokeWidth="3" strokeLinecap="round" />
              <path d="M86 53 l-11 4" stroke="#3b3b4d" strokeWidth="3" strokeLinecap="round" />
            </>
          )}
          {e.eyes === 'happy' && (
            <>
              <path d="M55 57 q5 -6 11 0" stroke="#3b3b4d" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M74 57 q5 -6 11 0" stroke="#3b3b4d" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          )}

          {e.tear && <circle cx="86" cy="66" r="3" fill="#7ec8f2" className="anim-float" />}

          {ap.glasses && (
            <g stroke="#5a5a66" strokeWidth="2" fill="none">
              <circle cx="60" cy="55" r="8" />
              <circle cx="80" cy="55" r="8" />
              <line x1="68" y1="55" x2="72" y2="55" />
            </g>
          )}

          <Mouth kind={e.mouth} />
          <Overlay state={bodyStateFor(patient)} skin={ap.skin} />
        </svg>
      </div>

      {speakOnTap && (
        <span
          className="absolute -top-1 -left-1 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-sm"
          style={{ width: Math.round(size * 0.2), height: Math.round(size * 0.2), fontSize: Math.round(size * 0.12) }}
        >
          🔊
        </span>
      )}
    </div>
  );
}
