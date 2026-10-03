import { useContext, useState } from 'react';
import { HospitalContext } from '../context/HospitalContext.jsx';
import { usePoll } from '../hooks/usePoll.js';
import PatientCard from '../components/PatientCard.jsx';
import DentalRoom from '../components/DentalRoom.jsx';
import Confetti from '../components/Confetti.jsx';
import { reactAs } from '../utils/tts.js';

export default function Dentista({ playerId }) {
  const { patients, pollPatients, discharge } = useContext(HospitalContext);
  const [active, setActive] = useState(null);
  const [done, setDone] = useState(null); // paciente tratado (ecrã de festa)
  const [busy, setBusy] = useState(false);

  usePoll(pollPatients, 2000);

  const patient = active ? patients.find((p) => p.id === active) : null;

  // Ecrã de festa depois da alta
  if (done) {
    return (
      <div className="space-y-4">
        <Confetti show />
        <div className="card animate-pop p-6 text-center">
          <div className="text-6xl">😁</div>
          <p className="mt-2 text-lg font-bold">{done} está com um sorriso lindo!</p>
          <p className="mt-1 text-sm text-gray-500">Não te esqueças de escovar os dentes! 🪥</p>
          <button onClick={() => setDone(null)} className="btn mt-6 w-full bg-gradient-to-r from-hospital-cyan to-teal-400 py-3 text-white hover:shadow-lg">
            Próximo paciente ▶
          </button>
        </div>
      </div>
    );
  }

  if (patient && patient.status === 'diagnosis') {
    const terminar = async () => {
      if (busy) return;
      setBusy(true);
      reactAs(patient, 'dentista', 'thanks');
      const res = await discharge(patient.id, playerId, 5);
      setBusy(false);
      if (res.ok) { setDone(patient.name); setActive(null); }
    };
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-bold">🦷 A tratar — {patient.name} ({patient.age} anos)</h3>
        <DentalRoom patient={patient} onComplete={terminar} onBack={() => setActive(null)} />
      </div>
    );
  }

  const fila = patients.filter((p) => p.status === 'diagnosis');

  return (
    <div>
      <h3 className="mb-2 text-lg font-bold">🦷 Para tratar ({fila.length})</h3>
      <div className="space-y-3">
        {fila.length === 0 && <p className="text-sm text-gray-400">Sem pacientes. Espera que a secretária registe alguém.</p>}
        {fila.map((p) => (
          <PatientCard key={p.id} patient={p} mode="dentista" onClick={() => setActive(p.id)} actionLabel="Tratar os dentes ▶" />
        ))}
      </div>
    </div>
  );
}
