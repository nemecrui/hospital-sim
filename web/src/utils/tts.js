// Ler texto em voz alta (para quem ainda não sabe ler).
function pickVoice(preferSecond) {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith('pt'));
  if (voices.length === 0) return null;
  // Voz das dicas tenta ser diferente da dos doentes
  if (preferSecond && voices.length > 1) return voices[1];
  return voices[0];
}

function say(text, { pitch = 1, rate = 0.95, second = false } = {}) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-PT';
    u.rate = rate;
    u.pitch = pitch;
    const v = pickVoice(second);
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {
    /* sem voz disponível */
  }
}

// Voz do doente
export function speak(text) {
  say(text, { pitch: 1, rate: 0.95, second: false });
}

// Voz das dicas — diferente (mais aguda e um pouco mais lenta) para não confundir
export function speakTip(text) {
  say(text, { pitch: 1.4, rate: 0.9, second: true });
}
