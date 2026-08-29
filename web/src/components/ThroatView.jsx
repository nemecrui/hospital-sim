// Vista da garganta (boca aberta). inflamed = vermelha e inchada.
export default function ThroatView({ inflamed }) {
  const back = inflamed ? '#c62828' : '#e78a90';
  const tonsil = inflamed ? '#e53935' : '#f0a6ab';
  const tonsilR = inflamed ? 9 : 6;
  return (
    <svg viewBox="0 0 140 130" width="150" height="140" className="mx-auto">
      {/* lábios */}
      <ellipse cx="70" cy="65" rx="52" ry="42" fill="#d98a8f" />
      {/* interior da boca */}
      <ellipse cx="70" cy="66" rx="44" ry="35" fill="#7d1f2a" />
      {/* fundo da garganta */}
      <ellipse cx="70" cy="72" rx="26" ry="22" fill={back} />
      {/* amígdalas */}
      <circle cx="52" cy="72" r={tonsilR} fill={tonsil} />
      <circle cx="88" cy="72" r={tonsilR} fill={tonsil} />
      {/* úvula */}
      <path d="M70 52 q4 12 0 20 q-4 -8 0 -20z" fill={inflamed ? '#e53935' : '#e78a90'} />
      {/* dentes de cima */}
      <g fill="#fff">
        <rect x="40" y="34" width="9" height="10" rx="2" />
        <rect x="51" y="31" width="9" height="10" rx="2" />
        <rect x="62" y="30" width="9" height="10" rx="2" />
        <rect x="73" y="30" width="9" height="10" rx="2" />
        <rect x="84" y="31" width="9" height="10" rx="2" />
        <rect x="95" y="34" width="9" height="10" rx="2" />
      </g>
      {/* língua */}
      <ellipse cx="70" cy="96" rx="30" ry="16" fill="#e26d78" />
      <path d="M70 84 q0 12 0 20" stroke="#c85763" strokeWidth="2" fill="none" />
    </svg>
  );
}
