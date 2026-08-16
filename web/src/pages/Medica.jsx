import { useContext, useState } from 'react';
import { HospitalContext } from '../context/HospitalContext.jsx';
import { usePoll } from '../hooks/usePoll.js';
import PatientCard from '../components/PatientCard.jsx';
import VitalsForm from '../components/VitalsForm.jsx';
import diagnoses from '../data/diagnoses.json';
import medicines from '../data/medicines.json';

export default function Medica({ playerId }) {
  const { patients, pollPatients, startConsult, prescribe } = useContext(HospitalContext);
  const [active, setActive] = useState(null); // doente em consulta
  const [vitals, setVitals] = useState({});
  const [diagnosis, setDiagnosis] = useState('');
  const [chosenMeds, setChosenMeds] = useState([]);

  usePoll(pollPatients, 2000);

  // Mantém o doente ativo sincronizado com a lista
  const activePatient = active ? patients.find((p) => p.id === active) : null;

  const openConsult = async (patient) => {
    setActive(patient.id);
    setVitals({ temp: patient.temp ?? '', hr: patient.hr ?? '', bp: patient.bp ?? '' });
    setDiagnosis(patient.diagnosis ?? '');
    setChosenMeds(patient.medicine ?? []);
    await startConsult(patient.id, playerId, {});
  };

  const toggleMed = (name) => {
    setChosenMeds((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name]
    );
  };

  const submitPrescription = async () => {
    if (!diagnosis) return;
    // Grava também os vitais recolhidos
    await startConsult(active, playerId, vitals);
    const ok = await prescribe(active, diagnosis, chosenMeds);
    if (ok) {
      setActive(null);
      setDiagnosis('');
      setChosenMeds([]);
      setVitals({});
    }
  };

  if (!activePatient) {
    const waiting = patients.filter((p) => p.status === 'waiting' || p.status === 'consulting');
    return (
      <div>
        <h3 className="mb-3 text-lg font-bold">🩺 Doentes para atender ({waiting.length})</h3>
        <div className="space-y-3">
          {waiting.length === 0 && (
            <p className="text-sm text-gray-400">Sem doentes na fila. Espera a secretária registar alguém.</p>
          )}
          {waiting.map((p) => (
            <PatientCard key={p.id} patient={p} onClick={openConsult} actionLabel="Atender ▶" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">
        🩺 Consulta — {activePatient.name} ({activePatient.age} anos)
      </h3>
      <p className="text-sm text-gray-600">
        Sintomas: {(activePatient.symptoms || []).join(', ') || '—'}
      </p>

      <VitalsForm initial={activePatient} onChange={setVitals} />

      <div className="card p-4">
        <label className="mb-2 block text-sm font-semibold">💊 Diagnóstico</label>
        <select className="input mb-4" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}>
          <option value="">— escolher —</option>
          {diagnoses.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <label className="mb-2 block text-sm font-semibold">💉 Prescrição</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {medicines.map((m) => (
            <label
              key={m.name}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-2 text-sm ${
                chosenMeds.includes(m.name)
                  ? 'border-hospital-pink bg-pink-50'
                  : 'border-gray-100'
              }`}
            >
              <input
                type="checkbox"
                checked={chosenMeds.includes(m.name)}
                onChange={() => toggleMed(m.name)}
              />
              <span>
                {m.name}
                {m.dose ? ` ${m.dose}` : ''} {m.frequency ? `· ${m.frequency}` : ''}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={submitPrescription}
          disabled={!diagnosis}
          className="btn flex-1 bg-gradient-to-r from-hospital-pink to-pink-500 py-3 text-white hover:shadow-lg disabled:opacity-50"
        >
          ✓ Prescrever e enviar à enfermeira
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
