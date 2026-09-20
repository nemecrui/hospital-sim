import { useEffect, useRef, useState } from 'react';

// 🎥 "Olho de câmara" reutilizável para exames com câmara.
//  - Liga a câmara (só para o efeito — nada é guardado nem enviado).
//  - Mostra a indicação do que apontar + um feixe/guia.
//  - Ao "tirar", congela a imagem e revela o `reveal` (o desenho do exame).
//  - Sem câmara/permissão → mostra `fallback` (versão desenhada).
// Props: badge, aim (texto), guide (emoji), facing ('environment'|'user'),
//        filter (CSS), captureLabel, reveal (node), afterShot (node), fallback (node).
export default function CameraLens({
  badge = '🎥',
  aim,
  guide,
  facing = 'environment',
  filter,
  captureLabel = '📸 Fazer exame',
  reveal,
  afterShot,
  fallback
}) {
  const [mode, setMode] = useState('loading'); // loading | cam | draw
  const [shot, setShot] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setMode('draw');
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing } }, audio: false });
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        streamRef.current = s;
        setMode('cam');
      } catch {
        if (!cancelled) setMode('draw');
      }
    })();
    return () => { cancelled = true; stop(); };
  }, [facing]);

  useEffect(() => {
    if (mode === 'cam' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play?.().catch(() => {});
    }
  }, [mode]);

  const tirar = () => { setShot(true); videoRef.current?.pause?.(); };
  const repetir = () => { setShot(false); videoRef.current?.play?.().catch(() => {}); };

  if (mode === 'draw') return <div className="mt-1">{fallback}</div>;

  return (
    <div className="mt-3">
      <style>{`@keyframes clscan{0%{top:-18%}50%{top:82%}100%{top:-18%}} .cl-beam{animation:clscan 3s ease-in-out infinite}`}</style>

      {aim && (
        <div className="mb-2 flex items-center justify-center gap-2 rounded-xl bg-sky-50 p-2 text-sm font-semibold text-sky-800">
          {guide && <span className="text-2xl">{guide}</span>} {aim}
        </div>
      )}

      <div className="relative mx-auto h-[260px] w-full max-w-[340px] overflow-hidden rounded-2xl border-2 border-[#123]" style={{ background: 'radial-gradient(120% 90% at 50% 30%, #0e1f52, #08122e 70%)' }}>
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" style={{ filter: filter || 'contrast(1.05)' }} />
        <div className="pointer-events-none absolute inset-0 opacity-15" style={{ backgroundImage: 'linear-gradient(#3fa9ff44 1px,transparent 1px),linear-gradient(90deg,#3fa9ff44 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

        {!shot && <div className="cl-beam pointer-events-none absolute left-0 right-0 h-16" style={{ background: 'linear-gradient(180deg,transparent,#00e5ff33 45%,#7ffcffcc 50%,#00e5ff33 55%,transparent)', boxShadow: '0 0 30px #00e5ff88' }} />}
        {!shot && guide && <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[110px] opacity-25">{guide}</div>}
        {shot && <div className="absolute inset-0 flex items-center justify-center">{reveal}</div>}

        <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-[#0b1c46cc] px-2 py-0.5 text-xs font-bold text-sky-100 ring-1 ring-sky-500">{badge}</div>
        {!shot && <div className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 text-xs font-bold text-red-300"><span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-400" /> LIVE</div>}
        <div className="pointer-events-none absolute inset-0" style={{ boxShadow: 'inset 0 0 90px #000a' }} />
      </div>

      {!shot ? (
        <button onClick={tirar} className="btn mx-auto mt-3 block bg-gradient-to-b from-sky-300 to-hospital-cyan px-6 py-2 font-bold text-[#06253f] shadow-md">{captureLabel}</button>
      ) : (
        <>
          {afterShot}
          <button onClick={repetir} className="mx-auto mt-2 block text-xs text-gray-400 hover:underline">↻ tirar outra vez</button>
        </>
      )}
    </div>
  );
}
