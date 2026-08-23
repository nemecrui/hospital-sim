import { useState } from 'react';
import { API_URL } from '../utils/api.js';
import AdminPanel from '../components/AdminPanel.jsx';

export default function Home({ onSessionReady }) {
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [taps, setTaps] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [mode, setMode] = useState('hospital');

  const secretTap = () => {
    const n = taps + 1;
    setTaps(n);
    if (n >= 5) setShowCode(true);
  };

  const tryAdmin = () => {
    if (adminCode.trim() === '1986') {
      setShowAdmin(true);
      setShowCode(false);
      setAdminCode('');
      setTaps(0);
    } else {
      setError('Código de admin errado.');
    }
  };

  if (showAdmin) {
    return <AdminPanel code="1986" onClose={() => setShowAdmin(false)} />;
  }

  const createSession = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
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
        <h1
          className="mb-2 cursor-pointer select-none text-center text-4xl font-bold"
          onClick={secretTap}
          title=""
        >
          🏥 Hospital
        </h1>
        <p className="mb-4 text-center text-gray-500">Escolhe o teu jogo</p>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => setMode('hospital')}
            className={`btn py-4 text-lg ${
              mode === 'hospital' ? 'bg-gradient-to-r from-hospital-pink to-pink-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            🏥 Hospital
          </button>
          <button
            onClick={() => setMode('vet')}
            className={`btn py-4 text-lg ${
              mode === 'vet' ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            🐾 Veterinário
          </button>
        </div>

        <button
          onClick={createSession}
          disabled={busy}
          className="btn mb-6 w-full bg-gradient-to-r from-hospital-cyan to-blue-400 py-4 text-lg text-white hover:shadow-lg disabled:opacity-50"
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

        {showCode && (
          <div className="mt-4 rounded-xl bg-gray-100 p-3">
            <label className="mb-1 block text-xs font-semibold text-gray-600">Código secreto</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                type="password"
                inputMode="numeric"
                placeholder="••••"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && tryAdmin()}
              />
              <button onClick={tryAdmin} className="btn bg-gray-700 px-4 text-white">
                Entrar
              </button>
            </div>
          </div>
        )}

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
