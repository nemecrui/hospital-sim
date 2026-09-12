import { useEffect, useRef, useState } from 'react';
import { speakTip } from '../utils/tts.js';
import { playSound } from '../utils/sound.js';

// 👵👴 Visitas da família: aparecem de vez em quando só para dar um miminho
// e trazer o lanchinho. NÃO são doentes — não entram na fila nem nos
// tratamentos; aparecem, dizem olá e vão-se embora. Tudo no cliente.

const VISITORS = [
  { name: 'Avô Xavier', emoji: '👴' },
  { name: 'Avó Rosa', emoji: '👵' },
  { name: 'Avó Ana', emoji: '👵' },
  { name: 'Avô João', emoji: '👴' },
  { name: 'Tia Fatinha', emoji: '👩' }
];
const SNACKS = ['🥪', '🍪', '🧃', '🍎', '🍰', '🥛', '🍫', '🍉', '🍇', '🧀'];

const pick = (a) => a[Math.floor(Math.random() * a.length)];

function greetingFor(v) {
  const snack = pick(SNACKS);
  return pick([
    `Olá! Sou ${v.name}. Vim só ver se está tudo bem por aqui! 💗`,
    `${v.name} passou para trazer um lanchinho: ${snack}! Que equipa tão boa! 😋`,
    `Está tudo a correr bem? Trouxe-vos ${snack} para ganharem forças! 💪`,
    `Vim dar um miminho à equipa e deixar ${snack}. Continuem assim! 🌟`,
    `${v.name} veio só dar um beijinho e ver como vão as coisas. 😘`
  ]);
}

export default function Visitor() {
  const [visit, setVisit] = useState(null); // { v, msg }
  const timers = useRef([]);

  useEffect(() => {
    let alive = true;
    const clearAll = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };

    const show = () => {
      if (!alive) return;
      const v = pick(VISITORS);
      setVisit({ v, msg: greetingFor(v) });
      playSound('notification');
      // fica ~8s e depois vai-se embora
      timers.current.push(setTimeout(() => alive && setVisit(null), 8000));
      // agenda a próxima visita daqui a 1m30 a 3m
      timers.current.push(setTimeout(show, 90000 + Math.random() * 90000));
    };

    // primeira visita entre 30s e 60s depois de entrar
    timers.current.push(setTimeout(show, 30000 + Math.random() * 30000));
    return () => {
      alive = false;
      clearAll();
    };
  }, []);

  if (!visit) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 right-3 z-40 flex max-w-[260px] items-end gap-2 sm:bottom-6">
      <div className="anim-bubble pointer-events-auto relative mb-1 rounded-2xl rounded-br-sm bg-white px-3 py-2 pr-6 text-sm font-semibold text-gray-700 shadow-md ring-1 ring-black/5">
        <span onClick={() => speakTip(visit.msg)} title="Toca para ouvir" className="cursor-pointer">
          {visit.msg}
        </span>
        <button
          onClick={() => setVisit(null)}
          className="absolute right-1 top-0.5 text-xs text-gray-300 hover:text-gray-500"
          title="Adeus!"
          aria-label="Fechar visita"
        >
          ✕
        </button>
      </div>
      <button
        onClick={() => speakTip(visit.msg)}
        className="anim-walkin pointer-events-auto text-4xl"
        title={`${visit.v.name} veio visitar`}
        aria-label={`${visit.v.name} — toca para ouvir`}
      >
        {visit.v.emoji}
      </button>
    </div>
  );
}
