// Quadro de pintura: camadas, pincéis (lápis, giz, neon), borracha, balde e desfazer.
import { hexToRgb, neonOf } from './palette.js';

function makeCanvas(w, h, cls) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  if (cls) c.className = cls;
  return c;
}

// Texturas de papel (repetíveis) para o lápis e o giz
const GRAIN_TILE = 128;
function makeGrain(kind) {
  const S = GRAIN_TILE, c = makeCanvas(S, S), x = c.getContext('2d');
  const im = x.createImageData(S, S), d = im.data;
  const G = 8, grid = [];
  for (let i = 0; i < (S / G) * (S / G); i++) grid.push(Math.random());
  const n = S / G;
  const coarse = (px, py) => {
    const gx = px / G, gy = py / G, x0 = Math.floor(gx), y0 = Math.floor(gy);
    const fx = gx - x0, fy = gy - y0;
    const v = (a, b) => grid[((b + n) % n) * n + ((a + n) % n)];
    const top = v(x0, y0) * (1 - fx) + v(x0 + 1, y0) * fx;
    const bot = v(x0, y0 + 1) * (1 - fx) + v(x0 + 1, y0 + 1) * fx;
    return top * (1 - fy) + bot * fy;
  };
  for (let y = 0; y < S; y++) {
    for (let xx = 0; xx < S; xx++) {
      const j = (y * S + xx) * 4;
      let a;
      if (kind === 'giz') {
        const v = 0.4 * Math.random() + 0.6 * coarse(xx, y);
        const t = Math.min(1, Math.max(0, (v - 0.3) / 0.12));
        a = t * t * (3 - 2 * t) * 255;
      } else {
        a = Math.random() < 0.1 ? 70 + Math.random() * 80 : 205 + Math.random() * 50;
      }
      d[j] = d[j + 1] = d[j + 2] = 0;
      d[j + 3] = a;
    }
  }
  x.putImageData(im, 0, 0);
  return c;
}
const GRAINS = {};
function grain(kind) {
  if (!GRAINS[kind]) {
    const c = makeGrain(kind);
    GRAINS[kind] = { canvas: c, url: c.toDataURL() };
  }
  return GRAINS[kind];
}

export const TOOLS = {
  lapis: { sizes: [4, 9, 16], alpha: 0.92, grain: 'lapis' },
  giz: { sizes: [11, 22, 36], alpha: 1, grain: 'giz' },
  neon: { sizes: [7, 13, 22], alpha: 1, neon: true },
  borracha: { sizes: [16, 34, 60], alpha: 1, eraser: true },
};

export class Board {
  /**
   * @param stageWrap elemento onde o quadro é encaixado
   * @param w,h tamanho em pixels
   * @param page resultado do convertImage (ou null para tela branca)
   */
  constructor(stageWrap, w, h, page = null) {
    this.wrap = stageWrap;
    this.w = w;
    this.h = h;
    this.page = page;
    this.k = Math.max(w, h) / 1400;
    this.tool = 'lapis';
    this.color = '#E5202A';
    this.size = 1;
    this.clip = true;
    this.undoStack = [];
    this.active = null;
    this.penSeen = false;
    this.onTap = null;
    this.onChange = null;
    this.onUndoExtra = null;
    this.maskCache = new Map();

    this.stage = document.createElement('div');
    this.stage.className = 'stage';
    this.paint = makeCanvas(w, h, 'layer');
    this.stroke = makeCanvas(w, h, 'layer stroke');
    this.pctx = this.paint.getContext('2d', { willReadFrequently: true });
    this.sctx = this.stroke.getContext('2d');
    this.stage.append(this.paint, this.stroke);
    if (page) {
      const lc = makeCanvas(w, h, 'layer');
      lc.getContext('2d').drawImage(page.lineCanvas, 0, 0);
      this.stage.append(lc);
      this.labels = makeCanvas(w, h, 'layer');
      this.stage.append(this.labels);
    }
    this.tmp = makeCanvas(w, h);
    this.tctx = this.tmp.getContext('2d');
    stageWrap.append(this.stage);

    this._bind();
    this.fit();
  }

  fit() {
    const r = this.wrap.getBoundingClientRect();
    const s = Math.min((r.width - 16) / this.w, (r.height - 16) / this.h);
    if (!(s > 0)) return;
    this.scale = s;
    this.stage.style.width = `${Math.floor(this.w * s)}px`;
    this.stage.style.height = `${Math.floor(this.h * s)}px`;
    this._applyStrokeStyle();
  }

  setTool(t) { this.tool = t; this._applyStrokeStyle(); }
  setColor(c) { this.color = c; }
  setSize(s) { this.size = s; }

  _applyStrokeStyle() {
    const t = TOOLS[this.tool];
    const st = this.stroke.style;
    st.opacity = t ? t.alpha : 1;
    if (t && t.grain) {
      const g = grain(t.grain);
      const sz = `${GRAIN_TILE * (this.scale || 1)}px ${GRAIN_TILE * (this.scale || 1)}px`;
      st.webkitMaskImage = st.maskImage = `url(${g.url})`;
      st.webkitMaskSize = st.maskSize = sz;
      st.webkitMaskRepeat = st.maskRepeat = 'repeat';
    } else {
      st.webkitMaskImage = st.maskImage = 'none';
    }
  }

  // ---------- eventos ----------
  _pos(e) {
    const r = this.stage.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * this.w) / r.width,
      y: ((e.clientY - r.top) * this.h) / r.height,
      p: e.pointerType === 'pen' ? e.pressure || 0.5 : 0.5,
    };
  }

  _bind() {
    const st = this.stage;
    st.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'pen') this.penSeen = true;
      if (this.penSeen && e.pointerType === 'touch') return; // apoio da mão com Apple Pencil
      if (this.active !== null) return;
      e.preventDefault();
      const p = this._pos(e);
      if (this.tool === 'numero') { this.onTap && this.onTap(p.x, p.y); return; }
      if (this.tool === 'balde') { this.bucket(p.x, p.y); return; }
      this.active = e.pointerId;
      try { st.setPointerCapture(e.pointerId); } catch {}
      this._begin(p);
    });
    const move = (e) => {
      if (e.pointerId !== this.active) return;
      e.preventDefault();
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      for (const ev of evs.length ? evs : [e]) this._add(this._pos(ev));
    };
    st.addEventListener('pointermove', move);
    const up = (e) => {
      if (e.pointerId !== this.active) return;
      this.active = null;
      this._end();
    };
    st.addEventListener('pointerup', up);
    st.addEventListener('pointercancel', up);
  }

  // ---------- traço ----------
  _width(p) {
    const t = TOOLS[this.tool];
    const base = t.sizes[this.size] * this.k;
    return this.penSeen ? base * (0.45 + p.p * 1.1) : base;
  }

  _begin(p) {
    const t = TOOLS[this.tool];
    this.pts = [p];
    this.bbox = null;
    this.region = -1;
    if (this.page && this.clip && !t.eraser) {
      const xi = Math.min(this.w - 1, Math.max(0, p.x | 0)), yi = Math.min(this.h - 1, Math.max(0, p.y | 0));
      this.region = this.page.owner[yi * this.w + xi];
    }
    const c = this.sctx;
    c.lineCap = c.lineJoin = 'round';
    const neon = t.neon ? neonOf(this.color) : null;
    this.strokeColor = t.eraser ? '#ffffff' : neon ? neon.core : this.color;
    this.glow = neon && neon.glow;
    this.glowBlur = TOOLS.neon.sizes[this.size] * this.k * 1.6;
    this.stroke.style.filter = neon
      ? [0.15, 0.35, 0.7].map((f) => `drop-shadow(0 0 ${(this.glowBlur * this.scale * f).toFixed(1)}px ${neon.glow})`).join(' ')
      : 'none';
    this._dot(p);
  }

  _grow(x0, y0, x1, y1) {
    const b = this.bbox;
    if (!b) this.bbox = { x0, y0, x1, y1 };
    else { b.x0 = Math.min(b.x0, x0); b.y0 = Math.min(b.y0, y0); b.x1 = Math.max(b.x1, x1); b.y1 = Math.max(b.y1, y1); }
  }

  _paintPath(draw, x0, y0, x1, y1, width) {
    const t = TOOLS[this.tool], c = this.sctx;
    const pad = t.neon ? width / 2 + this.glowBlur * 2 + 4 : width / 2 + 2;
    x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
    c.strokeStyle = c.fillStyle = this.strokeColor;
    c.lineWidth = width;
    draw(c);
    if (this.region >= 0) {
      const m = this._mask(this.region);
      c.save();
      c.beginPath();
      c.rect(x0, y0, x1 - x0, y1 - y0);
      c.clip();
      c.globalCompositeOperation = 'destination-in';
      c.drawImage(m, 0, 0);
      c.restore();
    }
    this._grow(x0, y0, x1, y1);
  }

  _dot(p) {
    const wd = this._width(p);
    this._paintPath((c, f = 1) => {
      c.beginPath();
      c.arc(p.x, p.y, (wd * f) / 2, 0, Math.PI * 2);
      c.fill();
    }, p.x, p.y, p.x, p.y, wd);
  }

  _add(p) {
    const pts = this.pts, last = pts[pts.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) < 1.2) return;
    pts.push(p);
    const n = pts.length;
    const a = n >= 3 ? mid(pts[n - 3], pts[n - 2]) : pts[0];
    const ctrl = pts[n - 2];
    const b = mid(pts[n - 2], pts[n - 1]);
    const wd = this._width(p);
    this._paintPath((c) => {
      c.beginPath();
      c.moveTo(a.x, a.y);
      c.quadraticCurveTo(ctrl.x, ctrl.y, b.x, b.y);
      c.stroke();
    }, Math.min(a.x, b.x, ctrl.x), Math.min(a.y, b.y, ctrl.y), Math.max(a.x, b.x, ctrl.x), Math.max(a.y, b.y, ctrl.y), wd);
  }

  _end() {
    const pts = this.pts;
    if (pts.length >= 2) {
      const a = mid(pts[pts.length - 2], pts[pts.length - 1]), b = pts[pts.length - 1];
      const wd = this._width(b);
      this._paintPath((c) => {
        c.beginPath();
        c.moveTo(a.x, a.y);
        c.lineTo(b.x, b.y);
        c.stroke();
      }, Math.min(a.x, b.x), Math.min(a.y, b.y), Math.max(a.x, b.x), Math.max(a.y, b.y), wd);
    }
    this._commit();
  }

  _commit() {
    const b = this.bbox;
    if (!b) return;
    const x0 = Math.max(0, Math.floor(b.x0)), y0 = Math.max(0, Math.floor(b.y0));
    const x1 = Math.min(this.w, Math.ceil(b.x1)), y1 = Math.min(this.h, Math.ceil(b.y1));
    const bw = x1 - x0, bh = y1 - y0;
    if (bw <= 0 || bh <= 0) { this.sctx.clearRect(0, 0, this.w, this.h); return; }
    const t = TOOLS[this.tool];
    this._pushUndo(x0, y0, bw, bh);
    let src = this.stroke;
    if (t.grain) {
      const tc = this.tctx;
      tc.clearRect(x0, y0, bw, bh);
      tc.globalCompositeOperation = 'source-over';
      tc.drawImage(this.stroke, x0, y0, bw, bh, x0, y0, bw, bh);
      tc.globalCompositeOperation = 'destination-in';
      tc.fillStyle = tc.createPattern(grain(t.grain).canvas, 'repeat');
      tc.fillRect(x0, y0, bw, bh);
      tc.globalCompositeOperation = 'source-over';
      src = this.tmp;
    }
    const p = this.pctx;
    p.save();
    p.globalAlpha = t.alpha;
    p.globalCompositeOperation = t.eraser ? 'destination-out' : 'source-over';
    if (t.neon) {
      p.shadowColor = this.glow;
      for (const f of [1.4, 0.7, 0.3]) {
        p.shadowBlur = this.glowBlur * f;
        p.drawImage(src, x0, y0, bw, bh, x0, y0, bw, bh);
      }
    }
    p.drawImage(src, x0, y0, bw, bh, x0, y0, bw, bh);
    p.restore();
    this.sctx.clearRect(0, 0, this.w, this.h);
    this._changed();
  }

  // Máscara (alfa) de uma região, para "não sair da linha"
  _mask(r) {
    let m = this.maskCache.get(r);
    if (m) return m;
    const R = this.page.regions[r], owner = this.page.owner, w = this.w;
    m = makeCanvas(this.w, this.h);
    const bw = R.x1 - R.x0 + 1, bh = R.y1 - R.y0 + 1;
    const mx = m.getContext('2d'), im = mx.createImageData(bw, bh), d = im.data;
    for (let y = 0; y < bh; y++) {
      let i = (R.y0 + y) * w + R.x0, j = y * bw * 4 + 3;
      for (let x = 0; x < bw; x++, i++, j += 4) if (owner[i] === r) d[j] = 255;
    }
    mx.putImageData(im, R.x0, R.y0);
    if (this.maskCache.size > 6) this.maskCache.delete(this.maskCache.keys().next().value);
    this.maskCache.set(r, m);
    return m;
  }

  // ---------- preenchimento ----------
  regionAt(x, y) {
    if (!this.page) return -1;
    const xi = Math.min(this.w - 1, Math.max(0, x | 0)), yi = Math.min(this.h - 1, Math.max(0, y | 0));
    return this.page.owner[yi * this.w + xi];
  }

  fillRegion(r, hex, { undo = true, extra = null } = {}) {
    const R = this.page.regions[r], owner = this.page.owner, w = this.w;
    const bw = R.x1 - R.x0 + 1, bh = R.y1 - R.y0 + 1;
    if (undo) this._pushUndo(R.x0, R.y0, bw, bh, extra);
    const im = this.pctx.getImageData(R.x0, R.y0, bw, bh), d = im.data;
    const [cr, cg, cb] = hexToRgb(hex);
    for (let y = 0; y < bh; y++) {
      let i = (R.y0 + y) * w + R.x0, j = y * bw * 4;
      for (let x = 0; x < bw; x++, i++, j += 4) {
        if (owner[i] === r) { d[j] = cr; d[j + 1] = cg; d[j + 2] = cb; d[j + 3] = 255; }
      }
    }
    this.pctx.putImageData(im, R.x0, R.y0);
    if (undo) this._changed();
  }

  bucket(x, y) {
    if (this.page) {
      const r = this.regionAt(x, y);
      if (r >= 0) this.fillRegion(r, this.color);
      return;
    }
    this._flood(x | 0, y | 0);
  }

  // Balde na tela livre: preenche área de cor parecida
  _flood(sx, sy) {
    const w = this.w, h = this.h;
    if (sx < 0 || sy < 0 || sx >= w || sy >= h) return;
    const im = this.pctx.getImageData(0, 0, w, h), d = im.data;
    const comp = (j) => {
      const a = d[j + 3] / 255;
      return [d[j] * a + 255 * (1 - a), d[j + 1] * a + 255 * (1 - a), d[j + 2] * a + 255 * (1 - a)];
    };
    const t = comp((sy * w + sx) * 4);
    const [cr, cg, cb] = hexToRgb(this.color);
    if (Math.abs(t[0] - cr) + Math.abs(t[1] - cg) + Math.abs(t[2] - cb) < 6) return;
    const tol = 110;
    const match = (i) => {
      const c = comp(i * 4);
      return Math.abs(c[0] - t[0]) + Math.abs(c[1] - t[1]) + Math.abs(c[2] - t[2]) <= tol;
    };
    const filled = new Uint8Array(w * h);
    const stack = [sx, sy];
    let x0 = sx, x1 = sx, y0 = sy, y1 = sy;
    while (stack.length) {
      const y = stack.pop(), x = stack.pop();
      let l = x;
      while (l > 0 && !filled[y * w + l - 1] && match(y * w + l - 1)) l--;
      let r = x;
      while (r < w - 1 && !filled[y * w + r + 1] && match(y * w + r + 1)) r++;
      if (filled[y * w + x] || !match(y * w + x)) continue;
      let upOpen = false, dnOpen = false;
      for (let xx = l; xx <= r; xx++) {
        const i = y * w + xx;
        filled[i] = 1;
        if (y > 0) {
          const u = i - w, ok = !filled[u] && match(u);
          if (ok && !upOpen) { stack.push(xx, y - 1); upOpen = true; } else if (!ok) upOpen = false;
        }
        if (y < h - 1) {
          const dn = i + w, ok = !filled[dn] && match(dn);
          if (ok && !dnOpen) { stack.push(xx, y + 1); dnOpen = true; } else if (!ok) dnOpen = false;
        }
      }
      if (l < x0) x0 = l;
      if (r > x1) x1 = r;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
    x0 = Math.max(0, x0 - 1); y0 = Math.max(0, y0 - 1); x1 = Math.min(w - 1, x1 + 1); y1 = Math.min(h - 1, y1 + 1);
    this._pushUndo(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
    // pinta com 1px extra para cobrir a borda suavizada dos traços
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = y * w + x;
        const hit = filled[i] || (x > 0 && filled[i - 1]) || (x < w - 1 && filled[i + 1]) || (y > 0 && filled[i - w]) || (y < h - 1 && filled[i + w]);
        if (!hit) continue;
        const j = i * 4;
        d[j] = cr; d[j + 1] = cg; d[j + 2] = cb; d[j + 3] = 255;
      }
    }
    const sub = new ImageData(x1 - x0 + 1, y1 - y0 + 1);
    for (let y = y0; y <= y1; y++) sub.data.set(d.subarray((y * w + x0) * 4, (y * w + x1 + 1) * 4), (y - y0) * (x1 - x0 + 1) * 4);
    this.pctx.putImageData(sub, x0, y0);
    this._changed();
  }

  // ---------- desfazer / limpar / exportar ----------
  _pushUndo(x, y, w, h, extra = null) {
    this.undoStack.push({ x, y, img: this.pctx.getImageData(x, y, w, h), extra });
    if (this.undoStack.length > 25) this.undoStack.shift();
  }

  undo() {
    const u = this.undoStack.pop();
    if (!u) return false;
    this.pctx.putImageData(u.img, u.x, u.y);
    if (u.extra && this.onUndoExtra) this.onUndoExtra(u.extra);
    this._changed();
    return true;
  }

  clear() {
    this.undoStack = [];
    this.pctx.clearRect(0, 0, this.w, this.h);
    this._changed();
  }

  _changed() { this.onChange && this.onChange(); }

  loadPaint(img) {
    this.pctx.drawImage(img, 0, 0, this.w, this.h);
  }

  paintBlob() {
    return new Promise((res) => this.paint.toBlob(res, 'image/png'));
  }

  exportBlob() {
    const c = makeCanvas(this.w, this.h), x = c.getContext('2d');
    x.fillStyle = '#fff';
    x.fillRect(0, 0, this.w, this.h);
    x.drawImage(this.paint, 0, 0);
    if (this.page) x.drawImage(this.page.lineCanvas, 0, 0);
    return new Promise((res) => c.toBlob(res, 'image/png'));
  }
}

function mid(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, p: b.p };
}
