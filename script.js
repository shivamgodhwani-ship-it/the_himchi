
function updateCarousel(animate = true) {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const cards = track.querySelectorAll('.menu-card');
  const cpv = getCardsPerView();
  const maxIndex = Math.max(0, cards.length - cpv);
  carouselIndex = Math.max(0, Math.min(carouselIndex, maxIndex));
  const offset = carouselIndex * getCardWidth();
  track.style.transition = animate ? 'transform .45s cubic-bezier(.25,.8,.25,1)' : 'none';
  track.style.transform = `translateX(-${offset}px)`;
  updateCarouselDots(maxIndex);
}

function updateCarouselDots(maxIndex) {
  const dotsContainer = document.getElementById('carouselDots');
  if (!dotsContainer) return;
  const count = maxIndex + 1;
  if (dotsContainer.children.length !== count) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === carouselIndex ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.onclick = () => { carouselIndex = i; updateCarousel(); };
      dotsContainer.appendChild(dot);
    }
  } else {
    [...dotsContainer.children].forEach((d, i) => d.classList.toggle('active', i === carouselIndex));
  }
}

function shiftCarousel(dir) {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const cards = track.querySelectorAll('.menu-card');
  const cpv = getCardsPerView();
  const maxIndex = Math.max(0, cards.length - cpv);
  carouselIndex = Math.max(0, Math.min(carouselIndex + dir, maxIndex));
  updateCarousel();
}

/* Set card widths based on viewport */
function resizeCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const viewport = track.parentElement;
  const vw = viewport.offsetWidth;
  const cpv = getCardsPerView();
  const gap = 20;
  const cardW = Math.floor((vw - gap * (cpv - 1)) / cpv);
  track.querySelectorAll('.menu-card').forEach(c => {
    c.style.width = cardW + 'px';
    c.style.minWidth = cardW + 'px';
  });
  updateCarousel(false);
}

/* Touch/swipe for carousel */
let touchStartX = 0;
let touchEndX = 0;
function initCarouselSwipe() {
  const viewport = document.querySelector('.carousel-viewport');
  if (!viewport) return;
  viewport.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  viewport.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) shiftCarousel(diff > 0 ? 1 : -1);
  }, { passive: true });
}

/* ================================================================
   DARK MODE
   ================================================================ */
function toggleDark() {
  document.body.classList.toggle('light');
  document.getElementById('darkToggle').textContent =
    document.body.classList.contains('light') ? '🌑' : '🌙';
  localStorage.setItem('himchi-theme', document.body.classList.contains('light') ? 'light' : 'dark');
}
if (localStorage.getItem('himchi-theme') === 'light') {
  document.body.classList.add('light');
  const btn = document.getElementById('darkToggle');
  if (btn) btn.textContent = '🌑';
}

/* ================================================================
   MOBILE MENU
   ================================================================ */
function toggleMenu() {
  const menu     = document.getElementById('navMenu');
  const burger   = document.getElementById('burger');
  const backdrop = document.getElementById('menuBackdrop');
  menu.classList.toggle('open');
  burger.classList.toggle('open');
  backdrop.classList.toggle('show');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href   = link.getAttribute('href');
    const target = document.querySelector(href);
    const menu   = document.getElementById('navMenu');
    if (menu.classList.contains('open')) {
      toggleMenu();
      setTimeout(() => { if (target) target.scrollIntoView({ behavior:'smooth' }); }, 320);
    } else {
      if (target) target.scrollIntoView({ behavior:'smooth' });
    }
  });
});

/* ================================================================
   ACTIVE NAV + SCROLLED
   ================================================================ */
const allSections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  allSections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 160) current = sec.id; });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 80);
  updateMascotBySection(current);
}, { passive: true });

/* ================================================================
   REVEAL ON SCROLL
   ================================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
    const idx = siblings.indexOf(entry.target);
    setTimeout(() => entry.target.classList.add('visible'), idx * 120);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ================================================================
   STATS COUNTER
   ================================================================ */
let statsAnimated = false;
const statsBar = document.querySelector('.stats-bar');
if (statsBar) {
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !statsAnimated) {
      statsAnimated = true;
      statsBar.querySelectorAll('.stat-num').forEach(animateCounter);
    }
  }, { threshold: 0.5 }).observe(statsBar);
}
function animateCounter(el) {
  const target  = parseFloat(el.dataset.target);
  const suffix  = el.dataset.suffix || '';
  const decimal = el.dataset.decimal === 'true';
  const duration = 1600;
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const v = (1 - Math.pow(1 - p, 3)) * target;
    el.textContent = (decimal ? v.toFixed(1) : Math.floor(v).toLocaleString()) + suffix;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = (decimal ? target.toFixed(1) : target.toLocaleString()) + suffix;
  }
  requestAnimationFrame(step);
}

/* ================================================================
   MASCOT — Section-aware expressions + Animations
   ================================================================ */
const mascot       = document.getElementById('mascot');
const speechBubble = document.getElementById('speechBubble');
let lastScrollY    = window.scrollY;
let wobbleTimer    = null;
let isWobbling     = false;
let bubbleTimer    = null;
let bubbleIdx      = 0;
let currentSection = '';

/* Expression configs per section */
const sectionExpressions = {
  hero: {
    eyes: `
      <path d="M30,75 Q39,69 48,75" fill="none" stroke="#2a1f14" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M52,75 Q61,69 70,75" fill="none" stroke="#2a1f14" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M32,68 Q39,65 46,68" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M54,68 Q61,65 68,68" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>`,
    mouth: `<path d="M37,96 Q50,106 63,96" fill="none" stroke="#2a1f14" stroke-width="2.8" stroke-linecap="round"/>`,
    msg: 'Welcome to Himchi! 🥟'
  },
  menu: {
    eyes: `
      <!-- Hungry eyes — wide open -->
      <circle cx="38" cy="73" r="7" fill="#2a1f14"/>
      <circle cx="62" cy="73" r="7" fill="#2a1f14"/>
      <circle cx="40" cy="71" r="2.5" fill="white"/>
      <circle cx="64" cy="71" r="2.5" fill="white"/>
      <path d="M32,66 Q39,63 46,66" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M54,66 Q61,63 68,66" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>`,
    mouth: `
      <path d="M37,97 Q50,108 63,97" fill="#2a1f14" stroke="#2a1f14" stroke-width="2" stroke-linecap="round"/>
      <path d="M38,97 Q50,104 62,97" fill="#e8c080" stroke="none"/>`,
    msg: 'These momos are calling you! 😋'
  },
  about: {
    eyes: `
      <!-- Warm crinkle eyes — squinting with joy -->
      <path d="M29,74 Q38,66 47,74" fill="none" stroke="#2a1f14" stroke-width="4" stroke-linecap="round"/>
      <path d="M53,74 Q62,66 71,74" fill="none" stroke="#2a1f14" stroke-width="4" stroke-linecap="round"/>
      <path d="M32,68 Q39,65 46,68" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M54,68 Q61,65 68,68" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>`,
    mouth: `<path d="M36,95 Q50,107 64,95" fill="none" stroke="#2a1f14" stroke-width="3" stroke-linecap="round"/>`,
    msg: 'We make every bite count! 🏮'
  },
  experience: {
    eyes: `
      <!-- Starry eyes — excited -->
      <text x="27" y="78" font-size="16" fill="#2a1f14">✨</text>
      <text x="50" y="78" font-size="16" fill="#2a1f14">✨</text>`,
    mouth: `<path d="M37,96 Q50,106 63,96" fill="none" stroke="#2a1f14" stroke-width="2.8" stroke-linecap="round"/>`,
    msg: 'The vibe is everything! ✨'
  },
  testimonials: {
    eyes: `
      <!-- Proud eyes -->
      <circle cx="38" cy="73" r="6.5" fill="#2a1f14"/>
      <circle cx="62" cy="73" r="6.5" fill="#2a1f14"/>
      <circle cx="40" cy="71" r="2.2" fill="white"/>
      <circle cx="64" cy="71" r="2.2" fill="white"/>
      <path d="M32,67 Q39,64 46,67" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M54,67 Q61,64 68,67" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>`,
    mouth: `<path d="M37,96 Q50,106 63,96" fill="none" stroke="#2a1f14" stroke-width="2.8" stroke-linecap="round"/>`,
    msg: 'Our guests love us! ⭐'
  },
  gallery: {
    eyes: `
      <!-- Surprised eyes -->
      <circle cx="38" cy="73" r="8" fill="#2a1f14"/>
      <circle cx="62" cy="73" r="8" fill="#2a1f14"/>
      <circle cx="40.5" cy="70.5" r="3" fill="white"/>
      <circle cx="64.5" cy="70.5" r="3" fill="white"/>
      <path d="M30,65 Q38,61 46,65" fill="none" stroke="#2a1f14" stroke-width="2" stroke-linecap="round"/>
      <path d="M54,65 Q62,61 70,65" fill="none" stroke="#2a1f14" stroke-width="2" stroke-linecap="round"/>`,
    mouth: `<ellipse cx="50" cy="99" rx="9" ry="6" fill="#2a1f14"/>`,
    msg: 'Wow, pretty moments! 📸'
  },
  contact: {
    eyes: `
      <!-- Heart eyes! -->
      <text x="26" y="80" font-size="15" fill="#f3703a">♥</text>
      <text x="50" y="80" font-size="15" fill="#f3703a">♥</text>
      <path d="M32,68 Q39,65 46,68" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M54,68 Q61,65 68,68" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>`,
    mouth: `<path d="M36,95 Q50,108 64,95" fill="none" stroke="#2a1f14" stroke-width="3.2" stroke-linecap="round"/>`,
    msg: 'Come visit us! We miss you 🧡'
  }
};

function setMascotExpression(section) {
  const expr = sectionExpressions[section] || sectionExpressions.hero;
  const eyeGroup   = document.getElementById('eyeGroup');
  const mouthGroup = document.getElementById('mouthGroup');
  if (eyeGroup)   eyeGroup.innerHTML   = expr.eyes;
  if (mouthGroup) mouthGroup.innerHTML = expr.mouth;
}

function updateMascotBySection(section) {
  if (section === currentSection) return;
  currentSection = section;
  setMascotExpression(section);

  // Show bubble with section message
  const expr = sectionExpressions[section];
  if (expr) {
    speechBubble.textContent = expr.msg;
    speechBubble.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => speechBubble.classList.remove('show'), 2600);
  }
}

/* Scroll wobble */
window.addEventListener('scroll', () => {
  const delta = Math.abs(window.scrollY - lastScrollY);
  lastScrollY = window.scrollY;
  if (delta > 10 && !isWobbling) {
    isWobbling = true;
    mascot.classList.add('wobble');
    clearTimeout(wobbleTimer);
    wobbleTimer = setTimeout(() => {
      mascot.classList.remove('wobble');
      isWobbling = false;
    }, 500);
  }
}, { passive: true });

/* Click messages */
const clickMessages = [
  'Satisfy Your Tongue! 🍜',
  'Reserve a table? 🗓️',
  'Best momos in town! 😋',
  'Come, eat, vibe! ✨',
  'You look hungry! 🧡',
  'Open till 11 PM! 🌙',
];

function mascotClick() {
  mascot.classList.remove('clicked');
  void mascot.offsetWidth;
  mascot.classList.add('clicked');
  setTimeout(() => mascot.classList.remove('clicked'), 450);

  speechBubble.textContent = clickMessages[bubbleIdx % clickMessages.length];
  bubbleIdx++;
  speechBubble.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => speechBubble.classList.remove('show'), 2800);
}

/* Excited jump when modal opens */
function mascotExcited() {
  mascot.classList.remove('excited');
  void mascot.offsetWidth;
  mascot.classList.add('excited');
  setTimeout(() => mascot.classList.remove('excited'), 1300);
  // heart eyes
  const eyeGroup = document.getElementById('eyeGroup');
  if (eyeGroup) {
    eyeGroup.innerHTML = `
      <text x="26" y="80" font-size="15" fill="#f3703a">♥</text>
      <text x="50" y="80" font-size="15" fill="#f3703a">♥</text>`;
    setTimeout(() => setMascotExpression(currentSection || 'hero'), 1500);
  }
  speechBubble.textContent = 'Yay! Let me set the table! 🥟';
  speechBubble.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => speechBubble.classList.remove('show'), 2800);
}

/* ================================================================
   MODAL
   ================================================================ */
function openModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  const d = document.getElementById('date');
  if (d && !d.value) d.min = new Date().toISOString().split('T')[0];
  mascotExcited();
}
function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.body.style.overflow = '';
}
function handleOverlay(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ================================================================
   FORM SUBMIT
   ================================================================ */
function submitForm() {
  const name   = document.getElementById('name').value.trim();
  const date   = document.getElementById('date').value;
  const time   = document.getElementById('time').value;
  const guests = document.getElementById('guests').value;
  let hasError = false;
  ['name','date','time'].forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
      el.style.borderColor = '#e53e3e';
      el.classList.remove('shake');
      void el.offsetWidth;
      el.classList.add('shake');
      el.addEventListener('input', () => { el.style.borderColor = ''; el.classList.remove('shake'); }, { once: true });
      hasError = true;
    }
  });
  if (hasError) return;
  const fd = new Date(date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
  const ft = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  const msg = ['Hello Himchi! 🥟','','🗓 New Reservation',`👤 Name: ${name}`,`📅 Date: ${fd}`,`⏰ Time: ${ft}`,`👥 Guests: ${guests}`,'','Please confirm. Thank you!'].join('%0A');
  window.open(`https://wa.me/917042377168?text=${msg}`, '_blank');
  closeModal();
}

/* ================================================================
   LOADER
   ================================================================ */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 850);
});

/* ================================================================
   INIT
   ================================================================ */
window.addEventListener('DOMContentLoaded', () => {
  resizeCarousel();
  initCarouselSwipe();
  setMascotExpression('hero');

  // Auto-rotate Must Try carousel every 5 seconds
  setInterval(() => {
    shiftCarousel(1);
  }, 5000);
});

window.addEventListener('resize', () => {
  resizeCarousel();
});
This adds the carousel auto-rotate inside the existing DOMContentLoaded event so the photos rotate every 5 seconds automatically.

>
ok and can u add that when we click reserve than mascot comes forward and helps in reservation 

I updated your script.js to make the mascot do an excited jump and show a message when the Reserve button is clicked.

This happens inside the openModal() function, so when you click Reserve, the mascot animation triggers and shows a helpful message.

/* ============================================================
   HIMCHI — script.js  (Upgraded)
   ============================================================ */

/* ================================================================
   CAROUSEL — Must Try
   ================================================================ */
let carouselIndex = 0;
const CARDS_PER_VIEW_BREAKPOINTS = [
  { maxWidth: 480,  count: 1 },
  { maxWidth: 768,  count: 2 },
  { maxWidth: 1024, count: 3 },
  { maxWidth: Infinity, count: 4 }
];

function getCardsPerView() {
  const w = window.innerWidth;
  for (const bp of CARDS_PER_VIEW_BREAKPOINTS) {
    if (w <= bp.maxWidth) return bp.count;
  }
  return 4;
}

function getCardWidth() {
  const track = document.getElementById('carouselTrack');
  if (!track) return 0;
  const card = track.querySelector('.menu-card');
  if (!card) return 0;
  const gap = 20;
  return card.offsetWidth + gap;
}

function updateCarousel(animate = true) {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const cards = track.querySelectorAll('.menu-card');
  const cpv = getCardsPerView();
  const maxIndex = Math.max(0, cards.length - cpv);
  carouselIndex = Math.max(0, Math.min(carouselIndex, maxIndex));
  const offset = carouselIndex * getCardWidth();
  track.style.transition = animate ? 'transform .45s cubic-bezier(.25,.8,.25,1)' : 'none';
  track.style.transform = `translateX(-${offset}px)`;
  updateCarouselDots(maxIndex);
}

function updateCarouselDots(maxIndex) {
  const dotsContainer = document.getElementById('carouselDots');
  if (!dotsContainer) return;
  const count = maxIndex + 1;
  if (dotsContainer.children.length !== count) {
    dotsContainer.innerHTML = '';
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === carouselIndex ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.onclick = () => { carouselIndex = i; updateCarousel(); };
      dotsContainer.appendChild(dot);
    }
  } else {
    [...dotsContainer.children].forEach((d, i) => d.classList.toggle('active', i === carouselIndex));
  }
}

function shiftCarousel(dir) {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const cards = track.querySelectorAll('.menu-card');
  const cpv = getCardsPerView();
  const maxIndex = Math.max(0, cards.length - cpv);
  carouselIndex = Math.max(0, Math.min(carouselIndex + dir, maxIndex));
  updateCarousel();
}

/* Set card widths based on viewport */
function resizeCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const viewport = track.parentElement;
  const vw = viewport.offsetWidth;
  const cpv = getCardsPerView();
  const gap = 20;
  const cardW = Math.floor((vw - gap * (cpv - 1)) / cpv);
  track.querySelectorAll('.menu-card').forEach(c => {
    c.style.width = cardW + 'px';
    c.style.minWidth = cardW + 'px';
  });
  updateCarousel(false);
}

/* Touch/swipe for carousel */
let touchStartX = 0;
let touchEndX = 0;
function initCarouselSwipe() {
  const viewport = document.querySelector('.carousel-viewport');
  if (!viewport) return;
  viewport.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  viewport.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) shiftCarousel(diff > 0 ? 1 : -1);
  }, { passive: true });
}

/* ================================================================
   DARK MODE
   ================================================================ */
function toggleDark() {
  document.body.classList.toggle('light');
  document.getElementById('darkToggle').textContent =
    document.body.classList.contains('light') ? '🌑' : '🌙';
  localStorage.setItem('himchi-theme', document.body.classList.contains('light') ? 'light' : 'dark');
}
if (localStorage.getItem('himchi-theme') === 'light') {
  document.body.classList.add('light');
  const btn = document.getElementById('darkToggle');
  if (btn) btn.textContent = '🌑';
}

/* ================================================================
   MOBILE MENU
   ================================================================ */
function toggleMenu() {
  const menu     = document.getElementById('navMenu');
  const burger   = document.getElementById('burger');
  const backdrop = document.getElementById('menuBackdrop');
  menu.classList.toggle('open');
  burger.classList.toggle('open');
  backdrop.classList.toggle('show');
  document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
}
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href   = link.getAttribute('href');
    const target = document.querySelector(href);
    const menu   = document.getElementById('navMenu');
    if (menu.classList.contains('open')) {
      toggleMenu();
      setTimeout(() => { if (target) target.scrollIntoView({ behavior:'smooth' }); }, 320);
    } else {
      if (target) target.scrollIntoView({ behavior:'smooth' });
    }
  });
});

/* ================================================================
   ACTIVE NAV + SCROLLED
   ================================================================ */
const allSections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  allSections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 160) current = sec.id; });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 80);
  updateMascotBySection(current);
}, { passive: true });

/* ================================================================
   REVEAL ON SCROLL
   ================================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
    const idx = siblings.indexOf(entry.target);
    setTimeout(() => entry.target.classList.add('visible'), idx * 120);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ================================================================
   STATS COUNTER
   ================================================================ */
let statsAnimated = false;
const statsBar = document.querySelector('.stats-bar');
if (statsBar) {
  new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !statsAnimated) {
      statsAnimated = true;
      statsBar.querySelectorAll('.stat-num').forEach(animateCounter);
    }
  }, { threshold: 0.5 }).observe(statsBar);
}
function animateCounter(el) {
  const target  = parseFloat(el.dataset.target);
  const suffix  = el.dataset.suffix || '';
  const decimal = el.dataset.decimal === 'true';
  const duration = 1600;
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    const v = (1 - Math.pow(1 - p, 3)) * target;
    el.textContent = (decimal ? v.toFixed(1) : Math.floor(v).toLocaleString()) + suffix;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = (decimal ? target.toFixed(1) : target.toLocaleString()) + suffix;
  }
  requestAnimationFrame(step);
}

/* ================================================================
   MASCOT — Section-aware expressions + Animations
   ================================================================ */
const mascot       = document.getElementById('mascot');
const speechBubble = document.getElementById('speechBubble');
let lastScrollY    = window.scrollY;
let wobbleTimer    = null;
let isWobbling     = false;
let bubbleTimer    = null;
let bubbleIdx      = 0;
let currentSection = '';

/* Expression configs per section */
const sectionExpressions = {
  hero: {
    eyes: `
      <path d="M30,75 Q39,69 48,75" fill="none" stroke="#2a1f14" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M52,75 Q61,69 70,75" fill="none" stroke="#2a1f14" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M32,68 Q39,65 46,68" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M54,68 Q61,65 68,68" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>`,
    mouth: `<path d="M37,96 Q50,106 63,96" fill="none" stroke="#2a1f14" stroke-width="2.8" stroke-linecap="round"/>`,
    msg: 'Welcome to Himchi! 🥟'
  },
  menu: {
    eyes: `
      <!-- Hungry eyes — wide open -->
      <circle cx="38" cy="73" r="7" fill="#2a1f14"/>
      <circle cx="62" cy="73" r="7" fill="#2a1f14"/>
      <circle cx="40" cy="71" r="2.5" fill="white"/>
      <circle cx="64" cy="71" r="2.5" fill="white"/>
      <path d="M32,66 Q39,63 46,66" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M54,66 Q61,63 68,66" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>`,
    mouth: `
      <path d="M37,97 Q50,108 63,97" fill="#2a1f14" stroke="#2a1f14" stroke-width="2" stroke-linecap="round"/>
      <path d="M38,97 Q50,104 62,97" fill="#e8c080" stroke="none"/>`,
    msg: 'These momos are calling you! 😋'
  },
  about: {
    eyes: `
      <!-- Warm crinkle eyes — squinting with joy -->
      <path d="M29,74 Q38,66 47,74" fill="none" stroke="#2a1f14" stroke-width="4" stroke-linecap="round"/>
      <path d="M53,74 Q62,66 71,74" fill="none" stroke="#2a1f14" stroke-width="4" stroke-linecap="round"/>
      <path d="M32,68 Q39,65 46,68" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M54,68 Q61,65 68,68" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>`,
    mouth: `<path d="M36,95 Q50,107 64,95" fill="none" stroke="#2a1f14" stroke-width="3" stroke-linecap="round"/>`,
    msg: 'We make every bite count! 🏮'
  },
  experience: {
    eyes: `
      <!-- Starry eyes — excited -->
      <text x="27" y="78" font-size="16" fill="#2a1f14">✨</text>
      <text x="50" y="78" font-size="16" fill="#2a1f14">✨</text>`,
    mouth: `<path d="M37,96 Q50,106 63,96" fill="none" stroke="#2a1f14" stroke-width="2.8" stroke-linecap="round"/>`,
    msg: 'The vibe is everything! ✨'
  },
  testimonials: {
    eyes: `
      <!-- Proud eyes -->
      <circle cx="38" cy="73" r="6.5" fill="#2a1f14"/>
      <circle cx="62" cy="73" r="6.5" fill="#2a1f14"/>
      <circle cx="40" cy="71" r="2.2" fill="white"/>
      <circle cx="64" cy="71" r="2.2" fill="white"/>
      <path d="M32,67 Q39,64 46,67" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M54,67 Q61,64 68,67" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>`,
    mouth: `<path d="M37,96 Q50,106 63,96" fill="none" stroke="#2a1f14" stroke-width="2.8" stroke-linecap="round"/>`,
    msg: 'Our guests love us! ⭐'
  },
  gallery: {
    eyes: `
      <!-- Surprised eyes -->
      <circle cx="38" cy="73" r="8" fill="#2a1f14"/>
      <circle cx="62" cy="73" r="8" fill="#2a1f14"/>
      <circle cx="40.5" cy="70.5" r="3" fill="white"/>
      <circle cx="64.5" cy="70.5" r="3" fill="white"/>
      <path d="M30,65 Q38,61 46,65" fill="none" stroke="#2a1f14" stroke-width="2" stroke-linecap="round"/>
      <path d="M54,65 Q62,61 70,65" fill="none" stroke="#2a1f14" stroke-width="2" stroke-linecap="round"/>`,
    mouth: `<ellipse cx="50" cy="99" rx="9" ry="6" fill="#2a1f14"/>`,
    msg: 'Wow, pretty moments! 📸'
  },
  contact: {
    eyes: `
      <!-- Heart eyes! -->
      <text x="26" y="80" font-size="15" fill="#f3703a">♥</text>
      <text x="50" y="80" font-size="15" fill="#f3703a">♥</text>
      <path d="M32,68 Q39,65 46,68" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M54,68 Q61,65 68,68" fill="none" stroke="#2a1f14" stroke-width="1.8" stroke-linecap="round"/>`,
    mouth: `<path d="M36,95 Q50,108 64,95" fill="none" stroke="#2a1f14" stroke-width="3.2" stroke-linecap="round"/>`,
    msg: 'Come visit us! We miss you 🧡'
  }
};

function setMascotExpression(section) {
  const expr = sectionExpressions[section] || sectionExpressions.hero;
  const eyeGroup   = document.getElementById('eyeGroup');
  const mouthGroup = document.getElementById('mouthGroup');
  if (eyeGroup)   eyeGroup.innerHTML   = expr.eyes;
  if (mouthGroup) mouthGroup.innerHTML = expr.mouth;
}

function updateMascotBySection(section) {
  if (section === currentSection) return;
  currentSection = section;
  setMascotExpression(section);

  // Show bubble with section message
  const expr = sectionExpressions[section];
  if (expr) {
    speechBubble.textContent = expr.msg;
    speechBubble.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => speechBubble.classList.remove('show'), 2600);
  }
}

/* Scroll wobble */
window.addEventListener('scroll', () => {
  const delta = Math.abs(window.scrollY - lastScrollY);
  lastScrollY = window.scrollY;
  if (delta > 10 && !isWobbling) {
    isWobbling = true;
    mascot.classList.add('wobble');
    clearTimeout(wobbleTimer);
    wobbleTimer = setTimeout(() => {
      mascot.classList.remove('wobble');
      isWobbling = false;
    }, 500);
  }
}, { passive: true });

/* Click messages */
const clickMessages = [
  'Satisfy Your Tongue! 🍜',
  'Reserve a table? 🗓️',
  'Best momos in town! 😋',
  'Come, eat, vibe! ✨',
  'You look hungry! 🧡',
  'Open till 11 PM! 🌙',
];

function mascotClick() {
  mascot.classList.remove('clicked');
  void mascot.offsetWidth;
  mascot.classList.add('clicked');
  setTimeout(() => mascot.classList.remove('clicked'), 450);

  speechBubble.textContent = clickMessages[bubbleIdx % clickMessages.length];
  bubbleIdx++;
  speechBubble.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => speechBubble.classList.remove('show'), 2800);
}

/* Excited jump when modal opens */
function mascotExcited() {
  mascot.classList.remove('excited');
  void mascot.offsetWidth;
  mascot.classList.add('excited');
  setTimeout(() => mascot.classList.remove('excited'), 1300);
  // heart eyes
  const eyeGroup = document.getElementById('eyeGroup');
  if (eyeGroup) {
    eyeGroup.innerHTML = `
      <text x="26" y="80" font-size="15" fill="#f3703a">♥</text>
      <text x="50" y="80" font-size="15" fill="#f3703a">♥</text>`;
    setTimeout(() => setMascotExpression(currentSection || 'hero'), 1500);
  }
  speechBubble.textContent = 'Yay! Let me set the table! 🥟';
  speechBubble.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => speechBubble.classList.remove('show'), 2800);
}

/* ================================================================
   MODAL
   ================================================================ */
function openModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  const d = document.getElementById('date');
  if (d && !d.value) d.min = new Date().toISOString().split('T')[0];

  mascotExcited();  // Mascot comes forward and helps in reservation
}
function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.body.style.overflow = '';
}
function handleOverlay(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ================================================================
   FORM SUBMIT
   ================================================================ */
function submitForm() {
  const name   = document.getElementById('name').value.trim();
  const date   = document.getElementById('date').value;
  const time   = document.getElementById('time').value;
  const guests = document.getElementById('guests').value;
  let hasError = false;
  ['name','date','time'].forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
      el.style.borderColor = '#e53e3e';
      el.classList.remove('shake');
      void el.offsetWidth;
      el.classList.add('shake');
      el.addEventListener('input', () => { el.style.borderColor = ''; el.classList.remove('shake'); }, { once: true });
      hasError = true;
    }
  });
  if (hasError) return;
  const fd = new Date(date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
  const ft = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  const msg = ['Hello Himchi! 🥟','','🗓 New Reservation',`👤 Name: ${name}`,`📅 Date: ${fd}`,`⏰ Time: ${ft}`,`👥 Guests: ${guests}`,'','Please confirm. Thank you!'].join('%0A');
  window.open(`https://wa.me/917042377168?text=${msg}`, '_blank');
  closeModal();
}

/* ================================================================
   LOADER
   ================================================================ */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 850);
});

/* ================================================================
   INIT
   ================================================================ */
window.addEventListener('DOMContentLoaded', () => {
  resizeCarousel();
  initCarouselSwipe();
  setMascotExpression('hero');

  // Auto-rotate Must Try carousel every 5 seconds
  setInterval(() => {
    shiftCarousel(1);
  }, 5000);
});

window.addEventListener('resize', () => {
  resizeCarousel();
});
