# triobum — protótipo da homepage

Protótipo **estático, responsivo e navegável** da home triobum. Usa HTML5 semântico, CSS e JavaScript nativo; não precisa instalar dependências, backend nem banco de dados. Os textos permanecem selecionáveis e os controles são reais. As imagens locais são recortes dos ativos visuais previamente aprovados, não capturas completas usadas como página.

## Executar localmente

Na pasta do projeto:

```bash
python3 -m http.server 3000 --bind 0.0.0.0
```

Abra `http://localhost:3000/`. O arquivo `index.html` também pode ser aberto diretamente, mas servir por HTTP reproduz melhor o comportamento do preview.

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Conteúdo editorial, seções e componentes semânticos. |
| `styles.css` | Sistema visual, grade e breakpoints responsivos. |
| `script.js` | Questionário, carrossel, stories, filtros e diálogos locais. |
| `assets/` | Imagens otimizadas extraídas dos mockups aprovados e marca. |
| `manus-routes.json` | Declaração da rota `/` do protótipo. |
| `ideas.md` | Direção visual e decisões de marca. |

## Interações disponíveis

O questionário Descubra tem duas etapas e quatro respostas. A recomendação explica de maneira local por que o modelo *fluxo* ou *pulso* foi destacado; ela é **ilustrativa** e não é aconselhamento técnico individual. Categorias levam ao produto na vitrine, botões e arraste horizontal controlam o carrossel, e os stories são navegáveis na tela pequena. No Explore, os quatro filtros atualizam a lista textual de lugares. Ações sem destino real abrem uma janela informativa, evitando links quebrados.

Este é um **protótipo de experiência**, não um catálogo comercial: produtos, eventos, grupos, valores e localizações exibidos como demonstração não são dados transacionais ou ao vivo. Nenhuma informação pessoal é coletada ou enviada a um servidor. Não há páginas long tail, login, integração com Strava, mapa de terceiros nem inscrição em eventos nesta etapa.

## Origem dos ativos

Os recortes foram feitos de composições visuais triobum previamente aprovadas no mesmo projeto. Os arquivos otimizados estão em `assets/` para que o protótipo distribuído funcione sozinho.
