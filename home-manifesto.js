/* Each line has its own mask; CSS staggers the three entrance groups slightly. */
const manifestoContent = {
  en: {
    lines: ['Rethinking the', 'Way', 'We Live'],
    description: 'EverDwell is a sustainability platform dedicated to reimagining the future of housing, empowering people to make more informed, responsible, and environmentally conscious choices for a better tomorrow.'
  },
  fr: {
    lines: ['Repenser notre', 'façon', 'de vivre'],
    description: 'EverDwell est une plateforme consacrée au développement durable qui repense l’avenir de l’habitat et permet à chacun de faire des choix plus éclairés, responsables et respectueux de l’environnement pour un avenir meilleur.'
  }
};

let manifestoResizeObserver;
let manifestoEntranceObserver;
let manifestoFrame;
let manifestoGeneration = 0;

function renderHomeManifesto(lang) {
  const section = document.querySelector('.home-intro');
  if (!section) return;
  const generation = ++manifestoGeneration;
  const c = manifestoContent[lang === 'fr' ? 'fr' : 'en'];
  const title = section.querySelector('h2');
  const paragraph = section.querySelector('.home-intro-description');
  manifestoResizeObserver?.disconnect();
  manifestoEntranceObserver?.disconnect();
  cancelAnimationFrame(manifestoFrame);
  section.classList.remove('is-reveal-ready', 'is-visible');
  if ('IntersectionObserver' in window) section.classList.add('is-reveal-ready');
  title.replaceChildren();
  c.lines.forEach(text => {
    const span = document.createElement('span');
    span.textContent = text;
    span.dataset.manifestoLine = '';
    title.append(span, document.createTextNode(' '));
  });
  paragraph.textContent = c.description;
  let lastWidth = 0;
  let inView = false;
  let fontsReady = !document.fonts || document.fonts.status === 'loaded';

  function prepareLines() {
    if (generation !== manifestoGeneration) return;
    const width = paragraph.getBoundingClientRect().width;
    if (!width || Math.abs(width - lastWidth) < .5) return;
    lastWidth = width;
    // Measure natural wrapping (including the first-line indent) for animation only.
    // Each naturally wrapped line gets a mask. Re-measure after width/font changes;
    // the copy remains one paragraph, with no hard-coded breaks.
    paragraph.textContent = c.description;
    const node = paragraph.firstChild;
    const range = document.createRange();
    const lines = [];
    for (const match of c.description.matchAll(/\S+/g)) {
      range.setStart(node, match.index);
      range.setEnd(node, match.index + match[0].length);
      const top = range.getBoundingClientRect().top;
      let line = lines[lines.length - 1];
      if (!line || Math.abs(line.top - top) > 2) {
        line = { top, words: [] };
        lines.push(line);
      }
      line.words.push(match[0]);
    }
    paragraph.replaceChildren();
    lines.forEach(line => {
      const span = document.createElement('span');
      span.textContent = line.words.join(' ');
      span.dataset.manifestoLine = '';
      paragraph.append(span, document.createTextNode(' '));
    });
  }

  function revealTogether() {
    if (!fontsReady || !inView || generation !== manifestoGeneration) return;
    prepareLines();
    // The title and description masks are committed together before revealing.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (generation === manifestoGeneration && inView) section.classList.add('is-visible');
    }));
  }

  if ('IntersectionObserver' in window) {
    manifestoEntranceObserver = new IntersectionObserver(entries => {
      if (generation !== manifestoGeneration) return;
      inView = entries[entries.length - 1].isIntersecting
        && entries[entries.length - 1].intersectionRatio >= .12;
      if (inView) {
        revealTogether();
      } else {
        section.classList.remove('is-visible');
      }
    }, { threshold: [0, .12] });
    manifestoEntranceObserver.observe(section);
  }
  if ('ResizeObserver' in window) {
    manifestoResizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(manifestoFrame);
      manifestoFrame = requestAnimationFrame(prepareLines);
    });
    manifestoResizeObserver.observe(paragraph);
  }
  manifestoFrame = requestAnimationFrame(prepareLines);
  if (!fontsReady) document.fonts.ready.then(() => {
    if (generation !== manifestoGeneration) return;
    fontsReady = true;
    lastWidth = 0;
    prepareLines();
    revealTogether();
  });
}
