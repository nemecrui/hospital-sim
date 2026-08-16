import { useState } from 'react';
import diagnoses from '../data/diagnoses.json';

export default function PatientForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ name: '', age: '', symptom: '', urgency: 'normal' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.age) return;
    onSubmit({
      name: form.name,
      age: parseInt(form.age, 10),
      symptoms: form.symptom ? [form.symptom] : [],
      urgency: form.urgency
    });
    setForm({ name: '', age: '', symptom: '', urgency: 'normal' });
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <h3 className="mb-3 text-lg font-bold">📝 Novo Doente</h3>

      <label className="mb-2 block text-sm font-semibold">Nome</label>
      <input
        className="input mb-3"
        placeholder="Ex: João Silva"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <label className="mb-2 block text-sm font-semibold">Idade</label>
      <input
        className="input mb-3"
        type="number"
        min="0"
        max="120"
        placeholder="Ex: 8"
        value={form.age}
        onChange={(e) => setForm({ ...form, age: e.target.value })}
      />

      <label className="mb-2 block text-sm font-semibold">Sintoma / Razão</label>
      <select
        className="input mb-3"
        value={form.symptom}
        onChange={(e) => setForm({ ...form, symptom: e.target.value })}
      >
        <option value="">— escolher —</option>
        {diagnoses.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <label className="mb-2 block text-sm font-semibold">Urgência</label>
      <div className="mb-4 flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="urgency"
            checked={form.urgency === 'normal'}
            onChange={() => setForm({ ...form, urgency: 'normal' })}
          />
          Normal
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="urgency"
            checked={form.urgency === 'urgent'}
            onChange={() => setForm({ ...form, urgency: 'urgent' })}
          />
          🔴 Urgente
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn w-full bg-gradient-to-r from-hospital-pink to-pink-500 py-3 text-white hover:shadow-lg disabled:opacity-50"
      >
        {loading ? 'A registar...' : '✓ Registar'}
      </button>
    </form>
  );
}
