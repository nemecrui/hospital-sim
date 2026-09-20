import CameraLens from './CameraLens.jsx';
import ThroatView from './ThroatView.jsx';
import EarView from './EarView.jsx';

// Moldura circular (efeito "espreitar pelo aparelho") à volta do desenho
function Scope({ children, bg = '#180a0d' }) {
  return (
    <div className="relative flex items-center justify-center rounded-full" style={{ width: 230, height: 230, background: bg, boxShadow: 'inset 0 0 60px #000, 0 0 0 6px #0006' }}>
      <div style={{ transform: 'scale(1.5)' }}>{children}</div>
    </div>
  );
}

// 🔦 Ver a garganta com a câmara da frente ("diz aaah")
export function ThroatScope({ inflamed }) {
  return (
    <CameraLens
      badge="🔦 Garganta"
      aim='Abre a boca e diz "aaah" para a câmara 🗣️'
      guide="👄"
      facing="user"
      filter="contrast(1.1) saturate(1.2)"
      captureLabel="🔦 Ver a garganta"
      reveal={<Scope bg="#1a0d10"><ThroatView inflamed={inflamed} /></Scope>}
      fallback={<div className="flex justify-center"><ThroatView inflamed={inflamed} /></div>}
    />
  );
}

// 👂 Ver o ouvido (otoscópio) — apontar ao ouvido (ou ao peluche)
export function EarScope({ inflamed }) {
  return (
    <CameraLens
      badge="👂 Ouvido"
      aim="Encosta a câmara ao ouvido (ou ao peluche!) 👂"
      guide="👂"
      facing="environment"
      filter="contrast(1.1) saturate(1.2)"
      captureLabel="👂 Ver o ouvido"
      reveal={<Scope bg="#120a0a"><EarView inflamed={inflamed} /></Scope>}
      fallback={<div className="flex justify-center"><EarView inflamed={inflamed} /></div>}
    />
  );
}
