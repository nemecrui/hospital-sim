import { useEffect, useState } from 'react';
import facts from '../data/facts.json';
import { speakTip } from '../utils/tts.js';

// Curiosidade educativa que vai rodando devagarinho (com voz das dicas).
export default function DidYouKnow() {
  const [i, setI] = useState(() => Math.floor(Math.random() * facts.length));

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % facts.length), 12000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <span>
        💡 <strong>Sabias que…</strong> {facts[i]}
      </span>
      <button
        onClick={() => speakTip(facts[i])}
        className="shrink-0 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900 hover:bg-amber-300"
        title="Ouvir a dica"
      >
        🔊
      </button>
    </div>
  );
}
