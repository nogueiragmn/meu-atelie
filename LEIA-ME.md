# Meu Ateliê 🎨

App de pintura e desenho para iPad. Funciona sem internet depois do primeiro acesso.

## Abrir no iPad
1. No Safari do iPad, abra **https://nogueiragmn.github.io/meu-atelie/** (precisa de internet só nesta primeira vez).
2. Toque em Compartilhar → **Adicionar à Tela de Início**. Abra sempre pelo ícone: fica em tela cheia,
   funciona sem internet e o iPad não apaga as obras guardadas.
3. Quando eu publicar novidades, elas aparecem na segunda vez que o app for aberto com internet.

As pinturas e o progresso ficam salvos só no iPad; nada é enviado para a internet.
O código e os desenhos da pasta `paginas/` ficam públicos no GitHub.

Alternativa sem internet nenhuma: no Mac, dois cliques em `iniciar.command` e abra no iPad o endereço mostrado
(as obras salvas nesse endereço ficam separadas das do site).

## Modos
- **Pintar com números**: modelo colorido à esquerda, lápis numerados à direita. Escolha o número e toque na área para pintar.
  Se tocar numa área com a cor errada, o lápis certo balança como dica.
- **Pintar livre**: lápis, giz, neon, balde e borracha sobre o desenho. 🪄 "Não sair da linha" mantém o traço dentro da área.
- **Desenhar**: folha em branco.
- **Minhas obras**: tudo que foi guardado com ⭐ (e as pinturas com números terminadas).

O progresso de cada desenho fica salvo automaticamente no iPad.

## Adicionar desenhos
Coloque a imagem (png, jpg, webp ou svg) em `paginas/`, adicione uma linha em `paginas/paginas.json` e publique (`git add -A && git commit -m 'novo desenho' && git push`):

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

## Créditos
Seção "Grandes Mulheres": desenhos e textos do livro de colorir “Vamos Colorir! Grandes personalidades
para meninas se inspirarem”, de @mariliaamaral999.
