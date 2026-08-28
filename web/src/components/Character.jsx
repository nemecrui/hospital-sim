import { avatarFor, moodFor } from '../utils/characters.js';

// A "cara" viva do doente: avatar que anima conforme o humor + emoji de emoção.
// `bump` (número): sempre que muda, a personagem dá um saltinho de reação.
export default function Character({ patient, mode, size = 64, showMood = true, bump = 0 }) {
  const avatar = avatarFor(patient, mode);
  const mood = moodFor(patient);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* camada do saltinho: remonta quando `bump` muda, para repetir a animação */}
      <div key={bump} className={`h-full w-full ${bump ? 'anim-hop' : ''}`}>
        <div
          className={`flex h-full w-full items-center justify-center rounded-2xl bg-white/70 anim-${mood.anim}`}
          style={{ fontSize: Math.round(size * 0.6), lineHeight: 1 }}
          title={mood.label}
        >
          {avatar}
        </div>
      </div>
      {showMood && (
        <span
          className="absolute -bottom-1 -right-1 drop-shadow-sm"
          style={{ fontSize: Math.round(size * 0.34) }}
        >
          {mood.badge}
        </span>
      )}
    </div>
  );
}
