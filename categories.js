(() => {
  'use strict';
  const main = document.querySelector('main');
  const nav = document.querySelector('.main-nav');
  if (!main || !nav) return;

  const teacherPage = document.body.classList.contains('teachers-page');
  const definitions = teacherPage ? [
    ['teacher-intro', 'מסלול המורים', '.breadcrumb,.teacher-hero,main>.values-strip'],
    ['teacher-way', 'איך מצטרפים', '#teacher-way'],
    ['registration', 'טופס הצטרפות', '#registration'],
    ['teacher-faq', 'שאלות של מורים', '#teacher-faq']
  ] : [
    ['home', 'בית', '#home,.home-values,#start'],
    ['about', 'אודות', '#about,.belief'],
    ['learning', 'תחומי למידה', '#learning'],
    ['approach', 'איך זה עובד', '#approach'],
    ['parents-registration', 'להורים', '#parents-registration'],
    ['teachers', 'למורים', '#teachers'],
    ['questions', 'שאלות נפוצות', '#questions,.closing']
  ];
  const routes = definitions.map(([id, label, selector]) => ({id, label, nodes:[...main.querySelectorAll(selector)]}));
  // If markup changes unexpectedly, retain the usable continuous-page fallback.
  if (routes.some(route => !route.nodes.length || route.nodes.some(node => node.parentElement !== main))) return;

  const originalTitle = document.title;
  routes.forEach(route => {
    const view = document.createElement('div');
    view.className = 'section-view';
    view.dataset.view = route.id;
    main.insertBefore(view, route.nodes[0]);
    view.append(...route.nodes);
    route.view = view;
    route.heading = view.querySelector('h1,h2');
    route.heading?.setAttribute('tabindex', '-1');
  });

  const pager = document.createElement('nav');
  pager.className = 'category-pager container';
  pager.setAttribute('aria-label', 'מעבר בין חלקי האתר');
  main.append(pager);
  function pagerLink(route, previous) {
    const link = document.createElement('a');
    link.href = '#' + route.id;
    link.className = 'category-step ' + (previous ? 'category-previous' : 'category-next');
    const label = document.createElement('span');
    const caption = document.createElement('small');
    caption.textContent = previous ? 'לחלק הקודם' : 'לחלק הבא';
    const title = document.createElement('strong');
    title.textContent = route.label;
    label.append(caption, title);
    const arrow = document.createElement('span');
    arrow.className = 'category-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = previous ? '→' : '←';
    link.append(...(previous ? [arrow, label] : [label, arrow]));
    return link;
  }
  function updatePager(index) {
    const position = document.createElement('p');
    position.className = 'category-position';
    const label = document.createElement('strong');
    label.textContent = routes[index].label;
    const count = document.createElement('span');
    count.textContent = `חלק ${index + 1} מתוך ${routes.length}`;
    position.append(label, count);
    pager.replaceChildren(position);
    if (index > 0) pager.prepend(pagerLink(routes[index - 1], true));
    if (index < routes.length - 1) pager.append(pagerLink(routes[index + 1], false));
  }

  function routeFor(hash) {
    let id;
    try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return undefined; }
    const target = document.getElementById(id);
    return routes.find(route => route.id === id || (target && route.view.contains(target)));
  }
  let current;
  let lastHash;
  function show(route, focus = false) {
    const changed = current !== route;
    current = route;
    routes.forEach(item => {
      item.view.hidden = item !== route;
      item.view.classList.toggle('is-current', item === route);
    });
    nav.querySelectorAll('a').forEach(link => {
      if (routeFor(link.getAttribute('href') || '') === route) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    document.body.dataset.currentView = route.id;
    document.title = route === routes[0] ? originalTitle : `${route.label} | הו״מ`;
    if (changed) updatePager(routes.indexOf(route));
    window.scrollTo({top:0, behavior:'instant'});
    if (focus) route.heading?.focus({preventScroll:true});
    if (changed) document.dispatchEvent(new CustomEvent('site:viewchange', {detail:{view:route.id}}));
    lastHash = location.hash;
  }

  document.documentElement.classList.add('category-navigation');
  document.body.classList.add('category-mode');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  show(routeFor(location.hash) || routes[0]);
  // Fragment navigation now selects a category; normal and modified links keep their native behavior.
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
    const skipToContent = url.hash === '#main';
    const route = skipToContent ? current : routeFor(url.hash);
    if (!route) return;
    event.preventDefault();
    if (!skipToContent && location.hash !== url.hash) history.pushState(null, '', url.hash);
    show(route, true);
  });
  function restoreRoute() {
    if (location.hash !== lastHash) show(routeFor(location.hash) || (location.hash ? current : routes[0]), true);
  }
  window.addEventListener('popstate', restoreRoute);
  window.addEventListener('hashchange', restoreRoute);
  window.addEventListener('pageshow', () => {
    if (location.hash !== lastHash) restoreRoute();
  });

  const header = document.querySelector('.site-header');
  if (header && 'ResizeObserver' in window) new ResizeObserver(() => {
    document.documentElement.style.setProperty('--category-header-height', Math.ceil(header.getBoundingClientRect().height) + 'px');
  }).observe(header);
})();
