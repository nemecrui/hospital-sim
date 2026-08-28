import { avatarFor, moodFor, bodyStateFor } from '../utils/characters.js';
import { speakAs } from '../utils/tts.js';

const SK = '#FBD3A6';
const HAIR = '#6B4A2B';
const PANTS = '#3E7BFA';
const CAST = '#EDEEF2';
const CASTL = '#C9CDD6';
const SPOT = '#E5484D';
const CHEEK = '#FF7A9A';

// Olhos por expressão
function Eyes({ kind }) {
  if (kind === 'tired')
    return (
      <>
        <path d="M53 54 q6 4 12 0" stroke="#3b3b4d" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M75 54 q6 4 12 0" stroke="#3b3b4d" strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    );
  if (kind === 'squeeze')
    return (
      <>
        <path d="M53 52 l12 4" stroke="#3b3b4d" strokeWidth="3" strokeLinecap="round" />
        <path d="M87 52 l-12 4" stroke="#3b3b4d" strokeWidth="3" strokeLinecap="round" />
      </>
    );
  if (kind === 'happy')
    return (
      <>
        <path d="M54 55 q6 -6 12 0" stroke="#3b3b4d" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M74 55 q6 -6 12 0" stroke="#3b3b4d" strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    );
  return (
    <>
      <circle cx="60" cy="54" r="3.4" fill="#3b3b4d" />
      <circle cx="80" cy="54" r="3.4" fill="#3b3b4d" />
    </>
  );
}

function Mouth({ kind }) {
  if (kind === 'frown') return <path d="M62 72 q8 -7 16 0" stroke="#b5546a" strokeWidth="3" fill="none" strokeLinecap="round" />;
  if (kind === 'open') return <ellipse cx="70" cy="72" rx="6" ry="7" fill="#b5546a" />;
  if (kind === 'wavy') return <path d="M60 72 q5 5 10 0 q5 -5 10 0" stroke="#b5546a" strokeWidth="3" fill="none" strokeLinecap="round" />;
  if (kind === 'big') return <path d="M58 69 q12 12 24 0 q-12 4 -24 0z" fill="#b5546a" />;
  return <path d="M60 70 q10 9 20 0" stroke="#b5546a" strokeWidth="3" fill="none" strokeLinecap="round" />;
}

function Arms({ mode }) {
  if (mode === 'belly')
    return (
      <>
        <path d="M46 100 q-14 20 22 30" stroke={SK} strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M94 100 q14 20 -22 30" stroke={SK} strokeWidth="14" fill="none" strokeLinecap="round" />
      </>
    );
  if (mode === 'head')
    return (
      <>
        <path d="M46 100 q-16 -18 4 -34" stroke={SK} strokeWidth="13" fill="none" strokeLinecap="round" />
        <path d="M94 100 q16 -18 -4 -34" stroke={SK} strokeWidth="13" fill="none" strokeLinecap="round" />
      </>
    );
  if (mode === 'ear')
    return (
      <>
        <rect x="30" y="98" width="13" height="50" rx="6.5" fill={SK} />
        <path d="M94 100 q18 -12 -2 -40" stroke={SK} strokeWidth="13" fill="none" strokeLinecap="round" />
      </>
    );
  if (mode === 'cheek')
    return (
      <>
        <rect x="30" y="98" width="13" height="50" rx="6.5" fill={SK} />
        <path d="M94 100 q16 -6 -6 -30" stroke={SK} strokeWidth="13" fill="none" strokeLinecap="round" />
      </>
    );
  return (
    <>
      <rect x="30" y="98" width="13" height="50" rx="6.5" fill={SK} />
      <rect x="97" y="98" width="13" height="50" rx="6.5" fill={SK} />
    </>
  );
}

// Configuração por estado: cor da camisola, olhos, boca, braços e extras
function stateConfig(state) {
  switch (state) {
    case 'healthy':
      return {
        shirt: '#FF6B9D',
        eyes: 'happy',
        mouth: 'big',
        arms: 'down',
        overlay: (
          <rect x="56" y="168" width="12" height="9" rx="2" fill="#FFE08A" stroke="#E0B84A" strokeWidth="1" transform="rotate(-20 62 172)" />
        )
      };
    case 'broken':
      return {
        shirt: '#FF6B9D',
        eyes: 'normal',
        mouth: 'frown',
        arms: 'down',
        overlay: (
          <>
            <rect x="53" y="150" width="18" height="46" rx="8" fill={CAST} stroke={CASTL} strokeWidth="2" />
            <line x1="55" y1="162" x2="69" y2="162" stroke={CASTL} strokeWidth="2" />
            <line x1="55" y1="172" x2="69" y2="172" stroke={CASTL} strokeWidth="2" />
            <line x1="55" y1="182" x2="69" y2="182" stroke={CASTL} strokeWidth="2" />
            <circle cx="86" cy="64" r="3" fill="#7ec8f2" />
          </>
        )
      };
    case 'fever':
      return {
        shirt: '#FF6B9D',
        eyes: 'tired',
        mouth: 'open',
        arms: 'down',
        overlay: (
          <>
            <circle cx="55" cy="64" r="6" fill={CHEEK} opacity="0.75" />
            <circle cx="85" cy="64" r="6" fill={CHEEK} opacity="0.75" />
            <circle cx="94" cy="40" r="4" fill="#7ec8f2" />
            <rect x="70" y="70" width="26" height="6" rx="3" fill="#C9CDD6" transform="rotate(12 70 72)" />
            <circle cx="95" cy="80" r="5" fill="#E5484D" />
          </>
        )
      };
    case 'belly':
      return {
        shirt: '#00C2D9',
        eyes: 'squeeze',
        mouth: 'wavy',
        arms: 'belly',
        overlay: <circle cx="70" cy="54" r="30" fill="#BFE3B0" opacity="0.35" />
      };
    case 'allergy':
      return {
        shirt: '#00C2D9',
        eyes: 'normal',
        mouth: 'frown',
        arms: 'down',
        overlay: (
          <>
            {[[58, 60], [82, 58], [70, 66], [50, 52], [90, 50], [64, 48], [76, 50]].map(([x, y], i) => (
              <circle key={`f${i}`} cx={x} cy={y} r="3.2" fill={SPOT} opacity="0.85" />
            ))}
            {[[36, 110], [38, 124], [104, 112], [102, 126]].map(([x, y], i) => (
              <circle key={`a${i}`} cx={x} cy={y} r="3" fill={SPOT} opacity="0.85" />
            ))}
          </>
        )
      };
    case 'cold':
      return {
        shirt: '#FFC93D',
        eyes: 'tired',
        mouth: 'frown',
        arms: 'down',
        overlay: (
          <>
            <circle cx="70" cy="66" r="5" fill="#FF7A6B" />
            <circle cx="55" cy="64" r="5" fill={CHEEK} opacity="0.6" />
            <circle cx="85" cy="64" r="5" fill={CHEEK} opacity="0.6" />
          </>
        )
      };
    case 'ear':
      return {
        shirt: '#00C2D9',
        eyes: 'squeeze',
        mouth: 'frown',
        arms: 'ear',
        overlay: (
          <>
            <path d="M96 52 q8 4 0 12" stroke="#E5484D" strokeWidth="3" fill="none" strokeLinecap="round" />
            <text x="100" y="42" fontSize="12" fill="#E5484D">!</text>
          </>
        )
      };
    case 'tooth':
      return {
        shirt: '#FF6B9D',
        eyes: 'squeeze',
        mouth: 'frown',
        arms: 'cheek',
        overlay: <circle cx="86" cy="70" r="7" fill={SK} />
      };
    case 'headache':
      return {
        shirt: '#FF6B9D',
        eyes: 'squeeze',
        mouth: 'frown',
        arms: 'head',
        overlay: (
          <>
            <path d="M40 34 l-6 -6 M44 30 l-4 -8" stroke="#E5484D" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M100 34 l6 -6 M96 30 l4 -8" stroke="#E5484D" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )
      };
    default: // generic
      return {
        shirt: '#8B7BE8',
        eyes: 'normal',
        mouth: 'frown',
        arms: 'down',
        overlay: <rect x="56" y="168" width="12" height="9" rx="2" fill="#FFE08A" stroke="#E0B84A" strokeWidth="1" transform="rotate(-20 62 172)" />
      };
  }
}

// Boneco de corpo inteiro (humanos). Nos animais, usa a cabeça grande (emoji).
export default function PatientBody({ patient, mode, size = 150, speakOnTap = true, bump = 0 }) {
  const mood = moodFor(patient);

  const onTap = speakOnTap
    ? (e) => {
        e.stopPropagation();
        speakAs(patient, mode);
      }
    : undefined;

  // Modo veterinário: mantém a cara grande do animal (corpos de bichos ficam para depois)
  if (mode === 'vet') {
    const avatar = avatarFor(patient, mode);
    return (
      <div
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

  const cfg = stateConfig(bodyStateFor(patient));
  const w = Math.round(size * (140 / 210));

  return (
    <div
      className={`relative shrink-0 ${speakOnTap ? 'cursor-pointer' : ''}`}
      style={{ width: w, height: size }}
      onClick={onTap}
      role={speakOnTap ? 'button' : undefined}
      title={speakOnTap ? 'Toca para ouvir' : mood.label}
    >
      <div key={bump} className={bump ? 'anim-hop' : ''}>
        <svg viewBox="0 0 140 210" width={w} height={size} className={`anim-${mood.anim}`}>
          {/* pernas */}
          <rect x="55" y="150" width="14" height="48" rx="7" fill={PANTS} />
          <rect x="71" y="150" width="14" height="48" rx="7" fill={PANTS} />
          <ellipse cx="62" cy="200" rx="10" ry="6" fill={SK} />
          <ellipse cx="78" cy="200" rx="10" ry="6" fill={SK} />
          {/* tronco */}
          <rect x="45" y="92" width="50" height="62" rx="20" fill={cfg.shirt} />
          <Arms mode={cfg.arms} />
          {/* pescoço */}
          <rect x="63" y="80" width="14" height="12" rx="4" fill={SK} />
          {/* cabeça */}
          <circle cx="70" cy="54" r="30" fill={SK} />
          <path d="M42 46 q28 -34 56 0 q-10 -12 -28 -12 q-18 0 -28 12z" fill={HAIR} />
          {cfg.overlay}
          <Eyes kind={cfg.eyes} />
          <Mouth kind={cfg.mouth} />
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
