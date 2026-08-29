import { useEffect, useState } from 'react';
import { API_URL } from '../utils/api.js';

const ROLE_LABEL = {
  secretaria: 'Secretária',
  medica: 'Médica',
  enfermeira: 'Enfermeira',
  tad: 'Técnico (TAS)'
};

function Kpi({ emoji, label, value, color }) {
  return (
    <div className="rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-black/5">
      <div className="text-2xl">{emoji}</div>
      <div className={`text-2xl font-bold ${color}`}>{value ?? 0}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

// Gráfico de barras simples (últimos 14 dias): visitas + jogos
function Bars({ daily = [] }) {
  const data = daily.slice(-14);
  const max = Math.max(1, ...data.map((d) => Math.max(d.visit, d.session)));
  return (
    <div>
      <div className="mb-1 flex gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-hospital-cyan" /> Visitas</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-hospital-pink" /> Jogos</span>
      </div>
      <div className="flex h-28 items-end gap-1">
        {data.map((d) => (
          <div key={d.day} className="flex flex-1 flex-col items-center justify-end gap-0.5" title={`${d.day} · ${d.visit} visitas · ${d.session} jogos`}>
            <div className="flex w-full items-end justify-center gap-0.5" style={{ height: '100%' }}>
              <div className="w-1/2 rounded-t bg-hospital-cyan" style={{ height: `${(d.visit / max) * 100}%` }} />
              <div className="w-1/2 rounded-t bg-hospital-pink" style={{ height: `${(d.session / max) * 100}%` }} />
            </div>
            <span className="text-[8px] text-gray-400">{d.day.slice(8)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPanel({ code, onClose }) {
  const [plays, setPlays] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [rp, rs] = await Promise.all([
          fetch(`${API_URL}/admin/plays?code=${encodeURIComponent(code)}`),
          fetch(`${API_URL}/admin/stats?code=${encodeURIComponent(code)}`)
        ]);
        if (!rp.ok) throw new Error();
        setPlays(await rp.json());
        if (rs.ok) setStats(await rs.json());
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

        {stats && (
          <div className="mb-5">
            <h2 className="mb-2 text-sm font-bold text-gray-600">📊 Estatísticas</h2>
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Kpi emoji="👀" label="Visitas" value={stats.totals.visits} color="text-hospital-cyan" />
              <Kpi emoji="🎮" label="Jogos" value={stats.totals.sessions} color="text-hospital-pink" />
              <Kpi emoji="💚" label="Curas" value={stats.totals.cures} color="text-green-600" />
              <Kpi emoji="📲" label="Instalações" value={stats.totals.installs} color="text-indigo-600" />
            </div>

            <div className="rounded-2xl bg-gray-50 p-3">
              <Bars daily={stats.daily} />
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                <div className="mb-1 text-xs font-bold uppercase text-gray-400">Papéis escolhidos</div>
                {['secretaria', 'medica', 'enfermeira', 'tad'].map((r) => (
                  <div key={r} className="flex justify-between">
                    <span>{ROLE_LABEL[r]}</span>
                    <span className="font-semibold">{stats.byRole?.[r] || 0}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5">
                <div className="mb-1 text-xs font-bold uppercase text-gray-400">Modo de jogo</div>
                <div className="flex justify-between"><span>🏥 Hospital</span><span className="font-semibold">{stats.byMode?.hospital || 0}</span></div>
                <div className="flex justify-between"><span>🐾 Veterinário</span><span className="font-semibold">{stats.byMode?.vet || 0}</span></div>
              </div>
            </div>
          </div>
        )}

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
