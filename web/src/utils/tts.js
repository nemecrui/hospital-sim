// Ler texto em voz alta (para quem ainda não sabe ler).
export function speak(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'pt-PT';
    u.rate = 0.95;
    // Tenta escolher uma voz portuguesa, se existir
    const voices = window.speechSynthesis.getVoices();
    const pt = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('pt'));
    if (pt) u.voice = pt;
    window.speechSynthesis.speak(u);
  } catch {
    /* sem voz disponível */
  }
}
