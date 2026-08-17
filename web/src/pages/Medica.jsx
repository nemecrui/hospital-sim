import { useContext, useState } from 'react';
import { HospitalContext } from '../context/HospitalContext.jsx';
import { usePoll } from '../hooks/usePoll.js';
import PatientCard from '../components/PatientCard.jsx';
import QueixaChips from '../components/QueixaChips.jsx';
import Wristband from '../components/Wristband.jsx';
import diagnoses from '../data/diagnoses.json';
import meds from '../data/meds.json';
import icons from '../data/icons.json';
import { speak } from '../utils/tts.js';

export default function Medica({ playerId }) {
  const { patients, pollPatients, prescribe, discharge } = useContext(HospitalContext);
  const [active, setActive] = useState(null);

  usePoll(pollPatients, 2000);

  const patient = active ? patients.find((p) => p.id === active) : null;

  if (patient && patient.status === 'diagnosis') {
    return <Consulta patient={patient} onBack={() => setActive(null)} prescribe={prescribe} />;
  }
  if (patient && patient.status === 'discharge') {
    return (
      <Alta patient={patient} playerId={playerId} discharge={discharge} onBack={() => setActive(null)} />
    );
  }

  const paraConsulta = patients.filter((p) => p.status === 'diagnosis');
  const paraAlta = patients.filter((p) => p.status === 'discharge');

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-lg font-bold">🔍 Para observar ({paraConsulta.length})</h3>
        <div className="space-y-3">
          {paraConsulta.length === 0 && (
            <p className="text-sm text-gray-400">Sem doentes para observar.</p>
          )}
          {paraConsulta.map((p) => (
            <PatientCard key={p.id} patient={p} onClick={() => setActive(p.id)} actionLabel="Observar ▶" />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-lg font-bold">✅ Para dar alta ({paraAlta.length})</h3>
        <div className="space-y-3">
          {paraAlta.length === 0 && <p className="text-sm text-gray-400">Ninguém pronto para alta.</p>}
          {paraAlta.map((p) => (
            <PatientCard key={p.id} patient={p} onClick={() => setActive(p.id)} actionLabel="Dar alta ▶" />
          ))}
        </div>
      </section>
    </div>
  );
}

function Consulta({ patient, onBack, prescribe }) {
  const [diagnosis, setDiagnosis] = useState('');
  const [chosen, setChosen] = useState([]); // nomes dos medicamentos
  const [busy, setBusy] = useState(false);

  const toggle = (name) =>
    setChosen((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));

  const confirmar = async () => {
    if (!diagnosis || chosen.length === 0) return;
    setBusy(true);
    const items = meds
      .filter((m) => chosen.includes(m.name))
      .map((m) => ({ name: m.name, emoji: m.emoji, type: m.type, total: m.doses }));
    const ok = await prescribe(patient.id, diagnosis, items);
    setBusy(false);
    if (ok) onBack();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">
        🔍 Consulta — {patient.name} ({patient.age} anos) {patient.triageColor && <Wristband color={patient.triageColor} />}
      </h3>

      <div className="card p-4">
        <QueixaChips queixas={patient.symptoms} name={patient.name} label="Queixas" />
        <div className="mt-3 flex gap-4 text-sm text-gray-600">
          <span>🌡️ {patient.temp ? `${patient.temp} °C` : '—'}</span>
          <span>❤️ {patient.hr ? `${patient.hr} bpm` : '—'}</span>
        </div>
      </div>

      <div className="card p-4">
        <label className="mb-2 block text-sm font-semibold">🩺 Diagnóstico</label>
        <div className="grid grid-cols-2 gap-2">
          {diagnoses.map((d) => (
            <button
              key={d}
              onClick={() => {
                setDiagnosis(d);
                speak(d);
              }}
              className={`btn flex items-center gap-2 py-3 text-left ${
                diagnosis === d ? 'bg-gradient-to-r from-hospital-cyan to-blue-400 text-white' : 'bg-white'
              }`}
            >
              <span className="text-2xl">{icons[d] || '🩺'}</span>
              <span className="text-sm font-semibold">{d}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <label className="mb-2 block text-sm font-semibold">💊 Prescrição (o que a enfermeira vai dar)</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {meds.map((m) => (
            <label
              key={m.name}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-2 text-sm ${
                chosen.includes(m.name) ? 'border-hospital-pink bg-pink-50' : 'border-gray-100'
              }`}
            >
              <input type="checkbox" checked={chosen.includes(m.name)} onChange={() => toggle(m.name)} />
              <span className="text-2xl">{m.emoji}</span>
              <span>
                {m.name} · {m.doses}× {m.type === 'curativo' ? '(curativo)' : ''}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={confirmar}
          disabled={!diagnosis || chosen.length === 0 || busy}
          className="btn flex-1 bg-gradient-to-r from-hospital-pink to-pink-500 py-3 text-white hover:shadow-lg disabled:opacity-50"
        >
          ✓ Prescrever e enviar à enfermeira
        </button>
        <button onClick={onBack} className="btn bg-white px-4 py-3 text-gray-700 hover:bg-gray-100">
          ↩ Voltar
        </button>
      </div>
    </div>
  );
}

function Alta({ patient, playerId, discharge, onBack }) {
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);

  const darAlta = async () => {
    setBusy(true);
    const ok = await discharge(patient.id, playerId, rating);
    setBusy(false);
    if (ok) onBack();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">✅ Alta — {patient.name}</h3>

      <div className="card p-4 text-center">
        <div className="text-5xl">😀</div>
        <p className="mt-2 font-semibold">O doente está curado e pronto para ir para casa!</p>
        <p className="text-sm text-gray-500">Diagnóstico: {patient.diagnosis || '—'}</p>
      </div>

      <div className="card p-4">
        <p className="mb-2 text-sm font-semibold">Como correu o atendimento?</p>
        <div className="flex gap-1 text-3xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)} className={n <= rating ? '' : 'opacity-30'}>
              ⭐
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={darAlta}
          disabled={busy}
          className="btn flex-1 bg-gradient-to-r from-green-400 to-green-500 py-3 text-white hover:shadow-lg disabled:opacity-50"
        >
          ✓ Dar alta
        </button>
        <button onClick={onBack} className="btn bg-white px-4 py-3 text-gray-700 hover:bg-gray-100">
          ↩ Voltar
        </button>
      </div>
    </div>
  );
}
