/* FORM — framework-free interactions. Works when index.html is opened locally. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const config = window.FORM_CONFIG || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phoneViewport = window.matchMedia('(max-width: 700px)');
  const menuButton = $('.menu-toggle');
  const nav = $('#main-nav');

  function closeMenu(returnFocus = false) {
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (open) $('a', nav).focus();
  });
  $$('a', nav).forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (menuButton.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') { closeMenu(true); return; }
    if (event.key === 'Tab') {
      const focusable = [menuButton, ...$$('a', nav)];
      const index = Math.max(0, focusable.indexOf(document.activeElement));
      event.preventDefault();
      const next = (index + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
      focusable[next].focus();
    }
  });
  const handleViewport = () => { if (!phoneViewport.matches) closeMenu(); };
  if (phoneViewport.addEventListener) phoneViewport.addEventListener('change', handleViewport);
  else if (phoneViewport.addListener) phoneViewport.addListener(handleViewport);

  // A single throttled scroll listener drives the progress line and navigation.
  const trackedSections = $$('a[href^="#"]', nav).map(link => ({ link, section: document.getElementById(link.hash.slice(1)) })).filter(item => item.section);
  let scrollQueued = false;
  function updateScroll() {
    scrollQueued = false;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0;
    $('#scroll-progress').style.width = `${ratio * 100}%`;
    $('#site-header').classList.toggle('scrolled', window.scrollY > 30);
    let current = null;
    trackedSections.forEach(item => { if (item.section.getBoundingClientRect().top <= 180) current = item; });
    trackedSections.forEach(item => {
      item.link.classList.toggle('is-current', item === current);
      if (item === current) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; window.requestAnimationFrame(updateScroll); }
  }, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();



  // Programme filters and a full accessible details dialog.
  const programmes = {
    strength: { label: 'STRENGTH TRAINING', title: 'Strong foundations.', image: '04-strength.webp', alt: 'A woman practising an incline dumbbell chest press', interest: 'Strength training', description: 'Get comfortable with weights through controlled movements and clear coaching. Begin with the fundamentals, then build a routine around your experience and goals.', points: ['Learn movement patterns before adding load', 'Use an appropriate weight and a controlled pace', 'Ask about a personal progression plan'] },
    functional: { label: 'FUNCTIONAL FITNESS', title: 'Everyday power.', image: '06-sled-push.webp', alt: 'A woman pushing a training sled', interest: 'Functional fitness', description: 'Explore purposeful full-body training with sleds, movement drills and adaptable circuits. The aim is a challenge you can understand and a pace you can work with.', points: ['Combine strength and conditioning', 'Adapt movement and intensity with your coach', 'Build a routine around purposeful effort'] },
    boxing: { label: 'BOXING FITNESS', title: 'Find your fight.', image: '07-boxing.webp', alt: 'A woman practising a punch against a boxing bag', interest: 'Boxing fitness', description: 'Learn basic footwork, controlled punches and rhythm in a fitness-focused session. Ask your coach how to begin and what equipment you need for your first class.', points: ['Practise stance, guard and movement', 'Develop rhythm with controlled bag work', 'Start with coached technique, then add pace'] },
    cardio: { label: 'CARDIO TRAINING', title: 'Build your rhythm.', image: '08-cardio.webp', alt: 'A woman jogging on a studio treadmill', interest: 'Cardio training', description: 'Walking, jogging and cycling give you different ways to find a steady rhythm. Choose a comfortable starting point and discuss how to fit cardio into your week.', points: ['Choose the bike or treadmill', 'Adjust pace to your comfort and experience', 'Build a practical, repeatable routine'] },
    group: { label: 'GROUP FITNESS', title: 'Better together.', image: '10-group-class.webp', alt: 'Women taking part in a lively group dance workout', interest: 'Group fitness', description: 'Bring movement, music and shared energy into your week. Explore approachable group sessions and ask which class format would suit your first visit.', points: ['Enjoy dance-based cardio and group energy', 'Follow a coached session with room to adjust', 'Confirm the current timetable and availability'] }
  };
  $$('.filter').forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.filter;
    $$('.filter').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active));
    });
    let count = 0;
    $$('.programme-card').forEach(card => {
      const visible = category === 'all' || card.dataset.category === category;
      card.hidden = !visible; if (visible) count++;
    });
    $('.programme-grid').classList.toggle('is-filtered', category !== 'all');
    $('#filter-status').textContent = `Showing ${count} programme${count === 1 ? '' : 's'}.`;
  }));

  const programmeDialog = $('#programme-dialog');
  const lightboxDialog = $('#lightbox-dialog');
  function openDialog(dialog) {
    if (typeof dialog.showModal !== 'function') return false;
    closeMenu();
    dialog.showModal();
    document.body.classList.add('modal-open');
    return true;
  }
  [programmeDialog, lightboxDialog].forEach(dialog => {
    $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      if (!programmeDialog.open && !lightboxDialog.open) document.body.classList.remove('modal-open');
    });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  });
  let currentProgramme = null;
  $$('.programme-open').forEach(button => button.addEventListener('click', () => {
    const item = programmes[button.dataset.programme];
    if (!item) return;
    currentProgramme = item;
    $('#programme-dialog-label').textContent = item.label;
    $('#programme-dialog-title').textContent = item.title;
    $('#programme-dialog-description').textContent = item.description;
    $('#programme-dialog-image').src = `assets/images/${item.image}`;
    $('#programme-dialog-image').alt = item.alt;
    const list = $('#programme-dialog-list');
    list.replaceChildren(...item.points.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
    if (!openDialog(programmeDialog)) {
      $('#enquiry-form select[name="interest"]').value = item.interest;
      clearPreview();
      document.getElementById('contact').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }));
  $('#programme-dialog-enquire').addEventListener('click', () => {
    if (currentProgramme) $('#enquiry-form select[name="interest"]').value = currentProgramme.interest;
    clearPreview();
    programmeDialog.close();
  });
  $$('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
    $('#lightbox-image').src = button.dataset.lightbox;
    $('#lightbox-image').alt = $('img', button).alt;
    $('#lightbox-caption').textContent = button.dataset.caption;
    if (!openDialog(lightboxDialog)) window.open(button.dataset.lightbox, '_blank', 'noopener');
  }));

  // Roving tab focus: keyboard arrows, Home and End work in both tab sets.
  function wireTabs(buttons, activate, vertical) {
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => activate(index));
      button.addEventListener('keydown', event => {
        let next = index;
        if (event.key === 'ArrowRight' || (vertical && event.key === 'ArrowDown')) next = (index + 1) % buttons.length;
        else if (event.key === 'ArrowLeft' || (vertical && event.key === 'ArrowUp')) next = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = buttons.length - 1;
        else return;
        event.preventDefault(); activate(next); buttons[next].focus();
      });
    });
  }
  function setActiveTab(buttons, index) {
    buttons.forEach((button, i) => {
      const active = i === index;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
  }
  const journey = [
    { image: '01-consultation.webp', alt: 'A trainee discussing her starting point with a female coach', title: 'Start with a conversation.', description: 'Tell us what you want from training and where you feel comfortable starting. We’ll help you choose a first session.' },
    { image: '02-warm-up.webp', alt: 'A woman preparing for training with a side-lunge warm-up', title: 'Get comfortable with movement.', description: 'Ease into the session with a warm-up. Your coach can adjust the movements to your experience and comfort.' },
    { image: '03-technique-coaching.webp', alt: 'A female coach helping a trainee understand a hip-hinge movement', title: 'Learn the movement first.', description: 'Practise the basics with clear cues and time to ask questions. Build confidence with technique before adding a bigger challenge.' },
    { image: '09-cable-row.webp', alt: 'A woman practising a controlled seated cable row', title: 'Build something repeatable.', description: 'Finish with a conversation about what worked for you. Choose a realistic next session and begin a routine you can return to.' }
  ];
  const stepButtons = $$('.journey-step');
  $('.journey-controls').setAttribute('aria-orientation', 'vertical');
  wireTabs(stepButtons, index => {
    const item = journey[index];
    setActiveTab(stepButtons, index);
    $('#journey-image').src = `assets/images/${item.image}`;
    $('#journey-image').alt = item.alt;
    $('#journey-caption').textContent = item.title;
    $('#journey-description').textContent = item.description;
    $('#journey-count').textContent = `0${index + 1} / 04`;
    $('#journey-panel').setAttribute('aria-labelledby', stepButtons[index].id);
  }, true);

  const schedules = [
    [['6:30 AM', 'Strength foundations', 'Technique-led studio training', '45 MIN'], ['8:00 AM', 'Group rhythm', 'Dance-based cardio', '45 MIN'], ['6:30 PM', 'Functional flow', 'Movement and conditioning', '45 MIN']],
    [['7:00 AM', 'Cardio rhythm', 'Bike and treadmill session', '45 MIN'], ['9:00 AM', 'Boxing basics', 'Footwork and controlled bag work', '45 MIN'], ['7:00 PM', 'Strength foundations', 'Technique-led studio training', '45 MIN']],
    [['8:30 AM', 'Weekend movement', 'A relaxed group session', '45 MIN'], ['10:00 AM', 'Mobility and reset', 'Gentle movement and stretching', '30 MIN'], ['11:30 AM', 'Coaching conversation', 'Discuss your next training step', 'BY REQUEST']]
  ];
  const dayButtons = $$('.schedule-tabs button');
  wireTabs(dayButtons, index => {
    setActiveTab(dayButtons, index);
    const panel = $('#schedule-panel');
    panel.replaceChildren(...schedules[index].map(([time, title, detail, duration]) => {
      const row = document.createElement('div'); row.className = 'class-row';
      const clock = document.createElement('time'); clock.textContent = time;
      const copy = document.createElement('div');
      const heading = document.createElement('h3'); heading.textContent = title;
      const sub = document.createElement('p'); sub.textContent = detail;
      copy.append(heading, sub);
      const length = document.createElement('span'); length.textContent = duration;
      row.append(clock, copy, length); return row;
    }));
    panel.setAttribute('aria-labelledby', dayButtons[index].id);
  }, false);

  // One selection state connects the package cards, form picker and enquiry.
  const membershipDetails = {
    Monthly: { amount: 1499, price: '₹1,499', duration: '1 month', description: 'A flexible start to your studio routine.' },
    Quarterly: { amount: 3999, price: '₹3,999', duration: '3 months', description: 'Give your new routine room to grow.' },
    Annual: { amount: 12999, price: '₹12,999', duration: '1 year', description: 'A longer-term home for your training.' }
  };
  const planSelect = $('#enquiry-plan');
  const formPackageButtons = $$('[data-form-plan]');
  const cardButtons = $$('.select-plan');
  const originalPlanLabels = new Map(cardButtons.map(button => [button, $('.plan-button-label', button).textContent]));
  function reflectPlan() {
    if (!membershipDetails[planSelect.value]) planSelect.value = 'Not sure yet';
    const plan = membershipDetails[planSelect.value];
    $$('[data-plan-card]').forEach(card => card.classList.toggle('selected', card.dataset.planCard === planSelect.value));
    $$('[data-compare-plan]').forEach(row => row.classList.toggle('selected', row.dataset.comparePlan === planSelect.value));
    cardButtons.forEach(button => {
      const selected = button.dataset.plan === planSelect.value;
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-controls', 'enquiry-form');
      $('.plan-button-label', button).textContent = selected ? (button.classList.contains('compare-plan-select') ? 'Selected' : 'Selected · continue') : originalPlanLabels.get(button);
    });
    formPackageButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.formPlan === planSelect.value));
      button.setAttribute('aria-controls', 'selected-plan-summary');
    });
    $('#selected-plan-summary').classList.toggle('has-selection', !!plan);
    $('#selected-plan-label').textContent = plan ? 'SELECTED PACKAGE' : 'YOUR STARTING POINT';
    $('#selected-plan-name').textContent = plan ? planSelect.value : 'Help me choose';
    $('#selected-plan-description').textContent = plan ? plan.description : 'Explore a package below, or tell us what you’re looking for.';
    $('#selected-plan-price').textContent = plan ? plan.price : '';
    $('#selected-plan-period').textContent = plan ? `for ${plan.duration}` : '';
    $('#selected-plan-price-block').hidden = !plan;
    $('#form-package-picker').hidden = false;
    $('#plan-fallback-label').hidden = true;
    planSelect.tabIndex = -1;
  }
  function choosePlan(value, moveToForm = false) {
    planSelect.value = membershipDetails[value] ? value : 'Not sure yet';
    reflectPlan();
    clearPreview();
    if (moveToForm) {
      $('#enquiry-form').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      $('#enquiry-form input[name="name"]').focus({ preventScroll: true });
    }
  }
  cardButtons.forEach(button => button.addEventListener('click', () => choosePlan(button.dataset.plan, true)));
  formPackageButtons.forEach(button => button.addEventListener('click', () => choosePlan(button.dataset.formPlan)));
  planSelect.addEventListener('change', () => { reflectPlan(); clearPreview(); });
  reflectPlan();

  // Optional live endpoint. The default makes a local preview and never sends data.
  const form = $('#enquiry-form');
  const nameInput = $('input[name="name"]', form);
  const phoneInput = $('input[name="phone"]', form);
  const result = $('#form-result');
  const resultMessage = $('#form-result-message');
  const downloadButton = $('#download-enquiry');
  const submit = $('.form-submit');
  const endpoint = typeof config.enquiryEndpoint === 'string' ? config.enquiryEndpoint.trim() : '';
  let preparedEnquiry = null;
  function clearPreview() {
    preparedEnquiry = null;
    result.hidden = true;
    result.classList.remove('error');
    downloadButton.hidden = true;
  }
  form.addEventListener('input', clearPreview);
  form.addEventListener('change', clearPreview);
  // Keep the mobile enquiry bar away from the form and the on-screen keyboard.
  form.addEventListener('focusin', () => document.body.classList.add('is-editing-form'));
  form.addEventListener('focusout', () => window.setTimeout(() => {
    document.body.classList.toggle('is-editing-form', form.contains(document.activeElement));
  }, 0));
  if (endpoint) {
    $('#form-demo-note').textContent = 'Choose a package and share a little about yourself so the studio can follow up.';
    $('#form-delivery-note').textContent = 'Membership enquiry · No payment is collected here.';
    $('.form-title > span').textContent = 'MEMBERSHIP ENQUIRY';
    $('#submit-label').textContent = 'Send my enquiry';
    $('.consent span').textContent = 'I agree that the studio may contact me about this enquiry.';
  }
  nameInput.addEventListener('input', () => nameInput.setCustomValidity(''));
  phoneInput.addEventListener('input', () => phoneInput.setCustomValidity(''));
  function showResult(message, error = false) {
    result.hidden = false;
    result.classList.toggle('error', error);
    resultMessage.textContent = message;
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled) return;
    downloadButton.hidden = true;
    nameInput.setCustomValidity(nameInput.value.trim() ? '' : 'Please enter your name.');
    const phone = phoneInput.value.trim();
    const digitCount = phone.replace(/\D/g, '').length;
    phoneInput.setCustomValidity(/^[+()\d\s-]+$/.test(phone) && digitCount >= 10 && digitCount <= 15 ? '' : 'Please enter a valid mobile number with 10 to 15 digits.');
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const packageDetails = membershipDetails[planSelect.value] || null;
    const enquiry = {
      name: String(values.get('name') || '').trim(), phone,
      email: String(values.get('email') || '').trim(),
      interest: String(values.get('interest') || ''),
      goal: String(values.get('goal') || ''),
      experience: String(values.get('experience') || ''),
      preferredTime: String(values.get('preferredTime') || 'Flexible'),
      plan: planSelect.value,
      packagePrice: packageDetails ? packageDetails.amount : null,
      packageDuration: packageDetails ? packageDetails.duration : null,
      currency: packageDetails ? 'INR' : null,
      message: String(values.get('message') || '').trim(), consent: true
    };
    if (!endpoint) {
      preparedEnquiry = enquiry;
      showResult(`${packageDetails ? `Your ${enquiry.plan.toLowerCase()} package enquiry` : 'Your enquiry'} summary is ready. This preview has not sent your details or booked an appointment.`);
      downloadButton.hidden = false;
      return;
    }
    submit.disabled = true;
    $('#submit-label').textContent = 'Sending…';
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), Number(config.requestTimeoutMs) || 20000);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(enquiry), signal: controller.signal, credentials: 'omit' });
      if (!response.ok) throw new Error('server');
      const receipt = await response.json();
      if (receipt.success !== true) throw new Error('receipt');
      showResult('Your enquiry has been received. The studio can follow up with you about your training options.');
      preparedEnquiry = null;
      form.reset(); reflectPlan();
      $('#enquiry-goal').value = '';
      $('#enquiry-experience').value = '';
      $('#training-preference-summary').hidden = true;
    } catch (error) {
      showResult(error.name === 'AbortError' ? 'The request took too long. Your details are still in the form; please try again.' : 'We could not confirm delivery. Your details are still in the form; please try again.', true);
    } finally {
      window.clearTimeout(timer);
      submit.disabled = false;
      $('#submit-label').textContent = 'Send my enquiry';
    }
  });
  downloadButton.addEventListener('click', () => {
    if (!preparedEnquiry) return;
    const e = preparedEnquiry;
    const text = ['FORM LADIES FITNESS STUDIO — ENQUIRY PREVIEW', '', 'This is a local demo summary. It has not been sent and does not confirm an appointment.', '', `Name: ${e.name}`, `Phone: ${e.phone}`, `Email: ${e.email || 'Not provided'}`, `Training goal: ${e.goal || 'Not provided'}`, `Experience: ${e.experience || 'Not provided'}`, `Interested in: ${e.interest}`, `Preferred training time: ${e.preferredTime}`, `Membership: ${e.plan}`, `Sample package price: ${e.packagePrice === null ? 'Not selected' : `INR ${e.packagePrice}`}`, `Package duration: ${e.packageDuration || 'Not selected'}`, '', 'Message:', e.message || 'No additional message.'].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'FORM-Membership-Enquiry.txt';
    document.body.append(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  function reflectTrainingPreferences() {
    const goal = $('#enquiry-goal').value;
    const experience = $('#enquiry-experience').value;
    $('#training-preference-summary').hidden = !goal;
    $('#training-preference-goal').textContent = goal;
    $('#training-preference-details').textContent = `${experience} · ${$('select[name="preferredTime"]', form).value}`;
  }
  $('select[name="preferredTime"]', form).addEventListener('change', reflectTrainingPreferences);
  // A small bridge allows the training finder to fill preferences without
  // touching personal details, membership state or the enquiry delivery flow.
  window.FORM_UI = Object.freeze({
    applyTrainingPreferences(preferences) {
      $('select[name="interest"]', form).value = preferences.interest;
      $('select[name="preferredTime"]', form).value = preferences.preferredTime;
      $('#enquiry-goal').value = preferences.goal;
      $('#enquiry-experience').value = preferences.experience;
      reflectTrainingPreferences();
      clearPreview();
      form.scrollIntoView({ behavior: reducedMotion || document.body.classList.contains('motion-off') ? 'auto' : 'smooth', block: 'start' });
      nameInput.focus({ preventScroll: true });
    }
  });
  $('#copyright-year').textContent = String(new Date().getFullYear());
})();
