from kit import *

# ---------- peças de princesa (pés em (0,0), cabeça em (0,-330)) ----------


def saia(cor, larg=170):
    return p(f'M-50 -205 C-90 -140 -{larg - 20} -60 -{larg} -8 Q0 14 {larg} -8 C{larg - 20} -60 90 -140 50 -205 Z', cor)


def babado(cor, larg=170):
    """Faixa decorativa na barra da saia."""
    return p(f'M-{larg} -8 Q0 14 {larg} -8 L{larg - 8} -45 Q0 -25 -{larg - 8} -45 Z', cor)


def corpete(cor):
    return p('M-46 -262 Q-56 -230 -48 -198 Q0 -188 48 -198 Q56 -230 46 -262 Q0 -250 -46 -262 Z', cor)


def mangas_bufantes(cor):
    return c(-60, -248, 26, cor) + c(60, -248, 26, cor)


def bracos(pele=PE, pose='saia'):
    if pose == 'saia':  # mãos segurando a saia
        return (p('M-72 -232 Q-92 -190 -84 -160 L-66 -162 Q-72 -195 -56 -228 Z', pele) +
                p('M72 -232 Q92 -190 84 -160 L66 -162 Q72 -195 56 -228 Z', pele) +
                c(-76, -152, 15, pele) + c(76, -152, 15, pele))
    if pose == 'frente':  # mãos juntas segurando algo
        return (p('M-72 -232 Q-80 -180 -30 -170 L-28 -186 Q-60 -192 -56 -228 Z', pele) +
                p('M72 -232 Q80 -180 30 -170 L28 -186 Q60 -192 56 -228 Z', pele))
    if pose == 'aceno':  # braço direito levantado
        return (p('M-72 -232 Q-92 -190 -84 -160 L-66 -162 Q-72 -195 -56 -228 Z', pele) + c(-76, -152, 15, pele) +
                p('M70 -240 Q110 -270 118 -320 L100 -324 Q94 -282 58 -258 Z', pele) + c(110, -334, 16, pele))
    return ''


def pescoco(pele=PE):
    return rect(-14, -282, 28, 26, pele, 6)


def cabelo_solto(cor, comprimento=-170):
    return p(f'M-72 -335 C-104 -425 104 -425 72 -335 L92 {comprimento} Q60 {comprimento + 15} 48 -235 L-48 -235 Q-60 {comprimento + 15} -92 {comprimento} Z', cor)


def franja_lado(cor):
    return p('M-62 -340 C-58 -405 62 -410 64 -335 C40 -375 0 -372 -62 -340 Z', cor)


def coque(cor):
    return c(0, -405, 34, cor) + cabelo_curto(cor)


def tranca_lateral(cor, x0=40, y0=-285, n=6):
    s = ''
    for k in range(n):
        s += el(x0 + 12 + k * 3, y0 + k * 26, 22 - k, 16, cor, 20)
    return s


def tiara(cor=LIMAO):
    return p('M-34 -386 L-26 -410 L-12 -392 L0 -418 L12 -392 L26 -410 L34 -386 Q0 -378 -34 -386 Z', cor)


def princesa(saia_cor, corpete_cor, cabelo_cor, manga_cor=None, penteado='solto', pose='saia', extra='', tiara_cor=LIMAO, larg=170):
    manga_cor = manga_cor or corpete_cor
    atras = cabelo_solto(cabelo_cor) if penteado in ('solto', 'franja') else ''
    frente = {'solto': franja_lado(cabelo_cor), 'franja': franja(cabelo_cor), 'coque': coque(cabelo_cor),
              'tranca': franja_lado(cabelo_cor) + tranca_lateral(cabelo_cor)}.get(penteado, '')
    return (atras + saia(saia_cor, larg) + babado(manga_cor, larg) + corpete(corpete_cor) + bracos(pose=pose) +
            mangas_bufantes(manga_cor) + pescoco() + cabeca(r=60) + frente + rosto(r=60) +
            (tiara(tiara_cor) if tiara_cor else '') + extra)


def castelo(x, y, s=1, parede=LI, telhado=RS):
    torre = lambda tx: rect(tx - 30, -260, 60, 260, parede, 2) + poly([(tx - 40, -260), (tx, -340), (tx + 40, -260)], telhado)
    return g(x, y, s, torre(-110), torre(110), rect(-80, -200, 160, 200, parede, 2), poly([(-95, -200), (0, -280), (95, -200)], telhado),
             rect(-25, -80, 50, 80, MR, 22), c(0, -140, 18, AC), rect(-125, -200, 30, 40, AC, 12), rect(95, -200, 30, 40, AC, 12))


def floco(x, y, r=16):
    return (p(f'M{x - r} {y} L{x + r} {y} M{x - r * .5} {y - r * .87} L{x + r * .5} {y + r * .87} M{x - r * .5} {y + r * .87} L{x + r * .5} {y - r * .87}') +
            c(x, y, r * 0.35, BR))


def estrela(x, y, r, cor=LIMAO):
    return poly([(x + r * math.cos(math.pi / 2 + i * math.pi / 5) * (1 if i % 2 == 0 else 0.45),
                  y - r * math.sin(math.pi / 2 + i * math.pi / 5) * (1 if i % 2 == 0 else 0.45)) for i in range(10)], cor)


# ---------- páginas ----------

def gelo():
    castelo_gelo = castelo(400, 330, 0.75, AC, CEU)
    capa = p('M-46 -262 C-110 -150 -190 -60 -210 -4 Q0 20 210 -4 C190 -60 110 -150 46 -262 Z', AC)
    rainha = g(270, 560, 0.85, capa,
               princesa(CEU, CEU, LIMAO, AC, penteado='tranca', pose='aceno', tiara_cor=AC))
    irma = g(530, 560, 0.75,
             p('M-60 -262 C-120 -170 -130 -60 -120 -6 L120 -6 C130 -60 120 -170 60 -262 Z', MG),
             princesa(VE, PR, MC, VE, penteado='franja', tiara_cor=None) +
             el(-58, -270, 16, 32, MC, 15) + el(58, -270, 16, 32, MC, -15))
    boneco = g(690, 560, 0.8, c(0, -60, 62, BR), c(0, -165, 48, BR), c(0, -245, 40, BR),
               p('M0 -245 L50 -238 L0 -230 Z', LA), c(-14, -255, 6, PR), c(14, -255, 6, PR),
               p('M-14 -228 Q0 -220 14 -228'), p('M-45 -170 L-110 -210 M45 -170 L110 -210'),
               c(0, -170, 7, PR), c(0, -140, 7, PR), p('M-6 -285 Q0 -310 8 -300'))
    flocos = ''.join(floco(x, y, 16) for x, y in [(90, 90), (200, 60), (620, 70), (720, 140), (80, 260), (720, 300)])
    return svg(rect(4, 4, 792, 592, LI, 12), flocos, castelo_gelo, chao(BR, 480), rainha, irma, boneco)


def bela():
    estante = (rect(30, 60, 220, 400, MR, 6) + ''.join(rect(40, 70 + k * 95, 200, 85, MC, 2) for k in range(4)) +
               ''.join(rect(48 + j * 32, 90 + k * 95, 26, 65, [VM, AZ, VD, AM, RX, LA][(j + k) % 6], 3) for k in range(4) for j in range(6)))
    janela = rect(560, 60, 200, 230, AC, 90) + p('M660 60 L660 290 M560 175 L760 175')
    mesa = rect(560, 400, 200, 22, MR, 6) + rect(645, 420, 30, 100, MR, 4)
    redoma = (rect(600, 380, 120, 22, AM, 6) + p('M610 380 L610 290 Q660 220 710 290 L710 380 Z', AC) +
              p('M660 375 L660 320') + rosa(660, 305, 22) + el(645, 345, 14, 7, VD, -30) + el(675, 340, 14, 7, VD, 30))
    fig = g(400, 565, 0.9, princesa(AM, AM, MR, AM, penteado='coque', pose='frente', tiara_cor=None,
                                     extra=livro(0, -175, 80, 56, AZ)) + p('M-30 -420 Q0 -440 30 -420 L20 -400 L-20 -400 Z', AM))
    piso = p('M4 520 L796 520 L796 596 L4 596 Z', VI)
    return svg(rect(4, 4, 792, 592, LA, 12), estante, janela, piso, mesa, redoma, fig)


def cinderela():
    rodas = c(-110, -40, 50, LIMAO) + c(110, -40, 50, LIMAO) + c(-110, -40, 16, AM) + c(110, -40, 16, AM)
    abobora = (el(0, -170, 170, 130, LA) + p('M-60 -290 Q-80 -170 -60 -50 M60 -290 Q80 -170 60 -50 M0 -300 L0 -40') +
               rect(-50, -230, 100, 90, AC, 40) + p('M0 -300 Q20 -340 50 -330', ) + el(40, -330, 22, 10, VD, -20))
    carruagem = g(590, 470, 0.8, abobora, rodas)
    sapatinho = g(160, 540, 0.9, p('M-50 0 L50 0 L50 -12 Q30 -40 0 -30 L-30 -12 L-50 -20 Z', AC), p('M-50 -20 L-50 0'))
    relogio = g(110, 210, 1, rect(-50, -140, 100, 200, CZ, 4), poly([(-60, -140), (0, -200), (60, -140)], MA), c(0, -60, 38, BR),
                p('M0 -60 L0 -88 M0 -60 L22 -60'))
    fig = g(360, 565, 0.9, princesa(AC, CEU, LIMAO, AC, penteado='coque', pose='saia', tiara_cor=AC) +
            p('M-36 -420 Q0 -436 36 -420', ) + p('M-36 -420 Q0 -436 36 -420 L30 -412 Q0 -426 -30 -412 Z', CEU))
    estrelas = ''.join(estrela(x, y, 16) for x, y in [(250, 60), (430, 90), (560, 50), (720, 100)])
    return svg(rect(4, 4, 792, 592, MA, 12), estrelas, c(680, 160, 40, LIMAO), relogio, chao(VE, 500), carruagem, sapatinho, fig)


def bela_adormecida():
    fig = g(300, 565, 0.92, princesa(RS, RS, AM, RC, penteado='solto', pose='saia', tiara_cor=LIMAO))
    roseira = ''.join(rosa(x, y, 20, VM) + el(x + 22, y + 10, 14, 7, VD, 30) for x, y in [(560, 470), (620, 500), (700, 470), (740, 520)])
    fadas = ''.join(g(x, y, 1.9, c(0, 0, 14, PE), p('M-10 10 L0 45 L10 10 Z', cor), el(-16, 18, 12, 18, AC, -30), el(16, 18, 12, 18, AC, 30),
                      c(-4, -2, 2.5, PR) + c(4, -2, 2.5, PR))
                    for x, y, cor in [(110, 120, VM), (230, 80, VD), (350, 140, CEU)])
    return svg(ceu(), nuvem(680, 90, 0.9), castelo(620, 440, 0.95, LI, AZ), chao(VC, 480), fadas, roseira, fig)


def rapunzel():
    torre = (rect(470, 120, 180, 480, CZ, 4) + poly([(450, 125), (560, 10), (670, 125)], RX) +
             rect(515, 170, 90, 80, AC, 40) + ''.join(rect(480 + (k % 2) * 80, 300 + k * 60, 60, 26, CZ, 4) for k in range(4)))
    tranca = ''.join(el(600 + math.sin(k * 0.7) * 30, 240 + k * 34, 26, 20, AM, 20) for k in range(10))
    flores_tranca = ''.join(c(600 + math.sin(k * 0.7) * 30, 240 + k * 34, 7, RS) for k in (2, 5, 8))
    fig = g(270, 565, 0.9, princesa(LI, RX, AM, LI, penteado='solto', pose='aceno', tiara_cor=None) +
            ''.join(el(-80 - k * 6, -240 + k * 40, 24, 18, AM, -20) for k in range(6)))
    lanternas = ''.join(g(x, y, 1, rect(-16, -22, 32, 40, LA, 8), rect(-10, 18, 20, 8, MR, 2)) for x, y in [(90, 90), (190, 150), (320, 70), (400, 170), (720, 260)])
    return svg(rect(4, 4, 792, 592, AZ, 12), lanternas, chao(VD, 520), torre, tranca, flores_tranca, fig, flor(80, 545, RS, r=18))


def sereia():
    mar = p('M4 300 Q100 285 200 300 T400 300 T600 300 T796 300 L796 596 L4 596 Z', CEU)
    pedra = p('M180 600 Q170 470 260 440 Q380 410 470 450 Q560 480 560 600 Z', CZ)
    cauda = (p('M-50 -200 C-60 -120 -40 -40 20 10 C60 40 100 40 130 20 L90 0 C40 -10 30 -100 50 -200 Z', TQ) +
             p('M120 20 L190 -30 L170 30 L200 80 Z', VD))
    fig = g(330, 470, 0.9,
            cabelo_solto(VM, -130),
            cauda,
            p('M-46 -262 Q-56 -230 -48 -198 Q0 -188 48 -198 Q56 -230 46 -262 Z', PE),
            el(-22, -240, 22, 16, LI) + el(22, -240, 22, 16, LI),
            bracos(pose='aceno'),
            pescoco(), cabeca(r=60), franja_lado(VM), rosto(r=60))
    peixe = g(640, 430, 1.2, el(0, 0, 44, 30, AM), poly([(-38, 0), (-75, -24), (-75, 24)], AM), rect(-10, -28, 14, 56, CEU, 6), olho_simples(22, -6))
    concha = g(110, 540, 1, p('M-40 0 Q0 -60 40 0 Z', RC), p('M0 0 L0 -40 M-20 0 L-12 -32 M20 0 L12 -32'))
    bolhas = c(560, 330, 14, BR) + c(590, 290, 10, BR) + c(700, 360, 12, BR)
    return svg(ceu(), sol(680, 90), nuvem(160, 90, 0.9), mar, pedra, fig, peixe, concha, bolhas)


def olho_simples(x, y, r=6):
    return c(x, y, r, PR)


def branca_de_neve():
    casinha = g(620, 470, 0.9, rect(-110, -150, 220, 150, MC, 4), poly([(-130, -150), (0, -250), (130, -150)], VM),
                rect(-25, -90, 50, 90, MR, 22), rect(-90, -110, 40, 40, AC, 4), rect(50, -110, 40, 40, AC, 4))
    laco = el(-28, -405, 22, 14, VM, -20) + el(28, -405, 22, 14, VM, 20) + c(0, -405, 10, VM)
    cabelo_curto_preto = p('M-72 -320 C-100 -430 100 -430 72 -320 Q60 -280 50 -300 L-50 -300 Q-60 -280 -72 -320 Z', PR)
    fig = g(320, 565, 0.92,
            cabelo_curto_preto,
            saia(AM), babado(BR), corpete(AZ), bracos(pose='frente'), mangas_bufantes(CEU), pescoco(),
            p('M-70 -262 Q-60 -300 -40 -290 L0 -270 L40 -290 Q60 -300 70 -262 Q0 -246 -70 -262 Z', BR),
            cabeca(r=60), p('M-62 -345 C-55 -400 55 -400 62 -345 C40 -372 -40 -372 -62 -345 Z', PR), rosto(r=60), laco,
            c(0, -168, 26, VM), p('M0 -194 L4 -210') + el(12, -206, 10, 5, VD, -20))
    passaro_azul = passaro(160, 200, CEU, 1.1)
    return svg(ceu(), sol(110, 90), nuvem(420, 90, 0.9), arvore(150, 470, 0.95), casinha, chao(VC, 480), passaro_azul,
               flor(540, 530, RS, r=18), flor(760, 540, LI, r=18), fig)


DESENHOS = {
    'princesas-do-gelo': ('Princesas do gelo', gelo),
    'bela-e-a-rosa': ('A Bela e a rosa encantada', bela),
    'cinderela': ('Cinderela', cinderela),
    'bela-adormecida': ('Bela Adormecida', bela_adormecida),
    'rapunzel': ('Rapunzel', rapunzel),
    'pequena-sereia': ('A pequena sereia', sereia),
    'branca-de-neve': ('Branca de Neve', branca_de_neve),
}
