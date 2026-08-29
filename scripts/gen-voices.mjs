// Gera os clips de voz (mp3) a partir de scripts/voice-lines.json, com o Google TTS (grátis).
// Correr uma vez, na RAIZ do projeto:
//   npm install google-tts-api
//   node scripts/gen-voices.mjs
// Os ficheiros vão para web/public/voices/ e é criado o manifest.json.
// Depois: git add -A && git commit -m "vozes" && git push
//
// Nota: para trocar o sotaque, muda LANG abaixo ('pt' = brasileiro; experimenta 'pt-PT').

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import googleTTS from 'google-tts-api';

const LANG = 'pt-PT';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, '../web/public/voices');

// stripEmoji + slug TÊM de ser iguais aos de web/src/utils/clips.js
function stripEmoji(t) {
  return String(t || '')
    .replace(/[\p{Extended_Pictographic}‍️⃣]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}
function slug(t) {
  return String(t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\p{Extended_Pictographic}‍️]/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

const lines = JSON.parse(fs.readFileSync(path.join(HERE, 'voice-lines.json'), 'utf8'));
fs.mkdirSync(OUT, { recursive: true });

const done = [];
let novos = 0;
for (const raw of lines) {
  const clean = stripEmoji(raw);
  if (!clean) continue;
  const s = slug(clean);
  if (!s || done.includes(s)) continue;
  const file = path.join(OUT, `${s}.mp3`);
  if (fs.existsSync(file)) {
    done.push(s);
    continue;
  }
  try {
    const b64 = await googleTTS.getAudioBase64(clean, { lang: LANG, slow: false, host: 'https://translate.google.com' });
    fs.writeFileSync(file, Buffer.from(b64, 'base64'));
    done.push(s);
    novos++;
    console.log('✓', s);
    await new Promise((r) => setTimeout(r, 400)); // pausa para não sobrecarregar o Google
  } catch (e) {
    console.error('✗ falhou:', clean, '—', String(e).slice(0, 120));
  }
}

fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify([...new Set(done)]));
console.log(`\nFeito: ${done.length} clips (${novos} novos). manifest.json escrito em web/public/voices/`);
