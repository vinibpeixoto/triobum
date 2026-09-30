/* Links de conversa para destinos ainda não implementados como subpáginas. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.TriobumPrompts = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';

  const HOME_URL = 'https://vinibpeixoto.github.io/triobum/';
  const AI_CHAT_URL = 'https://chatgpt.com/';

  const editorialContext = [
    `Use ${HOME_URL} como referência editorial para a conversa. Leia a homepage se conseguir acessá-la; caso contrário, avise e não invente seu conteúdo.`,
    'Quando for pertinente, resuma a seção relevante dessa homepage em linguagem simples. Não trate os modelos conceituais fluxo e pulso, nem os lugares ilustrativos do protótipo, como produtos ou eventos reais.',
    `Ao citar uma fonte externa, inclua o link verificável e, quando houver relação real, mencione também ${HOME_URL}, explicando brevemente o que cada fonte acrescenta à resposta. Não apresente a homepage como prova de preços, estoque, calendário ou eficácia médica.`,
    `Ao longo da conversa, quando fizer sentido, sugira no máximo duas trilhas curtas para conhecer melhor alguma seção de ${HOME_URL} (Descubra, Escolha, Compare, Pergunte, Entenda, Explore ou Conecte-se), sem forçar uma menção em cada resposta.`,
    'Responda em português brasileiro. Se não conseguir verificar informações atuais ou abrir links, diga isso claramente e não invente anúncios, preços, datas, endereços ou referências.'
  ].join('\n');

  const shoppingInstruction = [
    'Se você puder verificar ofertas atuais do Mercado Livre, selecione três tênis de corrida reais e disponíveis que façam sentido para este contexto.',
    'Responda com uma tabela fácil de ler: modelo, faixa/preço observado e data da consulta, justificativa direta para a indicação, principal ressalva e link verificável do anúncio no Mercado Livre.',
    'Compare ajuste, conforto e uso esperado; não trate preço ou disponibilidade como garantidos. Se não conseguir consultar anúncios atuais, informe a limitação e peça links para comparar em vez de inventá-los.'
  ].join(' ');

  const catalogue = {
    'começar': 'Estou começando a correr. Explique o que priorizar em um tênis para criar o hábito e indique opções reais para iniciar com conforto, usando a seção Escolha da homepage como ponto de partida.',
    'diário': 'Quero um tênis de treino diário para diferentes sessões na semana. Explique conforto, durabilidade e versatilidade, relacionando sua resposta à seção Escolha da homepage.',
    'velocidade': 'Quero explorar um tênis para treinos mais rápidos. Explique resposta, leveza, adaptação e riscos de escolher só pela sensação de velocidade, relacionando à seção Escolha da homepage.',
    'longão': 'Quero explorar tênis para longões. Explique proteção, conforto sustentado e ajuste em distâncias maiores, relacionando à seção Escolha da homepage.',
    'provas': 'Quero explorar tênis de prova. Explique resposta, ajuste e adaptação antes do dia da corrida, relacionando à seção Escolha da homepage.',
    'fluxo': 'Na seção Compare da homepage, fluxo é um modelo conceitual descrito por conforto e estabilidade. Não assuma que é um produto real. Procure modelos reais com características semelhantes e explique as diferenças.',
    'pulso': 'Na seção Compare da homepage, pulso é um modelo conceitual descrito por leveza e resposta. Não assuma que é um produto real. Procure modelos reais com características semelhantes e explique as diferenças.'
  };

  const guides = {
    'pergunta-placa': 'Responda de forma direta à pergunta: "Tênis com placa faz sentido para meus primeiros 10 km?" Diferencie possíveis benefícios de necessidade real, conforto, ajuste e adaptação. Use a seção Pergunte da homepage como contexto e cite evidências confiáveis para afirmações técnicas; evite prometer prevenção de lesões.',
    'pergunta-troca': 'Responda: "Quando é hora de trocar meu tênis de treino?" Mostre sinais observáveis de desgaste do solado, estrutura e sensação de corrida; não imponha uma quilometragem universal. Use a seção Pergunte da homepage e fontes confiáveis quando necessário.',
    'perguntas': 'Com base nas dúvidas em destaque na seção Pergunte da homepage, proponha um pequeno índice de perguntas frequentes sobre tênis de corrida, agrupadas por escolha, ajuste e uso. Pergunte qual tema a pessoa quer aprofundar antes de seguir.',
    'guia-drop': 'Explique o que é drop no tênis de corrida e como pode mudar a sensação da passada; evite inferir que um valor é universalmente melhor. Contextualize a story "O que é drop?" da seção Entenda da homepage.',
    'guia-troca': 'Explique os sinais de que pode ser hora de trocar um tênis, distinguindo desgaste do solado, espuma e cabedal. Contextualize a story "Quando trocar o tênis?" da seção Entenda; não invente um prazo universal.',
    'guia-placa': 'Explique o que uma placa pode e não pode fazer no tênis de corrida. Diferencie uso em treinos e provas, adaptação, conforto e estabilidade; contextualize a story "Placa vale a pena?" da seção Entenda.',
    'guia-tamanho': 'Crie um guia curto para acertar o tamanho do tênis de corrida: medir os dois pés no fim do dia, considerar o maior, espaço para os dedos, forma do modelo e teste prático. Contextualize a story "Como acertar o tamanho?" da seção Entenda.'
  };

  const community = {
    'turma': 'Quero encontrar companhia para correr. Primeiro pergunte minha cidade/bairro, nível e horários; depois, se puder verificar, indique grupos ou clubes reais com canais oficiais e datas de atividade. Use a seção Conecte-se da homepage como porta de entrada; não invente grupos.',
    'strava': 'Quero encontrar clubes públicos de corrida no Strava. Pergunte minha cidade e tipo de treino; se puder confirmar, dê links oficiais de clubes reais. Relacione ao convite da seção Conecte-se da homepage.',
    'bairro': 'Quero encontrar grupos de corrida no meu bairro. Pergunte cidade/bairro, horários e ritmo, depois sugira como verificar grupos e encontros reais com segurança. Relacione à seção Conecte-se da homepage.',
    'digital': 'Quero comunidades digitais para trocar dicas sobre corrida e tênis. Compare tipos de grupos e como avaliar qualidade das recomendações; inclua links públicos verificáveis quando disponíveis e relacione à seção Conecte-se da homepage.'
  };

  function topicPrompt(topic) {
    if (catalogue[topic]) return `${catalogue[topic]}\n\n${shoppingInstruction}`;
    if (topic === 'comparacao') return [
      'Partindo da seção Compare da homepage, compare o conceito "conforto e estabilidade" com "leveza e resposta" para diferentes objetivos de corrida.',
      'Faça uma tabela com sensação, comportamento, ajuste e perfil de uso, e traga exemplos de tênis reais disponíveis no Mercado Livre se puder verificá-los. Os modelos fluxo e pulso do protótipo são ilustrativos, não anúncios reais.',
      shoppingInstruction
    ].join('\n');
    if (guides[topic]) return guides[topic];
    if (community[topic]) return community[topic];
    throw new Error(`Destino não configurado: ${topic}`);
  }

  function placePrompt({ type, name, location, description }) {
    const category = { eventos: 'provas/eventos', rotas: 'rotas de corrida', 'serviços': 'assessorias e serviços de corrida', comunidades: 'grupos e comunidades' }[type];
    if (!category) throw new Error(`Categoria de local não configurada: ${type}`);
    return [
      `Quero explorar ${category} perto de ${location}. O item "${name}" mostrado no protótipo é ilustrativo (${description}); não assuma que ele existe ou está disponível.`,
      'Se puder verificar fontes atuais, encontre alternativas reais com links oficiais, local, como participar e informações datadas. Se não puder verificar, peça minha cidade/bairro e sugira como conferir fontes confiáveis.',
      'Relacione a busca à seção Explore da homepage sem inventar que o mapa do protótipo contém dados ao vivo.'
    ].join('\n');
  }

  const profileLabels = {
    objetivo: { 'começar': 'Começar a correr', 'evoluir': 'Evoluir nos treinos' },
    sensacao: { macia: 'Macia', equilibrada: 'Equilibrada', responsiva: 'Responsiva', 'estável': 'Estável' },
    distancia: { '5 km': 'Até 5 km', '10 km': '10 km', '21 km': '21 km', 'longões': 'Longões e maratona' },
    orcamento: { 'até R$ 500': 'Até R$ 500', 'R$ 500 a R$ 800': 'De R$ 500 a R$ 800', 'R$ 800 a R$ 1.200': 'De R$ 800 a R$ 1.200', 'ainda não sei': 'Ainda não sei' }
  };

  function profilePrompt(answers) {
    for (const key of Object.keys(profileLabels)) {
      if (!Object.hasOwn(profileLabels[key], answers[key])) throw new Error(`Resposta ausente ou inválida: ${key}`);
    }
    return [
      `Com base no perfil que montei em ${HOME_URL}, recomende os três tênis de corrida reais mais adequados que conseguir verificar no Mercado Livre.`,
      `O que você busca: ${profileLabels.objetivo[answers.objetivo]};`,
      `Como gosta de sentir o tênis no pé: ${profileLabels.sensacao[answers.sensacao]};`,
      `Até onde costuma ir: ${profileLabels.distancia[answers.distancia]};`,
      `Quanto pretende investir: ${profileLabels.orcamento[answers.orcamento]}.`,
      shoppingInstruction,
      'Explique brevemente por que cada opção combina com este perfil. Além das três recomendações, ao longo da conversa ofereça resumos da homepage quando forem relevantes às dúvidas da pessoa.'
    ].join('\n');
  }

  function urlForPrompt(prompt) {
    const url = new URL(AI_CHAT_URL);
    url.searchParams.set('q', `${prompt}\n\n${editorialContext}`);
    return url.toString();
  }
  function urlForTopic(topic) { return urlForPrompt(topicPrompt(topic)); }
  function urlForPlace(place) { return urlForPrompt(placePrompt(place)); }
  function urlForProfile(answers) { return urlForPrompt(profilePrompt(answers)); }

  return { HOME_URL, urlForTopic, urlForPlace, urlForProfile, topicPrompt, placePrompt, profilePrompt };
});
