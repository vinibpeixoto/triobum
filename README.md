# triobum — hub editorial gerado por tema

A home de tênis de corrida continua sendo um site **estático, responsivo e navegável**. O código entregue ao navegador é HTML, CSS e JavaScript nativos. A diferença desta versão é a **fonte de conteúdo**: JSONs de tema, página e seção, combinados a nove templates HTML independentes durante o build. Cada página tem HTML completo no servidor/arquivo, antes de qualquer JavaScript; a navegação acelerada entre páginas é um aprimoramento progressivo, não o único modo de acessar o conteúdo.

## Comece aqui

```bash
npm ci
npm run build
npm test
```

Para uma prévia rápida, abra `dist/index.html` **diretamente do disco** (`file://`), mantendo a pasta `dist/` completa ao seu lado. Se preferir testar a mesma forma de publicação do GitHub Pages, use um servidor estático: `cd dist && python3 -m http.server 3000`. O `index.html` gerado na raiz também funciona dos dois modos; o build o mantém sincronizado para o Preview antigo. Não edite os arquivos gerados: edite `src/` e rode o build outra vez.

Para testar a instalação em outra URL/subpasta, use `npm run build -- --site-url https://example.com/hub/` (o `basePath` será inferido); se precisar, informe também `--base-path /hub/`. O arquivo `site.config.json` contém o endereço público padrão `https://vinibpeixoto.github.io/triobum/`. Os prompts de conversa recebem automaticamente a URL canônica de cada página gerada. **O build não publica nem envia arquivos a qualquer serviço.**

## Onde editar

| Necessidade | Arquivo |
| --- | --- |
| Tema, conceito central, filtros complementares, marca e paleta geral | `src/themes/running-shoes/settings.json` |
| Produtos (incluindo textos de comparação, imagens e cores de cada modelo) | `src/catalog/products.json` |
| Prompts editoriais, perfil, mapa e contexto da triobum | `src/themes/running-shoes/prompts.json` |
| Rota, SEO, sequência dos componentes, rodapé e acessibilidade geral | `src/pages/running-shoes/home/page.json` |
| Conteúdo e opções de cada uma das nove seções | `src/pages/running-shoes/home/components/{id}.json` |
| Estrutura semântica de uma seção | `src/components/{id}.html` |
| CSS editorial e comportamento sem framework | `src/styles/styles.css`, `src/scripts/{app,pairing}.js` |
| Gerador e validação | `scripts/build.mjs`, `scripts/{test,test-compare}.mjs` |
| Saída pronta para publicação | `dist/` |

Todos os nomes de **atributos JSON** são em inglês. O conteúdo em português permanece nos **valores**. `coreConcept` representa o filtro definidor da exploração (`feel` / sensação); `additionalAttributes` descreve os demais filtros (`goal`, `distance`, `budget`). Em `discover.json`, cada etapa tem `fields: [{ "fieldId": "goal", "options": [{ "id": "start", "label": "Começar a correr" }] }]`. O `fieldId` é uma referência ao tema, e cada opção tem `id` estável, separado de sua legenda editável.

O `compare.json` seleciona a **dupla inicial** pelos IDs `running-shoes.flow` e `running-shoes.pulse` em `productIds`; os dados dos produtos estão em `src/catalog/products.json`. **triobum ritmo** tem imagem conceitual própria, cores e textos completos; os três modelos estão `ready`. Somente fluxo e pulso aparecem no HTML inicial; ritmo entra no Compare quando o visitante aciona **Roleta de experiências**. Leia `src/catalog/README.md` para o contrato.

## Adicione uma página ou tema

1. Para um novo **tema**, copie `src/themes/running-shoes/`, mude `id`, `theme`, `coreConcept`, `additionalAttributes`, tokens e prompts. Mantenha as chaves em inglês.
2. Para uma nova **página**, crie `src/pages/<theme-id>/<page-id>/page.json` com `themeId`, `route` (por exemplo `/guias/drop/`), `head`, `sections`, `footer` e `accessibility`. Crie em `components/` os JSONs referenciados pela página (é permitido apontar para JSONs compartilhados de outra página). Registre no cabeçalho os links para a nova rota. Não é preciso criar um HTML à mão.
3. Rode `npm run build`: cada `page.json` produz `dist/<route>/index.html`, metadados da página, `sitemap.xml`, `data/routes.json` e um payload público de navegação JSON. Por exemplo, `/guias/drop/` vira `dist/guias/drop/index.html`.
4. As URLs `assets/...` são resolvidas pelo build **relativamente a cada HTML**. Não codifique `/triobum/` nos templates. Use a URL pública ou `--site-url` para configurar canônicas e prompts. Componentes adicionais precisam ser registrados na validação de `scripts/build.mjs` e ter template próprio.

A navegação interna usa links HTML reais e legíveis por crawler. Com JavaScript, o navegador carrega o payload JSON da próxima rota, troca o HTML pré-renderizado, atualiza título/canônica/social tags e a URL pelo History API. Sem JavaScript, ou se a consulta falhar, cada clique abre seu próprio HTML gerado. Não há fallback genérico que mostre a home para uma URL de página inexistente. O `robots.txt` e o `sitemap.xml` são produzidos na saída; no GitHub Pages de projeto, o robots da subpasta não substitui um robots do domínio raiz, que pertence ao host.

## Publicar a saída

**GitHub Pages:** publique o **conteúdo de `dist/`**, não a pasta como um diretório aninhado. Isso pode ser feito copiando esse conteúdo para uma branch/pasta servida pelo Pages, ou em uma Action que execute `npm ci && npm run build` e use `dist/` como diretório de artifact. Confirme que a URL configurada no build corresponde à URL efetiva do Pages; no projeto atual o padrão é `https://vinibpeixoto.github.io/triobum/`. Se usar domínio próprio ou outro prefixo, execute `npm run build -- --site-url https://seu-dominio.example/caminho/` antes de publicar. Para hospedagem estática diferente, publique da mesma forma a árvore de `dist/`.

O HTML inclui `?v=<hash>` nas URLs de CSS e JavaScript: ao atualizar `dist/` no Pages, o navegador busca os arquivos modificados, mesmo que tenha armazenado uma versão antiga em cache. Esses parâmetros são gerados pelo build; não os edite manualmente.

`dist/` contém também arquivos JSON públicos em `data/` para navegação progressiva e `data/catalog/<themeId>/products.json` para o sorteio assíncrono via HTTP. O build gera **do mesmo JSON de origem** um `data/catalog/<themeId>/products.js` carregado apenas quando o usuário abre a página com `file://` e clica em Roleta de experiências; navegadores bloqueiam `fetch()` de um JSON local. Não existe uma segunda base para manter. As recomendações atuais são **ilustrativas**: o questionário gera seleção local; o link secundário de IA abre o ChatGPT e inclui as quatro respostas na URL. O mapa contém lugares demonstrativos e não consulta geolocalização ou dados ao vivo. Dados que não devam ser públicos não devem entrar nos JSONs.

No Compare, **Roleta de experiências** aparece logo após os dois modelos, com o link **Ver comparação →** sempre visível abaixo do botão — inclusive antes do primeiro sorteio e sem JavaScript. O HTML pré-gerado contém só a dupla inicial; a cada clique, o navegador consulta o arquivo público de produtos (JSON via HTTP; script gerado equivalente via `file://`) e escolhe aleatoriamente uma **dupla diferente da atual**. Nomes, imagens, cores, links, atributos e resumo mudam juntos; uma nova dupla **reinicia o mobile no passo 01**. A frase **“Compare triobum fluxo e triobum pulso.”** também está no HTML inicial, com os dois nomes em negrito. Quando outra dupla é sorteada, os nomes são atualizados e só então surge o prefixo **“Agora,”**; o link continua separado logo abaixo. A frase permanece visível mesmo durante carregamento ou erro, cujo feedback aparece à parte. **Ver comparação →**, **Voltar** e **Continuar** compartilham a âncora no início do bloco: no mobile, o scroll para em **PASSO X/Y**; no desktop, no começo dos atributos da comparação. Carregamento, erro e falta de alternativas continuam mensagens simples e não alteram o passo atual nem a visibilidade do link. Com três produtos há três combinações possíveis; conforme a base cresce, o sorteio considera automaticamente as novas duplas, sem alterar o HTML da seção. Em falha de leitura ou sem outra dupla disponível, a comparação atual permanece na tela. O catálogo é um arquivo estático de build, **não** uma API de estoque nem uma base de preços reais.

## Estrutura do projeto

```text
triobum/
├── site.config.json
├── src/
│   ├── catalog/{products.json,README.md}
│   ├── themes/running-shoes/{settings,prompts}.json
│   ├── pages/running-shoes/home/page.json
│   ├── pages/running-shoes/home/components/{header,hero,discover,choose,compare,ask,daily_drop,explore,connect}.json
│   ├── components/{layout,header,hero,discover,choose,compare,ask,daily_drop,explore,connect}.html
│   ├── styles/styles.css
│   ├── scripts/{app,pairing,router}.js
│   └── assets/*
├── scripts/{build,test,test-compare}.mjs
├── tests/README.md
└── dist/  # gerado, pronto para hospedar
```

Cada diretório próprio do projeto possui seu `README.md`, inclusive a árvore gerada em `dist/`. `node_modules/` e `.git/` são diretórios de terceiros e não fazem parte desta documentação. Os arquivos na raiz `index.html`, `styles.css`, `pairing.js`, `script.js`, `router.js`, `assets/`, `themes/`, `page-styles/` e `data/` são **espelhos gerados** para manter o Preview e publicações antigas na raiz funcionando. Para uma instalação nova, prefira `dist/`.
