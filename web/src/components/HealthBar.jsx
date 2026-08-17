export default function HealthBar({ value = 0 }) {
  const v = Math.max(0, Math.min(100, value));
  const color =
    v >= 100 ? 'bg-green-500' : v >= 60 ? 'bg-lime-500' : v >= 35 ? 'bg-yellow-400' : 'bg-red-400';
  const face = v >= 100 ? '😀' : v >= 60 ? '🙂' : v >= 35 ? '😕' : '🤒';

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm font-semibold">
        <span>{face} Estado do doente</span>
        <span>{v}%</span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}
