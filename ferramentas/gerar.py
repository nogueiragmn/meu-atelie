# Gera os SVGs das páginas e uma folha de prévia (prévia.html).
import os, sys, importlib
sys.path.insert(0, os.path.dirname(__file__))
RAIZ = os.path.join(os.path.dirname(__file__), '..', 'paginas')
cards = []
for mod, pasta in [('santos', 'santos'), ('bichos', 'bichos')]:
    try:
        m = importlib.import_module(mod)
    except ModuleNotFoundError:
        continue
    os.makedirs(os.path.join(RAIZ, pasta), exist_ok=True)
    for slug, (nome, fn) in m.DESENHOS.items():
        arq = f'{pasta}/{slug}.svg'
        open(os.path.join(RAIZ, arq), 'w').write(fn())
        cards.append(f'<figure><img src="../paginas/{arq}"><figcaption>{nome}</figcaption></figure>')
open(os.path.join(os.path.dirname(__file__), 'previa.html'), 'w').write(
    '<meta charset="utf-8"><style>body{margin:0;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font:14px sans-serif}'
    'img{width:100%;display:block}figure{margin:0}</style>' + ''.join(cards))
print(len(cards), 'desenhos')
