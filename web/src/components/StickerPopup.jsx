import { useContext, useEffect, useRef, useState } from 'react';
import { HospitalContext } from '../context/HospitalContext.jsx';
import Confetti from './Confetti.jsx';

// Popup que aparece a TODOS os jogadores quando alguém ganha um cromo.
export default function StickerPopup() {
  const { session } = useContext(HospitalContext);
  const [show, setShow] = useState(null);
  const lastTs = useRef(0);

  const st = session?.lastStickerObj;

  useEffect(() => {
    if (!st?.ts) return;
    // Na primeira vez apenas guardamos a referência (não mostra cromos antigos)
    if (lastTs.current === 0) {
      lastTs.current = st.ts;
      return;
    }
    if (st.ts <= lastTs.current) return;
    lastTs.current = st.ts;
    setShow(st);
    const t = setTimeout(() => setShow(null), 4000);
    return () => clearTimeout(t);
  }, [st?.ts]);

  if (!show) return null;
  return (
    <>
      <Confetti show />
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/20 p-4"
        onClick={() => setShow(null)}
      >
        <div className="card animate-pop max-w-xs p-6 text-center">
          <p className="text-sm text-gray-500">Novo autocolante! 🎉</p>
          <div className="my-2 text-7xl">{show.emoji}</div>
          <p className="text-lg font-bold">{show.name}</p>
          {show.by && <p className="mt-1 text-xs text-gray-400">Ganho por {show.by}</p>}
        </div>
      </div>
    </>
  );
}
