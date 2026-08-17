import icons from '../data/icons.json';
import { speak } from '../utils/tts.js';

// Mostra as queixas com imagem (emoji) + botão para ouvir em voz alta.
export default function QueixaChips({ queixas = [], name, label = 'Queixas' }) {
  const list = queixas.length ? queixas : ['—'];

  const readAloud = () => {
    const parte = queixas.length ? queixas.join(', ') : 'nada de especial';
    const frase = name ? `Olá, sou ${name}. Sinto ${parte}.` : `Sinto ${parte}.`;
    speak(frase);
  };

  return (
    <div>
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
          <span
            key={i}
            className="flex items-center gap-1 rounded-2xl bg-pink-50 px-3 py-2 text-base"
          >
            <span className="text-2xl">{icons[q] || '❓'}</span>
            <span>{q}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
