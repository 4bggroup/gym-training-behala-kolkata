/* FORM — visitor-controlled stories and a three-question training finder. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  const canMove = () => !motionPreference.matches && !document.body.classList.contains('motion-off');
  function cancelMotion() { running.forEach(animation => animation.cancel()); running.clear(); }
  function move(element, frames, duration = 520) {
    if (!canMove() || typeof element.animate !== 'function') return;
    const animation = element.animate(frames, { duration, easing: 'cubic-bezier(.22,1,.36,1)' });
    running.add(animation);
    animation.onfinish = animation.oncancel = () => running.delete(animation);
  }
  $('.motion-toggle').addEventListener('click', () => { if (!canMove()) cancelMotion(); });
  motionPreference.addEventListener('change', () => { if (!canMove()) cancelMotion(); });

  // Each story uses a different training photograph. No timer or autoplay.
  const stories = {
    strength: {
      title: 'Strong.', accent: 'Your way.',
      image: 'hero-battle-ropes.webp', focus: '82% center',
      alt: 'An Indian woman training with battle ropes in a black and yellow gym',
      copy: 'Purposeful training, clear coaching and a women-only space to build a routine that feels like yours.',
      caption: 'STRENGTH IS PERSONAL. SO IS OUR APPROACH.'
    },
    movement: {
      title: 'Move.', accent: 'With purpose.',
      image: '06-sled-push.webp', focus: '63% center',
      alt: 'A woman pushing a training sled along the gym floor',
      copy: 'A little effort, a clearer rhythm. Explore functional movement and build a routine around your everyday energy.',
      caption: 'SMALL STEPS. PURPOSEFUL MOVEMENT.'
    },
    together: {
      title: 'Better.', accent: 'Together.',
      image: '10-group-class.webp', focus: '54% center',
      alt: 'Women sharing a lively group training session in the studio',
      copy: 'Bring your own pace to a shared session. Find movement, music and a little encouragement in a women-only studio.',
      caption: 'YOUR PACE. OUR SHARED ENERGY.'
    }
  };
  const hero = $('#home');
  const storyImage = $('#hero-story-image');
  const storyButtons = $$('[data-hero-choice]');
  let requestedStory = 0;
  function commitStory(key, request) {
    if (request !== requestedStory) return;
    const story = stories[key];
    cancelMotion();
    hero.setAttribute('data-hero-story', key);
    hero.style.setProperty('--hero-focus', story.focus);
    storyImage.src = `assets/images/${story.image}`;
    storyImage.alt = story.alt;
    $('.hero-line').textContent = story.title;
    $('.hero-line-accent').textContent = story.accent;
    $('#hero-story-copy').textContent = story.copy;
    $('#hero-story-caption').textContent = story.caption;
    storyButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.heroChoice === key)));
    $('#hero-story-status').textContent = `${key === 'together' ? 'Group training' : key === 'movement' ? 'Movement' : 'Strength'} story selected.`;
    move(storyImage, [
      { clipPath: 'polygon(0 0,13% 0,0 100%,0 100%)', transform: 'scale(1.055)' },
      { clipPath: 'polygon(0 0,100% 0,100% 100%,0 100%)', transform: 'scale(1.025)' }
    ], 620);
    move($('#hero-title'), [{ transform: 'translateX(-12px)', clipPath: 'inset(0 100% 0 0)' }, { transform: 'translateX(0)', clipPath: 'inset(0 0 0 0)' }], 440);
  }
  async function chooseStory(key) {
    if (!stories[key] || hero.dataset.heroStory === key) {
      // Invalidates an image still decoding after another choice.
      requestedStory++;
      return;
    }
    const request = ++requestedStory;
    if (typeof window.Image === 'function') {
      const preload = new window.Image();
      try {
        if (typeof preload.decode === 'function') {
          preload.src = `assets/images/${stories[key].image}`;
          await preload.decode();
        } else {
          await new Promise((resolve, reject) => {
            preload.onload = resolve; preload.onerror = reject;
            preload.src = `assets/images/${stories[key].image}`;
          });
        }
      } catch {
        if (request === requestedStory) $('#hero-story-status').textContent = 'This photograph could not load. Please try another story.';
        return;
      }
    }
    commitStory(key, request);
  }
  storyButtons.forEach((button, index) => {
    button.addEventListener('click', () => chooseStory(button.dataset.heroChoice));
    button.addEventListener('keydown', event => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % storyButtons.length;
      else if (event.key === 'ArrowLeft') next = (index + storyButtons.length - 1) % storyButtons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = storyButtons.length - 1;
      else return;
      event.preventDefault();
      storyButtons[next].focus();
      return chooseStory(storyButtons[next].dataset.heroChoice);
    });
  });
  hero.classList.add('stories-ready');

  const questions = [
    {
      key: 'goal', title: 'What would you like from training?',
      note: 'Choose the direction that feels closest to you.', next: 'Next: your experience',
      options: [
        ['strength', 'Build strength', 'Get comfortable with weights and technique.'],
        ['movement', 'Move more', 'Find purposeful full-body movement.'],
        ['rhythm', 'Enjoy group energy', 'Movement, music and shared effort.'],
        ['unsure', 'Find my starting point', 'I’d like a little guidance first.']
      ]
    },
    {
      key: 'experience', title: 'Where are you starting from?',
      note: 'Every starting point belongs here.', next: 'Next: your time',
      options: [
        ['new', 'New to the gym', 'I’d like to understand the basics.'],
        ['returning', 'Getting back into it', 'I’m ready to find my rhythm again.'],
        ['regular', 'Already training', 'I’m looking for a place to keep progressing.']
      ]
    },
    {
      key: 'time', title: 'When does training fit your day?',
      note: 'Share a preference. Your coach can confirm available session times.', next: 'See my starting point',
      options: [
        ['Morning', 'Morning', 'Start the day with a little movement.'],
        ['Afternoon', 'Afternoon', 'Make room in the middle of your day.'],
        ['Evening', 'Evening', 'A training rhythm after your daily routine.'],
        ['Flexible', 'I’m flexible', 'Let’s find a time that works.']
      ]
    }
  ];
  const programmes = {
    strength: { title: 'Strength foundations.', interest: 'Strength training', image: '04-strength.webp', width: 1122, height: 1402, alt: 'A woman practising a controlled strength exercise with a dumbbell', description: 'Explore the strength area, learn the movements and discuss a training routine built around your goal.' },
    movement: { title: 'Functional movement.', interest: 'Functional fitness', image: '06-sled-push.webp', width: 1672, height: 941, alt: 'A woman pushing a sled along the studio training floor', description: 'Explore a mix of full-body movements and practical coaching cues, with the session adapted to your starting point.' },
    rhythm: { title: 'Group rhythm.', interest: 'Group fitness', image: '10-group-class.webp', width: 1672, height: 941, alt: 'Women moving together during a group studio session', description: 'Explore shared sessions with movement, music and encouragement. Ask the studio which classes fit your interests.' },
    unsure: { title: 'A coached first session.', interest: 'Not sure yet', image: '03-technique-coaching.webp', width: 1122, height: 1402, alt: 'A female coach guiding a trainee through a movement', description: 'Start with a conversation, a tour of the space and a little guided practice. Your coach can help you choose a direction.' }
  };
  const experienceNotes = {
    new: 'Begin with clear demonstrations and space to practise.',
    returning: 'Discuss your current comfort and ease into a manageable routine.',
    regular: 'Share your current routine and the progress you’d like to make.'
  };
  const answers = { goal: '', experience: '', time: '' };
  const previews = ['#finder-goal-preview', '#finder-experience-preview', '#finder-time-preview'];
  const previewFallbacks = ['Choose your goal', 'Your starting point', 'Your daily rhythm'];
  const stops = $$('[data-finder-stop]');
  const panel = $('#finder-question-panel');
  const result = $('#finder-result');
  const options = $('#finder-options');
  let step = 0;
  let showingResult = false;
  function answerLabel(index) {
    const question = questions[index];
    return question.options.find(option => option[0] === answers[question.key])?.[1] || '';
  }
  function reflectRoute() {
    stops.forEach((stop, index) => {
      stop.classList.toggle('is-current', !showingResult && index === step);
      stop.classList.toggle('is-complete', !!answers[questions[index].key]);
      if (!showingResult && index === step) stop.setAttribute('aria-current', 'step');
      else stop.removeAttribute('aria-current');
      $(previews[index]).textContent = answerLabel(index) || previewFallbacks[index];
    });
  }
  function renderQuestion(focus = true) {
    showingResult = false;
    panel.hidden = false;
    result.hidden = true;
    const question = questions[step];
    $('#finder-question-count').textContent = `0${step + 1} / 03`;
    $('#finder-question').textContent = question.title;
    $('#finder-question-note').textContent = question.note;
    $('#finder-next-label').textContent = question.next;
    $('#finder-back').disabled = step === 0;
    $('#finder-next').disabled = !answers[question.key];
    options.replaceChildren(...question.options.map(([value, label, note]) => {
      const button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.className = 'finder-option';
      button.setAttribute('data-finder-value', value);
      button.setAttribute('aria-pressed', String(answers[question.key] === value));
      const heading = document.createElement('strong'); heading.textContent = label;
      const description = document.createElement('span'); description.textContent = note;
      button.append(heading, description);
      button.addEventListener('click', () => {
        answers[question.key] = value;
        $$('button', options).forEach(option => option.setAttribute('aria-pressed', String(option.dataset.finderValue === value)));
        $('#finder-next').disabled = false;
        reflectRoute();
        $('#finder-status').textContent = `${label} selected.`;
      });
      return button;
    }));
    reflectRoute();
    if (focus) {
      $('#finder-question').focus({ preventScroll: true });
      $('#finder-status').textContent = `Question ${step + 1} of 3. ${question.title}`;
    }
  }
  function showResult() {
    const programme = programmes[answers.goal];
    if (!programme || !answers.experience || !answers.time) return;
    showingResult = true;
    panel.hidden = true;
    result.hidden = false;
    const image = $('#finder-result-image');
    image.src = `assets/images/${programme.image}`;
    image.alt = programme.alt;
    image.setAttribute('width', programme.width);
    image.setAttribute('height', programme.height);
    $('#finder-result-title').textContent = programme.title;
    $('#finder-result-description').textContent = `${programme.description} ${experienceNotes[answers.experience]}`;
    $('#finder-result-experience').textContent = answerLabel(1);
    $('#finder-result-time').textContent = answers.time === 'Flexible' ? 'Flexible timing' : `${answers.time} preference`;
    reflectRoute();
    $('#finder-result-title').focus({ preventScroll: true });
    $('#finder-status').textContent = `Your starting point: ${programme.title} Your coach can help confirm the right option.`;
    move($('.finder-result-photo'), [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], 540);
  }
  $('#finder-next').addEventListener('click', () => {
    if (!answers[questions[step].key]) return;
    if (step < questions.length - 1) { step++; renderQuestion(); }
    else showResult();
  });
  $('#finder-back').addEventListener('click', () => { if (step > 0) { step--; renderQuestion(); } });
  $('#finder-edit').addEventListener('click', () => { step = 0; renderQuestion(); });
  $('#finder-apply').addEventListener('click', () => {
    if (!showingResult || !window.FORM_UI) return;
    window.FORM_UI.applyTrainingPreferences({
      goal: answerLabel(0), experience: answerLabel(1),
      interest: programmes[answers.goal].interest, preferredTime: answers.time
    });
    $('#finder-status').textContent = 'Your training preferences were added to the enquiry. Your membership choice and personal details have been kept.';
  });
  $('#finder').classList.add('finder-ready');
  renderQuestion(false);
})();
