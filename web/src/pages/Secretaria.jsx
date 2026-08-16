import { useContext, useState } from 'react';
import { HospitalContext } from '../context/HospitalContext.jsx';
import { usePoll } from '../hooks/usePoll.js';
import PatientCard from '../components/PatientCard.jsx';
import diagnoses from '../data/diagnoses.json';
import { generateArrival } from '../utils/generators.js';
import { playSound } from '../utils/sound.js';

export default function Secretaria() {
  const { patients, pollPatients, registerPatient, loading } = useContext(HospitalContext);
  const [arrival, setArrival] = useState(() => generateArrival());
  const [form, setForm] = useState({ name: '', age: '', symptom: '', urgency: 'normal' });
  const [feedback, setFeedback] = useState(null);

  usePoll(pollPatients, 2000);

  const nextArrival = () => {
    setArrival(generateArrival());
    setForm({ name: '', age: '', symptom: '', urgency: 'normal' });
    setFeedback(null);
  };

  const handleRegister = async () => {
    if (!form.name || !form.age) return;

    const okName = form.name.trim().toLowerCase() === arrival.name.toLowerCase();
    const okAge = parseInt(form.age, 10) === arrival.age;
    const okSymptom = form.symptom === arrival.symptom;
    const score = [okName, okAge, okSymptom].filter(Boolean).length;

    const ok = await registerPatient(
      form.name.trim(),
      parseInt(form.age, 10),
      form.symptom ? [form.symptom] : [],
      form.urgency
    );

    if (ok) {
      playSound(score === 3 ? 'success' : 'notification');
      setFeedback({ score, okName, okAge, okSymptom });
      setTimeout(nextArrival, 2600);
    }
  };

  const waiting = patients.filter((p) => p.status === 'waiting');

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-3">
        {/* Doente que chega e "fala" */}
        <div
          className={`card animate-bounce-in p-4 ${
            arrival.urgency === 'urgent' ? 'border-hospital-danger ring-2 ring-hospital-danger/30' : ''
          }`}
        >
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-500">
            🚪 Chegou um doente {arrival.urgency === 'urgent' && '🔴 (parece urgente!)'}
          </div>
          <div className="rounded-2xl rounded-tl-none bg-blue-50 p-3 text-blue-900">
            <p className="text-lg">
              «Olá! Chamo-me <strong>{arrival.name}</strong>, tenho{' '}
              <strong>{arrival.age}</strong> anos e vim por causa de{' '}
              <strong>{arrival.symptom}</strong>.»
            </p>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            👉 Escreve os dados dele na ficha ao lado.
          </p>
        </div>

        {/* Fila de espera */}
        <div>
          <h3 className="mb-2 text-lg font-bold">📋 Fila de espera ({waiting.length})</h3>
          <div className="space-y-2">
            {waiting.length === 0 && (
              <p className="text-sm text-gray-400">Ainda não registaste ninguém.</p>
            )}
            {waiting.map((p) => (
              <PatientCard key={p.id} patient={p} />
            ))}
          </div>
        </div>
      </div>

      {/* Ficha de registo (transcrição) */}
      <div className="card p-4">
        <h3 className="mb-3 text-lg font-bold">📝 Ficha de entrada</h3>

        <label className="mb-1 block text-sm font-semibold">Nome</label>
        <input
          className="input mb-3"
          placeholder="Escreve o nome..."
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <label className="mb-1 block text-sm font-semibold">Idade</label>
        <input
          className="input mb-3"
          type="number"
          min="0"
          max="120"
          placeholder="Escreve a idade..."
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
        />

        <label className="mb-1 block text-sm font-semibold">Motivo da visita</label>
        <select
          className="input mb-3"
          value={form.symptom}
          onChange={(e) => setForm({ ...form, symptom: e.target.value })}
        >
          <option value="">— escolher —</option>
          {diagnoses.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <label className="mb-1 block text-sm font-semibold">Urgência</label>
        <div className="mb-4 flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="urgency"
              checked={form.urgency === 'normal'}
              onChange={() => setForm({ ...form, urgency: 'normal' })}
            />
            Normal
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="urgency"
              checked={form.urgency === 'urgent'}
              onChange={() => setForm({ ...form, urgency: 'urgent' })}
            />
            🔴 Urgente
          </label>
        </div>

        <button
          onClick={handleRegister}
          disabled={loading || !form.name || !form.age || feedback}
          className="btn w-full bg-gradient-to-r from-hospital-pink to-pink-500 py-3 text-white hover:shadow-lg disabled:opacity-50"
        >
          {loading ? 'A registar...' : '✓ Registar doente'}
        </button>

        {feedback && (
          <div className="mt-3 animate-pulse-success rounded-xl bg-green-50 p-3 text-center">
            <div className="text-2xl">{'⭐'.repeat(feedback.score) || '💪'}</div>
            <p className="text-sm font-semibold text-green-800">
              {feedback.score === 3
                ? 'Perfeito! Escreveste tudo certinho!'
                : 'Boa! Doente registado.'}
            </p>
            {feedback.score < 3 && (
              <p className="mt-1 text-xs text-gray-500">
                {!feedback.okName && `Nome: ${arrival.name}. `}
                {!feedback.okAge && `Idade: ${arrival.age}. `}
                {!feedback.okSymptom && `Motivo: ${arrival.symptom}.`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
