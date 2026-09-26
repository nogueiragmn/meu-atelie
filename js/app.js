import { PALETTE } from './palette.js';
import { convertImage } from './convert.js';
import { Board } from './board.js';
import { store } from './store.js';
import { sound } from './sound.js';

const app = document.getElementById('app');
let cleanup = null;

// ---------- utilidades ----------
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') for (const [p, val] of Object.entries(v)) el.style.setProperty(p.startsWith('--') ? p : p.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase()), val);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
  return el;
}

function show(el, onLeave) {
  if (cleanup) cleanup();
  cleanup = onLeave || null;
  app.replaceChildren(el);
}

function toast(msg) {
  const t = h('div', { class: 'toast' }, msg);
  document.body.append(t);
  setTimeout(() => t.classList.add('out'), 1800);
  setTimeout(() => t.remove(), 2300);
}

function confirmBox(msg, yes = 'Sim', no = 'Não') {
  return new Promise((res) => {
    const close = (v) => { m.remove(); res(v); };
    const m = h('div', { class: 'modal' },
      h('div', { class: 'modal-card' },
        h('p', {}, msg),
        h('div', { class: 'modal-btns' },
          h('button', { class: 'btn big no', onclick: () => close(false) }, no),
          h('button', { class: 'btn big yes', onclick: () => close(true) }, yes))));
    document.body.append(m);
  });
}

function loading(msg) {
  const el = h('div', { class: 'loading' }, h('div', { class: 'spinner' }, '🎨'), h('p', {}, msg));
  document.body.append(el);
  return () => el.remove();
}

function pencil(p, { num, onclick } = {}) {
  return h('button', { class: 'lapis', style: { '--c': p.hex }, title: p.nome, 'aria-label': p.nome, onclick },
    h('i', { class: 'ponta' }), h('i', { class: 'corpo' }, num ? h('b', {}, String(num)) : null));
}

function confetti() {
  const c = h('canvas', { class: 'confetti' });
  document.body.append(c);
  const W = (c.width = innerWidth), H = (c.height = innerHeight), x = c.getContext('2d');
  const cols = PALETTE.filter((_, i) => i > 0 && i < 23).map((p) => p.hex);
  const parts = Array.from({ length: 160 }, () => ({
    x: Math.random() * W, y: -20 - Math.random() * H * 0.6, vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4,
    r: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.3, s: 8 + Math.random() * 10, c: cols[(Math.random() * cols.length) | 0],
  }));
  const t0 = performance.now();
  (function tick(t) {
    x.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.r += p.vr;
      x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore();
    }
    if (t - t0 < 3500) requestAnimationFrame(tick); else c.remove();
  })(t0);
}

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

// ---------- páginas ----------
async function listPages() {
  let base = [];
  try {
    const r = await fetch('paginas/paginas.json', { cache: 'no-cache' });
    base = (await r.json()).map((p) => ({ ...p, src: 'paginas/' + p.arquivo }));
  } catch (e) { console.warn('sem paginas.json', e); }
  const ups = (await store.all('paginas')).map((p) => ({ ...p, src: URL.createObjectURL(p.blob), upload: true }));
  return [...base, ...ups];
}

const convCache = new Map();
async function getConverted(page) {
  const key = page.id + JSON.stringify(page.opcoes || {});
  if (convCache.has(key)) return convCache.get(key);
  const img = await loadImage(page.src);
  await new Promise((r) => setTimeout(r, 30));
  const conv = convertImage(img, page.opcoes || {});
  conv.originalSrc = page.src;
  conv.modelURL = conv.modelCanvas.toDataURL('image/png');
  if (convCache.size >= 3) convCache.delete(convCache.keys().next().value);
  convCache.set(key, conv);
  return conv;
}

// ---------- telas ----------
function home() {
  const card = (cls, emoji, title, sub, fn) =>
    h('button', { class: `card ${cls}`, onclick: () => { sound.unlock(); sound.click(); fn(); } },
      h('span', { class: 'emoji' }, emoji), h('strong', {}, title), h('small', {}, sub));
  const muteBtn = h('button', { class: 'btn round mute', onclick: () => { muteBtn.textContent = sound.toggle() ? '🔇' : '🔊'; } }, sound.muted ? '🔇' : '🔊');
  show(h('div', { class: 'home' },
    h('h1', {}, 'Meu Ateliê ', h('span', {}, '🎨')),
    h('div', { class: 'cards' },
      card('c1', '🔢', 'Pintar com números', 'Toque no número e pinte!', () => pagesScreen('numeros')),
      card('c2', '🖍️', 'Pintar livre', 'Pinte do seu jeito', () => pagesScreen('livre')),
      card('c3', '✏️', 'Desenhar', 'Folha em branco', () => openDrawing()),
      card('c4', '🖼️', 'Minhas obras', 'Tudo que você guardou', () => gallery())),
    muteBtn));
}

async function pagesScreen(mode) {
  const pages = await listPages();
  const urls = pages.filter((p) => p.upload).map((p) => p.src);
  const title = mode === 'numeros' ? '🔢 Pintar com números' : '🖍️ Pintar livre';
  const fileInput = h('input', { type: 'file', accept: 'image/*', hidden: true, onchange: async () => {
    const f = fileInput.files[0];
    if (!f) return;
    await store.put('paginas', { id: 'u' + Date.now(), nome: 'Desenho novo', blob: f });
    pagesScreen(mode);
  } });
  const grid = h('div', { class: 'grid' },
    pages.map((p) => h('div', { class: 'page-card', onclick: () => { sound.click(); openPage(mode, p); } },
      h('img', { src: p.src, alt: p.nome, draggable: 'false' }),
      h('span', {}, p.nome),
      p.upload ? h('button', { class: 'del', onclick: async (e) => {
        e.stopPropagation();
        if (await confirmBox('Tirar este desenho da lista?')) { await store.del('paginas', p.id); pagesScreen(mode); }
      } }, '✖') : null)),
    h('div', { class: 'page-card add', onclick: () => fileInput.click() }, h('span', { class: 'plus' }, '+'), h('span', {}, 'Adicionar foto')),
    fileInput);
  show(h('div', { class: 'list' },
    h('header', { class: 'topbar' }, h('button', { class: 'btn round', onclick: home }, '🏠'), h('h2', {}, title)),
    grid), () => urls.forEach((u) => URL.revokeObjectURL(u)));
}

async function openPage(mode, page) {
  const done = loading('Preparando o desenho…');
  try {
    const conv = await getConverted(page);
    done();
    await workScreen(mode, page, conv);
  } catch (e) {
    done();
    console.error(e);
    toast('Ops! Não consegui abrir esse desenho.');
  }
}

function openDrawing() {
  workScreen('desenho', { id: 'desenho', nome: 'Desenho' }, null);
}

async function workScreen(mode, page, conv) {
  const stateKey = mode === 'desenho' ? 'desenho' : `${mode}:${page.id}`;
  const saved = await store.get('estado', stateKey);

  const wrap = h('main', { class: 'board-wrap' });
  const side = h('aside', { class: 'side' });
  const tray = h('aside', { class: 'tray' });
  const progress = h('div', { class: 'progress' });
  const undoBtn = h('button', { class: 'btn round', title: 'Desfazer' }, '↩️');
  const trashBtn = h('button', { class: 'btn round', title: 'Apagar tudo' }, '🗑️');
  const saveBtn = h('button', { class: 'btn pill', title: 'Guardar' }, '⭐ Guardar');
  const root = h('div', { class: `work mode-${mode}` },
    h('header', { class: 'topbar' },
      h('button', { class: 'btn round', onclick: () => (mode === 'desenho' ? home() : pagesScreen(mode)) }, '⬅️'),
      h('h2', {}, page.nome), progress, h('div', { class: 'spacer' }), undoBtn, trashBtn, saveBtn),
    side, wrap, tray);

  let board;
  const onResize = () => board && board.fit();
  show(root, () => { window.removeEventListener('resize', onResize); clearTimeout(saveTimer); flush(); });
  window.addEventListener('resize', onResize);
  await new Promise((r) => requestAnimationFrame(r));

  if (conv) {
    board = new Board(wrap, conv.w, conv.h, conv);
  } else {
    let w, h2;
    if (saved && saved.w) { w = saved.w; h2 = saved.h; } else {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const s = Math.min(dpr, 2200 / Math.max(r.width, r.height));
      w = Math.round((r.width - 16) * s); h2 = Math.round((r.height - 16) * s);
    }
    board = new Board(wrap, w, h2, null);
  }

  // salvamento automático
  let saveTimer = 0, pending = null;
  const schedule = (fn) => { pending = fn; clearTimeout(saveTimer); saveTimer = setTimeout(flush, 700); };
  function flush() { if (pending) { const f = pending; pending = null; f(); } }
  const savePaint = () => schedule(async () => store.put('estado', { blob: await board.paintBlob(), w: board.w, h: board.h }, stateKey));

  if (saved && saved.blob && mode !== 'numeros') {
    try { board.loadPaint(await createImageBitmap(saved.blob)); } catch (e) { console.warn(e); }
  }

  undoBtn.onclick = () => { if (board.undo()) sound.click(); };
  saveBtn.onclick = async () => {
    await store.put('obras', { blob: await board.exportBlob(), data: Date.now(), titulo: page.nome });
    sound.yay();
    toast('Guardado nas Minhas obras! ⭐');
  };

  if (mode === 'numeros') setupNumbers({ board, conv, page, side, tray, progress, trashBtn, saved, stateKey, schedule });
  else setupFree({ board, mode, side, tray, trashBtn, savePaint });
}

function toolPanel(board, side, withClip) {
  const tools = [['lapis', '✏️', 'Lápis'], ['giz', '🖍️', 'Giz'], ['neon', '✨', 'Neon'], ['balde', '🪣', 'Balde'], ['borracha', '🧽', 'Borracha']];
  const btns = tools.map(([id, em, nome]) => h('button', { class: 'tool', 'data-t': id, onclick: () => pick(id) }, h('span', {}, em), h('small', {}, nome)));
  const pick = (id) => { sound.click(); board.setTool(id); btns.forEach((b) => b.classList.toggle('on', b.dataset.t === id)); };
  const sizes = [0, 1, 2].map((s) => h('button', { class: `size s${s}`, onclick: () => { sound.click(); board.setSize(s); sizes.forEach((b, i) => b.classList.toggle('on', i === s)); } }, h('i')));
  sizes[1].classList.add('on');
  side.append(h('div', { class: 'tools' }, btns), h('div', { class: 'sizes' }, sizes));
  if (withClip) {
    const clip = h('button', { class: 'tool clip on', onclick: () => { board.clip = !board.clip; clip.classList.toggle('on', board.clip); sound.click(); } },
      h('span', {}, '🪄'), h('small', {}, 'Não sair da linha'));
    side.append(clip);
  }
  pick('lapis');
}

function setupFree({ board, mode, side, tray, trashBtn, savePaint }) {
  toolPanel(board, side, mode === 'livre');
  const pens = PALETTE.map((p) => pencil(p, { onclick: () => select(p) }));
  const select = (p) => {
    sound.click();
    board.setColor(p.hex);
    pens.forEach((el) => el.classList.toggle('on', el.title === p.nome));
    if (board.tool === 'borracha') side.querySelector('[data-t=lapis]').click();
  };
  tray.append(h('div', { class: 'pencils' }, pens));
  board.setColor(PALETTE[4].hex);
  pens[4].classList.add('on');
  board.onChange = savePaint;
  trashBtn.onclick = async () => {
    if (await confirmBox(mode === 'desenho' ? 'Começar um desenho novo?' : 'Apagar a pintura e começar de novo?')) board.clear();
  };
}

function setupNumbers({ board, conv, page, side, tray, progress, trashBtn, saved, stateKey, schedule }) {
  board.setTool('numero');
  const { regions, numbers } = conv;
  const done = new Uint8Array(regions.length);
  const hexOf = (num) => PALETTE[numbers[num - 1].color].hex;

  const reset = () => {
    done.fill(0);
    board.pctx.clearRect(0, 0, board.w, board.h);
    regions.forEach((r, i) => {
      if (r.num === 0) done[i] = 1;
      else if (r.tiny) { done[i] = 1; board.fillRegion(i, PALETTE[r.color].hex, { undo: false }); }
    });
  };
  reset();
  if (saved && saved.filled) for (const i of saved.filled) if (regions[i] && !done[i]) { done[i] = 1; board.fillRegion(i, hexOf(regions[i].num), { undo: false }); }

  const total = regions.filter((r) => r.num && !r.tiny).length;
  let sel = 1;
  const pens = numbers.map((n) => pencil(PALETTE[n.color], { num: n.num, onclick: () => { sound.click(); select(n.num); } }));

  const remaining = (num) => regions.some((r, i) => r.num === num && !done[i]);
  const refresh = () => {
    const ctx = board.labels.getContext('2d');
    ctx.clearRect(0, 0, board.w, board.h);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    regions.forEach((r, i) => {
      if (done[i]) return;
      const on = r.num === sel;
      if (on) {
        ctx.beginPath();
        ctx.arc(r.lx, r.ly, r.fs * 0.78, 0, Math.PI * 2);
        ctx.fillStyle = hexOf(r.num);
        ctx.globalAlpha = 0.55;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.lineWidth = Math.max(2, r.fs * 0.08);
        ctx.strokeStyle = '#222';
        ctx.stroke();
      }
      ctx.font = `${on ? 800 : 600} ${r.fs}px ui-rounded, "SF Pro Rounded", system-ui, sans-serif`;
      ctx.fillStyle = on ? '#111' : '#7a7a7a';
      ctx.fillText(String(r.num), r.lx, r.ly + r.fs * 0.05);
    });
    const n = regions.filter((r, i) => r.num && !r.tiny && done[i]).length;
    progress.replaceChildren(h('div', { class: 'bar' }, h('i', { style: { width: `${(100 * n) / Math.max(1, total)}%` } })), h('span', {}, `${n}/${total}`));
    pens.forEach((el, k) => {
      el.classList.toggle('on', numbers[k].num === sel);
      el.classList.toggle('ok', !remaining(numbers[k].num));
    });
  };
  const select = (num) => { sel = num; refresh(); };
  const persist = () => schedule(() => store.put('estado', { filled: [...done.keys()].filter((i) => done[i] && regions[i].num && !regions[i].tiny) }, stateKey));

  board.onTap = (x, y) => {
    const i = board.regionAt(x, y);
    if (i < 0 || done[i]) return;
    const r = regions[i];
    if (r.num !== sel) {
      sound.oops();
      const el = pens[r.num - 1];
      el.classList.remove('hint');
      void el.offsetWidth;
      el.classList.add('hint');
      return;
    }
    board.fillRegion(i, hexOf(r.num), { extra: { r: i } });
    done[i] = 1;
    sound.pop();
    if (!remaining(sel)) {
      const next = numbers.find((n) => remaining(n.num));
      if (next) setTimeout(() => select(next.num), 450);
    }
    refresh();
    persist();
    if (regions.every((_, k) => done[k])) {
      setTimeout(async () => {
        sound.yay();
        confetti();
        toast('Parabéns! Ficou lindo! 🎉');
        await store.put('obras', { blob: await board.exportBlob(), data: Date.now(), titulo: page.nome });
      }, 250);
    }
  };
  board.onUndoExtra = ({ r }) => { done[r] = 0; refresh(); persist(); };
  trashBtn.onclick = async () => {
    if (!(await confirmBox('Apagar a pintura e começar de novo?'))) return;
    board.undoStack = [];
    reset();
    sel = numbers.length ? numbers[0].num : 1;
    refresh();
    persist();
  };

  const modelImg = h('img', { src: conv.modelURL, alt: 'modelo', draggable: 'false' });
  let showingModel = true;
  side.append(h('div', { class: 'model', onclick: () => { showingModel = !showingModel; modelImg.src = showingModel ? conv.modelURL : conv.originalSrc; } },
    modelImg, h('small', {}, 'Modelo — toque para trocar')));
  tray.append(h('div', { class: 'pencils numbered', style: { '--n': numbers.length } }, pens));
  const first = numbers.find((n) => remaining(n.num));
  select(first ? first.num : 1);
}

async function gallery() {
  const obras = (await store.all('obras')).sort((a, b) => b.data - a.data);
  const urls = [];
  const url = (b) => { const u = URL.createObjectURL(b); urls.push(u); return u; };
  const open = (o) => {
    const src = url(o.blob);
    const m = h('div', { class: 'modal viewer', onclick: (e) => { if (e.target === m) m.remove(); } },
      h('div', { class: 'viewer-card' },
        h('img', { src }),
        h('div', { class: 'modal-btns' },
          h('button', { class: 'btn big', onclick: () => { const a = h('a', { href: src, download: `obra-${o.id}.png` }); document.body.append(a); a.click(); a.remove(); } }, '⬇️ Baixar'),
          h('button', { class: 'btn big no', onclick: async () => { if (await confirmBox('Apagar esta obra?')) { await store.del('obras', o.id); m.remove(); gallery(); } } }, '🗑️ Apagar'),
          h('button', { class: 'btn big yes', onclick: () => m.remove() }, '✔️ Fechar'))));
    document.body.append(m);
  };
  show(h('div', { class: 'list' },
    h('header', { class: 'topbar' }, h('button', { class: 'btn round', onclick: home }, '🏠'), h('h2', {}, '🖼️ Minhas obras')),
    obras.length
      ? h('div', { class: 'grid' }, obras.map((o) => h('div', { class: 'page-card obra', onclick: () => open(o) },
          h('img', { src: url(o.blob) }), h('span', {}, new Date(o.data).toLocaleDateString('pt-BR')))))
      : h('p', { class: 'empty' }, 'Ainda não tem nada aqui. Toque em ⭐ Guardar quando terminar um desenho!')),
    () => urls.forEach((u) => URL.revokeObjectURL(u)));
}

// Evita zoom/rolagem acidental no iPad
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());
document.addEventListener('touchmove', (e) => { if (!e.target.closest('.tray, .grid, .side')) e.preventDefault(); }, { passive: false });

// Funciona sem internet depois do primeiro acesso (precisa de https ou localhost)
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch((e) => console.warn('sw', e));
// Pede ao navegador para não apagar as obras guardadas
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});

home();
