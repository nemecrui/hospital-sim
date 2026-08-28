import { useContext, useMemo, useState } from 'react';
import { HospitalContext } from '../context/HospitalContext.jsx';
import { usePoll } from '../hooks/usePoll.js';
import PatientCard from '../components/PatientCard.jsx';
import { getContent } from '../content.js';

const MAX_ACTIVE = 3;

export default function Secretaria({ mode }) {
  const content = getContent(mode);
  const { patients, pollPatients, registerPatient } = useContext(HospitalContext);
  const [arrival, setArrival] = useState(() => content.makeArrival());
  const [form, setForm] = useState({ name: '', age: '' });
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);

  usePoll(pollPatients, 2000);

  const active = useMemo(() => patients.filter((p) => p.status !== 'discharged'), [patients]);
  const salaCheia = active.length >= MAX_ACTIVE;

  const nextArrival = () => {
    setArrival(content.makeArrival());
    setForm({ name: '', age: '' });
    setFeedback(null);
  };

  // No modo vet o nome vem com emoji da espécie (ex: "🐶 Bobi").
  // Comparamos só a parte de texto e guardamos o nome completo (com emoji).
  const arrivalPlain = arrival.name.replace(/[^\p{L}\p{N} ]/gu, '').trim();
  const isVet = content.mode === 'vet';

  const handleRegister = async () => {
    if (!form.name || !form.age || busy) return;
    setBusy(true);
    const okName = form.name.trim().toLowerCase() === arrivalPlain.toLowerCase();
    const okAge = parseInt(form.age, 10) === arrival.age;
    const score = [okName, okAge].filter(Boolean).length;

    // Guarda o nome completo (com emoji do bicho) para manter a identidade.
    const nameToStore = isVet ? arrival.name : form.name.trim();
    const res = await registerPatient(nameToStore, parseInt(form.age, 10));
    setBusy(false);
    if (res.ok) {
      setFeedback({ score, okName, okAge });
      setTimeout(nextArrival, 2400);
    } else if (res.full) {
      setFeedback({ full: true });
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-3">
        {salaCheia ? (
          <div className="card p-6 text-center">
            <div className="text-4xl">⏳</div>
            <p className="mt-2 font-semibold">A sala está cheia!</p>
            <p className="text-sm text-gray-500">
              Espera que a equipa trate alguns doentes antes de receber mais.
            </p>
          </div>
        ) : (
          <>
            {/* Cartão de identificação do doente que chega */}
            <div key={`${arrival.name}-${arrival.age}`} className="card anim-walkin overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-400 px-4 py-2 text-sm font-bold text-white">
                🪪 CARTÃO DE IDENTIFICAÇÃO
              </div>
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-5xl">
                  {arrival.avatar}
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-400">Nome</div>
                  <div className="text-lg font-bold">{arrival.name}</div>
                  <div className="mt-1 text-xs uppercase text-gray-400">Idade</div>
                  <div className="text-lg font-bold">{arrival.age} anos</div>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400">
              👉 Copia os dados do cartão para a ficha.
            </p>
          </>
        )}
      </div>

      {/* Ficha de entrada (só nome + idade) */}
      <div className="card p-4">
        <h3 className="mb-3 text-lg font-bold">📝 Ficha de entrada</h3>

        <label className="mb-1 block text-sm font-semibold">Nome</label>
        <input
          className="input mb-3"
          placeholder="Escreve o nome..."
          value={form.name}
          disabled={salaCheia}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <label className="mb-1 block text-sm font-semibold">Idade</label>
        <input
          className="input mb-4"
          type="number"
          min="0"
          max="120"
          placeholder="Escreve a idade..."
          value={form.age}
          disabled={salaCheia}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />

        <button
          onClick={handleRegister}
          disabled={busy || salaCheia || !form.name || !form.age || (feedback && !feedback.full)}
          className="btn w-full bg-gradient-to-r from-hospital-pink to-pink-500 py-3 text-white hover:shadow-lg disabled:opacity-50"
        >
          {busy ? 'A registar...' : '✓ Enviar para a triagem'}
        </button>

        {feedback && !feedback.full && (
          <div className="mt-3 animate-pulse-success rounded-xl bg-green-50 p-3 text-center">
            <div className="text-2xl">{'⭐'.repeat(feedback.score) || '💪'}</div>
            <p className="text-sm font-semibold text-green-800">
              {feedback.score === 2 ? 'Perfeito! Foi para a triagem.' : 'Boa! Doente registado.'}
            </p>
            {feedback.score < 2 && (
              <p className="mt-1 text-xs text-gray-500">
                {!feedback.okName && `Nome: ${arrival.name}. `}
                {!feedback.okAge && `Idade: ${arrival.age}.`}
              </p>
            )}
          </div>
        )}

        <div className="mt-4">
          <h4 className="mb-2 text-sm font-bold">
            👥 Na sala ({active.length}/{MAX_ACTIVE})
          </h4>
          <div className="space-y-2">
            {active.length === 0 && (
              <p className="text-sm text-gray-400">Ainda não há doentes.</p>
            )}
            {active.map((p) => (
              <PatientCard key={p.id} patient={p} mode={mode} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
