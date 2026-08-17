import { useContext, useState } from 'react';
import { HospitalContext } from '../context/HospitalContext.jsx';
import { usePoll } from '../hooks/usePoll.js';
import PatientCard from '../components/PatientCard.jsx';
import QueixaChips from '../components/QueixaChips.jsx';
import examsData from '../data/exams.json';

function resultsFor(name) {
  return examsData.find((e) => e.name === name)?.results || ['Normal', 'Alterado'];
}

export default function Tad({ playerId }) {
  const { patients, pollPatients, examResult, examsDone } = useContext(HospitalContext);
  const [active, setActive] = useState(null);

  usePoll(pollPatients, 2000);

  const patient = active ? patients.find((p) => p.id === active) : null;

  if (patient && patient.status === 'exams') {
    return (
      <ExamRoom
        patient={patient}
        playerId={playerId}
        examResult={examResult}
        examsDone={examsDone}
        onBack={() => setActive(null)}
      />
    );
  }

  const fila = patients.filter((p) => p.status === 'exams');

  return (
    <div>
      <h3 className="mb-2 text-lg font-bold">🔬 Exames a fazer ({fila.length})</h3>
      <div className="space-y-3">
        {fila.length === 0 && (
          <p className="text-sm text-gray-400">Sem exames pedidos. Espera que a médica peça algum.</p>
        )}
        {fila.map((p) => (
          <PatientCard key={p.id} patient={p} onClick={() => setActive(p.id)} actionLabel="Fazer exames ▶" />
        ))}
      </div>
    </div>
  );
}

function ExamRoom({ patient, playerId, examResult, examsDone, onBack }) {
  const [open, setOpen] = useState(null); // exame a definir resultado
  const exams = patient.exams || [];
  const todosFeitos = exams.length > 0 && exams.every((e) => e.result);

  const escolher = async (examName, result) => {
    await examResult(patient.id, examName, result);
    setOpen(null);
  };

  const enviar = async () => {
    const ok = await examsDone(patient.id, playerId);
    if (ok) onBack();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">🔬 Exames — {patient.name} ({patient.age} anos)</h3>

      <div className="card p-4">
        <QueixaChips queixas={patient.symptoms} name={patient.name} label="Queixa" />
      </div>

      <div className="space-y-3">
        {exams.map((ex) => (
          <div key={ex.name} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-lg font-semibold">
                <span className="text-3xl">{ex.emoji}</span> {ex.name}
              </span>
              {ex.result ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                  ✓ {ex.result}
                </span>
              ) : (
                <button
                  onClick={() => setOpen(open === ex.name ? null : ex.name)}
                  className="btn bg-hospital-cyan px-3 py-1 text-sm text-white"
                >
                  Fazer exame
                </button>
              )}
            </div>

            {open === ex.name && !ex.result && (
              <div className="mt-3">
                <p className="mb-2 text-xs text-gray-500">Qual foi o resultado?</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {resultsFor(ex.name).map((r) => (
                    <button
                      key={r}
                      onClick={() => escolher(ex.name, r)}
                      className="btn bg-white py-2 text-sm hover:bg-pink-50"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={enviar}
          disabled={!todosFeitos}
          className="btn flex-1 bg-gradient-to-r from-hospital-pink to-pink-500 py-3 text-white hover:shadow-lg disabled:opacity-50"
        >
          {todosFeitos ? '✓ Enviar resultados ao médico' : 'Faz todos os exames primeiro'}
        </button>
        <button onClick={onBack} className="btn bg-white px-4 py-3 text-gray-700 hover:bg-gray-100">
          ↩ Voltar
        </button>
      </div>
    </div>
  );
}
