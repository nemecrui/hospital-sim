import { useContext } from 'react';
import { HospitalContext } from '../context/HospitalContext.jsx';

// Barra do objetivo comum do dia (partilhada por todas as jogadoras).
export default function GoalBar({ target = 8 }) {
  const { patients } = useContext(HospitalContext);
  const curados = patients.filter((p) => p.status === 'discharged').length;
  const pct = Math.min(100, Math.round((curados / target) * 100));
  const feito = curados >= target;

  return (
    <div className="mb-3 rounded-2xl bg-white/70 p-2 shadow-sm">
      <div className="mb-1 flex items-center justify-between text-xs font-semibold">
        <span>🎯 Meta do dia: curar {target} doentes juntas</span>
        <span>{feito ? '🎉 Conseguimos!' : `${curados}/${target}`}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full transition-all duration-500 ${feito ? 'bg-green-500' : 'bg-gradient-to-r from-hospital-pink to-hospital-cyan'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
