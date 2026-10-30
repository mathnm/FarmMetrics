# FarmMetrics

Gerenciador de recursos e calculadora de vendas para **Stardew Valley 1.6** (React + TypeScript + Vite, roda 100% no navegador).

## Funcionalidades

1. **Lucro diário (GPD)**: lucro real por tile considerando replantio (colheita única) vs. rebrota, custo de sementes, fertilizante (velocidade e chance de Prata/Ouro/Irídio), nível de cultivo e profissões (Cultivador, Agricultor). Culturas de várias estações (Milho, Trigo, Girassol) podem seguir para a próxima estação.
2. **Barril vs. Jarra de Conserva**: compara Vinho/Suco/Cerveja com Geleia/Picles por **ouro extra por dia de máquina** (quando faltam máquinas) e por **ouro por item** (quando faltam frutas). Ex.: a Carambola rende mais por fruta no Barril, mas a Jarra rende mais por dia de máquina.
3. **Planejador de estação**: a partir do dia atual (ex.: Primavera 12) e do tamanho da horta, lista o que ainda dá tempo de colher até o dia 28 (com janela de plantio) e calcula a rotação ideal por programação dinâmica.
4. **Pecuária**: Maionese (galinhas/patos) vs. Queijo (vacas/cabras) vs. Óleo de Trufa (porcos) vs. Tecido (ovelhas/coelhos), com amizade, cuidado/alimentação, feno, Auto-Acariciador/Auto-Pegador, profissões, retorno do investimento e máquinas necessárias.

As configurações (nível, fertilizante, profissões) são compartilhadas entre as abas e ficam salvas no navegador.

## Como rodar

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm test         # testes das regras de cálculo
npm run build    # gera dist/ (site estático)
```

## Fonte dos dados

Os dados ficam embutidos em `src/data/` no formato e com os IDs do 1.6 (`Crops.json`/`Objects.json`), transcritos da [Stardew Valley Wiki](https://stardewvalleywiki.com) e dos dados desempacotados da comunidade. As regras de máquinas (Barril/Jarra/Maionese/Queijo/Tear/Extrator) e de animais estão em `src/lib/processing.ts` e `src/data/animals.ts`.

Para usar os arquivos do **seu** jogo:

1. Desempacote `Content` com o [StardewXnbHack](https://github.com/Pathoschild/StardewXnbHack) (os arquivos da pasta do jogo são `.xnb`).
2. Rode `npm run import-data -- "/caminho/Content (unpacked)/Data"`.

O script atualiza tempos de crescimento, rebrota, estações, rendimento e preços de venda. Os preços de semente são mantidos (dependem da loja).

## Aproximações conhecidas

- Tempo de máquina convertido em dias usando 1.440 minutos por dia.
- Redução de crescimento por fertilizante = `ceil(dias × velocidade)` (o jogo distribui a redução por fases; bate com a wiki para as culturas listadas).
- Chance de produto grande (Ovo/Leite Grande) = amizade ÷ `DeluxeProduceCareDivisor`; trufas = 1 por dia em que o porco sai.
