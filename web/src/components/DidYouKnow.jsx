import { useEffect, useState } from 'react';
import facts from '../data/facts.json';

// Curiosidade educativa que vai rodando devagarinho.
export default function DidYouKnow() {
  const [i, setI] = useState(() => Math.floor(Math.random() * facts.length));

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % facts.length), 12000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mb-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
      💡 <strong>Sabias que…</strong> {facts[i]}
    </div>
  );
}
