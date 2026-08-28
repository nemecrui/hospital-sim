import icons from '../data/icons.json';
import { speak, speakAs } from '../utils/tts.js';
import Character from './Character.jsx';
import SpeechBubble from './SpeechBubble.jsx';

// Mostra a queixa (com imagem), a historinha do doente e um botão para ouvir tudo.
export default function QueixaChips({ queixas = [], name, story, label = 'Queixa', patient, mode }) {
  const list = queixas.length ? queixas : ['—'];

  const readAloud = () => {
    // Voz por idade/espécie quando temos o doente; senão, voz simples.
    if (patient) {
      speakAs(patient, mode);
      return;
    }
    const parte = queixas.length ? queixas.join(', ') : 'nada de especial';
    speak(`Olá, sou ${name || 'o doente'}. Tenho ${parte}. ${story || ''}`);
  };

  return (
    <div>
      {patient && (
        <div className="mb-3 flex items-center gap-3">
          <Character patient={patient} mode={mode} size={72} />
          <SpeechBubble patient={patient} mode={mode} />
        </div>
      )}

      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <button
          onClick={readAloud}
          className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-200"
          title="Ouvir"
        >
          🔊 Ouvir
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {list.map((q, i) => (
          <span key={i} className="flex items-center gap-1 rounded-2xl bg-pink-50 px-3 py-2 text-base">
            <span className="text-2xl">{icons[q] || '❓'}</span>
            <span>{q}</span>
          </span>
        ))}
      </div>

      {story && (
        <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">
          📖 {story}
        </p>
      )}
    </div>
  );
}
