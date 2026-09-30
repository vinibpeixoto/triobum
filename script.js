/* triobum — interface local; destinos futuros abrem conversas contextuais em nova aba. */
'use strict';

const prompts = window.TriobumPrompts;
const answers = { objetivo: null, sensacao: null, distancia: null, orcamento: null };
const questionLabels = { objetivo: 'objetivo', sensacao: 'sensação', distancia: 'distância', orcamento: 'orçamento' };
const wizardFeedback = document.getElementById('wizard-feedback');
const wizardStep1 = document.getElementById('wizard-step-1');
const wizardStep2 = document.getElementById('wizard-step-2');
const wizardProgress = document.querySelectorAll('.wizard-progress span');
const wizardCounter = document.getElementById('wizard-counter');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollBehavior = () => motion.matches ? 'instant' : 'smooth';
function clearRecommendation() {
  document.getElementById('recommendation').hidden = true;
  document.getElementById('recommendation-title').textContent = '';
  document.getElementById('recommendation-reason').textContent = '';
  const complete = Object.values(answers).every(Boolean);
  if (complete) document.getElementById('profile-ai-link').href = prompts.urlForProfile(answers);
}

function setWizardStep(step) {
  clearRecommendation();
  wizardStep1.hidden = step !== 1;
  wizardStep2.hidden = step !== 2;
  wizardProgress.forEach((bar, index) => bar.classList.toggle('is-current', index === step - 1));
  wizardCounter.textContent = `0${step} / 02`;
  wizardFeedback.textContent = `Etapa ${step} de 2.`;
  const heading = (step === 1 ? wizardStep1 : wizardStep2).querySelector('h3');
  heading.focus({ preventScroll: true });
  if (step === 2) document.getElementById('wizard-step-2').scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
}

document.querySelectorAll('[data-question]').forEach(group => {
  const options = [...group.querySelectorAll('button[data-value]')];
  options[0].tabIndex = 0;
  function select(choice) {
    options.forEach(button => {
      const selected = button === choice;
      button.setAttribute('aria-checked', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    answers[group.dataset.question] = choice.dataset.value;
    wizardFeedback.textContent = '';
    clearRecommendation();
  }
  group.addEventListener('click', event => {
    const choice = event.target.closest('button[data-value]');
    if (!choice || !group.contains(choice)) return;
    select(choice);
  });
  group.addEventListener('keydown', event => {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const current = options.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
      : (current + (['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 1) + options.length) % options.length;
    select(options[next]);
    options[next].focus();
  });
});

function missingFor(keys) { return keys.filter(key => !answers[key]).map(key => questionLabels[key]); }
document.getElementById('wizard-next').addEventListener('click', () => {
  const missing = missingFor(['objetivo', 'sensacao']);
  if (missing.length) { wizardFeedback.textContent = `Escolha ${missing.join(' e ')} para continuar.`; return; }
  setWizardStep(2);
});
document.getElementById('wizard-back').addEventListener('click', () => setWizardStep(1));
document.getElementById('wizard-submit').addEventListener('click', () => {
  const missing = missingFor(['objetivo', 'sensacao', 'distancia', 'orcamento']);
  if (missing.length) {
    wizardFeedback.textContent = `Escolha ${missing.join(', ')} para ver as recomendações.`;
    return;
  }
  document.getElementById('profile-ai-link').href = prompts.urlForProfile(answers);
  const faster = answers.objetivo === 'evoluir' && answers.sensacao === 'responsiva' && answers.distancia !== 'longões';
  const title = faster ? 'Seu ponto de partida: triobum pulso.' : 'Seu ponto de partida: triobum fluxo.';
  const budgetNote = answers.orcamento === 'ainda não sei'
    ? 'Você pode definir o orçamento depois de comparar conforto, ajuste e uso.'
    : `Seu orçamento de ${answers.orcamento} ajuda a organizar a busca; os preços destes modelos ainda não estão disponíveis neste protótipo.`;
  const reason = faster
    ? `Você quer evoluir, prefere uma sensação responsiva e costuma correr ${answers.distancia}. O pulso prioriza leveza e resposta para treinos em que o ritmo sobe. ${budgetNote}`
    : `Você busca ${answers.objetivo === 'começar' ? 'começar a correr' : 'evoluir com uma base confiável'}, prefere uma sensação ${answers.sensacao} e costuma correr ${answers.distancia}. O fluxo prioriza conforto e estabilidade. ${budgetNote}`;
  document.getElementById('recommendation-title').textContent = title;
  document.getElementById('recommendation-reason').textContent = reason;
  const recommendation = document.getElementById('recommendation');
  recommendation.hidden = false;
  document.getElementById('recommendation-title').focus({ preventScroll: true });
  recommendation.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
});

document.querySelectorAll('a[data-topic]').forEach(link => {
  link.href = prompts.urlForTopic(link.dataset.topic);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.setAttribute('aria-label', `${link.textContent.trim()} — abrir conversa no ChatGPT em nova aba`);
});

const cards = [...document.querySelectorAll('.product-card')];
const track = document.getElementById('product-track');
let activeCard = 0;
function setActiveCard(index, smooth = true) {
  activeCard = (index + cards.length) % cards.length;
  const card = cards[activeCard];
  track.scrollTo({ left: card.offsetLeft - cards[0].offsetLeft, behavior: smooth ? scrollBehavior() : 'instant' });
  cards.forEach((item, i) => item.setAttribute('aria-current', i === activeCard ? 'true' : 'false'));
  document.querySelectorAll('.category').forEach(button => {
    const selected = button.dataset.category === card.dataset.category;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.getElementById('carousel-status').textContent = `${activeCard + 1} de ${cards.length}`;
}
document.querySelectorAll('.category').forEach(button => button.addEventListener('click', () => {
  setActiveCard(cards.findIndex(card => card.dataset.category === button.dataset.category));
}));
document.getElementById('carousel-prev').addEventListener('click', () => setActiveCard(activeCard - 1));
document.getElementById('carousel-next').addEventListener('click', () => setActiveCard(activeCard + 1));
let trackTimer;
track.addEventListener('scroll', () => {
  clearTimeout(trackTimer);
  trackTimer = setTimeout(() => {
    const current = cards.reduce((nearest, card, index) =>
      Math.abs(card.offsetLeft - cards[0].offsetLeft - track.scrollLeft) < Math.abs(cards[nearest].offsetLeft - cards[0].offsetLeft - track.scrollLeft) ? index : nearest, 0);
    activeCard = current;
    document.getElementById('carousel-status').textContent = `${current + 1} de ${cards.length}`;
    cards.forEach((item, i) => item.setAttribute('aria-current', i === current ? 'true' : 'false'));
    document.querySelectorAll('.category').forEach(button => {
      const selected = button.dataset.category === cards[current].dataset.category;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }, 90);
});

const stories = [...document.querySelectorAll('.story')];
const storyTrack = document.querySelector('.stories');
let activeStory = 0;
function setStory(index) {
  activeStory = (index + stories.length) % stories.length;
  storyTrack.scrollTo({ left: stories[activeStory].offsetLeft - stories[0].offsetLeft, behavior: scrollBehavior() });
  document.getElementById('story-count').textContent = `${activeStory + 1} de ${stories.length}`;
  stories.forEach((story, i) => story.setAttribute('aria-current', i === activeStory ? 'true' : 'false'));
}
document.getElementById('story-prev').addEventListener('click', () => setStory(activeStory - 1));
document.getElementById('story-next').addEventListener('click', () => setStory(activeStory + 1));
let storyTimer;
storyTrack.addEventListener('scroll', () => {
  clearTimeout(storyTimer);
  storyTimer = setTimeout(() => {
    activeStory = stories.reduce((nearest, story, index) =>
      Math.abs(story.offsetLeft - stories[0].offsetLeft - storyTrack.scrollLeft) < Math.abs(stories[nearest].offsetLeft - stories[0].offsetLeft - storyTrack.scrollLeft) ? index : nearest, 0);
    document.getElementById('story-count').textContent = `${activeStory + 1} de ${stories.length}`;
    stories.forEach((story, i) => story.setAttribute('aria-current', i === activeStory ? 'true' : 'false'));
  }, 90);
});
cards.forEach((card, i) => { card.setAttribute('role', 'group'); card.setAttribute('aria-roledescription', 'slide'); card.setAttribute('aria-label', `${i + 1} de ${cards.length}: ${card.querySelector('h3').textContent}`); });
stories.forEach((story, i) => { story.setAttribute('role', 'group'); story.setAttribute('aria-roledescription', 'story'); story.setAttribute('aria-label', `${i + 1} de ${stories.length}: ${story.querySelector('h3').textContent}`); });
cards[0].setAttribute('aria-current', 'true');
stories[0].setAttribute('aria-current', 'true');

const compare = document.getElementById('compare');
const compareProgress = compare.querySelector('.compare-mobile-progress');
const compareNavigation = compare.querySelector('.compare-mobile-navigation');
const compareDescriptions = [
  'Primeiro, conheça as duas sensações.',
  'Depois, veja como cada tênis se comporta e se ajusta.',
  'Por fim, descubra qual faz mais sentido para você.'
];
let compareStep = 1;
compare.classList.add('is-enhanced');
compareProgress.hidden = false;
compareNavigation.hidden = false;
document.getElementById('compare-step-description').tabIndex = -1;
function showCompareStep(step, moveFocus = false) {
  compareStep = Math.min(3, Math.max(1, step));
  compare.dataset.step = String(compareStep);
  const label = `0${compareStep} / 03`;
  document.getElementById('compare-step-count').textContent = label;
  document.getElementById('compare-nav-counter').textContent = label;
  document.getElementById('compare-step-description').textContent = compareDescriptions[compareStep - 1];
  compareProgress.querySelectorAll('i').forEach((bar, index) => bar.classList.toggle('active', index === compareStep - 1));
  document.getElementById('compare-back').hidden = compareStep === 1;
  document.getElementById('compare-next').hidden = compareStep === 3;
  if (moveFocus) {
    document.getElementById('compare-step-description').focus({ preventScroll: true });
    compareProgress.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  }
}
document.getElementById('compare-back').addEventListener('click', () => showCompareStep(compareStep - 1, true));
document.getElementById('compare-next').addEventListener('click', () => showCompareStep(compareStep + 1, true));
showCompareStep(1);

const places = {
  eventos: {
    title: 'Eventos para começar.', description: 'Provas para descobrir um novo percurso e correr no seu tempo.',
    items: [
      ['Corrida 5K — domingo, 7h', 'Parque Ibirapuera · São Paulo', 'Uma prova curta para começar com companhia.'],
      ['Volta do parque — 10 km', 'Parque Villa-Lobos · São Paulo', 'Percurso urbano em ritmo aberto.'],
      ['Circuito da orla — 5 km', 'Santos · litoral paulista', 'Uma manhã de corrida perto do mar.']
    ]
  },
  rotas: {
    title: 'Rotas para descobrir.', description: 'Trajetos ilustrativos para diferentes distâncias e jeitos de correr.',
    items: [
      ['Volta do parque — 4,8 km', 'Parque Ibirapuera · percurso plano', 'Boa para uma rodagem leve.'],
      ['Marginal do rio — 8 km', 'Pinheiros · São Paulo', 'Para encaixar um treino mais longo.'],
      ['Rota da manhã — 3 km', 'Centro · Santos', 'Para tirar o primeiro treino do papel.']
    ]
  },
  'serviços': {
    title: 'Ajuda para evoluir.', description: 'Apoio profissional de corrida, com exemplos para explorar o conceito.',
    items: [
      ['Assessoria de corrida', 'Zona oeste · São Paulo', 'Treinos acompanhados em grupo.'],
      ['Treinador de corrida', 'Atendimento ilustrativo · online', 'Orientação personalizada para seus objetivos.'],
      ['Avaliação de corrida', 'Centro · São Paulo', 'Uma conversa sobre treino, adaptação e rotina.']
    ]
  },
  comunidades: {
    title: 'Gente para correr junto.', description: 'Ideias de lugares para encontrar companhia e compartilhar percursos.',
    items: [
      ['Grupo do bairro', 'Vila Mariana · São Paulo', 'Encontros em horários combinados.'],
      ['Clube de corrida', 'Pinheiros · São Paulo', 'Treinos de diferentes ritmos.'],
      ['Comunidade digital', 'Encontros online', 'Trocas sobre tênis, treinos e provas.']
    ]
  }
};
const markerPositions = {
  eventos: [[34,49],[53,62],[67,38],[44,78]],
  rotas: [[41,43],[48,47],[56,56],[63,59]],
  'serviços': [[30,37],[40,66],[56,41],[72,70]],
  comunidades: [[38,55],[49,72],[65,47],[72,78]]
};
function renderPlaces(filter) {
  const group = places[filter];
  if (!group) return;
  document.getElementById('places-title').textContent = group.title;
  document.getElementById('places-description').textContent = group.description;
  const map = document.querySelector('.map-panel');
  map.dataset.activeFilter = filter;
  map.querySelectorAll('.map-marker').forEach(marker => marker.remove());
  markerPositions[filter].forEach(([top,left]) => {
    const marker = document.createElement('span');
    marker.className = 'map-marker';
    marker.setAttribute('aria-hidden','true');
    marker.style.top = `${top}%`;
    marker.style.left = `${left}%`;
    map.append(marker);
  });
  const list = document.getElementById('places-list');
  list.replaceChildren(...group.items.map(([title, location, description]) => {
    const li = document.createElement('li');
    const strong = document.createElement('strong'); strong.textContent = title;
    const span = document.createElement('span'); span.textContent = location;
    const link = document.createElement('a');
    link.textContent = 'Explorar opções reais ↗';
    link.href = prompts.urlForPlace({ type: filter, name: title, location, description });
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `${title}: explorar opções reais no ChatGPT em nova aba`);
    li.append(strong, span, link); return li;
  }));
  document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => renderPlaces(button.dataset.filter)));
renderPlaces('eventos');
