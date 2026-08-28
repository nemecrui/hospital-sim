import { useEffect, useState } from 'react';

let uid = 0;

// Pequena chuva de emojis a subir (corações, estrelas), disparada quando
// `trigger` muda de valor. Usa-se por cima de uma personagem (container relativo).
export default function Reaction({ trigger, emojis = ['❤️'], count = 5 }) {
  const [parts, setParts] = useState([]);

  useEffect(() => {
    if (!trigger) return;
    const batch = Array.from({ length: count }, () => ({
      id: ++uid,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      left: 8 + Math.random() * 78,
      delay: Math.random() * 0.25,
      dur: 0.9 + Math.random() * 0.5
    }));
    setParts((p) => [...p, ...batch]);
    const t = setTimeout(() => {
      const ids = new Set(batch.map((b) => b.id));
      setParts((p) => p.filter((x) => !ids.has(x.id)));
    }, 1700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-visible">
      {parts.map((p) => (
        <span
          key={p.id}
          className="anim-floatup absolute text-xl"
          style={{
            left: `${p.left}%`,
            bottom: '30%',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
