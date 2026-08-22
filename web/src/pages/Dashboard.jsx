import { useContext } from 'react';
import { HospitalContext } from '../context/HospitalContext.jsx';
import { usePoll } from '../hooks/usePoll.js';
import PatientCard from '../components/PatientCard.jsx';
import Caderneta from '../components/Caderneta.jsx';

function Stat({ label, value, emoji }) {
  return (
    <div className="card flex-1 p-4 text-center">
      <div className="text-3xl">{emoji}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

const FLOW = [
  { key: 'triage', label: '🩺 Triagem' },
  { key: 'diagnosis', label: '🔍 Médica' },
  { key: 'exams', label: '🔬 Exames' },
  { key: 'treatment', label: '💊 Tratamento' },
  { key: 'discharge', label: '📤 Pronto p/ alta' },
  { key: 'discharged', label: '✅ Alta' }
];

export default function Dashboard() {
  const { patients, stats, session, pollPatients, pollStats, pollSession, resetSession } =
    useContext(HospitalContext);

  usePoll(() => {
    pollPatients();
    pollStats();
    pollSession();
  }, 2500);

  const discharged = patients.filter((p) => p.status === 'discharged');
  const satisfaction = stats?.satisfaction ?? 0;
  const stars = '⭐'.repeat(Math.round(satisfaction)) || '—';

  const handleReset = async () => {
    if (confirm('Começar um novo dia? Isto limpa os doentes atuais.')) {
      await resetSession();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">📈 Resumo do dia</h3>

      <div className="flex gap-3">
        <Stat label="Curados" value={stats?.totalTreated ?? 0} emoji="✅" />
        <Stat label="Espera média (min)" value={stats?.avgWaitTime ?? 0} emoji="⏱️" />
        <Stat label={`Satisfação ${stars}`} value={satisfaction} emoji="😊" />
      </div>

      {stats?.byStatus && (
        <div className="card p-4 text-sm">
          {FLOW.map((s) => (
            <div key={s.key} className="flex justify-between">
              <span>{s.label}</span>
              <strong>{stats.byStatus[s.key] ?? 0}</strong>
            </div>
          ))}
        </div>
      )}

      <div>
        <h4 className="mb-2 font-bold">📋 Histórico (altas)</h4>
        <div className="space-y-3">
          {discharged.length === 0 && (
            <p className="text-sm text-gray-400">Ainda ninguém teve alta hoje.</p>
          )}
          {discharged.map((p) => (
            <PatientCard key={p.id} patient={p} />
          ))}
        </div>
      </div>

      <Caderneta earned={session?.stickersList || []} />

      <button
        onClick={handleReset}
        className="btn w-full bg-gradient-to-r from-hospital-yellow to-yellow-500 py-3 text-white hover:shadow-lg"
      >
        🔄 Novo dia
      </button>
    </div>
  );
}
