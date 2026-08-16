import { useState } from 'react';
import { API_URL } from '../utils/api.js';

const ROLES = [
  { id: 'secretaria', label: '👩‍💼 Secretária' },
  { id: 'medica', label: '👨‍⚕️ Médica' },
  { id: 'enfermeira', label: '👩‍⚕️ Enfermeira' }
];

export default function Setup({ sessionId, onDone }) {
  const [players, setPlayers] = useState(1);
  const [roles, setRoles] = useState([]);
  const [busy, setBusy] = useState(false);

  const setCount = (n) => {
    setPlayers(n);
    setRoles((prev) => prev.slice(0, n));
  };

  const toggleRole = (id) => {
    setRoles((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id);
      if (prev.length >= players) return [...prev.slice(1), id]; // mantém as últimas N
      return [...prev, id];
    });
  };

  const cpuRoles = ROLES.filter((r) => !roles.includes(r.id)).map((r) => r.label);

  const confirm = async () => {
    if (roles.length !== players) return;
    setBusy(true);
    try {
      await fetch(`${API_URL}/sessions/${sessionId}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players, humanRoles: roles })
      });
      onDone({ players, humanRoles: roles });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-1 text-center text-3xl font-bold">🏥 Quem vai jogar?</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Os papéis que ninguém escolher são feitos pelo computador 🤖
        </p>

        <label className="mb-2 block text-sm font-semibold">Quantas jogadoras?</label>
        <div className="mb-6 flex gap-3">
          {[1, 2].map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`btn flex-1 py-4 text-lg ${
                players === n
                  ? 'bg-gradient-to-r from-hospital-pink to-pink-500 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              {n} {n === 1 ? 'jogadora' : 'jogadoras'}
            </button>
          ))}
        </div>

        <label className="mb-2 block text-sm font-semibold">
          Escolhe {players === 1 ? 'o teu papel' : 'os 2 papéis'} ({roles.length}/{players})
        </label>
        <div className="mb-4 space-y-2">
          {ROLES.map((r) => {
            const selected = roles.includes(r.id);
            return (
              <button
                key={r.id}
                onClick={() => toggleRole(r.id)}
                className={`btn w-full py-3 text-left text-lg ${
                  selected
                    ? 'bg-gradient-to-r from-hospital-cyan to-blue-400 text-white'
                    : 'bg-white text-gray-700'
                }`}
              >
                {selected ? '✓ ' : ''}
                {r.label}
              </button>
            );
          })}
        </div>

        {cpuRoles.length > 0 && roles.length === players && (
          <p className="mb-4 rounded-xl bg-yellow-50 p-2 text-center text-sm text-yellow-800">
            🤖 O computador faz: {cpuRoles.join(', ')}
          </p>
        )}

        <button
          onClick={confirm}
          disabled={busy || roles.length !== players}
          className="btn w-full bg-gradient-to-r from-green-400 to-green-500 py-3 text-white hover:shadow-lg disabled:opacity-40"
        >
          {busy ? 'A preparar...' : '✓ Começar!'}
        </button>
      </div>
    </div>
  );
}
