// Toca clips de voz pré-gerados (mp3) quando existem; senão, quem chama usa a voz do browser.
// Cada personagem soa diferente porque tocamos o mesmo clip a velocidades/tons diferentes.

let manifest = new Set();
let current = null;

// slug tem de ser IGUAL ao do gerador (scripts/gen-voices.mjs)
export function slug(t) {
  return String(t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // tira acentos
    .replace(/[\p{Extended_Pictographic}‍️]/gu, '') // tira emojis
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

(async function loadManifest() {
  try {
    const res = await fetch('/voices/manifest.json', { cache: 'no-cache' });
    if (res.ok) {
      const arr = await res.json();
      if (Array.isArray(arr)) manifest = new Set(arr);
    }
  } catch {
    /* sem clips — usa-se a voz do browser */
  }
})();

export function stopClip() {
  if (current) {
    try {
      current.pause();
    } catch {
      /* ignore */
    }
    current = null;
  }
}

// Toca o clip para este texto, no tom da personagem (derivado do pitch). Devolve true se tocou.
export function playClip(text, pitch = 1) {
  const s = slug(text);
  if (!manifest.has(s)) return false;
  try {
    stopClip();
    const a = new Audio(`/voices/${s}.mp3`);
    const rate = Math.max(0.85, Math.min(1.3, 1 + (pitch - 1) * 0.4));
    a.playbackRate = rate;
    a.preservesPitch = false;
    a.mozPreservesPitch = false;
    a.webkitPreservesPitch = false;
    current = a;
    a.play().catch(() => {});
    return true;
  } catch {
    return false;
  }
}
