(() => {
  'use strict';
  // Private inquiry preview only. No requests, email, storage, or public listings.
  const form = document.querySelector('#parent-form');
  const fields = document.querySelector('#parent-fields');
  const review = document.querySelector('#parent-review');
  const errors = document.querySelector('#parent-errors');
  const steps = [...document.querySelectorAll('[data-parent-step]')];
  let current = 0;
  function showStep(step, focus = true) {
    current = step;
    clearErrors();
    form.hidden = step === 2;
    review.hidden = step !== 2;
    steps.forEach((el,index) => { el.hidden = index !== step; });
    document.querySelectorAll('[data-parent-progress]').forEach((el,index) => {
      el.classList.toggle('is-complete', index < step);
      if(index === step) el.setAttribute('aria-current','step'); else el.removeAttribute('aria-current');
    });
    document.querySelector('#parent-preview').textContent = step === 0 ? 'ממשיכים לפרטי הלמידה ←' : 'לבדיקת הפרטים ←';
    document.querySelector('#parent-back').hidden = step !== 1;
    if(focus) {
      const target = step === 2 ? document.querySelector('#parent-review-title') : document.querySelector('#parent-step-title-' + step);
      target.focus({preventScroll:true});
      document.querySelector('.parent-form-card').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    }
  }
  const input = key => document.querySelector('#parent-' + key);
  const value = key => input(key).value.trim();
  const subjects = () => [...form.querySelectorAll('#parent-subjects input:checked')].map(el => el.value);
  function clearErrors() {
    fields.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    fields.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; });
    errors.hidden = true;
  }
  function validate() {
    clearErrors();
    const invalid = [];
    const fail = (key,message) => {
      const el = key === 'subjects' ? input('subjects') : input(key);
      el.setAttribute('aria-invalid','true');
      document.querySelector('#parent-error-' + key).textContent = message;
      invalid.push(el);
    };
    if (current === 0) {
    if (value('name').length < 2) fail('name','נא להזין את שם ההורה.');
    const phone = value('phone');
    if (!/^[+\d\s()\-]+$/.test(phone) || phone.replace(/\D/g,'').length < 9 || phone.replace(/\D/g,'').length > 15) fail('phone','נא להזין מספר טלפון תקין.');
    if (value('email') && !input('email').validity.valid) fail('email','נא להזין כתובת אימייל תקינה או להשאיר את השדה ריק.');
    } else {
    if (!value('grade')) fail('grade','נא לבחור שכבת גיל.');
    if (!subjects().length) fail('subjects','נא לבחור תחום אחד לפחות. אפשר לבחור גם ״נשמח להכוונה״.');
    }
    if (invalid.length) {
      errors.textContent = 'כדי להמשיך, השלימו את השדות המסומנים.';
      errors.hidden = false;
      (invalid[0].querySelector('input') || invalid[0]).focus();
    }
    return !invalid.length;
  }
  function preview() {
    if(!validate()) return;
    if(current === 0) { showStep(1); return; }
    const rows = [['שם ההורה',value('name')],['טלפון',value('phone')],['אימייל',value('email') || 'לא צוין'],['אזור מגורים',value('city') || 'לא צוין'],['שכבת גיל',value('grade')],['תחומי עניין',subjects().join(' · ')],['אופן למידה',value('format') || 'פתוחים להצעות'],['מה חשוב לכם',value('note') || 'לא צוין']];
    document.querySelector('#parent-summary').replaceChildren(...rows.map(([label,text]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = text; dd.dir = 'auto';
      row.append(dt,dd); return row;
    }));
    showStep(2);
  }
  form.addEventListener('submit',event => { event.preventDefault(); preview(); });
  document.querySelector('#parent-preview').addEventListener('click',preview);
  form.addEventListener('keydown',event => {
    if (event.key === 'Enter' && event.target.matches('input:not([type="checkbox"])')) { event.preventDefault(); preview(); }
  });
  document.querySelector('#parent-edit').addEventListener('click',() => {
    showStep(0);
  });
  document.querySelector('#parent-edit-learning').addEventListener('click',() => showStep(1));
  document.querySelector('#parent-back').addEventListener('click',() => showStep(0));
  document.querySelector('#parent-clear').addEventListener('click',() => {
    form.reset(); clearErrors(); document.querySelector('#parent-summary').replaceChildren();
    showStep(0);
  });
  fields.disabled = false;
  showStep(0,false);
})();
