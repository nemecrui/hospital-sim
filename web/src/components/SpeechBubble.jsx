import { speechFor } from '../utils/characters.js';

// Balão de fala com o que a personagem está a dizer (feitio × estado).
export default function SpeechBubble({ patient, mode, className = '' }) {
  const line = speechFor(patient, mode);
  if (!line) return null;

  return (
    <div className={`anim-bubble relative inline-block max-w-full rounded-2xl rounded-bl-sm bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-black/5 ${className}`}>
      {/* biquinho do balão */}
      <span className="absolute -bottom-1 left-3 h-3 w-3 rotate-45 bg-white ring-1 ring-black/5"></span>
      <span className="relative">💬 {line}</span>
    </div>
  );
}
