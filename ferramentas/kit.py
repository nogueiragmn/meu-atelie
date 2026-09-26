# Kit para desenhar páginas em SVG no estilo do Ateliê:
# cores chapadas da paleta, contorno preto grosso, formas grandes (fáceis de pintar).
import math

# Paleta (mesmos valores de js/palette.js)
BR = '#FFFFFF'; LIMAO = '#FFF23A'; AM = '#FFC81E'; LA = '#FF8A1F'; VM = '#E5202A'; VI = '#9E1B32'
RC = '#FFB6D3'; RS = '#FF5FA2'; MG = '#D4108A'; LI = '#C39BEA'; RX = '#7A34C2'
AC = '#9ED8FF'; CEU = '#2BA6F5'; AZ = '#2150D8'; MA = '#18236E'; TQ = '#12BDB2'
VC = '#9EE25B'; VD = '#2DB43E'; VE = '#136A31'; PE = '#F8CBA2'; MC = '#C47C3D'; MR = '#6B3B1F'
CZ = '#8E8E8E'; PR = '#1E1E1E'

W, H = 800, 600
TRACO = 7


def svg(*partes):
    corpo = '\n'.join(p for p in partes if p)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">\n'
            f'<g stroke="#222" stroke-width="{TRACO}" stroke-linejoin="round" stroke-linecap="round">\n{corpo}\n</g></svg>\n')


def g(x, y, s, *partes, flip=False):
    """Grupo posicionado; o traço é compensado para manter a mesma espessura."""
    sx = -s if flip else s
    return f'<g transform="translate({x} {y}) scale({sx} {s})" stroke-width="{TRACO / s:.2f}">' + ''.join(p for p in partes if p) + '</g>'


def c(x, y, r, fill):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}"/>'


def el(x, y, rx, ry, fill, rot=0):
    t = f' transform="rotate({rot} {x} {y})"' if rot else ''
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}"{t}/>'


def p(d, fill='none'):
    return f'<path d="{d}" fill="{fill}"/>'


def rect(x, y, w, h, fill, rx=0):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"/>'


def poly(pts, fill):
    return f'<polygon points="{" ".join(f"{a},{b}" for a, b in pts)}" fill="{fill}"/>'


def brilho(x, y, r):
    """Pontinho branco nos olhos (sem contorno)."""
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff" stroke="none"/>'


# ---------------- cenário ----------------

def ceu(cor=AC):
    return rect(4, 4, 792, 592, cor, 12)


def chao(cor=VC, y=470):
    return p(f'M4 {y} Q200 {y - 40} 400 {y - 10} T796 {y - 20} L796 596 L4 596 Z', cor)


def sol(x, y, r=45):
    raios = ''.join(
        f'M{x + math.cos(a) * (r + 14):.0f} {y + math.sin(a) * (r + 14):.0f} L{x + math.cos(a) * (r + 36):.0f} {y + math.sin(a) * (r + 36):.0f} '
        for a in [i * math.pi / 4 for i in range(8)])
    return p(raios) + c(x, y, r, AM)


def nuvem(x, y, s=1):
    return g(x, y, s, p('M-70 20 Q-95 -10 -60 -20 Q-50 -55 -10 -45 Q15 -70 45 -45 Q85 -45 75 -10 Q100 15 65 25 Z', BR))


def flor(x, y, cor=RS, miolo=AM, r=22):
    return p(f'M{x} {y + r} L{x} {y + r + 45}') + c(x, y, r, cor) + c(x, y, r * 0.42, miolo)


def arvore(x, y, s=1, copa=VD, tronco=MC):
    return g(x, y, s, rect(-22, -150, 44, 150, tronco, 6),
             p('M-95 -150 Q-130 -200 -85 -235 Q-80 -300 -15 -295 Q30 -330 75 -285 Q130 -270 110 -210 Q140 -165 90 -140 Q0 -120 -95 -150 Z', copa))


def auréola(x, y, r):
    return c(x, y, r, LIMAO)


# ---------------- pessoas (coordenadas: pés em (0,0), cabeça em (0,-330)) ----------------

def rosto(x=0, y=-325, r=62, feliz=True, olhos_fechados=False):
    ex, ey = r * 0.34, y + r * 0.02
    if olhos_fechados:
        olhos = (p(f'M{x - ex - 10} {ey} Q{x - ex} {ey + 10} {x - ex + 10} {ey}') +
                 p(f'M{x + ex - 10} {ey} Q{x + ex} {ey + 10} {x + ex + 10} {ey}'))
    else:
        olhos = (el(x - ex, ey, r * 0.09, r * 0.13, PR) + el(x + ex, ey, r * 0.09, r * 0.13, PR) +
                 brilho(x - ex + 3, ey - 4, 3.5) + brilho(x + ex + 3, ey - 4, 3.5))
    boca = p(f'M{x - r * 0.22} {y + r * 0.36} Q{x} {y + r * (0.58 if feliz else 0.45)} {x + r * 0.22} {y + r * 0.36}')
    bochechas = c(x - r * 0.58, y + r * 0.32, r * 0.15, RC) + c(x + r * 0.58, y + r * 0.32, r * 0.15, RC)
    return bochechas + olhos + boca


def pes(cor=MR):
    return el(-38, -4, 30, 14, cor) + el(38, -4, 30, 14, cor)


def tunica(cor, largura=120, topo=-262):
    return p(f'M-58 {topo} C-80 -200 -{largura - 10} -80 -{largura} -8 Q0 10 {largura} -8 C{largura - 10} -80 80 -200 58 {topo} Z', cor)


def manto(cor, aberto=True):
    """Manto sobre os ombros, dos dois lados."""
    e = 'M-60 -262 C-130 -170 -150 -70 -140 -6 L-92 -4 C-96 -90 -86 -190 -30 -255 Z'
    d = 'M60 -262 C130 -170 150 -70 140 -6 L92 -4 C96 -90 86 -190 30 -255 Z'
    return p(e, cor) + p(d, cor)


def mangas(cor, mao=PE, maos_juntas=True):
    if maos_juntas:
        return (el(-50, -190, 32, 62, cor, -38) + el(50, -190, 32, 62, cor, 38) +
                c(0, -150, 24, mao))
    return el(-78, -170, 30, 70, cor, 12) + el(78, -170, 30, 70, cor, -12) + c(-88, -110, 20, mao) + c(88, -110, 20, mao)


def cabeca(cor=PE, r=62, y=-325):
    return c(0, y, r, cor)


def veu(cor, touca=BR):
    """Véu de freira: parte de trás, touca branca e o rosto por cima."""
    return (p('M-88 -335 C-100 -440 100 -440 88 -335 L110 -225 Q0 -205 -110 -225 Z', cor) +
            el(0, -322, 80, 84, touca) + el(0, -258, 62, 24, touca))


def cabelo_curto(cor):
    return p('M-64 -335 C-70 -410 70 -410 64 -335 C50 -370 -20 -385 -64 -335 Z', cor)


def cabelo_longo(cor):
    return (p('M-70 -330 C-95 -420 95 -420 70 -330 L82 -240 Q55 -230 45 -262 L-45 -262 Q-55 -230 -82 -240 Z', cor))


def franja(cor):
    return p('M-62 -345 C-55 -400 55 -400 62 -345 C30 -370 -10 -370 -62 -345 Z', cor)


def barba(cor, y=-325):
    d = y + 7
    return p(f'M-60 {d} C-60 {d + 68} 60 {d + 68} 60 {d} C40 {d + 28} -40 {d + 28} -60 {d} Z', cor)


def cruz(x, y, s=1, cor=MR):
    return g(x, y, s, p('M-9 -60 L9 -60 L9 -30 L32 -30 L32 -14 L9 -14 L9 50 L-9 50 L-9 -14 L-32 -14 L-32 -30 L-9 -30 Z', cor))


def rosa(x, y, r=17, cor=VM):
    return c(x, y, r, cor) + p(f'M{x - r * 0.5} {y} Q{x} {y - r * 0.7} {x + r * 0.5} {y}')


def livro(x, y, w=90, h=64, cor=VM, rot=0):
    t = f' transform="rotate({rot} {x} {y})"'
    return (f'<g{t}>' + rect(x - w / 2, y - h / 2, w, h, cor, 6) +
            rect(x - w / 2 + 8, y - h / 2 + 8, w - 16, h - 16, BR, 3) + p(f'M{x} {y - h / 2 + 8} L{x} {y + h / 2 - 8}') + '</g>')


def passaro(x, y, cor, s=1, flip=False):
    return g(x, y, s, el(0, 0, 34, 24, cor), c(24, -16, 17, cor), poly([(38, -18), (56, -12), (38, -8)], LA),
             p('M-10 -6 Q0 -22 12 -4', cor), c(28, -19, 3.5, PR), flip=flip)


def pomba(x, y, s=1, flip=False):
    return g(x, y, s, el(0, 0, 44, 24, BR), c(34, -14, 18, BR), poly([(48, -16), (66, -12), (48, -6)], LA),
             p('M-20 -8 Q-5 -60 25 -10 Z', BR), p('M-40 0 L-70 -12 L-70 12 Z', BR), c(38, -17, 3.5, PR), flip=flip)
