import { useContext, useEffect, useRef, useState } from 'react';
import { HospitalContext } from '../context/HospitalContext.jsx';
import { speakTip } from '../utils/tts.js';

// Mascote do hospital: dá as boas-vindas, anima a equipa e festeja as curas.
export default function Mascot({ mode }) {
  const { patients } = useContext(HospitalContext);
  const vet = mode === 'vet';

  const greet = vet ? 'Olá! Bem-vindos à clínica dos bichinhos! 🐾' : 'Olá! Bem-vindos ao nosso hospital! 🏥';
  const idle = vet
    ? ['Estás a cuidar tão bem dos bichinhos! 💪', 'A melhor clínica de sempre! 🌟', 'Cada animal merece um miminho 💗', 'Ele vai ficar ótimo! 🍀', 'Uma festinha cura metade! 😊']
    : ['Estás a fazer um ótimo trabalho! 💪', 'A nossa equipa é a melhor! 🌟', 'Cuida bem de cada doente 💗', 'Vais ver que ele fica bom! 🍀', 'Um sorriso cura metade! 😊'];
  const cheers = ['Boa! Mais um curado! 🎉', 'Que equipa incrível! 👏', 'Mais um amiguinho feliz! 💚', 'Uau, conseguiram! 🥳'];

  const [msg, setMsg] = useState(greet);
  const [celebrate, setCelebrate] = useState(false);
  const [hidden, setHidden] = useState(false);
  const prevDone = useRef(null);

  // Rotação de incentivos
  useEffect(() => {
    const t = setInterval(() => {
      setCelebrate(false);
      setMsg(idle[Math.floor(Math.random() * idle.length)]);
    }, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Festeja quando alguém é curado (nº de altas sobe)
  useEffect(() => {
    const done = (patients || []).filter((p) => p.status === 'discharged').length;
    if (prevDone.current === null) {
      prevDone.current = done;
      return;
    }
    if (done > prevDone.current) {
      setCelebrate(true);
      setMsg(cheers[Math.floor(Math.random() * cheers.length)]);
      const t = setTimeout(() => setCelebrate(false), 3500);
      prevDone.current = done;
      return () => clearTimeout(t);
    }
    prevDone.current = done;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patients]);

  if (hidden) {
    return (
      <div className="pointer-events-none fixed bottom-6 left-2 z-40">
        <button
          onClick={() => setHidden(false)}
          className="pointer-events-auto text-3xl opacity-70 anim-float"
          title="Mostrar o mascote"
          aria-label="Mostrar o mascote"
        >
          🧸
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed bottom-6 left-2 z-40 flex items-end gap-2">
      <button
        onClick={() => speakTip(msg)}
        className={`pointer-events-auto text-4xl ${celebrate ? 'anim-hop' : 'anim-float'}`}
        title="Toca no mascote"
        aria-label="Mascote — toca para ouvir"
      >
        🧸
      </button>
      <div
        onClick={() => speakTip(msg)}
        title="Toca para ouvir"
        className="anim-bubble pointer-events-auto relative mb-1 max-w-[220px] cursor-pointer rounded-2xl rounded-bl-sm bg-white px-3 py-1.5 pr-6 text-sm font-semibold text-gray-700 shadow-md ring-1 ring-black/5"
      >
        {msg}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setHidden(true);
          }}
          className="absolute right-1 top-0.5 text-xs text-gray-300 hover:text-gray-500"
          title="Esconder"
          aria-label="Esconder o mascote"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
