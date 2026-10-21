(() => {
  'use strict';
  // Demo only: no network requests, storage, or actual registration.
  const form = document.querySelector('#teacher-form');
  const fields = document.querySelector('#demo-fields');
  const steps = [...document.querySelectorAll('[data-step]')];
  const next = document.querySelector('#form-next');
  const back = document.querySelector('#form-back');
  const finish = document.querySelector('#form-finish');
  const errors = document.querySelector('#form-errors');
  const complete = document.querySelector('#demo-complete');
  let current = 0;
  const input = key => document.querySelector('#teacher-' + key);
  const value = key => input(key).value.trim();
  const selectedSubjects = () => [...document.querySelectorAll('#specialties input:checked')].map(el => el.value);
  function clearErrors() {
    document.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; });
    fields.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    errors.hidden = true;
  }
  function validate() {
    clearErrors();
    const issues = [];
    const fail = (key, message) => {
      const element = key === 'specialties' ? document.querySelector('#specialties') : input(key);
      element.setAttribute('aria-invalid', 'true');
      document.querySelector('#error-' + key).textContent = message;
      issues.push(element);
    };
    if (current === 0) {
      if (value('name').length < 2) fail('name', 'נא להזין שם מלא.');
      if (value('city').length < 2) fail('city', 'נא להזין עיר או אזור הוראה.');
      if (!value('email') || !input('email').validity.valid) fail('email', 'נא להזין כתובת אימייל תקינה.');
      const phone = value('phone');
      const digits = phone.replace(/\D/g, '');
      if (!/^[+\d\s()\-]+$/.test(phone) || digits.length < 9 || digits.length > 15) fail('phone', 'נא להזין מספר טלפון תקין.');
    } else if (current === 1) {
      if (!selectedSubjects().length) fail('specialties', 'נא לבחור לפחות תחום הוראה אחד.');
      if (!value('experience')) fail('experience', 'נא לבחור את הניסיון בהוראה.');
      if (!value('format')) fail('format', 'נא לבחור אופן הוראה.');
    }
    if (issues.length) {
      errors.textContent = 'כדי להמשיך, יש להשלים את השדות המסומנים.';
      errors.hidden = false;
      (issues[0].querySelector('input') || issues[0]).focus();
    }
    return !issues.length;
  }
  function review() {
    const rows = [['שם מלא',value('name')],['עיר / אזור',value('city')],['אימייל',value('email')],['טלפון',value('phone')],['תחומי הוראה',selectedSubjects().join(' · ')],['ניסיון',value('experience')],['אופן הוראה',value('format')],['זמינות',value('availability') || 'לא צוין'],['הכשרה והיכרות',value('about') || 'לא צוין']];
    document.querySelector('#application-review').replaceChildren(...rows.map(([label,text]) => {
      const row = document.createElement('div');
      const term = document.createElement('dt'); term.textContent = label;
      const detail = document.createElement('dd'); detail.textContent = text; detail.dir = 'auto';
      row.append(term,detail); return row;
    }));
  }
  function showStep(step, focus = true) {
    current = step;
    clearErrors();
    steps.forEach((el,index) => { el.hidden = index !== step; });
    document.querySelectorAll('[data-progress]').forEach((el,index) => {
      el.classList.toggle('is-complete',index < step);
      if (index === step) el.setAttribute('aria-current','step'); else el.removeAttribute('aria-current');
    });
    next.hidden = step === 2; finish.hidden = step !== 2; back.hidden = step === 0;
    document.querySelector('#form-edit-personal').hidden = step !== 2;
    back.textContent = step === 2 ? 'חזרה להיכרות המקצועית' : 'חזרה לפרטים האישיים';
    next.textContent = step === 0 ? 'להיכרות המקצועית ←' : 'לבדיקת הפרטים ←';
    if (step === 2) review();
    if (focus) {
      document.querySelector('#step-title-' + step).focus({preventScroll:true});
      form.closest('.form-card').scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    }
  }
  const advance = () => { if (validate()) showStep(Math.min(current + 1,2)); };
  next.addEventListener('click',advance);
  back.addEventListener('click',() => showStep(current - 1));
  document.querySelector('#form-edit-personal').addEventListener('click',() => showStep(0));
  form.addEventListener('submit',event => { event.preventDefault(); if(current < 2) advance(); });
  // Enter on text fields acts as Next; textarea and buttons keep native keyboard behavior.
  form.addEventListener('keydown',event => {
    if (event.key === 'Enter' && event.target.matches('input:not([type="checkbox"])')) { event.preventDefault(); if(current < 2) advance(); }
  });
  finish.addEventListener('click',() => {
    form.hidden = true; complete.hidden = false;
    document.querySelector('#complete-title').focus();
  });
  document.querySelector('#edit-demo').addEventListener('click',() => { complete.hidden = true; form.hidden = false; showStep(0); });
  document.querySelector('#reset-demo').addEventListener('click',() => {
    form.reset(); document.querySelector('#application-review').replaceChildren();
    complete.hidden = true; form.hidden = false; showStep(0);
  });
  fields.disabled = false;
  showStep(0,false);
})();
