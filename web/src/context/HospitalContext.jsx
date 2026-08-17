import { createContext, useCallback, useState } from 'react';
import { playSound } from '../utils/sound.js';
import { API_URL } from '../utils/api.js';

export const HospitalContext = createContext(null);

export function HospitalProvider({ children, sessionId }) {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const pollPatients = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/patients?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setPatients((prev) => {
          if (prev.length && data.length > prev.length) playSound('notification');
          return data;
        });
        setError(null);
      }
    } catch {
      setError('Sem ligação ao servidor');
    }
  }, [sessionId]);

  const pollStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/stats/${sessionId}`);
      if (res.ok) setStats(await res.json());
    } catch {
      /* silencioso */
    }
  }, [sessionId]);

  // Secretária — registar (nome + idade). Devolve { ok, full? }
  const registerPatient = useCallback(
    async (name, age) => {
      const res = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, name, age })
      });
      if (res.ok) {
        playSound('success');
        await pollPatients();
        return { ok: true };
      }
      if (res.status === 409) return { ok: false, full: true };
      return { ok: false };
    },
    [sessionId, pollPatients]
  );

  // Enfermeira — triagem
  const triage = useCallback(
    async (patientId, playerId, data) => {
      const res = await fetch(`${API_URL}/patients/${patientId}/triage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, ...data })
      });
      if (res.ok) {
        playSound('complete');
        await pollPatients();
        return true;
      }
      return false;
    },
    [pollPatients]
  );

  // Médica — diagnóstico + prescrição (items)
  const prescribe = useCallback(
    async (patientId, diagnosis, items) => {
      const res = await fetch(`${API_URL}/patients/${patientId}/prescribe`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosis, items })
      });
      if (res.ok) {
        playSound('complete');
        await pollPatients();
        return true;
      }
      return false;
    },
    [pollPatients]
  );

  // Enfermeira — aplicar uma dose. Devolve { ok, wait? }
  const giveDose = useCallback(
    async (patientId, itemName) => {
      const res = await fetch(`${API_URL}/patients/${patientId}/dose`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemName })
      });
      if (res.ok) {
        playSound('success');
        await pollPatients();
        return { ok: true };
      }
      if (res.status === 429) {
        const body = await res.json().catch(() => ({}));
        playSound('error');
        return { ok: false, wait: body.wait || 3 };
      }
      return { ok: false };
    },
    [pollPatients]
  );

  // Enfermeira — enviar para alta (só se saúde 100%)
  const toDischarge = useCallback(
    async (patientId, playerId) => {
      const res = await fetch(`${API_URL}/patients/${patientId}/to-discharge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });
      if (res.ok) {
        playSound('complete');
        await pollPatients();
        return true;
      }
      return false;
    },
    [pollPatients]
  );

  // Médica — dar alta
  const discharge = useCallback(
    async (patientId, playerId, rating) => {
      const res = await fetch(`${API_URL}/patients/${patientId}/discharge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, rating })
      });
      if (res.ok) {
        playSound('complete');
        await pollPatients();
        await pollStats();
        return true;
      }
      return false;
    },
    [pollPatients, pollStats]
  );

  const resetSession = useCallback(async () => {
    const res = await fetch(`${API_URL}/sessions/${sessionId}/reset`, { method: 'POST' });
    if (res.ok) {
      await pollPatients();
      await pollStats();
      return true;
    }
    return false;
  }, [sessionId, pollPatients, pollStats]);

  return (
    <HospitalContext.Provider
      value={{
        sessionId,
        patients,
        stats,
        error,
        pollPatients,
        pollStats,
        registerPatient,
        triage,
        prescribe,
        giveDose,
        toDischarge,
        discharge,
        resetSession
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
}
