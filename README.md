# triobum — protótipo da homepage

Protótipo **estático, responsivo e navegável** da home triobum. Usa HTML5 semântico, CSS e JavaScript nativo; não precisa instalar dependências, backend nem banco de dados. Os textos permanecem selecionáveis e os controles são reais. As imagens locais são recortes dos ativos visuais previamente aprovados, não capturas completas usadas como página.

## Versão pública e Preview

O autor do projeto também publicou a home em **[vinibpeixoto.github.io/triobum](https://vinibpeixoto.github.io/triobum/)**. Esta URL pública é a referência editorial usada nos links de conversa do ChatGPT. Ela é uma publicação independente do Preview de desenvolvimento do Manus: alterações feitas aqui aparecem no Preview, mas **não atualizam automaticamente o GitHub Pages**. Após cada revisão, é preciso copiar/publicar a nova versão dos arquivos estáticos no repositório que hospeda a página pública. Até essa atualização, a versão pública pode diferir da versão deste pacote.

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
| `script.js` | Questionário, carrossel, etapas mobile, stories e filtros. |
| `prompts.js` | Prompts contextuais e URLs de conversas ChatGPT por destino do hub. |
| `sync_links.js` | Atualiza os 19 `href` pré-gerados do HTML após mudanças em `prompts.js` (`node sync_links.js`). |
| `assets/` | Imagens otimizadas extraídas dos mockups aprovados e marca. |
| `manus-routes.json` | Declaração da rota `/` do protótipo. |
| `ideas.md` | Direção visual e decisões de marca. |

## Interações disponíveis

O questionário Descubra tem duas etapas e quatro respostas. O botão azul **“Ver minhas recomendações”** exibe apenas o quadro verde **“Sua seleção”** na própria página; ele não abre uma aba externa. A recomendação local explica por que o modelo conceitual *fluxo* ou *pulso* foi destacado; ela é **ilustrativa** e não é aconselhamento técnico individual. Só dentro desse quadro verde, o link **“Explorar mais opções”** abre em nova aba uma conversa que inclui as escolhas no parâmetro `q` da URL e solicita três tênis reais do Mercado Livre com justificativas, tabela e links verificáveis. O aviso sobre compartilhar as respostas aparece ao lado desse link, antes do clique.

Categorias levam ao produto na vitrine; botões e arraste horizontal controlam o carrossel. No celular, o Compare apresenta todo o conteúdo em três etapas (`01/03`, `02/03`, `03/03`) com controle anterior/próximo; no desktop, mantém os diferenciais completos em duas colunas, usando os mesmos cards suaves verde (fluxo) e coral (pulso) do mobile. Os quatro stories são navegáveis na tela pequena. Os filtros do Explore atualizam a lista textual de lugares.

Destinos de subpáginas ainda não construídas — produtos, comparação aprofundada, perguntas, guias, lugares e comunidades — abrem em **nova aba** URLs `https://chatgpt.com/?q=...`, cada uma com um prompt próprio. Os prompts apontam para `https://vinibpeixoto.github.io/triobum/` como referência editorial, instruem o ChatGPT a não inventar conteúdo ou anúncios não verificados e pedem que explique a complementaridade das fontes quando couber. A navegação principal por seções da própria homepage continua interna. O uso do ChatGPT pode exigir acesso ou login na plataforma externa; o protótipo não tem integração por API nem envia dados a um servidor próprio.

Este é um **protótipo de experiência**, não um catálogo comercial: produtos, eventos, grupos, valores e localizações exibidos como demonstração não são dados transacionais ou ao vivo. As quatro escolhas do questionário ficam no navegador até que o usuário clique no link externo dentro de **“Sua seleção”**; nesse momento, elas fazem parte da URL enviada ao ChatGPT. Não há páginas long tail, login, integração com Strava, mapa de terceiros nem inscrição em eventos nesta etapa.

## Origem dos ativos

Os visuais vêm das composições triobum previamente aprovadas no mesmo projeto. O painel Descubra e os cinco cartões da vitrine usam áreas com **fundo e produto juntos**, em vez de pequenos tênis isolados sobre superfícies de outra cor. O tênis coral foi retocado apenas para remover uma seta de carrossel que havia ficado impressa na arte. A fotografia dos stories foi ampliada e integrada ao fundo dos próprios cards; o conteúdo escrito continua em HTML selecionável. Os arquivos otimizados em `assets/` são suficientes para que o protótipo funcione sozinho.
