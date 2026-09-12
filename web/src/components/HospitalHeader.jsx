import { useEffect, useState } from 'react';
import { currentTheme } from '../utils/theme.js';

// Banner do hospital com relógio (avança sozinho — decorativo) e tema sazonal.
export default function HospitalHeader({ title = '🏥 Hospital dos Amiguinhos' }) {
  const [min, setMin] = useState(8 * 60); // começa às 08:00
  const theme = currentTheme();

  useEffect(() => {
    const t = setInterval(() => setMin((m) => (m + 1) % (24 * 60)), 1500);
    return () => clearInterval(t);
  }, []);

  const hh = String(Math.floor(min / 60)).padStart(2, '0');
  const mm = String(min % 60).padStart(2, '0');

  return (
    <div className={`mb-3 flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r ${theme.from} ${theme.to} px-4 py-2 text-white shadow`}>
      <span className="font-bold">
        {theme.emoji ? `${theme.emoji} ` : ''}
        {title}
      </span>
      <span className="flex items-center gap-2">
        {theme.deco.length > 0 && (
          <span className="hidden text-lg sm:inline" aria-hidden="true">
            {theme.deco.join(' ')}
          </span>
        )}
        <span className="rounded-full bg-white/25 px-2 py-0.5 text-sm font-semibold">
          ⏰ {hh}:{mm}
        </span>
      </span>
    </div>
  );
}
