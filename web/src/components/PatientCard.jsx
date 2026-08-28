import Wristband from './Wristband.jsx';
import Character from './Character.jsx';
import SpeechBubble from './SpeechBubble.jsx';
import { traitFor } from '../utils/characters.js';
import icons from '../data/icons.json';

const STATUS_LABELS = {
  triage: { text: 'Triagem', emoji: '🩺', color: 'bg-yellow-100 text-yellow-800' },
  diagnosis: { text: 'Médica', emoji: '🔍', color: 'bg-blue-100 text-blue-800' },
  exams: { text: 'Exames', emoji: '🔬', color: 'bg-indigo-100 text-indigo-800' },
  treatment: { text: 'Tratamento', emoji: '💊', color: 'bg-purple-100 text-purple-800' },
  discharge: { text: 'Pronto p/ alta', emoji: '📤', color: 'bg-teal-100 text-teal-800' },
  discharged: { text: 'Alta', emoji: '✅', color: 'bg-green-100 text-green-800' }
};

// Humor do doente conforme o tempo de espera (sala de espera com vida)
function moodOf(patient) {
  if (patient.status === 'discharged' || !patient.createdAt) return null;
  const mins = (Date.now() - new Date(patient.createdAt).getTime()) / 60000;
  if (mins < 1) return { face: '🙂', text: 'tranquilo' };
  if (mins < 2.5) return { face: '😐', text: 'a ficar aborrecido' };
  if (mins < 4) return { face: '😟', text: 'impaciente' };
  const asleep = patient.id.charCodeAt(patient.id.length - 1) % 2 === 0;
  return asleep ? { face: '😴', text: 'adormeceu' } : { face: '😠', text: 'farto de esperar' };
}

export default function PatientCard({ patient, mode, onClick, actionLabel }) {
  const status = STATUS_LABELS[patient.status] || STATUS_LABELS.triage;
  const mood = moodOf(patient);
  const trait = traitFor(patient);
  const urgent = patient.emergency;

  return (
    <div
      className={`card animate-bounce-in p-4 ${
        urgent ? 'border-hospital-danger ring-2 ring-hospital-danger/40' : ''
      }`}
    >
      {urgent && (
        <div className="mb-2 inline-flex animate-wiggle items-center gap-1 rounded-full bg-hospital-danger px-2 py-0.5 text-xs font-bold text-white">
          🚑 URGÊNCIA
        </div>
      )}

      <div className="flex items-start gap-3">
        <Character patient={patient} mode={mode} size={60} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-lg font-bold">{patient.name}</span>
                <span className="text-sm text-gray-500">({patient.age} anos)</span>
                {patient.triageColor && <Wristband color={patient.triageColor} />}
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {trait.emoji} {trait.label}
                </span>
              </div>

              {patient.symptoms?.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {patient.symptoms.map((s, i) => (
                    <span key={i} className="rounded-full bg-pink-50 px-2 py-0.5 text-xs text-pink-700">
                      {icons[s] || ''} {s}
                    </span>
                  ))}
                </div>
              )}

              {patient.diagnosis && (
                <div className="mt-1 text-sm text-gray-600">
                  🩺 <strong>{patient.diagnosis}</strong>
                </div>
              )}
            </div>

            <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${status.color}`}>
              {status.emoji} {status.text}
            </span>
          </div>

          <div className="mt-2">
            <SpeechBubble patient={patient} mode={mode} />
          </div>

          {mood && (
            <div className="mt-1 text-xs text-gray-400">
              {mood.face} {mood.text}
            </div>
          )}
        </div>
      </div>

      {onClick && actionLabel && (
        <button
          onClick={() => onClick(patient)}
          className={`btn mt-3 w-full py-2 text-white hover:shadow-lg ${
            urgent
              ? 'bg-gradient-to-r from-hospital-danger to-red-500'
              : 'bg-gradient-to-r from-hospital-pink to-pink-500'
          }`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
