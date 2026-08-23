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
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

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

  const deleteAll = async () => {
    if (!confirm('Apagar TODAS as sessões de toda a gente? Isto limpa tudo e não se pode desfazer.')) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`${API_URL}/sessions`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      localStorage.removeItem('sessionId');
      const body = await res.json().catch(() => ({}));
      setMsg(`✅ Apaguei ${body.deleted ?? 0} sessão(ões).`);
    } catch {
      setMsg('❌ Não consegui apagar as sessões.');
    } finally {
      setBusy(false);
    }
  };

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
            <p className="mb-2 text-xs text-gray-500">
              {plays.length} jogada(s) registada(s) · sem nomes, por privacidade
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-gray-400">
                    <th className="p-1">Profissão</th>
                    <th className="p-1">Sala</th>
                    <th className="p-1">Data/hora</th>
                  </tr>
                </thead>
                <tbody>
                  {plays.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100">
                      <td className="p-1 font-semibold">{ROLE_LABEL[p.role] || p.role}</td>
                      <td className="p-1">{p.code || '—'}</td>
                      <td className="p-1 text-gray-500">{new Date(p.createdAt).toLocaleString('pt-PT')}</td>
                    </tr>
                  ))}
                  {plays.length === 0 && (
                    <tr>
                      <td colSpan="3" className="p-2 text-center text-gray-400">
                        Ainda ninguém jogou.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <h2 className="mb-2 text-sm font-bold text-gray-600">🧹 Manutenção</h2>
              <button
                onClick={deleteAll}
                disabled={busy}
                className="btn bg-hospital-danger px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
              >
                {busy ? 'A apagar…' : 'Apagar todas as sessões'}
              </button>
              {msg && <p className="mt-2 text-sm text-gray-600">{msg}</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
