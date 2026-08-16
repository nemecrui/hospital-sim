import { useContext, useState } from 'react';
import { HospitalContext } from '../context/HospitalContext.jsx';
import { usePoll } from '../hooks/usePoll.js';
import PatientCard from '../components/PatientCard.jsx';

export default function Enfermeira({ playerId }) {
  const { patients, pollPatients, discharge } = useContext(HospitalContext);
  const [active, setActive] = useState(null);
  const [doses, setDoses] = useState({});
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(5);

  usePoll(pollPatients, 2000);

  const activePatient = active ? patients.find((p) => p.id === active) : null;

  const open = (patient) => {
    setActive(patient.id);
    setDoses({});
    setNotes('');
    setRating(5);
  };

  const giveDose = (med) => {
    setDoses((prev) => ({ ...prev, [med]: (prev[med] || 0) + 1 }));
  };

  const finish = async () => {
    const ok = await discharge(active, playerId, notes, rating);
    if (ok) {
      setActive(null);
      setNotes('');
      setRating(5);
      setDoses({});
    }
  };

  if (!activePatient) {
    const toTreat = patients.filter((p) => p.status === 'treating');
    return (
      <div>
        <h3 className="mb-3 text-lg font-bold">💊 Doentes em tratamento ({toTreat.length})</h3>
        <div className="space-y-3">
          {toTreat.length === 0 && (
            <p className="text-sm text-gray-400">
              Sem doentes para tratar. Espera a médica prescrever.
            </p>
          )}
          {toTreat.map((p) => (
            <PatientCard key={p.id} patient={p} onClick={open} actionLabel="Tratar ▶" />
          ))}
        </div>
      </div>
    );
  }

  const meds = activePatient.medicine || [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">👩‍⚕️ Tratamento — {activePatient.name}</h3>
      <p className="text-sm text-gray-600">
        Diagnóstico: <strong>{activePatient.diagnosis || '—'}</strong>
      </p>

      <div className="card p-4">
        <h4 className="mb-3 font-bold">💊 Medicação prescrita</h4>
        {meds.length === 0 && <p className="text-sm text-gray-400">Sem medicação prescrita.</p>}
        <div className="space-y-2">
          {meds.map((m) => (
            <div key={m} className="flex items-center justify-between rounded-xl bg-pink-50 p-2">
              <span className="text-sm">{m}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">dado {doses[m] || 0}×</span>
                <button
                  onClick={() => giveDose(m)}
                  className="btn bg-hospital-pink px-3 py-1 text-sm text-white"
                >
                  Dar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <label className="mb-2 block text-sm font-semibold">📝 Observações</label>
        <textarea
          className="input mb-4"
          rows="3"
          placeholder="Ex: Doente melhorou significativamente."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <label className="mb-2 block text-sm font-semibold">🎯 Satisfação do doente</label>
        <div className="mb-2 flex gap-1 text-3xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={n <= rating ? '' : 'opacity-30'}
            >
              ⭐
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={finish}
          className="btn flex-1 bg-gradient-to-r from-green-400 to-green-500 py-3 text-white hover:shadow-lg"
        >
          ✓ Dar alta
        </button>
        <button
          onClick={() => setActive(null)}
          className="btn bg-white px-4 py-3 text-gray-700 hover:bg-gray-100"
        >
          ↩ Voltar
        </button>
      </div>
    </div>
  );
}
