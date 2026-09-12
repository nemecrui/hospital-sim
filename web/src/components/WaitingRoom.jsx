import Character from './Character.jsx';
import { waitMood } from '../utils/characters.js';

// 🪑 Sala de espera com vida: os doentes sentados no banco, a baloiçar as
// pernas e a ficarem impacientes com o tempo. A secretária pode acalmá-los 🧸.
function Seat({ patient, mode, onCalm, called }) {
  const mood = waitMood(patient) || { face: '🙂', text: 'tranquilo', anim: 'breathe' };
  const calmed = patient.calmedAt && Date.now() - new Date(patient.calmedAt).getTime() < 25000;

  return (
    <div className={`relative flex w-20 flex-col items-center ${called ? 'scale-105' : ''}`}>
      {called && (
        <div className="absolute -top-4 z-10 animate-bounce text-lg" aria-hidden="true">📣</div>
      )}
      <div className={`flex flex-col items-center rounded-2xl px-1 pt-1 ${called ? 'ring-2 ring-hospital-cyan' : ''}`}>
        <div className={`anim-${mood.anim}`}>
          <Character patient={patient} mode={mode} size={46} showMood={false} speakOnTap={false} />
        </div>
        {/* pernas a baloiçar */}
        <svg width="34" height="20" viewBox="0 0 34 20" className={`anim-${mood.anim}`} style={{ marginTop: -4 }}>
          <line x1="12" y1="0" x2="10" y2="16" stroke="#42506B" strokeWidth="4" strokeLinecap="round" />
          <line x1="22" y1="0" x2="24" y2="16" stroke="#42506B" strokeWidth="4" strokeLinecap="round" />
          <circle cx="9" cy="17" r="3" fill="#3b3b4d" />
          <circle cx="25" cy="17" r="3" fill="#3b3b4d" />
        </svg>
        {/* banco */}
        <div className="h-1.5 w-16 rounded-full bg-amber-300" />
      </div>
      <span className="mt-1 truncate text-[11px] font-semibold text-gray-600" style={{ maxWidth: 76 }}>
        {patient.name}
      </span>
      <span className="text-[11px] text-gray-400">{mood.face}</span>
      <button
        onClick={() => onCalm(patient)}
        disabled={calmed}
        className="mt-0.5 rounded-full bg-pink-100 px-2 py-0.5 text-[11px] font-semibold text-pink-700 hover:bg-pink-200 disabled:opacity-40"
        title="Dar um miminho para acalmar"
      >
        {calmed ? '😊 calmo' : '🧸 acalmar'}
      </button>
    </div>
  );
}

export default function WaitingRoom({ patients = [], mode, onCall, onCalm, calledId }) {
  const waiting = patients.filter((p) => p.status !== 'discharged');

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">🪑 Sala de espera ({waiting.length})</h3>
        <button
          onClick={onCall}
          disabled={waiting.length === 0}
          className="btn bg-gradient-to-r from-hospital-cyan to-blue-400 px-3 py-1 text-sm text-white hover:shadow-lg disabled:opacity-40"
        >
          📣 Chamar o próximo
        </button>
      </div>

      {waiting.length === 0 ? (
        <p className="text-sm text-gray-400">A sala está vazia — ainda ninguém à espera. 🌼</p>
      ) : (
        <div className="flex flex-wrap items-end justify-center gap-3">
          {waiting.map((p) => (
            <Seat key={p.id} patient={p} mode={mode} onCalm={onCalm} called={p.id === calledId} />
          ))}
        </div>
      )}
    </div>
  );
}
