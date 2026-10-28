// Transforma uma imagem colorida em desenho para colorir:
//  - linhas pretas (contornos)
//  - regiões fechadas, cada uma com a cor da paleta mais próxima
//  - posição do número de cada região
import { PALETTE, WHITE, BLACK, rgbToLab } from './palette.js';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

// Distância (chamfer) de cada pixel "dentro" até o pixel "fora" mais próximo.
function chamfer(inside, w, h, borderIsOutside = false) {
  const N = w * h, d = new Float32Array(N), BIG = 1e9, D = 1.4142;
  for (let i = 0; i < N; i++) d[i] = inside[i] ? BIG : 0;
  if (borderIsOutside) {
    for (let x = 0; x < w; x++) {
      if (d[x]) d[x] = 1;
      if (d[N - w + x]) d[N - w + x] = 1;
    }
    for (let y = 0; y < h; y++) {
      if (d[y * w]) d[y * w] = 1;
      if (d[y * w + w - 1]) d[y * w + w - 1] = 1;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      let v = d[i];
      if (!v) continue;
      if (x > 0) v = Math.min(v, d[i - 1] + 1);
      if (y > 0) {
        v = Math.min(v, d[i - w] + 1);
        if (x > 0) v = Math.min(v, d[i - w - 1] + D);
        if (x < w - 1) v = Math.min(v, d[i - w + 1] + D);
      }
      d[i] = v;
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x;
      let v = d[i];
      if (!v) continue;
      if (x < w - 1) v = Math.min(v, d[i + 1] + 1);
      if (y < h - 1) {
        v = Math.min(v, d[i + w] + 1);
        if (x < w - 1) v = Math.min(v, d[i + w + 1] + D);
        if (x > 0) v = Math.min(v, d[i + w - 1] + D);
      }
      d[i] = v;
    }
  }
  return d;
}

// Rótulos de componentes conexos (4-vizinhos) onde key[i] >= 0 e iguais.
function components(key, w, h) {
  const N = w * h, comp = new Int32Array(N).fill(-1), stack = new Int32Array(N);
  const counts = [], labels = [], seeds = [];
  for (let s = 0; s < N; s++) {
    if (key[s] < 0 || comp[s] >= 0) continue;
    const id = counts.length, k = key[s];
    let sp = 0, n = 0;
    stack[sp++] = s;
    comp[s] = id;
    while (sp) {
      const i = stack[--sp];
      n++;
      const x = i % w;
      if (x > 0 && comp[i - 1] < 0 && key[i - 1] === k) { comp[i - 1] = id; stack[sp++] = i - 1; }
      if (x < w - 1 && comp[i + 1] < 0 && key[i + 1] === k) { comp[i + 1] = id; stack[sp++] = i + 1; }
      if (i >= w && comp[i - w] < 0 && key[i - w] === k) { comp[i - w] = id; stack[sp++] = i - w; }
      if (i < N - w && comp[i + w] < 0 && key[i + w] === k) { comp[i + w] = id; stack[sp++] = i + w; }
    }
    counts.push(n);
    labels.push(k);
    seeds.push(s);
  }
  return { comp, counts, labels, seeds };
}

// Afina a máscara de linhas até 1px (Zhang-Suen).
function skeleton(mask, w, h) {
  const sk = new Uint8Array(mask);
  const del = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (let pass = 0; pass < 2; pass++) {
      del.length = 0;
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          if (!sk[i]) continue;
          const p2 = sk[i - w], p3 = sk[i - w + 1], p4 = sk[i + 1], p5 = sk[i + w + 1];
          const p6 = sk[i + w], p7 = sk[i + w - 1], p8 = sk[i - 1], p9 = sk[i - w - 1];
          const b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
          if (b < 2 || b > 6) continue;
          const a = (!p2 && p3) + (!p3 && p4) + (!p4 && p5) + (!p5 && p6) + (!p6 && p7) + (!p7 && p8) + (!p8 && p9) + (!p9 && p2);
          if (a !== 1) continue;
          if (pass === 0 ? (p2 && p4 && p6) || (p4 && p6 && p8) : (p2 && p4 && p8) || (p2 && p6 && p8)) continue;
          del.push(i);
        }
      }
      if (del.length) { changed = true; for (const i of del) sk[i] = 0; }
    }
  }
  return sk;
}

// Liga cada ponta solta ao traço mais próximo (que não seja o próprio traço) até D pixels.
// Devolve uma máscara: 1 = ponte nova, 2 = pixel que já era linha.
function closeGaps(line, w, h, D) {
  const N = w * h, sk = skeleton(line, w, h);
  const ponte = new Uint8Array(N);
  const stamp = new Int32Array(N);
  const G = Math.round(D * 2.5);
  const q = new Int32Array(N), dist = new Int16Array(N);
  let id = 0;
  for (let y = 2; y < h - 2; y++) {
    for (let x = 2; x < w - 2; x++) {
      const e = y * w + x;
      if (!sk[e]) continue;
      const nb = sk[e - w - 1] + sk[e - w] + sk[e - w + 1] + sk[e - 1] + sk[e + 1] + sk[e + w - 1] + sk[e + w] + sk[e + w + 1];
      if (nb !== 1) continue;
      // marca o próprio traço perto da ponta (até G passos pela linha)
      id++;
      let qh = 0, qt = 0;
      q[qt++] = e; stamp[e] = id; dist[e] = 0;
      while (qh < qt) {
        const i = q[qh++];
        if (dist[i] >= G) continue;
        const ix = i % w;
        for (let dy = -w; dy <= w; dy += w) {
          for (let dx = -1; dx <= 1; dx++) {
            const j = i + dy + dx;
            if (j < 0 || j >= N || stamp[j] === id || !line[j]) continue;
            const jx = j % w;
            if (Math.abs(jx - ix) > 1) continue;
            stamp[j] = id; dist[j] = dist[i] + 1; q[qt++] = j;
          }
        }
      }
      // procura a linha "de outro traço" mais próxima
      let best = -1, bd = D * D + 1;
      for (let yy = Math.max(0, y - D); yy <= Math.min(h - 1, y + D); yy++) {
        for (let xx = Math.max(0, x - D); xx <= Math.min(w - 1, x + D); xx++) {
          const j = yy * w + xx;
          if (!line[j] || stamp[j] === id) continue;
          const d2 = (xx - x) ** 2 + (yy - y) ** 2;
          if (d2 < bd) { bd = d2; best = j; }
        }
      }
      if (best < 0) continue;
      // desenha a ponte (2px)
      const bx = best % w, by = (best / w) | 0;
      const steps = Math.max(Math.abs(bx - x), Math.abs(by - y));
      for (let k = 0; k <= steps; k++) {
        const px = Math.round(x + ((bx - x) * k) / steps), py = Math.round(y + ((by - y) * k) / steps);
        for (const j of [py * w + px, py * w + px + 1, (py + 1) * w + px]) if (!line[j]) ponte[j] = 1;
      }
    }
  }
  return ponte;
}

function labDist(a, b) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

/**
 * opts (todos opcionais, podem vir do paginas.json):
 *  tamanho   lado maior em pixels (1400)
 *  escuro    luminosidade máx. (0-100) para ser linha (45)
 *  espessura meia-largura máx. de uma linha; áreas pretas mais grossas viram região (auto)
 *  minCor    fração mínima da imagem para uma cor ser mantida (0.001)
 *  maxCores  número máximo de cores (sem limite)
 *  minArea   área mínima de uma região em pixels (auto)
 *  bordas    true = desenha linha entre cores diferentes mesmo sem contorno (true)
 *  linhas    [[x1,y1,x2,y2,...], ...] traços extras em coordenadas da imagem original
 *  fechar    liga pontas soltas de traços a até N pixels (em escala 1400) com linhas invisíveis
 */
export function convertImage(img, opts = {}) {
  const size = opts.tamanho || 1400;
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const sc = size / Math.max(iw, ih);
  const w = Math.round(iw * sc), h = Math.round(ih * sc), N = w * h;

  const src = makeCanvas(w, h);
  const sx = src.getContext('2d', { willReadFrequently: true });
  sx.fillStyle = '#fff';
  sx.fillRect(0, 0, w, h);
  sx.imageSmoothingQuality = 'high';
  sx.drawImage(img, 0, 0, w, h);
  // linhas extras desenhadas à mão (coordenadas da imagem original), ex.: contorno do cabelo na testa
  if (opts.linhas) {
    sx.save();
    sx.strokeStyle = '#222';
    sx.lineWidth = (opts.linhaLargura || 2.5) * sc;
    sx.lineCap = sx.lineJoin = 'round';
    for (const l of opts.linhas) {
      sx.beginPath();
      for (let k = 0; k < l.length; k += 2) sx[k ? 'lineTo' : 'moveTo'](l[k] * sc, l[k + 1] * sc);
      sx.stroke();
    }
    sx.restore();
  }
  const px = sx.getImageData(0, 0, w, h).data;

  // 1. Luminosidade, croma e cor da paleta mais próxima de cada pixel
  const P = PALETTE.length;
  const allowed = opts.cores ? opts.cores.map((n) => n - 1) : PALETTE.map((_, i) => i);
  const L = new Float32Array(N), C = new Float32Array(N);
  const lbl = new Int16Array(N);
  const cache = new Int16Array(32768).fill(-1);
  for (let i = 0, j = 0; i < N; i++, j += 4) {
    const r = px[j], g = px[j + 1], b = px[j + 2];
    const lab = rgbToLab(r, g, b);
    L[i] = lab[0];
    C[i] = Math.hypot(lab[1], lab[2]);
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    let best = cache[key];
    if (best < 0) {
      let bd = Infinity;
      for (const p of allowed) {
        const dd = labDist(lab, PALETTE[p].lab);
        if (dd < bd) { bd = dd; best = p; }
      }
      cache[key] = best;
    }
    lbl[i] = best;
  }

  // 2. Máscara de linhas: pixels escuros e pouco coloridos (+ 1px de antisserrilhado)
  const dark = opts.escuro ?? 45;
  let line = new Uint8Array(N);
  for (let i = 0; i < N; i++) if (L[i] < dark && C[i] < 30) line[i] = 1;
  {
    const g2 = new Uint8Array(line);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        if (line[i] || L[i] >= 72) continue;
        if (line[i - 1] || line[i + 1] || line[i - w] || line[i + w] ||
            line[i - w - 1] || line[i - w + 1] || line[i + w - 1] || line[i + w + 1]) g2[i] = 1;
      }
    }
    line = g2;
  }

  // 3. Áreas pretas grossas (ex.: gato preto) viram região para pintar
  const T = opts.espessura ?? Math.max(5, Math.round(size / 110));
  {
    const dl = chamfer(line, w, h, true);
    const notCore = new Uint8Array(N);
    let any = false;
    for (let i = 0; i < N; i++) {
      if (line[i] && dl[i] >= T) any = true;
      else notCore[i] = 1;
    }
    if (any) {
      const dc = chamfer(notCore, w, h);
      const blobKey = new Int16Array(N).fill(-1);
      for (let i = 0; i < N; i++) if (line[i] && dc[i] <= T + 0.5) blobKey[i] = 1;
      const bc = components(blobKey, w, h);
      const minBlob = N * 0.003;
      for (let i = 0; i < N; i++) {
        const c = bc.comp[i];
        if (c >= 0 && bc.counts[c] >= minBlob) line[i] = 0;
      }
    }
  }
  // 3b. Fecha pequenas aberturas (ex.: fios de cabelo que terminam sem contorno na testa).
  //     As pontas soltas dos traços são ligadas ao traço vizinho por uma linha invisível.
  let ponte = null;
  if (opts.fechar) {
    const D = Math.round((opts.fechar * size) / 1400);
    ponte = closeGaps(line, w, h, D);
    for (let i = 0; i < N; i++) if (ponte[i]) line[i] = 1;
  }
  for (let i = 0; i < N; i++) if (line[i]) lbl[i] = -1;

  // 4. Filtro de moda 3x3 para limpar ruído/textura
  {
    const cnt = new Int32Array(P);
    for (let pass = 0; pass < 2; pass++) {
      const out = new Int16Array(lbl);
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          if (lbl[i] < 0) continue;
          let best = lbl[i], bc = 0;
          for (let dy = -w; dy <= w; dy += w) {
            for (let dx = -1; dx <= 1; dx++) {
              const v = lbl[i + dy + dx];
              if (v >= 0 && ++cnt[v] > bc) { bc = cnt[v]; best = v; }
            }
          }
          for (let dy = -w; dy <= w; dy += w) for (let dx = -1; dx <= 1; dx++) {
            const v = lbl[i + dy + dx];
            if (v >= 0) cnt[v] = 0;
          }
          if (bc >= 4) out[i] = best;
        }
      }
      lbl.set(out);
    }
  }

  // 5. Reduz cores pouco usadas
  {
    const counts = new Int32Array(P);
    let total = 0;
    for (let i = 0; i < N; i++) if (lbl[i] >= 0) { counts[lbl[i]]++; total++; }
    const minCor = opts.minCor ?? 0.001;
    let keep = [...Array(P).keys()].filter((p) => counts[p] > 0 && counts[p] >= total * minCor);
    keep.sort((a, b) => counts[b] - counts[a]);
    if (opts.maxCores) keep = keep.slice(0, opts.maxCores);
    if (!keep.length) keep = [WHITE];
    const remap = new Int16Array(P);
    for (let p = 0; p < P; p++) {
      if (keep.includes(p)) { remap[p] = p; continue; }
      let bd = Infinity;
      for (const k of keep) {
        const dd = labDist(PALETTE[p].lab, PALETTE[k].lab);
        if (dd < bd) { bd = dd; remap[p] = k; }
      }
    }
    for (let i = 0; i < N; i++) if (lbl[i] >= 0) lbl[i] = remap[lbl[i]];
  }

  // 6. Regiões conexas; regiões pequenas são absorvidas pela vizinha
  let { comp, counts, labels, seeds } = components(lbl, w, h);
  const minArea = opts.minArea ?? Math.round(N * 0.00007);
  {
    const order = counts.map((n, c) => c).filter((c) => counts[c] < minArea).sort((a, b) => counts[a] - counts[b]);
    const stack = new Int32Array(N);
    for (const c of order) {
      if (!counts[c] || counts[c] >= minArea) continue;
      // coleta pixels da região e vizinhos
      const pix = [];
      const contacts = new Map();
      let sp = 0;
      stack[sp++] = seeds[c];
      const mark = -3 - c; // marcação temporária
      comp[seeds[c]] = mark;
      while (sp) {
        const i = stack[--sp];
        pix.push(i);
        const x = i % w;
        const nb = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w];
        for (const j of nb) {
          if (j < 0 || j >= N) continue;
          const cj = comp[j];
          if (cj === c) { comp[j] = mark; stack[sp++] = j; }
          else if (cj >= 0) contacts.set(cj, (contacts.get(cj) || 0) + 1);
        }
      }
      let best = -1, bn = 0;
      for (const [k, n] of contacts) if (n > bn) { bn = n; best = k; }
      if (best >= 0) {
        for (const i of pix) { comp[i] = best; lbl[i] = labels[best]; }
        counts[best] += pix.length;
      } else if (PALETTE[labels[c]].lab[0] > 85) {
        for (const i of pix) { comp[i] = -2; lbl[i] = -2; } // "buraco" branco fixo (brilho do olho etc.)
      } else {
        for (const i of pix) { comp[i] = -1; lbl[i] = -1; line[i] = 1; }
      }
      counts[c] = 0;
    }
  }

  // 7. Linha entre regiões vizinhas de cores diferentes (quando não havia contorno)
  if (opts.bordas !== false) {
    const mark = new Uint8Array(N);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x, a = comp[i];
        if (a === -1) continue;
        if (x < w - 1) { const b = comp[i + 1]; if (b !== -1 && b !== a) { mark[i] = 1; mark[i + 1] = 1; } }
        if (y < h - 1) { const b = comp[i + w]; if (b !== -1 && b !== a) { mark[i] = 1; mark[i + w] = 1; } }
      }
    }
    for (let i = 0; i < N; i++) if (mark[i]) { comp[i] = -1; line[i] = 1; }
  }

  // 8. Compacta ids de região
  const cnt2 = new Int32Array(counts.length);
  for (let i = 0; i < N; i++) if (comp[i] >= 0) cnt2[comp[i]]++;
  const tinyArea = Math.max(8, minArea / 4);
  const idMap = new Int32Array(counts.length).fill(-1);
  const regions = [];
  for (let c = 0; c < counts.length; c++) {
    if (cnt2[c] >= tinyArea) { idMap[c] = regions.length; regions.push({ color: labels[c], count: cnt2[c] }); }
  }
  const regionId = new Int32Array(N);
  for (let i = 0; i < N; i++) {
    const c = comp[i];
    if (c >= 0) {
      regionId[i] = idMap[c];
      if (idMap[c] < 0) line[i] = 1;
    } else regionId[i] = c; // -1 linha, -2 buraco
  }

  // 9. Dono de cada pixel de linha = região mais próxima (a tinta passa por baixo da linha)
  const owner = new Int32Array(N);
  {
    const q = new Int32Array(N);
    let qh = 0, qt = 0;
    for (let i = 0; i < N; i++) {
      owner[i] = regionId[i] >= 0 ? regionId[i] : -1;
      if (owner[i] >= 0) q[qt++] = i;
    }
    while (qh < qt) {
      const i = q[qh++], o = owner[i], x = i % w;
      if (x > 0 && owner[i - 1] < 0 && regionId[i - 1] === -1) { owner[i - 1] = o; q[qt++] = i - 1; }
      if (x < w - 1 && owner[i + 1] < 0 && regionId[i + 1] === -1) { owner[i + 1] = o; q[qt++] = i + 1; }
      if (i >= w && owner[i - w] < 0 && regionId[i - w] === -1) { owner[i - w] = o; q[qt++] = i - w; }
      if (i < N - w && owner[i + w] < 0 && regionId[i + w] === -1) { owner[i + w] = o; q[qt++] = i + w; }
    }
  }

  // 10. Caixa de cada região e melhor ponto para o número
  for (const r of regions) { r.x0 = w; r.y0 = h; r.x1 = 0; r.y1 = 0; r.rad = 0; r.lx = 0; r.ly = 0; }
  const inside = new Uint8Array(N);
  for (let i = 0; i < N; i++) if (regionId[i] >= 0) inside[i] = 1;
  const dt = chamfer(inside, w, h, true);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x, o = owner[i];
      if (o < 0) continue;
      const r = regions[o];
      if (x < r.x0) r.x0 = x;
      if (x > r.x1) r.x1 = x;
      if (y < r.y0) r.y0 = y;
      if (y > r.y1) r.y1 = y;
      if (regionId[i] === o && dt[i] > r.rad) { r.rad = dt[i]; r.lx = x; r.ly = y; }
    }
  }

  // 10b. Pedaços finos separados só por pontes invisíveis (ex.: mechas de cabelo) voltam a ser uma área só.
  //      Áreas largas (rosto, fundo) nunca entram nessa união.
  if (ponte) {
    const R = regions.length, pai = new Int32Array(R).map((_, k) => k);
    const raiz = (k) => { while (pai[k] !== k) k = pai[k] = pai[pai[k]]; return k; };
    const fino = size / 50;
    for (let y = 2; y < h - 2; y++) {
      for (let x = 2; x < w - 2; x++) {
        if (ponte[y * w + x] !== 1) continue;
        let a = -1;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const r = regionId[(y + dy) * w + x + dx];
            if (r < 0 || regions[r].rad >= fino) continue;
            if (a < 0) a = r; else { const ra = raiz(a), rb = raiz(r); if (ra !== rb) pai[rb] = ra; }
          }
        }
      }
    }
    const novo = new Int32Array(R).fill(-1), juntas = [];
    for (let k = 0; k < R; k++) {
      const r0 = raiz(k);
      if (novo[r0] < 0) { novo[r0] = juntas.length; juntas.push({ ...regions[r0], count: 0, maior: 0 }); }
      novo[k] = novo[r0];
      const J = juntas[novo[k]], r = regions[k];
      J.count += r.count;
      J.x0 = Math.min(J.x0, r.x0); J.y0 = Math.min(J.y0, r.y0); J.x1 = Math.max(J.x1, r.x1); J.y1 = Math.max(J.y1, r.y1);
      if (r.rad > J.rad) { J.rad = r.rad; J.lx = r.lx; J.ly = r.ly; }
      if (r.count > J.maior) { J.maior = r.count; J.color = r.color; }
    }
    if (juntas.length < R) {
      for (let i = 0; i < N; i++) {
        if (owner[i] >= 0) owner[i] = novo[owner[i]];
        if (regionId[i] >= 0) regionId[i] = novo[regionId[i]];
      }
      regions.length = 0;
      for (const J of juntas) { delete J.maior; regions.push(J); }
    }
  }

  // 11. Numeração: cores usadas (menos o branco) viram 1..k
  //     Regiões minúsculas e pequenas áreas pretas já vêm pintadas.
  for (const r of regions) r.tiny = r.rad < 5 || (r.color === BLACK && r.count < N * 0.01);
  const used = [...new Set(regions.filter((r) => !r.tiny).map((r) => r.color))].filter((c) => c !== WHITE).sort((a, b) => a - b);
  const numbers = used.map((c, i) => ({ num: i + 1, color: c }));
  for (const r of regions) {
    const n = numbers.find((x) => x.color === r.color);
    r.num = r.color === WHITE ? 0 : n ? n.num : -1;
    r.fs = Math.max(size / 58, Math.min(size / 28, r.rad * 1.15));
  }

  // 12. Imagem das linhas (preto com leve suavização)
  const lineCanvas = makeCanvas(w, h);
  {
    const lx = lineCanvas.getContext('2d');
    const im = lx.createImageData(w, h), d = im.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x, j = i * 4;
        d[j] = 34; d[j + 1] = 30; d[j + 2] = 32;
        if (ponte && ponte[i] === 1) continue; // ponte invisível
        if (line[i]) { d[j + 3] = 255; continue; }
        let n = 0;
        if (x > 0) n += line[i - 1];
        if (x < w - 1) n += line[i + 1];
        if (y > 0) n += line[i - w];
        if (y < h - 1) n += line[i + w];
        d[j + 3] = n ? Math.min(200, n * 70) : 0;
      }
    }
    lx.putImageData(im, 0, 0);
  }

  // 13. Modelo colorido (como fica pronto)
  const modelCanvas = makeCanvas(w, h);
  {
    const mx = modelCanvas.getContext('2d');
    const im = mx.createImageData(w, h), d = im.data;
    for (let i = 0, j = 0; i < N; i++, j += 4) {
      const o = owner[i];
      const rgb = o >= 0 ? PALETTE[regions[o].color].rgb : [255, 255, 255];
      d[j] = rgb[0]; d[j + 1] = rgb[1]; d[j + 2] = rgb[2]; d[j + 3] = 255;
    }
    mx.putImageData(im, 0, 0);
    mx.drawImage(lineCanvas, 0, 0);
  }

  return { w, h, owner, regions, numbers, lineCanvas, modelCanvas };
}
