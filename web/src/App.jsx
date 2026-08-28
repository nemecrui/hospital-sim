import { useEffect, useState } from 'react';
import { HospitalProvider } from './context/HospitalContext.jsx';
import Home from './pages/Home.jsx';
import Setup from './pages/Setup.jsx';
import Secretaria from './pages/Secretaria.jsx';
import Medica from './pages/Medica.jsx';
import Enfermeira from './pages/Enfermeira.jsx';
import Tad from './pages/Tad.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GoalBar from './components/GoalBar.jsx';
import HospitalHeader from './components/HospitalHeader.jsx';
import DidYouKnow from './components/DidYouKnow.jsx';
import StickerPopup from './components/StickerPopup.jsx';
import Mascot from './components/Mascot.jsx';
import { setSoundEnabled, isSoundEnabled } from './utils/sound.js';
import { isMusicOn, toggleMusic } from './utils/music.js';
import { API_URL } from './utils/api.js';
import { getContent } from './content.js';

const ROLE_STYLE = {
  secretaria: { from: 'from-pink-400', to: 'to-pink-500' },
  medica: { from: 'from-blue-400', to: 'to-blue-500' },
  enfermeira: { from: 'from-green-400', to: 'to-green-500' },
  tad: { from: 'from-indigo-400', to: 'to-indigo-500' }
};
const ROLE_IDS = ['secretaria', 'medica', 'enfermeira', 'tad'];

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [config, setConfig] = useState(null); // { players, humanRoles: [] }
  const [childName, setChildName] = useState('');
  const [role, setRole] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('sessionId');
    if (saved) setSessionId(saved);
    const savedName = localStorage.getItem('childName');
    if (savedName) setChildName(savedName);
  }, []);

  // Sempre que temos sessão, buscamos a configuração (nº jogadoras / papéis humanos)
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/sessions/${sessionId}`);
        if (res.ok && !cancelled) {
          const s = await res.json();
          setConfig({
            code: s.code || null,
            players: s.players ?? 1,
            humanRoles: safeParse(s.humanRoles),
            goalTarget: s.goalTarget ?? 8,
            scenario: s.scenario || 'normal',
            mode: s.mode || 'hospital'
          });
        }
      } catch {
        /* servidor offline — Home trata do erro */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const handleSessionReady = (id) => {
    setSessionId(id);
    localStorage.setItem('sessionId', id);
  };

  const leaveSession = () => {
    setSessionId(null);
    setConfig(null);
    setRole(null);
    localStorage.removeItem('sessionId');
  };

  if (!sessionId) return <Home onSessionReady={handleSessionReady} />;

  // À espera de saber a config
  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        A carregar sessão...
      </div>
    );
  }

  // Sessão ainda não configurada → ecrã de setup
  if (config.humanRoles.length === 0) {
    return (
      <Setup
        sessionId={sessionId}
        mode={config.mode}
        onDone={(c) => setConfig((prev) => ({ ...prev, ...c }))}
        onBack={leaveSession}
      />
    );
  }

  const logPlay = (r) => {
    if (!['secretaria', 'medica', 'enfermeira', 'tad'].includes(r)) return;
    fetch(`${API_URL}/plays`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, name: childName || 'Criança', role: r })
    }).catch(() => {});
  };

  if (!role) {
    return (
      <RoleSelector
        sessionId={sessionId}
        config={config}
        childName={childName}
        setChildName={setChildName}
        onSelectRole={(r) => {
          localStorage.setItem('childName', childName || 'Criança');
          logPlay(r);
          setRole(r);
        }}
        onLeave={leaveSession}
      />
    );
  }

  const playerId = childName || 'Criança';
  const content = getContent(config.mode);

  return (
    <HospitalProvider sessionId={sessionId}>
      <StickerPopup />
      <Mascot mode={config.mode} />
      <div className="mx-auto min-h-screen max-w-3xl p-4">
        <HospitalHeader title={content.title} />

        <header className="mb-3 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            👧 <strong>{playerId}</strong> ·{' '}
            {role === 'dashboard' ? '📊 Dashboard' : content.roles[role]}
          </div>
          <button
            onClick={() => setRole(null)}
            className="btn bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
          >
            ← Trocar papel
          </button>
        </header>

        <GoalBar mode={config.mode} />
        <DidYouKnow />

        {role === 'secretaria' && <Secretaria mode={config.mode} />}
        {role === 'medica' && <Medica playerId={playerId} mode={config.mode} />}
        {role === 'enfermeira' && <Enfermeira playerId={playerId} mode={config.mode} />}
        {role === 'tad' && <Tad playerId={playerId} mode={config.mode} />}
        {role === 'dashboard' && <Dashboard />}
      </div>
    </HospitalProvider>
  );
}

function safeParse(json) {
  try {
    const v = JSON.parse(json || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function RoleSelector({ sessionId, config, childName, setChildName, onSelectRole, onLeave }) {
  const [copied, setCopied] = useState(false);
  const [sound, setSound] = useState(isSoundEnabled());
  const [music, setMusic] = useState(isMusicOn());

  const content = getContent(config.mode);
  const humanRoles = config.humanRoles;
  const humanRoleIds = ROLE_IDS.filter((id) => humanRoles.includes(id));
  const cpuRoleIds = ROLE_IDS.filter((id) => !humanRoles.includes(id));
  const shareCode = config.code || sessionId;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
  };

  const toggleMus = () => {
    setMusic(toggleMusic());
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-6 text-center text-4xl font-bold">{content.title}</h1>

        <div className="mb-4 rounded-xl bg-blue-50 p-3 text-center">
          <div className="text-xs text-blue-500">
            Palavra-passe do jogo (diz à mana esta fruta 🍓)
          </div>
          <div className="flex items-center justify-center gap-2">
            <code className="text-xl font-bold text-blue-800">{shareCode}</code>
            <button onClick={copyCode} className="text-xs underline">
              {copied ? '✓ copiado' : 'copiar'}
            </button>
          </div>
        </div>

        <label className="mb-2 block text-sm font-semibold">Qual é o teu nome?</label>
        <input
          className="input mb-6"
          placeholder="Ex: Sofia"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
        />

        <div className="space-y-3">
          {humanRoleIds.map((id) => (
            <button
              key={id}
              onClick={() => onSelectRole(id)}
              className={`btn w-full bg-gradient-to-r ${ROLE_STYLE[id].from} ${ROLE_STYLE[id].to} py-4 text-lg font-bold text-white transition hover:scale-105 hover:shadow-lg`}
            >
              {content.roles[id]}
            </button>
          ))}

          <button
            onClick={() => onSelectRole('dashboard')}
            className="btn w-full bg-gradient-to-r from-yellow-400 to-yellow-500 py-4 text-lg font-bold text-white transition hover:scale-105 hover:shadow-lg"
          >
            📊 Dashboard
          </button>
        </div>

        {cpuRoleIds.length > 0 && (
          <p className="mt-4 rounded-xl bg-yellow-50 p-2 text-center text-xs text-yellow-800">
            🤖 O computador trata de: {cpuRoleIds.map((id) => content.roles[id]).join(', ')}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
          <button onClick={onLeave} className="hover:underline">
            ← Sair da sessão
          </button>
          <div className="flex gap-3">
            <button onClick={toggleMus} className="hover:underline">
              {music ? '🎵 Música ligada' : '🎵 Música desligada'}
            </button>
            <button onClick={toggleSound} className="hover:underline">
              {sound ? '🔊 Som ligado' : '🔇 Som desligado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
