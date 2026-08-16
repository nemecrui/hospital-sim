const STATUS_LABELS = {
  waiting: { text: 'À espera', emoji: '⏳', color: 'bg-yellow-100 text-yellow-800' },
  consulting: { text: 'Em consulta', emoji: '🩺', color: 'bg-blue-100 text-blue-800' },
  treating: { text: 'Em tratamento', emoji: '💊', color: 'bg-purple-100 text-purple-800' },
  discharged: { text: 'Alta', emoji: '✅', color: 'bg-green-100 text-green-800' }
};

export default function PatientCard({ patient, onClick, actionLabel }) {
  const status = STATUS_LABELS[patient.status] || STATUS_LABELS.waiting;
  const isUrgent = patient.urgency === 'urgent';

  return (
    <div
      className={`card animate-bounce-in p-4 ${
        isUrgent ? 'border-hospital-danger ring-2 ring-hospital-danger/30' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              {isUrgent ? '🔴 ' : ''}
              {patient.name}
            </span>
            <span className="text-sm text-gray-500">({patient.age} anos)</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {(patient.symptoms || []).map((s, i) => (
              <span
                key={i}
                className="rounded-full bg-pink-50 px-2 py-0.5 text-xs text-pink-700"
              >
                {s}
              </span>
            ))}
          </div>
          {patient.diagnosis && (
            <div className="mt-1 text-sm text-gray-600">
              💊 <strong>Diagnóstico:</strong> {patient.diagnosis}
            </div>
          )}
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${status.color}`}>
          {status.emoji} {status.text}
        </span>
      </div>

      {onClick && actionLabel && (
        <button
          onClick={() => onClick(patient)}
          className="btn mt-3 w-full bg-gradient-to-r from-hospital-pink to-pink-500 py-2 text-white hover:shadow-lg"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
