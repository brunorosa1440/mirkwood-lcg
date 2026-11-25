# Mirkwood LCG — Simulador LOTR LCG

Protótipo pessoal para jogar *The Lord of the Rings: The Card Game* a solo no browser, com o lado do encontro automatizado.

**Jogar:** https://brunorosa1440.github.io/mirkwood-lcg/

- Menu: Jogar (cenários), Baralhos (baralhos iniciais), Construtor
- Automatizado: cenário **Passage Through Mirkwood** com o baralho inicial **Riders of Rohan** (Éomer, Lothíriel, Hirgon); o resto aparece bloqueado
- Imagens das cartas carregadas do DragnCards (S3); dados das cartas do [dragncards-lotrlcg-plugin](https://github.com/seastan/dragncards-lotrlcg-plugin)

## Estrutura
- `src/data.js` — cartas, baralhos iniciais e baralho do cenário (gerado por `tools/extract.py`)
- `src/engine.js` — motor de regras (fases, encontro, efeitos das cartas)
- `src/ui.js`, `src/shell.html` — interface
- `build.sh` — junta tudo em `index.html`
- `tests/sim.js` — 300 partidas simuladas em Node (`node tests/sim.js`)

Para automatizar uma carta nova: efeito em `WR`/`SHADOW`/`EVENTS`/`ABIL` (ou no ponto do motor certo) em `src/engine.js` e o nome em `IMPLEMENTED`.

As cartas, textos e imagens de The Lord of the Rings: The Card Game são © Fantasy Flight Games. Projeto de fã, sem fins comerciais.
