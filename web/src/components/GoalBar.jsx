import { useContext, useEffect, useRef, useState } from 'react';
import { HospitalContext } from '../context/HospitalContext.jsx';
import { usePoll } from '../hooks/usePoll.js';
import Confetti from './Confetti.jsx';
import scenarios from '../data/scenarios.json';
import icons from '../data/icons.json';

function objText(obj) {
  if (!obj) return 'A preparar objetivo...';
  if (obj.type === 'disease') return `Curar ${obj.target} × ${obj.disease}`;
  return `Curar ${obj.target} doentes`;
}

// Barra de estado do dia: objetivo atual (ao vivo) + tema, partilhada por todas.
export default function GoalBar() {
  const { patients, session, pollSession } = useContext(HospitalContext);
  const [celebrate, setCelebrate] = useState(false);
  const lastId = useRef(null);

  usePoll(pollSession, 4000);

  const obj = session?.objectiveObj;
  const scen = scenarios.find((s) => s.id === session?.scenario);

  // Festa quando o objetivo muda (foi cumprido e surgiu um novo)
  useEffect(() => {
    if (!obj?.id) return;
    if (lastId.current === null) {
      lastId.current = obj.id;
      return;
    }
    if (obj.id !== lastId.current) {
      lastId.current = obj.id;
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 3500);
      return () => clearTimeout(t);
    }
  }, [obj?.id]);

  const discharged = patients.filter((p) => p.status === 'discharged');
  const qualifying =
    obj?.type === 'disease'
      ? discharged.filter((p) => p.diagnosis === obj.disease).length
      : discharged.length;
  const target = obj?.target || 1;
  const progress = obj ? Math.max(0, qualifying - (obj.startCount || 0)) : 0;
  const pct = Math.min(100, Math.round((progress / target) * 100));

  return (
    <>
      <Confetti show={celebrate} />
      <div className="mb-3 rounded-2xl bg-white/70 p-2 shadow-sm">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold">
          <span>
            🎯 {objText(obj)} {obj?.type === 'disease' ? icons[obj.disease] || '' : ''}
          </span>
          <span>{celebrate ? '🎉 Cumprido!' : `${progress}/${target}`}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-hospital-pink to-hospital-cyan transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {scen && (
          <div className="mt-1 text-[11px] text-gray-400">
            {scen.emoji} {scen.name}
          </div>
        )}
      </div>
    </>
  );
}
