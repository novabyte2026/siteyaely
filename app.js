(() => {
  'use strict';
  const content = window.SITE_CONTENT || {};
  document.querySelectorAll('[data-content]').forEach(element => {
    const value = content[element.dataset.content];
    if (typeof value === 'string') { element.textContent = value; element.style.whiteSpace = 'pre-line'; }
  });
  const tabs = Array.from(document.querySelectorAll('[data-topic]'));
  const panel = document.querySelector('#learning-panel');
  if (!panel || !tabs.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const movingParts = [panel.querySelector('.learning-content'), panel.querySelector('.learning-art')].filter(Boolean);
  let activeTab = tabs.find(tab => tab.getAttribute('aria-selected') === 'true') || tabs[0];
  let transitionId = 0;
  let animations = [];

  function stopMotion() {
    animations.forEach(animation => animation.cancel());
    animations = [];
  }

  function renderTopic(tab) {
    const topic = content.topics?.[tab.dataset.topic];
    if (!topic) return;
    panel.setAttribute('aria-labelledby', tab.id);
    document.querySelector('#topic-number').textContent = topic.number;
    document.querySelector('#topic-title').textContent = topic.title;
    document.querySelector('#topic-description').textContent = topic.description;
    document.querySelector('#art-word').textContent = topic.word;
    document.querySelector('#art-word').style.fontSize = tab.dataset.topic === 'habits' ? '39px' : '';
    document.querySelector('#art-caption').textContent = topic.caption;
    document.querySelector('.art-top').textContent = topic.artLabel;
    document.querySelector('#topic-points').replaceChildren(...topic.points.map(point => { const item = document.createElement('li'); item.textContent = point; return item; }));
  }

  function animateParts(entering, direction) {
    animations = movingParts.map((part, index) => {
      const offset = (index === 0 ? 9 : -7) * direction;
      return part.animate(entering
        ? [{ opacity: 0, translate: `${offset}px 0` }, { opacity: 1, translate: '0 0' }]
        : [{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: `${-offset}px 0` }], {
        duration: entering ? 310 : 110,
        easing: entering ? 'cubic-bezier(.2,.7,.2,1)' : 'ease-out',
        fill: 'both'
      });
    });
    return Promise.allSettled(animations.map(animation => animation.finished));
  }

  async function selectTopic(tab) {
    if (tab === activeTab || !content.topics?.[tab.dataset.topic]) return;
    const direction = tabs.indexOf(tab) > tabs.indexOf(activeTab) ? 1 : -1;
    activeTab = tab;
    const currentTransition = ++transitionId;
    stopMotion();
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    if (reducedMotion.matches || !movingParts.every(part => typeof part.animate === 'function')) {
      renderTopic(tab);
      panel.removeAttribute('aria-busy');
      return;
    }

    panel.setAttribute('aria-busy', 'true');
    await animateParts(false, direction);
    if (currentTransition !== transitionId) return;
    renderTopic(tab);
    stopMotion();
    panel.removeAttribute('aria-busy');
    await animateParts(true, direction);
    if (currentTransition === transitionId) stopMotion();
  }

  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    ++transitionId;
    stopMotion();
    renderTopic(activeTab);
    panel.removeAttribute('aria-busy');
  });
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTopic(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowLeft') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowRight') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); tabs[next].focus(); selectTopic(tabs[next]); }
    });
  });
})();
