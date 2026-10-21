(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  if (!header) return;
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden','true');
  header.append(progress);
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'back-to-top';
  back.textContent = 'לראש העמוד ↑';
  back.hidden = true;
  document.body.append(back);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  back.addEventListener('click', () => {
    window.scrollTo({top:0,behavior:reduce.matches ? 'instant' : 'smooth'});
    document.querySelector('.brand').focus({preventScroll:true});
  });
  let frame = 0;
  function update() {
    frame = 0;
    const y = window.scrollY;
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--reading-progress',range > 0 ? Math.min(1,Math.max(0,y / range)) : 0);
    header.classList.toggle('has-scrolled', y > 25);
    back.hidden = y < innerHeight * 1.4;
  }
  const schedule = () => { if(!frame) frame = requestAnimationFrame(update); };
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pageshow',schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
  update();
})();
