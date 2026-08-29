import { isStandalone } from './InstallPrompt.jsx';

// Rodapé fixo, presente em todos os ecrãs.
export default function Footer() {
  const instalado = isStandalone();
  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-50 py-1 text-center text-[11px] text-gray-400">
      Made by Rui Xavier com carinho para a Inês e a Sara ❤️
      {!instalado && (
        <>
          {' · '}
          <button
            onClick={() => window.dispatchEvent(new Event('open-install'))}
            className="pointer-events-auto font-semibold text-hospital-pink hover:underline"
          >
            📲 Instalar app
          </button>
        </>
      )}
    </footer>
  );
}
