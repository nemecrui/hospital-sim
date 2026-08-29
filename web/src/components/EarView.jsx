// Vista do ouvido (otoscópio). inflamed = canal vermelho/inflamado.
export default function EarView({ inflamed }) {
  const canal = inflamed ? '#c62828' : '#caa06a';
  const glow = inflamed ? '#e5393533' : 'transparent';
  return (
    <svg viewBox="0 0 140 130" width="150" height="140" className="mx-auto">
      {/* orelha (pavilhão) */}
      <path
        d="M78 18 C 108 18, 120 52, 108 84 C 100 106, 78 116, 60 112 C 44 108, 40 92, 48 82 C 56 72, 44 66, 40 54 C 34 34, 52 18, 78 18 Z"
        fill="#f3c9a0"
        stroke="#d8a878"
        strokeWidth="2"
      />
      {/* dobra interior */}
      <path d="M74 34 C 92 34, 98 58, 90 78 C 84 94, 70 100, 62 96" fill="none" stroke="#d8a878" strokeWidth="3" />
      {/* auréola de inflamação */}
      <circle cx="74" cy="66" r="24" fill={glow} />
      {/* canal auditivo */}
      <ellipse cx="74" cy="66" rx="15" ry="18" fill={canal} />
      <ellipse cx="74" cy="66" rx="7" ry="10" fill="#3a2410" />
      {/* brilho do otoscópio */}
      <circle cx="80" cy="60" r="3" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}
