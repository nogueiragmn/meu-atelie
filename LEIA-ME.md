# Meu Ateliê 🎨

App de pintura e desenho para iPad, 100% local (sem internet).

## Ligar
1. No Mac, dê dois cliques em `iniciar.command` (ou rode `python3 servidor.py` nesta pasta).
   Na primeira vez o macOS pode perguntar se permite conexões para o Python: permita.
2. No iPad (mesmo Wi-Fi), abra no Safari o endereço que aparece na janela (ex.: `http://192.168.3.102:8080`).
3. Dica: no Safari do iPad toque em Compartilhar → **Adicionar à Tela de Início**. Assim ele abre em tela cheia, como um app.

## Modos
- **Pintar com números**: modelo colorido à esquerda, lápis numerados à direita. Escolha o número e toque na área para pintar.
  Se tocar numa área com a cor errada, o lápis certo balança como dica.
- **Pintar livre**: lápis, giz, neon, balde e borracha sobre o desenho. 🪄 "Não sair da linha" mantém o traço dentro da área.
- **Desenhar**: folha em branco.
- **Minhas obras**: tudo que foi guardado com ⭐ (e as pinturas com números terminadas).

O progresso de cada desenho fica salvo automaticamente no iPad.

## Adicionar desenhos
Coloque a imagem (png, jpg, webp ou svg) em `paginas/` e adicione uma linha em `paginas/paginas.json`:

```json
{ "id": "leao", "nome": "Leão", "arquivo": "leao.png" }
```

Ajustes opcionais por desenho (`"opcoes": { ... }`):
- `maxCores`: limita o número de cores (ex.: 6 para crianças pequenas)
- `escuro`: quão escuro precisa ser para virar linha (padrão 45; aumente se linhas cinzas sumirem)
- `minCor`: descarta cores que ocupam menos que essa fração da imagem (padrão 0.001)
- `minArea`: área mínima (em pixels) de cada região
- `bordas`: `false` para não criar linha entre cores vizinhas sem contorno

Também dá para adicionar pelo próprio iPad com o cartão **+ Adicionar foto**.
Funciona melhor com desenhos estilo cartoon: cores chapadas e contorno preto.
