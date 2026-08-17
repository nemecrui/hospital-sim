export const WRISTBANDS = [
  { id: 'verde', label: 'Verde', sub: 'Não é urgente', dot: '🟢', bg: 'bg-green-500', ring: 'ring-green-500' },
  { id: 'amarela', label: 'Amarela', sub: 'Pouco urgente', dot: '🟡', bg: 'bg-yellow-400', ring: 'ring-yellow-400' },
  { id: 'laranja', label: 'Laranja', sub: 'Urgente', dot: '🟠', bg: 'bg-orange-500', ring: 'ring-orange-500' },
  { id: 'vermelha', label: 'Vermelha', sub: 'Muito urgente', dot: '🔴', bg: 'bg-red-500', ring: 'ring-red-500' }
];

export function bandOf(id) {
  return WRISTBANDS.find((w) => w.id === id);
}

// Pequeno crachá com a cor da pulseira
export default function Wristband({ color }) {
  const b = bandOf(color);
  if (!b) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold">
      {b.dot} {b.label}
    </span>
  );
}
