import { useEffect, useState } from 'react';

// Banner do hospital com relógio (avança sozinho — decorativo).
export default function HospitalHeader() {
  const [min, setMin] = useState(8 * 60); // começa às 08:00

  useEffect(() => {
    const t = setInterval(() => setMin((m) => (m + 1) % (24 * 60)), 1500);
    return () => clearInterval(t);
  }, []);

  const hh = String(Math.floor(min / 60)).padStart(2, '0');
  const mm = String(min % 60).padStart(2, '0');

  return (
    <div className="mb-3 flex items-center justify-between rounded-2xl bg-gradient-to-r from-hospital-pink to-hospital-cyan px-4 py-2 text-white shadow">
      <span className="font-bold">🏥 Hospital dos Amiguinhos</span>
      <span className="rounded-full bg-white/25 px-2 py-0.5 text-sm font-semibold">
        ⏰ {hh}:{mm}
      </span>
    </div>
  );
}
