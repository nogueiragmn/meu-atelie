// Caixinha com 24 lápis de cor
export const PALETTE = [
  { nome: 'Branco', hex: '#FFFFFF' },
  { nome: 'Amarelo limão', hex: '#FFF23A' },
  { nome: 'Amarelo', hex: '#FFC81E' },
  { nome: 'Laranja', hex: '#FF8A1F' },
  { nome: 'Vermelho', hex: '#E5202A' },
  { nome: 'Vinho', hex: '#9E1B32' },
  { nome: 'Rosa claro', hex: '#FFB6D3' },
  { nome: 'Rosa', hex: '#FF5FA2' },
  { nome: 'Magenta', hex: '#D4108A' },
  { nome: 'Lilás', hex: '#C39BEA' },
  { nome: 'Roxo', hex: '#7A34C2' },
  { nome: 'Azul claro', hex: '#9ED8FF' },
  { nome: 'Azul céu', hex: '#2BA6F5' },
  { nome: 'Azul', hex: '#2150D8' },
  { nome: 'Azul marinho', hex: '#18236E' },
  { nome: 'Turquesa', hex: '#12BDB2' },
  { nome: 'Verde claro', hex: '#9EE25B' },
  { nome: 'Verde', hex: '#2DB43E' },
  { nome: 'Verde escuro', hex: '#136A31' },
  { nome: 'Pele', hex: '#F8CBA2' },
  { nome: 'Marrom claro', hex: '#C47C3D' },
  { nome: 'Marrom', hex: '#6B3B1F' },
  { nome: 'Cinza', hex: '#8E8E8E' },
  { nome: 'Preto', hex: '#1E1E1E' },
];

export const WHITE = 0;
export const BLACK = PALETTE.length - 1;

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const lin = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  lin[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);

export function rgbToLab(r, g, b) {
  const R = lin[r], G = lin[g], B = lin[b];
  const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const fx = f(x), fy = f(y), fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

for (const p of PALETTE) {
  p.rgb = hexToRgb(p.hex);
  p.lab = rgbToLab(...p.rgb);
}

// Versão "neon" de uma cor: mais saturada e luminosa
export function neonOf(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const d = max - min;
  if (d > 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  if (d < 0.08) {
    return l > 0.5 ? { glow: 'hsl(55 100% 70%)', core: '#ffffff' } : { glow: 'hsl(0 0% 40%)', core: 'hsl(0 0% 12%)' };
  }
  return { glow: `hsl(${h.toFixed(0)} 100% 55%)`, core: `hsl(${h.toFixed(0)} 100% 74%)` };
}
