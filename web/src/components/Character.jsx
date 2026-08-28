import { avatarFor, moodFor } from '../utils/characters.js';
import { speakAs } from '../utils/tts.js';

// A "cara" viva do doente: avatar que anima conforme o humor + emoji de emoção.
// `bump` (número): sempre que muda, a personagem dá um saltinho de reação.
// `speakOnTap`: tocar na personagem fá-la falar a queixa (voz por idade/espécie).
export default function Character({ patient, mode, size = 64, showMood = true, bump = 0, speakOnTap = true }) {
  const avatar = avatarFor(patient, mode);
  const mood = moodFor(patient);

  const onTap = speakOnTap
    ? (e) => {
        e.stopPropagation();
        speakAs(patient, mode);
      }
    : undefined;

  return (
    <div
      className={`relative shrink-0 ${speakOnTap ? 'cursor-pointer' : ''}`}
      style={{ width: size, height: size }}
      onClick={onTap}
      role={speakOnTap ? 'button' : undefined}
      title={speakOnTap ? 'Toca para ouvir' : mood.label}
    >
      {/* camada do saltinho: remonta quando `bump` muda, para repetir a animação */}
      <div key={bump} className={`h-full w-full ${bump ? 'anim-hop' : ''}`}>
        <div
          className={`flex h-full w-full items-center justify-center rounded-2xl bg-white/70 anim-${mood.anim} transition-transform hover:scale-105`}
          style={{ fontSize: Math.round(size * 0.6), lineHeight: 1 }}
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

      {speakOnTap && (
        <span
          className="absolute -top-1 -left-1 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-sm"
          style={{ width: Math.round(size * 0.3), height: Math.round(size * 0.3), fontSize: Math.round(size * 0.18) }}
        >
          🔊
        </span>
      )}
    </div>
  );
}
