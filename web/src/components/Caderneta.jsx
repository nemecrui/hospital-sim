import stickers from '../data/stickers.json';

// Caderneta de autocolantes: mostra todos, os ganhos a cores (com contagem).
export default function Caderneta({ earned = [] }) {
  const counts = earned.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});
  const totalDiferentes = stickers.filter((s) => counts[s.id]).length;

  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-bold">📔 Caderneta de autocolantes</h4>
        <span className="text-xs text-gray-500">
          {totalDiferentes}/{stickers.length}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
        {stickers.map((s) => {
          const n = counts[s.id] || 0;
          const got = n > 0;
          return (
            <div
              key={s.id}
              title={s.name}
              className={`relative flex aspect-square items-center justify-center rounded-xl text-2xl ${
                got ? 'bg-pink-50' : 'bg-gray-100 grayscale opacity-40'
              }`}
            >
              {got ? s.emoji : '❔'}
              {n > 1 && (
                <span className="absolute -bottom-1 -right-1 rounded-full bg-hospital-pink px-1 text-[10px] font-bold text-white">
                  {n}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
