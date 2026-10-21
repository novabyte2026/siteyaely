(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const revealTargets = [...document.querySelectorAll('.section-heading,.about-copy,.section-top,.route-card,.learning-panel,.teacher-invitation-inner>div,.belief-inner,.faq-list,.closing,.teacher-process article,.registration-intro,.form-card,.parent-intro,.journey-stop,.connection-scene,.routes-heading')];
  const motionTargets = [...revealTargets, ...document.querySelectorAll('.hero')];
  let revealObserver;
  let resetObserver;
  function showAll() {
    motionTargets.forEach(el => el.classList.add('is-visible'));
    root.classList.remove('motion-enabled');
    revealObserver?.disconnect();
    resetObserver?.disconnect();
  }
  function observeMotion() {
    showAll();
    if (reduce.matches || !('IntersectionObserver' in window)) return;
    try {
      revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      }), {rootMargin:'0px 0px 70px 0px',threshold:0});
      // Reset beyond the entrance boundary so the moving element cannot retrigger itself.
      resetObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting && !entry.target.contains(document.activeElement)) {
          entry.target.classList.remove('is-visible');
        }
      }), {rootMargin:'120px 0px 120px 0px',threshold:0});
      revealTargets.forEach((el,index) => {
        el.classList.add('reveal-ready');
        const direction = el.matches('.section-heading,.parent-intro,.registration-intro,.route-card:not(.route-teacher)') ? 'right' : el.matches('.about-copy,.form-card,.route-teacher,.connection-scene,.faq-list') ? 'left' : el.matches('.journey-stop,.teacher-process article') ? (index % 2 ? 'right' : 'left') : 'up';
        el.dataset.reveal = direction;
        if (el.matches('.route-card,.teacher-process article')) el.style.setProperty('--reveal-delay', (index % 2) * 75 + 'ms');
      });
      motionTargets.forEach(el => {
        const box = el.getBoundingClientRect();
        el.classList.toggle('is-visible', (box.top < window.innerHeight + 70 && box.bottom > 0) || el.contains(document.activeElement));
        revealObserver.observe(el);
        resetObserver.observe(el);
      });
      root.classList.add('motion-enabled');
    } catch { showAll(); }
  }
  observeMotion();
  document.addEventListener('focusin', event => {
    motionTargets.forEach(el => { if (el.contains(event.target)) el.classList.add('is-visible'); });
  });
  document.addEventListener('focusout', () => requestAnimationFrame(() => {
    if (!root.classList.contains('motion-enabled')) return;
    motionTargets.forEach(el => {
      const box = el.getBoundingClientRect();
      if ((box.bottom < -120 || box.top > window.innerHeight + 120) && !el.contains(document.activeElement)) el.classList.remove('is-visible');
    });
  }));
  window.addEventListener('beforeprint', showAll);
  window.addEventListener('afterprint', observeMotion);

  const journey = document.querySelector('.journey-stops');
  const stops = journey ? [...journey.querySelectorAll('.journey-stop')] : [];
  const counter = document.querySelector('#journey-current');
  let frame = 0;
  function updateJourney() {
    frame = 0;
    if (!journey || !stops.length) return;
    const box = journey.getBoundingClientRect();
    if (box.bottom < 0 || box.top > window.innerHeight) return;
    const first = stops[0].offsetTop + 44;
    const last = stops[stops.length - 1].offsetTop + 44;
    const guide = window.innerHeight * .58;
    const progress = reduce.matches ? 1 : Math.max(0,Math.min(1,(guide - box.top - first) / Math.max(1,last-first)));
    const active = Math.max(0,stops.findLastIndex(stop => stop.getBoundingClientRect().top + 44 <= guide));
    journey.style.setProperty('--rail-start', first + 'px');
    journey.style.setProperty('--rail-length', (last-first) + 'px');
    journey.style.setProperty('--journey-progress', progress.toFixed(4));
    stops.forEach((stop,index) => {
      stop.classList.toggle('is-reached',index <= active || reduce.matches);
      stop.classList.toggle('is-active',index === active);
    });
    if(counter) counter.textContent = String(active + 1).padStart(2,'0');
  }
  function schedule() { if(journey && !frame) frame = requestAnimationFrame(updateJourney); }
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  reduce.addEventListener('change',() => { observeMotion(); schedule(); });
  window.addEventListener('pageshow',schedule);
  schedule();
})();
