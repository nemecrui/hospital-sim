import { useContext, useEffect, useState } from 'react';
import { HospitalContext } from '../context/HospitalContext.jsx';
import { usePoll } from '../hooks/usePoll.js';
import PatientCard from '../components/PatientCard.jsx';
import QueixaChips from '../components/QueixaChips.jsx';
import HealthBar from '../components/HealthBar.jsx';
import { WRISTBANDS } from '../components/Wristband.jsx';
import { triageTip } from '../utils/hints.js';
import { speakTip } from '../utils/tts.js';
import Thermometer from '../components/Thermometer.jsx';
import Stethoscope from '../components/Stethoscope.jsx';
import CareGesture from '../components/CareGesture.jsx';
import MedGesture from '../components/MedGesture.jsx';
import NailClip from '../components/NailClip.jsx';

// Que gesto usar para cada item (null = simples toque)
function gestureKind(it) {
  if (it.type === 'nails') return 'snip';
  if (it.type === 'curativo') return it.name === 'Gesso' ? 'wrap' : 'rub';
  if (it.name === 'Antibiótico' || it.name === 'Soro' || it.name === 'Vacina') return 'injection';
  if (it.name === 'Xarope') return 'spoon';
  return null;
}

const DOSE_WINDOW_S = 240; // 3 tomas=80s, 2 tomas=120s, 1 toma=sem espera

const cooldownMsFor = (total) => Math.round(DOSE_WINDOW_S / Math.max(1, total)) * 1000;
const fmt = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`);

export default function Enfermeira({ playerId }) {
  const { patients, pollPatients, triage, giveDose, toDischarge } = useContext(HospitalContext);
  const [active, setActive] = useState(null);
  const [now, setNow] = useState(Date.now());

  usePoll(pollPatients, 2000);

  // Relógio para atualizar os contadores de espera das doses
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const patient = active ? patients.find((p) => p.id === active) : null;

  if (patient && patient.status === 'triage') {
    return <Triagem patient={patient} playerId={playerId} onBack={() => setActive(null)} triage={triage} />;
  }
  if (patient && patient.status === 'treatment') {
    return (
      <Tratamento
        patient={patient}
        now={now}
        giveDose={giveDose}
        toDischarge={toDischarge}
        playerId={playerId}
        onBack={() => setActive(null)}
      />
    );
  }

  const paraTriagem = patients.filter((p) => p.status === 'triage');
  const paraTratar = patients.filter((p) => p.status === 'treatment');

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-lg font-bold">🩺 Triagem ({paraTriagem.length})</h3>
        <div className="space-y-3">
          {paraTriagem.length === 0 && (
            <p className="text-sm text-gray-400">Sem doentes para triar.</p>
          )}
          {paraTriagem.map((p) => (
            <PatientCard key={p.id} patient={p} onClick={() => setActive(p.id)} actionLabel="Fazer triagem ▶" />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-lg font-bold">💊 Tratamento ({paraTratar.length})</h3>
        <div className="space-y-3">
          {paraTratar.length === 0 && (
            <p className="text-sm text-gray-400">Sem doentes para tratar.</p>
          )}
          {paraTratar.map((p) => (
            <PatientCard key={p.id} patient={p} onClick={() => setActive(p.id)} actionLabel="Tratar ▶" />
          ))}
        </div>
      </section>
    </div>
  );
}

function Triagem({ patient, playerId, onBack, triage }) {
  const [vitals, setVitals] = useState({ temp: '', hr: '' });
  const [color, setColor] = useState(null);
  const [busy, setBusy] = useState(false);

  const medir = () => {
    setVitals({
      temp: (36 + Math.random() * 3).toFixed(1),
      hr: String(60 + Math.floor(Math.random() * 40))
    });
  };

  const confirmar = async () => {
    if (!color) return;
    setBusy(true);
    const ok = await triage(patient.id, playerId, {
      temp: vitals.temp || null,
      hr: vitals.hr || null,
      triageColor: color
    });
    setBusy(false);
    if (ok) onBack();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">
        🩺 Triagem — {patient.name} ({patient.age} anos)
      </h3>

      <div className="card p-4">
        <QueixaChips queixas={patient.symptoms} name={patient.name} story={patient.story} label="O doente diz que sente" />
      </div>

      <div className="card p-4">
        <span className="text-sm font-semibold">🌡️ Sinais vitais</span>

        <div className="my-3 grid gap-4 sm:grid-cols-2">
          <Thermometer onMeasure={(t) => setVitals((v) => ({ ...v, temp: t }))} />
          <Stethoscope onMeasure={(h) => setVitals((v) => ({ ...v, hr: String(h) }))} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-gray-500">🌡️ Temperatura (°C)</span>
            <input
              className="input"
              type="number"
              step="0.1"
              placeholder="37.0"
              value={vitals.temp}
              onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">❤️ Pulsação (bpm)</span>
            <input
              className="input"
              type="number"
              placeholder="80"
              value={vitals.hr}
              onChange={(e) => setVitals({ ...vitals, hr: e.target.value })}
            />
          </label>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">Normal: ~37 °C e 60–100 bpm.</span>
          <button onClick={medir} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200">
            🎲 Medir tudo
          </button>
        </div>
      </div>

      <div className="card p-4">
        <p className="mb-2 text-sm font-semibold">Que pulseira vais dar? (mais grave = cor mais forte)</p>
        <div className="grid grid-cols-2 gap-3">
          {WRISTBANDS.map((b) => (
            <button
              key={b.id}
              onClick={() => setColor(b.id)}
              className={`btn flex items-center gap-2 py-4 text-white ${b.bg} ${
                color === b.id ? `ring-4 ${b.ring} ring-offset-2` : 'opacity-90'
              }`}
            >
              <span className="text-xl">{b.dot}</span>
              <span className="text-left">
                <span className="block font-bold">{b.label}</span>
                <span className="block text-xs opacity-90">{b.sub}</span>
              </span>
            </button>
          ))}
        </div>
        {triageTip(vitals.temp, color) && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-xl bg-amber-50 p-2 text-xs text-amber-800">
            <span>{triageTip(vitals.temp, color)}</span>
            <button
              onClick={() => speakTip(triageTip(vitals.temp, color))}
              className="shrink-0 rounded-full bg-amber-200 px-2 py-0.5 font-semibold text-amber-900"
              title="Ouvir a dica"
            >
              🔊
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={confirmar}
          disabled={!color || busy}
          className="btn flex-1 bg-gradient-to-r from-green-400 to-green-500 py-3 text-white hover:shadow-lg disabled:opacity-50"
        >
          ✓ Enviar à médica
        </button>
        <button onClick={onBack} className="btn bg-white px-4 py-3 text-gray-700 hover:bg-gray-100">
          ↩ Voltar
        </button>
      </div>
    </div>
  );
}

function Tratamento({ patient, now, giveDose, toDischarge, playerId, onBack }) {
  const [msg, setMsg] = useState(null);
  const [care, setCare] = useState(null); // curativo/gesso a aplicar com gesto
  const items = patient.medicine || [];
  const health = patient.health ?? 0;
  const curado = health >= 100;

  const aplicar = async (item) => {
    const res = await giveDose(patient.id, item.name);
    if (!res.ok && res.wait) setMsg(`⏳ Espera ${res.wait}s antes da próxima dose de ${item.name}.`);
    else setMsg(null);
  };

  const enviarAlta = async () => {
    const ok = await toDischarge(patient.id, playerId);
    if (ok) onBack();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">💊 Tratamento — {patient.name}</h3>
      <p className="text-sm text-gray-600">
        Diagnóstico: <strong>{patient.diagnosis || '—'}</strong>
      </p>

      <div className="card p-4">
        <HealthBar value={health} />
      </div>

      <div className="card space-y-2 p-4">
        <h4 className="font-bold">Medicação e curativos</h4>
        {items.length === 0 && <p className="text-sm text-gray-400">Sem prescrição.</p>}
        {items.map((it) => {
          const done = it.given >= it.total;
          const cooldownMs = cooldownMsFor(it.total);
          const cooldown = it.given > 0 ? Math.max(0, cooldownMs - (now - (it.lastGivenAt || 0))) : 0;
          const waiting = cooldown > 0 && !done;
          return (
            <div key={it.name} className="flex items-center justify-between rounded-xl bg-pink-50 p-2">
              <span className="flex items-center gap-2">
                <span className="text-2xl">{it.emoji}</span>
                <span>
                  <span className="font-semibold">{it.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {it.given}/{it.total} {it.type === 'curativo' ? 'aplicado' : 'doses'}
                    {it.total > 1 && ` · a cada ${Math.round(DOSE_WINDOW_S / it.total)}s`}
                  </span>
                </span>
              </span>
              <button
                onClick={() => (gestureKind(it) ? setCare(it) : aplicar(it))}
                disabled={done || waiting}
                className="btn bg-hospital-pink px-3 py-1 text-sm text-white disabled:opacity-40"
              >
                {done ? '✓ Feito' : waiting ? fmt(Math.ceil(cooldown / 1000)) : it.type === 'curativo' ? 'Aplicar' : 'Dar dose'}
              </button>
            </div>
          );
        })}
        {msg && <p className="text-center text-xs text-hospital-danger">{msg}</p>}
      </div>

      {care && (
        <div className="card p-4">
          <h4 className="mb-1 font-bold">
            {care.emoji} {care.name}
          </h4>
          {(() => {
            const kind = gestureKind(care);
            const finish = async () => {
              await aplicar(care);
              setCare(null);
            };
            const cancel = () => setCare(null);
            if (kind === 'snip') return <NailClip onDone={finish} onCancel={cancel} />;
            if (['rub', 'wrap'].includes(kind))
              return <CareGesture name={care.name} emoji={care.emoji} onDone={finish} onCancel={cancel} />;
            return <MedGesture kind={kind} onDone={finish} onCancel={cancel} />;
          })()}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={enviarAlta}
          disabled={!curado}
          className="btn flex-1 bg-gradient-to-r from-teal-400 to-teal-500 py-3 text-white hover:shadow-lg disabled:opacity-50"
        >
          {curado ? '✓ Doente bom — enviar para alta' : 'Continua o tratamento até 100%'}
        </button>
        <button onClick={onBack} className="btn bg-white px-4 py-3 text-gray-700 hover:bg-gray-100">
          ↩ Voltar
        </button>
      </div>
    </div>
  );
}
