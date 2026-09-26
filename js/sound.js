// Sons simples gerados na hora (sem arquivos)
let ctx = null;
let muted = localStorageGet('atelie-mudo') === '1';

function localStorageGet(k) {
  try { return localStorage.getItem(k); } catch { return null; }
}

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, type = 'sine', vol = 0.18, slide = 0) {
  const c = ac();
  if (!c || muted) return;
  const t = c.currentTime + start;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sound = {
  unlock: () => ac(),
  get muted() { return muted; },
  toggle() {
    muted = !muted;
    try { localStorage.setItem('atelie-mudo', muted ? '1' : '0'); } catch {}
    return muted;
  },
  pop: () => tone(520 + Math.random() * 200, 0, 0.16, 'sine', 0.2, 1.8),
  click: () => tone(900, 0, 0.05, 'triangle', 0.08),
  oops: () => { tone(300, 0, 0.14, 'sine', 0.14, 0.7); tone(240, 0.12, 0.18, 'sine', 0.12, 0.7); },
  yay: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.22, 'triangle', 0.16)),
};
