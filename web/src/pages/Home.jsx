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

  const joinSession = async () => {
    if (!joinCode.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/sessions/${joinCode.trim()}`);
      if (!res.ok) throw new Error();
      onSessionReady(joinCode.trim());
    } catch {
      setError('Código de sessão não encontrado.');
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
          placeholder="Cola aqui o código da sessão"
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
      </div>
    </div>
  );
}
