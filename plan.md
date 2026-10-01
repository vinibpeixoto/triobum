# Plano de reconstrução — triobum

## Objetivo e escopo

Transformar a home existente em um projeto **data-driven** sem alterar a experiência aprovada: dados visíveis e interativos em JSON com chaves em inglês; nove templates HTML semânticos; CSS editorial e JS nativo; build estático que gera `index.html` completo, navegável e publicável em GitHub Pages ou em outra subpasta/domínio. O protótipo continua sem backend, banco de dados ou integração com serviços externos além dos links ChatGPT já aprovados.

## Estrutura

- `site.config.json`: siteUrl e basePath padrão, sobrescritos por argumentos do build.
- `src/themes/running-shoes/settings.json`: tema, conceito central `feel`, atributos adicionais `goal`, `distance`, `budget`, identidade e tokens editáveis.
- `src/themes/running-shoes/prompts.json`: prompts editoriais dos modelos, templates dinâmicos (perfil/lugar/comparação sorteada), instruções comuns e destino ChatGPT.
- `src/catalog/products.json`: base global de produtos com IDs `<themeId>.<slug>`; fluxo, pulso e ritmo estão `ready`, cada qual com imagem e cores conceituais próprias.
- `src/pages/running-shoes/home/page.json`: rota `/`, SEO, metadados e ordem/paths dos nove componentes; rodapé e skip-link ficam aqui.
- `src/pages/running-shoes/home/components/*.json`: dados específicos de `header`, `hero`, `discover`, `choose`, `compare`, `ask`, `daily_drop`, `explore`, `connect`.
- `src/components/*.html`: templates Nunjucks com markup semântico, iteradores e *sem texto editorial fixo*; `src/components/layout.html` é o documento base.
- `src/styles/styles.css`, `src/scripts/app.js` e `src/scripts/pairing.js`: estilos, interações e seleção aleatória de outra dupla a partir do catálogo público.
- `src/assets`: imagens da identidade aprovada e novo render conceitual de ritmo, todas locais e copiadas para a saída.
- `scripts/build.mjs`: geração e validação de rotas, catálogo público, prompts, sitemap, robots, manifesto e payloads de navegação; `scripts/{test,test-compare}.mjs`: verificações de conteúdo, integridade e funcionalidade.
- O `compare.json` contém `productIds` e dados editoriais da seção, sem repetir os nomes, imagens, cores ou diferenciais dos produtos. O build resolve somente os produtos referenciados e serializa apenas esses modelos no HTML/payload da página; IDs ausentes, duplicados, de tema errado ou em rascunho são rejeitados. As superfícies de comparação vêm do produto e são geradas por página.
- `dist/`: pasta gerada para publicar; `index.html` completo, assets, CSS, JS, JSONs públicos, sitemap/robots e READMEs gerados por diretório.
- Compatibilidade com o Preview existente: o build também escreve na raiz `index.html`, `styles.css`, `script.js` e `manus-routes.json`; o artefato recomendado para publicar é sempre o conteúdo de `dist/`.
- `README.md` em todos os diretórios e subdiretórios próprios do projeto, incluindo a saída gerada; excluem-se `.git` e `node_modules`.

## Design e comportamento

A estética editorial inspirada nas páginas de produto da Apple já foi aprovada: fundo branco, muito espaço, hierarquia tipográfica forte, fotografia grande e assinatura de seis barras coloridas. O preto/cinza estabelecem a leitura, o azul guia ações e o verde-lima indica seleção. Preservar os paddings, grids, imagens, títulos, estados, carrosséis, wizard em duas etapas, Compare em três etapas mobile / duas colunas desktop, stories 2×2 desktop / carrossel mobile e mapa ilustrativo. Nenhuma nova decoração. Animações discretas e `prefers-reduced-motion` respeitado. Voz conversacional e direta: "O tênis certo começa por você." / "Duas experiências explicadas do jeito que você sente.". Logotipo textual triobum e barras de ritmo; cor de assinatura azul `#0866e9`.

## Servir e publicar

Node 22 + Nunjucks somente durante o build; o resultado não depende de Nunjucks nem de Node. `npm ci && npm run build` gera `dist/index.html` com conteúdo completo antes da requisição (SSG, não SSR em servidor). Todas as rotas listadas em futuros `page.json` produzem seu próprio `<route>/index.html`, metadata e sitemap. `--base-path /triobum/ --site-url https://vinibpeixoto.github.io/triobum/` permite GitHub Pages; opções alternativas mudam URL de canonical, assets e links de contexto dos prompts sem editar JSON editorial. Assets e CSS/JS usam caminhos relativos ao documento para funcionar em subpastas. HTML é estável por URL; ativos com nomes estáveis são revalidados/atualizados no deploy (não declarar cache imutável); nenhuma API/private response.

A navegação SPA é aprimoramento progressivo: links internos para outras páginas geradas podem consultar um manifesto de rotas e payload JSON gerado no build, atualizar DOM/head e `history.pushState`. Links continuam apontando para HTML real, funcionando sem JS e em acesso direto. A homepage atual mantém navegação por âncoras. Desconhecidos não têm fallback para `index.html`; hosts devem retornar 404.

O botão “Roleta de experiências” consulta `data/catalog/<themeId>/products.json` **somente depois do clique** em HTTP; em `file://`, onde o navegador bloqueia `fetch` de arquivos locais, carrega um `products.js` gerado da **mesma única fonte** `src/catalog/products.json`. Escolhe uma dupla de modelos prontos diferente da atual e atualiza o conteúdo completo da comparação sem remontar a página nem zerar o passo mobile. Cada HTML SSG contém apenas a dupla inicial, e a funcionalidade opera em qualquer rota gerada, host estático ou abertura direta do arquivo local. O catálogo é estático e versionado, não um banco de dados nem um serviço de estoque.

## Verificação

Comparar textos, hierarquia, links, URLs de prompts e inventário de imagens gerados com o HTML anterior; validar JSON, todos os caminhos, build e `/manus-routes.json`; verificar que a home responde com conteúdo e metadados no HTML bruto, e que o pacote funciona em `/` e em subpasta sem depender de execução de JS. Revisão independente de conexões entre dados/templates/interações. Não publicar no GitHub do usuário nem alterar a página pública automaticamente.
