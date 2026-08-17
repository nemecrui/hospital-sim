import { useState } from 'react';
import { API_URL } from '../utils/api.js';

export default function Home({ onSessionReady }) {
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const createSession = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/sessions`, { method: 'POST' });
      if (!res.ok) throw new Error();
      const session = await res.json();
      onSessionReady(session.id);
    } catch {
      setError('Não consegui criar a sessão. O servidor está a correr?');
    } finally {
      setBusy(false);
    }
  };

  const deleteAll = async () => {
    if (!confirm('Apagar TODAS as sessões? Isto limpa tudo e não se pode desfazer.')) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/sessions`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      localStorage.removeItem('sessionId');
      const body = await res.json().catch(() => ({}));
      setError(`✅ Apaguei ${body.deleted ?? 0} sessão(ões).`);
    } catch {
      setError('Não consegui apagar as sessões.');
    } finally {
      setBusy(false);
    }
  };

  const joinSession = async () => {
    const code = joinCode.trim().toLowerCase();
    if (!code) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/sessions/by-code/${encodeURIComponent(code)}`);
      if (!res.ok) throw new Error();
      const session = await res.json();
      onSessionReady(session.id);
    } catch {
      setError('Não encontrei essa fruta. Confere com quem começou o jogo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-2 text-center text-4xl font-bold">🏥 Hospital</h1>
        <p className="mb-6 text-center text-gray-500">Simulador para brincar aos hospitais</p>

        <button
          onClick={createSession}
          disabled={busy}
          className="btn mb-6 w-full bg-gradient-to-r from-hospital-pink to-pink-500 py-4 text-lg text-white hover:shadow-lg disabled:opacity-50"
        >
          ✨ Começar um novo dia
        </button>

        <div className="mb-4 flex items-center gap-2 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          OU JUNTAR-ME A UM JOGO
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <input
          className="input mb-3"
          placeholder="Escreve a fruta (ex: morango)"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />
        <button
          onClick={joinSession}
          disabled={busy || !joinCode.trim()}
          className="btn w-full bg-gradient-to-r from-hospital-cyan to-blue-400 py-3 text-white hover:shadow-lg disabled:opacity-50"
        >
          🔗 Juntar-me
        </button>

        {error && <p className="mt-4 text-center text-sm text-hospital-danger">{error}</p>}

        <div className="mt-6 border-t border-gray-100 pt-3 text-center">
          <button
            onClick={deleteAll}
            disabled={busy}
            className="text-xs text-gray-400 hover:text-hospital-danger hover:underline disabled:opacity-50"
          >
            🧹 Apagar todas as sessões
          </button>
        </div>
      </div>
    </div>
  );
}
