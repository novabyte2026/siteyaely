(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const close = () => {
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', 'פתיחת תפריט');
    nav.classList.remove('is-open');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'סגירת תפריט' : 'פתיחת תפריט');
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  document.addEventListener('click', e => { if (!e.target.closest('.site-header')) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { close(); menu.focus(); }
  });
  window.matchMedia('(min-width: 1101px)').addEventListener('change', close);
  const links = [...nav.querySelectorAll('a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) links.forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, {rootMargin:'-15% 0px -55% 0px',threshold:0});
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
  }
  document.querySelector('#year').textContent = new Date().getFullYear();
})();
