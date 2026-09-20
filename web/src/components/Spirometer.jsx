import { useEffect, useRef, useState } from 'react';

// 🫁 Capacidade respiratória: sopra para o MICROFONE e o balão enche.
// Mede o sopro mais forte e dá um resultado. Simula inspirar (balão a esvaziar)
// e expirar (a soprar → balão a encher). O microfone é só para medir o sopro —
// nada é gravado nem enviado; desliga tudo ao sair. Sem microfone → "manter premido".

function resultFor(peak) {
  if (peak >= 75) return 'Sopro de campeão! 🫁💪';
  if (peak >= 50) return 'Respira muito bem 🫁';
  if (peak >= 30) return 'Respiração normal';
  if (peak >= 15) return 'Um bocadinho preso 😮‍💨';
  return 'Chiadinho — dar xarope 🥄';
}

export default function Spirometer({ onDecide }) {
  const [mode, setMode] = useState('loading'); // loading | mic | manual
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);

  const acRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(0);
  const levelRef = useRef(0);
  const peakRef = useRef(0);
  const holdRef = useRef(false);
  const manualTimer = useRef(null);

  const stopAll = () => {
    cancelAnimationFrame(rafRef.current);
    if (manualTimer.current) clearInterval(manualTimer.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    acRef.current?.close?.().catch?.(() => {});
    acRef.current = null;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) return setMode('manual');
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        streamRef.current = s;
        const AC = window.AudioContext || window.webkitAudioContext;
        const ac = new AC();
        acRef.current = ac;
        ac.resume?.().catch(() => {});
        const src = ac.createMediaStreamSource(s);
        const an = ac.createAnalyser();
        an.fftSize = 1024;
        src.connect(an);
        const buf = new Uint8Array(an.fftSize);
        const loop = () => {
          an.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) {
            const v = (buf[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / buf.length); // 0..1
          const lv = Math.min(100, Math.max(0, rms * 260 - 4)); // tira o ruído de fundo
          levelRef.current += (lv - levelRef.current) * 0.35;
          if (levelRef.current > peakRef.current) peakRef.current = levelRef.current;
          setLevel(Math.round(levelRef.current));
          setPeak(Math.round(peakRef.current));
          rafRef.current = requestAnimationFrame(loop);
        };
        setMode('mic');
        rafRef.current = requestAnimationFrame(loop);
      } catch {
        if (!cancelled) setMode('manual');
      }
    })();
    return () => { cancelled = true; stopAll(); };
  }, []);

  // Fallback manual: manter premido a soprar
  const startHold = () => {
    holdRef.current = true;
    if (manualTimer.current) return;
    manualTimer.current = setInterval(() => {
      const target = holdRef.current ? 92 : 0;
      levelRef.current += (target - levelRef.current) * 0.15;
      if (levelRef.current > peakRef.current) peakRef.current = levelRef.current;
      setLevel(Math.round(levelRef.current));
      setPeak(Math.round(peakRef.current));
    }, 50);
  };
  const stopHold = () => { holdRef.current = false; };

  const recomecar = () => {
    peakRef.current = 0;
    setPeak(0);
  };
  const registar = () => {
    const r = resultFor(peakRef.current);
    stopAll();
    onDecide(r);
  };

  const soprando = level > 18;
  const scale = 1 + Math.min(1.1, level / 90);
  const pronto = peak >= 8;

  return (
    <div className="mt-3 text-center">
      <p className="mb-2 text-sm font-semibold text-gray-700">
        {mode === 'manual' ? '🎈 Mantém o botão premido para soprar!' : soprando ? 'Isso! Sopra com força! 💨💨' : 'Inspira fundo… e SOPRA para o microfone! 💨'}
      </p>

      <div className="relative mx-auto flex h-[210px] w-full max-w-[320px] items-center justify-center overflow-hidden rounded-2xl border-2 border-sky-100 bg-gradient-to-b from-sky-50 to-white">
        {/* balão/pulmões que enche com o sopro */}
        <div style={{ transform: `scale(${scale})`, transition: 'transform .08s linear' }} className="text-[86px] leading-none">
          {soprando ? '🎈' : '🫁'}
        </div>
        {/* ventinho */}
        {soprando && <div className="pointer-events-none absolute bottom-3 left-3 text-3xl">💨</div>}
        {/* medidor de pico à direita */}
        <div className="absolute bottom-3 right-3 top-3 flex w-4 flex-col-reverse overflow-hidden rounded-full bg-sky-100">
          <div className="w-full bg-gradient-to-t from-hospital-cyan to-sky-400 transition-[height] duration-100" style={{ height: `${level}%` }} />
          <div className="absolute left-0 w-full border-t-2 border-dashed border-hospital-pink" style={{ bottom: `${peak}%` }} />
        </div>
      </div>

      <div className="mx-auto mt-2 flex max-w-[320px] items-center justify-between text-xs text-gray-500">
        <span>Sopro máximo: <b className="text-hospital-pink">{peak}</b></span>
        <span>{peak >= 75 ? '🏆 enorme!' : peak >= 50 ? '💪 forte' : peak >= 30 ? '🙂 bom' : peak >= 15 ? '😮‍💨 fraquinho' : '…'}</span>
      </div>

      {mode === 'manual' && (
        <button
          onPointerDown={startHold}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          className="btn mx-auto mt-3 block touch-none select-none bg-gradient-to-b from-sky-300 to-hospital-cyan px-6 py-3 font-bold text-[#06253f] shadow-md active:scale-95"
        >
          💨 Manter premido para soprar
        </button>
      )}

      <div className="mt-3 flex justify-center gap-2">
        <button onClick={recomecar} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200">↺ recomeçar</button>
        <button onClick={registar} disabled={!pronto} className="btn bg-gradient-to-r from-hospital-pink to-pink-500 px-4 py-1 text-sm text-white disabled:opacity-40">
          ✓ Registar sopro
        </button>
      </div>
    </div>
  );
}
