from kit import *
from bichos import olho, sorriso


def estrelas(pts, r=14):
    return ''.join(poly([(x + r * math.cos(math.pi / 2 + i * math.pi / 5) * (1 if i % 2 == 0 else 0.45),
                          y - r * math.sin(math.pi / 2 + i * math.pi / 5) * (1 if i % 2 == 0 else 0.45)) for i in range(10)], LIMAO)
                   for x, y in pts)


def bruxa_vassoura():
    lua = c(680, 120, 70, LIMAO)
    vassoura = p('M110 400 L560 370 L562 386 L112 416 Z', MC) + p('M560 360 Q640 340 700 320 Q690 370 700 430 Q640 410 560 396 Z', AM) + \
        p('M590 370 L680 340 M590 382 L690 382 M590 392 L680 415')
    bruxa = g(340, 395, 0.95,
              p('M-60 -10 Q-80 -120 -40 -180 L40 -180 Q80 -120 60 -10 Z', PR),
              el(-70, -90, 22, 50, PR, 30), c(-92, -48, 16, PE),
              rect(-14, -205, 28, 26, PE, 6),
              p('M-50 -265 Q-95 -200 -100 -120 Q-80 -110 -72 -140 Q-66 -200 -46 -238 Z', LA),
              el(-96, -112, 12, 16, LA),
              c(0, -250, 55, PE),
              p('M-95 -290 Q0 -320 95 -290 L80 -275 Q0 -300 -80 -275 Z', PR),
              p('M-55 -290 L10 -400 L55 -290 Z', PR), p('M-55 -305 L55 -305 L50 -290 L-50 -290 Z', RX),
              rosto(0, -248, 55))
    gato = g(530, 370, 0.85, el(0, -10, 45, 40, PR), c(0, -70, 34, PR), poly([(-30, -90), (-35, -125), (-10, -100)], PR),
             poly([(30, -90), (35, -125), (10, -100)], PR), c(-12, -72, 8, LIMAO), c(12, -72, 8, LIMAO), p('M40 -10 Q90 -30 80 -90'))
    cao = g(200, 380, 0.85, el(0, -10, 50, 38, MC), c(-40, -65, 36, MC), el(-65, -60, 14, 28, MR, 20), el(-15, -60, 14, 28, MR, -20),
            olho(-52, -70, 6), olho(-30, -70, 6), el(-41, -50, 10, 7, PR))
    sapo = g(610, 355, 0.75, el(0, -20, 45, 32, VD), c(-22, -50, 15, VD), c(22, -50, 15, VD), c(-22, -52, 6, PR), c(22, -52, 6, PR), sorriso(0, -20, 18, 8))
    ave = passaro(460, 230, VM, 1.3)
    return svg(rect(4, 4, 792, 592, MA, 12), estrelas([(80, 60), (200, 120), (420, 50), (540, 150), (760, 260), (90, 300)]), lua,
               p('M4 520 Q150 450 300 500 Q450 540 600 470 Q700 440 796 480 L796 596 L4 596 Z', VE),
               arvore(720, 560, 0.7, VD, MR), vassoura, cao, bruxa, gato, sapo, ave)


def monstrinho(x, y, s, flip=False):
    return g(x, y, s,
             rect(-55, -60, 40, 60, MR, 14), rect(15, -60, 40, 60, MR, 14), el(-35, -2, 30, 13, MC), el(35, -2, 30, 13, MC),
             p('M-80 -50 Q-90 -170 0 -180 Q90 -170 80 -50 Q0 -20 -80 -50 Z', MR),
             el(0, -95, 50, 50, PE),
             poly([(-55, -165), (-75, -215), (-30, -175)], AM), poly([(55, -165), (75, -215), (30, -175)], AM),
             c(-25, -140, 16, LA), c(25, -140, 16, LA), c(-25, -138, 7, PR), c(25, -138, 7, PR),
             el(0, -112, 14, 9, MC), p('M-22 -95 Q0 -78 22 -95'),
             poly([(-70, -120), (-95, -110), (-75, -95)], RX), poly([(70, -120), (95, -110), (75, -95)], RX), flip=flip)


def filho_monstro():
    neve = p('M4 470 Q200 440 400 465 T796 455 L796 596 L4 596 Z', BR)
    arvores = arvore(110, 470, 1, VE, MR) + arvore(690, 470, 1.05, VE, MR)
    sombra = p('M520 480 Q560 380 600 300 Q640 280 650 330 Q700 300 690 360 Q660 420 640 480 Z', CZ)
    rato = g(560, 520, 0.8, p('M-40 -10 Q-80 -20 -95 -50'), el(0, -25, 45, 30, CZ), c(38, -45, 24, CZ),
             c(25, -72, 16, RC), c(52, -72, 16, RC), c(60, -42, 5, RS), olho(42, -50, 5))
    flocos = ''.join(c(x, y, 9, BR) for x, y in [(70, 80), (200, 60), (320, 120), (460, 70), (590, 140), (740, 80), (260, 240), (420, 260)])
    lua = c(400, 90, 40, LIMAO)
    return svg(rect(4, 4, 792, 592, MA, 12), lua, flocos, arvores, neve, sombra, monstrinho(300, 540, 1.6), rato)


def homem_graveto():
    def graveto(x, y, s, fita=None):
        return g(x, y, s,
                 p('M-14 -300 Q-22 -150 -10 0 L10 0 Q22 -150 14 -300 Z', MC),
                 p('M-8 -220 L-90 -260 L-84 -272 L-4 -238 Z', MC), p('M8 -220 L90 -170 L84 -158 L4 -204 Z', MC),
                 p('M-6 -60 L-40 0 L-28 4 L0 -40 Z', MC), p('M6 -60 L40 0 L28 4 L0 -40 Z', MC),
                 c(0, -330, 34, MC), olho(-12, -336, 6), olho(12, -336, 6), sorriso(0, -318, 12, 8),
                 el(-90, -272, 16, 8, VD, -20),
                 (p('M-20 -280 Q0 -270 20 -280 L20 -268 Q0 -258 -20 -268 Z', fita) if fita else ''))
    arvore_casa = (rect(560, 160, 60, 340, MR, 6) + p('M450 170 Q430 80 520 70 Q560 10 640 40 Q720 30 730 110 Q770 170 700 200 Q590 220 450 170 Z', VD) +
                   el(640, 300, 40, 26, MC) + c(640, 300, 12, MR))
    cachorro = g(240, 520, 0.9, el(0, -40, 70, 40, BR), c(-70, -80, 38, BR), el(-95, -70, 16, 30, PR, 15), c(-75, -88, 6, PR),
                 el(-100, -76, 9, 7, PR), rect(-40, -20, 16, 30, BR, 6), rect(30, -20, 16, 30, BR, 6), p('M68 -50 Q100 -70 95 -95'),
                 el(10, -55, 20, 14, PR))
    return svg(ceu(), sol(110, 90), nuvem(330, 90, 0.9), arvore_casa, chao(VC, 500), cachorro,
               graveto(420, 540, 0.9, VM), graveto(520, 540, 0.55, AZ), graveto(700, 540, 0.75, RS),
               flor(80, 540, AM, r=18))


def zog():
    dragao = g(380, 520, 1.1,
               p('M80 -40 Q180 -30 200 -110 Q215 -150 240 -130 Q210 -20 90 0 Z', LA),
               el(0, -80, 110, 80, LA), el(10, -60, 60, 48, AM),
               p('M-40 -140 Q-120 -260 -40 -230 Q-10 -200 -10 -150 Z', VM), p('M40 -140 Q120 -280 60 -240 Q20 -210 20 -150 Z', VM),
               rect(-70, -20, 40, 40, LA, 14), rect(40, -20, 40, 40, LA, 14),
               el(-90, -170, 70, 56, LA),
               poly([(-110, -220), (-100, -265), (-80, -222)], AM), poly([(-70, -222), (-55, -265), (-45, -218)], AM),
               olho(-105, -180, 12), olho(-65, -180, 12), el(-140, -150, 10, 7, MR), sorriso(-100, -140, 26, 14),
               poly([(-60, -125), (-40, -112), (-60, -100)], AM))
    escola = g(640, 470, 0.9, rect(-90, -200, 180, 200, CZ, 4), rect(-110, -260, 50, 260, CZ, 4), rect(60, -260, 50, 260, CZ, 4),
               poly([(-120, -260), (-85, -320), (-50, -260)], AZ), poly([(50, -260), (85, -320), (120, -260)], AZ),
               rect(-25, -80, 50, 80, MR, 22), c(0, -140, 20, AC))
    estrela_ouro = estrelas([(160, 140)], 34)
    return svg(ceu(), nuvem(140, 90, 1), nuvem(460, 70, 0.8), escola, chao(VC, 500), estrela_ouro, dragao, flor(90, 540, RS, r=18))


def superminhoca():
    corpo = ''
    pts = [(160, 400), (220, 330), (300, 290), (380, 300), (440, 360), (470, 430), (540, 470), (620, 450), (670, 390)]
    for k, (x, y) in enumerate(pts):
        corpo += c(x, y, 42, RS if k % 2 == 0 else RC)
    cabeca_m = c(700, 340, 55, RS) + olho(685, 325, 10) + olho(720, 325, 10) + sorriso(702, 355, 22, 12)
    capa = p('M650 380 Q600 430 560 520 L620 500 L640 540 L680 420 Z', VM)
    besouro = g(150, 520, 1, el(0, 0, 38, 28, AZ), c(-34, -8, 16, PR), p('M0 -28 L0 28'), c(-12, -5, 6, PR), c(14, 8, 6, PR))
    abelha = g(560, 150, 1, el(0, 0, 36, 24, AM), rect(-8, -24, 12, 48, PR, 4), rect(14, -22, 10, 44, PR, 4), el(-6, -30, 18, 12, AC, -20),
               el(14, -30, 18, 12, AC, 20), olho(30, -4, 5))
    return svg(ceu(), sol(110, 90), nuvem(330, 90, 0.9), chao(VC, 470), flor(80, 470, AM, r=20), flor(760, 500, LI, r=20),
               capa, corpo, cabeca_m, besouro, abelha)


def tiddler():
    fundo = rect(4, 4, 792, 592, CEU, 12)
    areia = p('M4 500 Q200 470 400 495 T796 490 L796 596 L4 596 Z', PE)

    def peixe(x, y, s, cor, listra, flip=False):
        return g(x, y, s, el(0, 0, 60, 40, cor), poly([(-52, 0), (-100, -32), (-100, 32)], cor), rect(-12, -38, 18, 76, listra, 8),
                 olho(30, -8, 8), sorriso(36, 12, 10, 6), flip=flip)
    algas = p('M90 500 Q60 430 100 370 Q130 320 100 270 Q150 320 130 380 Q100 440 120 500 Z', VD) + \
        p('M700 495 Q680 440 710 390 Q670 430 680 495 Z', VE)
    estrela_mar = estrelas([(620, 520)], 30).replace(LIMAO, LA)
    bolhas = c(420, 200, 14, BR) + c(440, 160, 10, BR) + c(430, 125, 8, BR)
    return svg(fundo, areia, algas, peixe(330, 300, 1.2, LIMAO, LA), peixe(560, 210, 1.6, MG, LI, flip=True),
               peixe(220, 140, 1, VD, AM), peixe(600, 400, 1.1, AZ, AC, flip=True), estrela_mar, bolhas)


def macaquinho_mamae():
    def macaco(x, y, s, flip=False):
        return g(x, y, s, p('M-50 0 Q-120 -10 -110 -90', ), el(0, -60, 60, 70, MR), el(0, -45, 34, 42, PE),
                 c(-55, -150, 24, MR), c(55, -150, 24, MR), c(-55, -150, 12, PE), c(55, -150, 12, PE),
                 c(0, -155, 60, MR), p('M-45 -150 Q-40 -200 0 -195 Q40 -200 45 -150 Q45 -110 0 -105 Q-45 -110 -45 -150 Z', PE),
                 olho(-16, -160, 8), olho(16, -160, 8), sorriso(0, -128, 16, 10), flip=flip)
    borboleta = g(420, 180, 1.4, el(-22, -10, 26, 20, AM, -30), el(-18, 16, 18, 14, LA, 20), el(22, -10, 26, 20, AM, 30), el(18, 16, 18, 14, LA, -20),
                  el(0, 0, 6, 26, MR), p('M0 -24 L-10 -40 M0 -24 L10 -40'))
    folhas = el(150, 140, 80, 30, VD, -20) + el(650, 130, 80, 30, VD, 20) + el(120, 260, 60, 24, VE, 30) + el(700, 270, 60, 24, VE, -30)
    return svg(ceu(), folhas, chao(VD, 480), arvore(720, 480, 0.9, VE, MR), borboleta,
               macaco(250, 520, 1.15), macaco(560, 520, 0.7, flip=True), flor(420, 530, RS, r=18))


def espantalhos():
    def espantalho(x, y, s, roupa, chapeu, cabelo, vestido=False):
        corpo = (p('M-60 -230 L60 -230 L80 -40 L-80 -40 Z', roupa) if vestido else
                 rect(-55, -230, 110, 130, roupa, 10) + rect(-50, -100, 40, 100, AZ, 6) + rect(10, -100, 40, 100, AZ, 6))
        return g(x, y, s, rect(-8, -300, 16, 300, MC, 4), rect(-140, -220, 280, 16, MC, 4),
                 corpo, rect(-140, -230, 85, 36, roupa, 10), rect(55, -230, 85, 36, roupa, 10),
                 p('M-150 -225 L-170 -215 L-150 -205 M150 -225 L170 -215 L150 -205', ),
                 c(0, -290, 46, PE), olho(-15, -296, 6), olho(15, -296, 6), sorriso(0, -275, 14, 8), c(0, -284, 6, LA),
                 p('M-48 -300 Q-60 -260 -50 -240 M48 -300 Q60 -260 50 -240'),
                 el(-40, -260, 12, 26, cabelo, 20) + el(40, -260, 12, 26, cabelo, -20),
                 p('M-70 -320 L70 -320 L60 -335 L-60 -335 Z', chapeu), rect(-35, -380, 70, 50, chapeu, 6))
    flores = ''.join(flor(x, y, cor, r=16) for x, y, cor in [(80, 500, RS), (140, 530, LI), (660, 520, VM), (730, 500, CEU)])
    coracao = p('M400 150 Q370 110 340 140 Q320 180 400 230 Q480 180 460 140 Q430 110 400 150 Z', VM)
    return svg(ceu(), sol(700, 90), nuvem(150, 90, 0.9), coracao, chao(AM, 470), flores,
               espantalho(270, 560, 0.95, VD, MR, AM), espantalho(530, 560, 0.95, RS, LI, LA, vestido=True))


DESENHOS = {
    'bruxa-e-a-vassoura': ('A bruxa e a vassoura', bruxa_vassoura),
    'filho-do-grufalo': ('O filho do Grúfalo', filho_monstro),
    'homem-graveto': ('Homem-Graveto', homem_graveto),
    'zog': ('Zog, o dragãozinho', zog),
    'superminhoca': ('Superminhoca', superminhoca),
    'tiddler': ('Tiddler, o peixinho', tiddler),
    'macaquinho-procura-mamae': ('Macaquinho procura a mamãe', macaquinho_mamae),
    'casamento-dos-espantalhos': ('O casamento dos espantalhos', espantalhos),
}
