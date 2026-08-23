import { useEffect, useState } from 'react';
import { API_URL } from '../utils/api.js';

const ROLE_LABEL = {
  secretaria: 'Secretária',
  medica: 'Médica',
  enfermeira: 'Enfermeira',
  tad: 'Técnico (TAS)'
};

export default function AdminPanel({ code, onClose }) {
  const [plays, setPlays] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/admin/plays?code=${encodeURIComponent(code)}`);
        if (!res.ok) throw new Error();
        setPlays(await res.json());
      } catch {
        setError('Não consegui carregar (código errado?).');
      }
    })();
  }, [code]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-2xl p-6">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">🔐 Painel de Admin</h1>
          <button onClick={onClose} className="btn bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-100">
            ← Sair
          </button>
        </div>

        {error && <p className="text-sm text-hospital-danger">{error}</p>}
        {!plays && !error && <p className="text-sm text-gray-400">A carregar…</p>}

        {plays && (
          <>
            <p className="mb-2 text-xs text-gray-500">{plays.length} jogada(s) registada(s)</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-gray-400">
                    <th className="p-1">Nome</th>
                    <th className="p-1">Profissão</th>
                    <th className="p-1">Sala</th>
                    <th className="p-1">Data/hora</th>
                  </tr>
                </thead>
                <tbody>
                  {plays.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100">
                      <td className="p-1 font-semibold">{p.name}</td>
                      <td className="p-1">{ROLE_LABEL[p.role] || p.role}</td>
                      <td className="p-1">{p.code || '—'}</td>
                      <td className="p-1 text-gray-500">{new Date(p.createdAt).toLocaleString('pt-PT')}</td>
                    </tr>
                  ))}
                  {plays.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-2 text-center text-gray-400">
                        Ainda ninguém jogou.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
