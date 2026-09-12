import { useContext, useEffect, useRef, useState } from 'react';
import { HospitalContext } from '../context/HospitalContext.jsx';
import { speakTip } from '../utils/tts.js';

const NAME_KEY = 'mascotName';
function loadName() {
  try {
    return localStorage.getItem(NAME_KEY) || '';
  } catch {
    return '';
  }
}

// Mascote do hospital: dá as boas-vindas, anima a equipa e festeja as curas.
export default function Mascot({ mode }) {
  const { patients } = useContext(HospitalContext);
  const vet = mode === 'vet';

  const [name, setName] = useState(loadName());

  const greetFor = (n) =>
    n
      ? vet
        ? `Olá! Sou ${n}, o ajudante da clínica! 🐾`
        : `Olá! Sou ${n}, o vosso ajudante! 🏥`
      : vet
        ? 'Olá! Bem-vindos à clínica! 🐾 Dás-me um nome? Toca no ✏️'
        : 'Olá! Bem-vindos ao hospital! 🏥 Dás-me um nome? Toca no ✏️';

  const idle = vet
    ? ['Estás a cuidar tão bem dos bichinhos! 💪', 'A melhor clínica de sempre! 🌟', 'Cada animal merece um miminho 💗', 'Ele vai ficar ótimo! 🍀', 'Uma festinha cura metade! 😊']
    : ['Estás a fazer um ótimo trabalho! 💪', 'A nossa equipa é a melhor! 🌟', 'Cuida bem de cada doente 💗', 'Vais ver que ele fica bom! 🍀', 'Um sorriso cura metade! 😊'];
  const cheers = ['Boa! Mais um curado! 🎉', 'Que equipa incrível! 👏', 'Mais um amiguinho feliz! 💚', 'Uau, conseguiram! 🥳'];

  const [msg, setMsg] = useState(greetFor(name));
  const [celebrate, setCelebrate] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
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

  const saveName = () => {
    const n = draft.trim().slice(0, 20);
    setName(n);
    try {
      localStorage.setItem(NAME_KEY, n);
    } catch {
      /* ignore */
    }
    setEditing(false);
    if (n) {
      const hello = `Obrigado! Agora chamo-me ${n}! 💗`;
      setMsg(hello);
      speakTip(hello);
    } else {
      setMsg(greetFor(''));
    }
  };

  if (hidden) {
    return (
      <div className="pointer-events-none fixed bottom-6 left-2 z-40">
        <button
          onClick={() => setHidden(false)}
          className="pointer-events-auto anim-float text-3xl opacity-70"
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
      <div className="flex flex-col items-center">
        {name && <span className="pointer-events-none mb-0.5 rounded-full bg-white/90 px-2 text-[10px] font-bold text-hospital-pink shadow-sm">{name}</span>}
        <button
          onClick={() => speakTip(msg)}
          className={`pointer-events-auto text-4xl ${celebrate ? 'anim-hop' : 'anim-float'}`}
          title="Toca no mascote"
          aria-label="Mascote — toca para ouvir"
        >
          🧸
        </button>
      </div>

      <div className="anim-bubble pointer-events-auto relative mb-1 max-w-[240px] rounded-2xl rounded-bl-sm bg-white px-3 py-1.5 pr-6 text-sm font-semibold text-gray-700 shadow-md ring-1 ring-black/5">
        {editing ? (
          <div className="flex items-center gap-1 py-0.5">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveName()}
              placeholder="Nome do mascote"
              className="w-32 rounded-lg border border-gray-200 px-2 py-0.5 text-sm outline-none focus:border-hospital-pink"
            />
            <button onClick={saveName} className="rounded-lg bg-hospital-pink px-2 py-0.5 text-xs font-bold text-white">
              ✓
            </button>
          </div>
        ) : (
          <span onClick={() => speakTip(msg)} title="Toca para ouvir" className="cursor-pointer">
            {msg}
          </span>
        )}

        {/* renomear */}
        {!editing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDraft(name);
              setEditing(true);
            }}
            className="absolute -top-2 right-6 text-xs"
            title="Dar/mudar o nome"
            aria-label="Dar nome ao mascote"
          >
            ✏️
          </button>
        )}
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
