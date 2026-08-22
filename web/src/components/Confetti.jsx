import { useMemo } from 'react';

const EMOJIS = ['🎉', '⭐', '🎊', '🌈', '💫', '🎈', '💛'];

// Chuva de confetti por cima de tudo. Mostra enquanto `show` for true.
export default function Confetti({ show }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 30 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 1.8 + Math.random() * 1.4,
        size: 1.2 + Math.random() * 1.4,
        e: EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
      })),
    // recria os confettis sempre que passa a mostrar
    [show]
  );

  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-6vh',
            fontSize: `${p.size}rem`,
            animation: `confetti-fall ${p.dur}s linear ${p.delay}s forwards`
          }}
        >
          {p.e}
        </span>
      ))}
    </div>
  );
}
