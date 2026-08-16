import { createContext, useCallback, useState } from 'react';
import { playSound } from '../utils/sound.js';
import { API_URL } from '../utils/api.js';

export const HospitalContext = createContext(null);

export function HospitalProvider({ children, sessionId }) {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pollPatients = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/patients?sessionId=${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setPatients((prev) => {
          // Toca notificação se surgiu um novo doente à espera
          if (prev.length && data.length > prev.length) playSound('notification');
          return data;
        });
        setError(null);
      }
    } catch (err) {
      setError('Sem ligação ao servidor');
    }
  }, [sessionId]);

  const pollStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/stats/${sessionId}`);
      if (res.ok) setStats(await res.json());
    } catch (err) {
      /* silencioso */
    }
  }, [sessionId]);

  const registerPatient = useCallback(
    async (name, age, symptoms, urgency = 'normal') => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/patients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, name, age, symptoms, urgency })
        });
        if (res.ok) {
          playSound('success');
          await pollPatients();
          return true;
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [sessionId, pollPatients]
  );

  const addRandomPatient = useCallback(async () => {
    const res = await fetch(`${API_URL}/patients/random`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    if (res.ok) {
      playSound('success');
      await pollPatients();
      return true;
    }
    return false;
  }, [sessionId, pollPatients]);

  const startConsult = useCallback(
    async (patientId, playerId, vitals = {}) => {
      const res = await fetch(`${API_URL}/patients/${patientId}/consult`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, ...vitals })
      });
      if (res.ok) {
        await pollPatients();
        return true;
      }
      return false;
    },
    [pollPatients]
  );

  const prescribe = useCallback(
    async (patientId, diagnosis, medicine) => {
      const res = await fetch(`${API_URL}/patients/${patientId}/prescribe`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagnosis, medicine })
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

  const discharge = useCallback(
    async (patientId, playerId, notes, rating) => {
      const res = await fetch(`${API_URL}/patients/${patientId}/treat`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, notes, rating })
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
    const res = await fetch(`${API_URL}/sessions/${sessionId}/reset`, {
      method: 'POST'
    });
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
        loading,
        error,
        pollPatients,
        pollStats,
        registerPatient,
        addRandomPatient,
        startConsult,
        prescribe,
        discharge,
        resetSession
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
}
