from kit import *


def cena_basica(sol_x=680, nuvens=((150, 110, 1), (560, 80, 0.8))):
    return [ceu(), sol(sol_x, 100) if sol_x else '', *[nuvem(*n) for n in nuvens], chao()]


def terezinha():
    fig = g(400, 560, 1,
            auréola(0, -340, 98),
            veu(PR),
            pes(MR), tunica(MC), manto(BR),
            mangas(MC, maos_juntas=True),
            cruz(0, -175, 1.1, MR),
            rosa(-38, -200), rosa(38, -205), rosa(-30, -140), rosa(34, -150), rosa(0, -110, 15),
            el(-58, -170, 14, 8, VD, -30), el(60, -178, 14, 8, VD, 30),
            c(-22, -168, 20, PE), c(22, -168, 20, PE),
            el(0, -322, 80, 84, BR), el(0, -258, 62, 24, BR),
            cabeca(r=58), rosto(r=58))
    petalas = ''.join(rosa(x, y, 14) for x, y in [(120, 250), (190, 330), (640, 260), (700, 360), (90, 400), (600, 190)])
    return svg(*cena_basica(), flor(90, 505, RS), flor(710, 500, VM), petalas, fig)


def catarina():
    lirio = (p('M60 -80 L60 -300', ) + el(45, -200, 18, 8, VD, -30) +
             c(60, -310, 20, BR) + c(42, -290, 16, BR) + c(78, -290, 16, BR) + c(60, -312, 7, AM))
    fig = g(400, 560, 1,
            auréola(0, -340, 98),
            veu(PR),
            pes(PR), tunica(BR), manto(PR),
            mangas(BR, maos_juntas=False),
            livro(-88, -135, 70, 56, VM, -10),
            lirio,
            c(-88, -110, 20, PE), c(88, -110, 20, PE),
            el(0, -322, 80, 84, BR), el(0, -258, 62, 24, BR),
            cabeca(r=58), rosto(r=58))
    return svg(*cena_basica(sol_x=120, nuvens=((620, 100, 1), (330, 70, 0.7))), flor(120, 505, LI), flor(690, 510, RS), fig)


def teresa():
    pena = p('M95 -120 C120 -190 150 -230 170 -250 C150 -200 130 -160 100 -115 Z', BR) + p('M95 -120 L80 -95')
    livro_aberto = (p('M-120 -150 Q-70 -170 -20 -150 L-20 -95 Q-70 -115 -120 -95 Z', BR) +
                    p('M-20 -150 Q30 -170 80 -150 L80 -95 Q30 -115 -20 -95 Z', BR) +
                    p('M-100 -140 Q-70 -150 -40 -140 M-100 -125 Q-70 -135 -40 -125 M0 -140 Q30 -150 60 -140 M0 -125 Q30 -135 60 -125'))
    fig = g(400, 560, 1,
            auréola(0, -340, 98),
            veu(PR),
            pes(MR), tunica(MC), manto(BR),
            el(-80, -165, 30, 60, MC, 30), el(75, -165, 30, 60, MC, -30),
            livro_aberto,
            pena,
            c(-110, -110, 19, PE), c(92, -118, 19, PE),
            el(0, -322, 80, 84, BR), el(0, -258, 62, 24, BR),
            cabeca(r=58), rosto(r=58))
    return svg(*cena_basica(sol_x=0, nuvens=((150, 110, 1), (640, 120, 0.9))), pomba(600, 200, 1.1, flip=True), flor(110, 510, AM), flor(700, 505, RS), fig)


def francisco():
    cordao = p('M-100 -95 Q0 -75 100 -95 L100 -80 Q0 -60 -100 -80 Z', BR) + p('M-30 -80 L-40 -10 M-15 -78 L-18 -20')
    fig = g(400, 560, 1,
            auréola(0, -340, 98),
            pes(MC), tunica(MR), cordao,
            mangas(MR, maos_juntas=False),
            cabeca(r=62),
            p('M-64 -330 C-70 -360 -55 -385 -45 -380 C-40 -350 -55 -335 -64 -330 Z', MC),
            p('M64 -330 C70 -360 55 -385 45 -380 C40 -350 55 -335 64 -330 Z', MC),
            barba(MC),
            rosto(r=62),
            c(-88, -110, 20, PE), c(88, -110, 20, PE))
    passaros = (passaro(-88, -135, CEU, 0.9) + passaro(88, -135, AM, 0.9, flip=True))
    fig2 = g(400, 560, 1, passaros)
    return svg(*cena_basica(), arvore(110, 480, 0.9), passaro(560, 170, VM, 1), passaro(250, 140, LA, 0.9, flip=True),
               flor(640, 505, RS), flor(720, 520, LI), fig, fig2)


def joao_paulo():
    baculo = p('M150 -10 L150 -330', ) + rect(143, -330, 14, 320, CZ, 6) + cruz(150, -350, 1, AM)
    mozeta = p('M-58 -262 C-100 -240 -120 -200 -110 -170 Q0 -140 110 -170 C120 -200 100 -240 58 -262 Z', VM)
    fig = g(380, 560, 1,
            baculo,
            pes(VI), tunica(BR), mozeta,
            el(-80, -165, 30, 62, BR, 20), el(80, -165, 30, 62, BR, -25),
            cruz(0, -200, 0.7, AM),
            c(-95, -110, 20, PE), c(140, -150, 20, PE),
            cabeca(r=64),
            p('M-66 -330 C-72 -300 -60 -290 -55 -300 C-58 -320 -58 -330 -66 -330 Z', CZ),
            p('M66 -330 C72 -300 60 -290 55 -300 C58 -320 58 -330 66 -330 Z', CZ),
            p('M-40 -380 C-30 -400 30 -400 40 -380 Q0 -370 -40 -380 Z', BR),
            rosto(r=64))
    igreja = g(620, 470, 1, rect(-80, -160, 160, 160, AM, 4), poly([(-95, -160), (0, -240), (95, -160)], VM),
               rect(-30, -80, 60, 80, MR, 25), rect(-12, -300, 24, 60, AM), p('M0 -330 L0 -300 M-14 -318 L14 -318'))
    return svg(*cena_basica(sol_x=0, nuvens=((140, 110, 1), (470, 90, 0.8))), igreja, fig)


def padre_pio():
    terco = (p('M-40 -150 Q0 -60 40 -150') + cruz(0, -80, 0.45, MR))
    capuz = p('M-70 -262 Q-120 -250 -100 -200 Q0 -180 100 -200 Q120 -250 70 -262 Z', MR)
    fig = g(400, 560, 1,
            auréola(0, -340, 98),
            pes(MR), tunica(MR), capuz,
            p('M-100 -95 Q0 -75 100 -95 L100 -80 Q0 -60 -100 -80 Z', BR),
            mangas(MR, maos_juntas=True),
            terco,
            cabeca(r=62),
            p('M-64 -330 C-72 -370 -50 -392 -40 -385 C-45 -350 -55 -335 -64 -330 Z', CZ),
            p('M64 -330 C72 -370 50 -392 40 -385 C45 -350 55 -335 64 -330 Z', CZ),
            p('M-62 -318 C-70 -210 70 -210 62 -318 C40 -285 -40 -285 -62 -318 Z', CZ),
            rosto(r=62))
    return svg(*cena_basica(), flor(110, 505, VM), flor(180, 530, AM), flor(700, 510, RS), fig)


def carlo():
    fig = g(400, 560, 1,
            el(-35, -8, 30, 14, BR), el(35, -8, 30, 14, BR),
            p('M-55 -150 L-60 -12 L-8 -12 L0 -110 L8 -12 L60 -12 L55 -150 Z', AZ),
            rect(-75, -250, 40, 110, VD, 16),
            p('M-60 -262 C-75 -200 -70 -160 -62 -140 L62 -140 C70 -160 75 -200 60 -262 Z', VM),
            p('M-22 -262 L0 -225 L22 -262 Z', BR),
            el(-78, -190, 26, 55, VM, 20), el(78, -190, 26, 55, VM, -20),
            rect(-60, -175, 120, 80, CZ, 8), rect(-50, -168, 100, 62, AC, 4), cruz(0, -137, 0.35, AM),
            c(-62, -140, 18, PE), c(62, -140, 18, PE),
            cabeca(r=62),
            p('M-66 -330 C-80 -380 -60 -410 -30 -400 C-10 -420 20 -420 35 -402 C65 -410 80 -370 66 -330 C55 -360 30 -370 0 -365 C-30 -370 -55 -360 -66 -330 Z', MR),
            rosto(r=62))
    igreja = g(640, 470, 0.9, rect(-80, -160, 160, 160, BR, 4), poly([(-95, -160), (0, -240), (95, -160)], AZ),
               rect(-30, -80, 60, 80, MR, 25), c(0, -120, 18, AC))
    return svg(*cena_basica(sol_x=120, nuvens=((330, 90, 0.8), (560, 120, 0.7))), igreja, arvore(130, 480, 0.8), fig)


def jesus_criancas():
    jesus = g(400, 540, 0.95,
              auréola(0, -300, 95),
              cabelo_longo(MR),
              rect(-120, -120, 240, 110, MC, 10),
              p('M-58 -232 C-80 -170 -95 -120 -110 -10 L110 -10 C95 -120 80 -170 58 -232 Z', BR),
              p('M-58 -232 C-110 -180 -120 -90 -80 -10 L-30 -10 C-60 -90 -50 -170 -20 -225 Z', VM),
              el(-60, -150, 30, 55, BR, 30), el(70, -150, 30, 55, BR, -40),
              c(-95, -110, 20, PE), c(110, -115, 20, PE),
              cabeca(r=60, y=-295), barba(MR, -295),
              rosto(y=-295, r=60))
    menina = g(210, 560, 0.62,
               cabelo_longo(AM), pes(RS), tunica(RS, 105, -262), mangas(RS, maos_juntas=True),
               cabeca(r=62), franja(AM), rosto(r=62))
    menino = g(600, 560, 0.62,
               pes(MR), tunica(VD, 100, -262), mangas(VD, maos_juntas=False), c(-88, -110, 20, PE), c(88, -110, 20, PE),
               cabeca(r=62), cabelo_curto(MR), rosto(r=62))
    ovelha = g(700, 540, 0.7, el(0, -40, 70, 45, BR), c(-70, -60, 30, CZ), rect(-40, -10, 16, 40, CZ, 6), rect(25, -10, 16, 40, CZ, 6),
               c(-78, -64, 4, PR))
    return svg(*cena_basica(sol_x=0, nuvens=((150, 100, 1), (650, 90, 0.9))), arvore(110, 460, 0.85), jesus, menina, menino, ovelha)


def nossa_senhora():
    def estrela(x, y, r):
        return poly([(x + r * math.cos(math.pi / 2 + i * math.pi / 5) * (1 if i % 2 == 0 else 0.45),
                      y - r * math.sin(math.pi / 2 + i * math.pi / 5) * (1 if i % 2 == 0 else 0.45)) for i in range(10)], LIMAO)
    fig = g(400, 470, 0.95,
            auréola(0, -340, 98),
            p('M-88 -335 C-100 -440 100 -440 88 -335 L140 -10 Q0 10 -140 -10 Z', CEU),
            tunica(BR, 115),
            el(-98, -165, 27, 62, BR, 38), el(98, -165, 27, 62, BR, -38),
            c(-128, -118, 20, PE), c(128, -118, 20, PE),
            el(0, -322, 68, 72, BR),
            cabeca(r=58), rosto(r=58, olhos_fechados=True))
    raios = ''
    for lado in (-1, 1):
        hx, hy = 400 + lado * 128 * 0.95, 470 - 118 * 0.95 + 18
        for a1, a2 in [(-5, 30), (42, 80), (92, 135)]:
            raios += poly([(hx, hy), (hx + lado * a1, 500), (hx + lado * a2, 500)], AM)
    globo = el(400, 520, 170, 70, AZ) + p('M300 505 Q340 480 380 500 Q420 520 470 495 Q500 485 520 505 Q480 540 420 545 Q350 545 300 505 Z', VD)
    estrelas = ''.join(estrela(x, y, 26) for x, y in [(120, 110), (240, 60), (560, 60), (680, 110), (110, 280), (690, 280)])
    return svg(rect(4, 4, 792, 592, MA, 12), estrelas, globo, raios, fig)


def sagrada_familia():
    estabulo = (p('M60 250 L400 90 L740 250 Z', MC) + rect(100, 250, 600, 346, AM, 0))
    estrela = poly([(400 + 26 * math.cos(math.pi / 2 + i * math.pi / 5) * (1 if i % 2 == 0 else 0.45),
                     45 - 26 * math.sin(math.pi / 2 + i * math.pi / 5) * (1 if i % 2 == 0 else 0.45)) for i in range(10)], LIMAO)
    jose = g(210, 570, 0.85,
             p('M110 0 L110 -380', ) + rect(103, -380, 14, 380, MR, 6),
             pes(MR), tunica(MC), manto(VD),
             el(-70, -170, 28, 62, MC, 15), el(80, -180, 28, 62, MC, -30), c(-80, -110, 20, PE), c(105, -230, 20, PE),
             cabeca(r=62), cabelo_curto(MR), barba(MR), rosto(r=62))
    bebe = g(0, 0, 1, el(0, -165, 60, 36, BR), c(-42, -178, 26, PE), rosto(-42, -180, 26, olhos_fechados=True))
    maria = g(560, 570, 0.85,
              p('M-88 -335 C-100 -440 100 -440 88 -335 L130 -10 Q0 10 -130 -10 Z', CEU),
              pes(MR), tunica(RC),
              el(-60, -170, 30, 55, RC, 30), el(60, -170, 30, 55, RC, -30),
              bebe,
              c(-70, -140, 20, PE), c(70, -140, 20, PE),
              el(0, -322, 72, 78, BR),
              cabeca(r=58), rosto(r=58))
    feno = p('M60 596 L60 540 Q400 500 740 540 L740 596 Z', AM)
    return svg(rect(4, 4, 792, 592, MA, 12), estrela, estabulo, feno, jose, maria)


DESENHOS = {
    'santa-terezinha': ('Santa Terezinha do Menino Jesus', terezinha),
    'santa-catarina-de-sena': ('Santa Catarina de Sena', catarina),
    'santa-teresa-davila': ("Santa Teresa d'Ávila", teresa),
    'sao-francisco': ('São Francisco de Assis', francisco),
    'sao-joao-paulo-ii': ('São João Paulo II', joao_paulo),
    'sao-padre-pio': ('São Padre Pio', padre_pio),
    'sao-carlo-acutis': ('São Carlo Acutis', carlo),
    'jesus-e-as-criancas': ('Jesus e as crianças', jesus_criancas),
    'nossa-senhora-das-gracas': ('Nossa Senhora das Graças', nossa_senhora),
    'sagrada-familia': ('Sagrada Família', sagrada_familia),
}
