/* ============================================================
   HIMCHI — script.js
   ============================================================ */

/* ---- FEATURED DATA (no prices shown) ---- */
const featuredData = {
  momos: [
    { img:'momos.jpg', emoji:'🥟', name:'Tandoori Momos',   desc:'Smoky & char-grilled'    },
    { img:'',          emoji:'🥟', name:'Steamed Momos',    desc:'Soft & classic'           },
    { img:'',          emoji:'🥟', name:'Fried Momos',      desc:'Golden & crispy'          },
    { img:'',          emoji:'🥟', name:'Chilli Momos',     desc:'Fiery gravy toss'         },
  ],
  noodles: [
    { img:'noodles.jpg',emoji:'🍜', name:'Garlic Noodles',   desc:'Wok-fired bold'          },
    { img:'',           emoji:'🍜', name:'Schezwan Noodles', desc:'Fiery & saucy'           },
    { img:'',           emoji:'🍜', name:'Hakka Noodles',    desc:'Street classic'          },
    { img:'',           emoji:'🍜', name:'Veg Chow Mein',    desc:'Loaded veggies'          },
  ],
  shakes: [
    { img:'shake.jpg', emoji:'🍫', name:'Chocolate Shake',  desc:'Thick & indulgent'       },
    { img:'',          emoji:'🍓', name:'Strawberry Shake', desc:'Fresh & fruity'           },
    { img:'',          emoji:'🥭', name:'Mango Shake',      desc:'Summer special'           },
    { img:'',          emoji:'🍌', name:'Banana Shake',     desc:'Creamy & smooth'          },
  ],
  beverages: [
    { img:'drink.jpg', emoji:'🧋', name:'Iced Tea',         desc:'Refreshing & light'      },
    { img:'',          emoji:'🍋', name:'Lemonade',         desc:'Tangy & cool'             },
    { img:'',          emoji:'☕', name:'Cold Coffee',      desc:'Iced & strong'            },
    { img:'',          emoji:'🥤', name:'Mojito',           desc:'Minty & fizzy'            },
  ]
};

const CATS = ['momos','noodles','shakes','beverages'];
let currentCat = 'momos';
let autoTimer = null;

function renderFeaturedItems(cat) {
  const container = document.getElementById('featuredItems');
  container.classList.add('fade');
  setTimeout(() => {
    container.innerHTML = featuredData[cat].map(item => {
      const imgBlock = item.img
        ? `<div class="feat-card-img"><img src="${item.img}" alt="${item.name}" loading="lazy" onerror="this.parentElement.style.display='none';this.parentElement.nextElementSibling.style.display='flex'"></div><div class="feat-card-img-fb" style="display:none">${item.emoji}</div>`
        : `<div class="feat-card-img-fb">${item.emoji}</div>`;
      return `<div class="feat-card">${imgBlock}<h4>${item.name}</h4><p>${item.desc}</p></div>`;
    }).join('');
    container.classList.remove('fade');
  }, 220);
}

function switchTab(cat, btn) {
  currentCat = cat;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const target = btn || document.querySelector(`[data-cat="${cat}"]`);
  if (target) target.classList.add('active');
  renderFeaturedItems(cat);
}

function onTabClick(cat, btn) {
  switchTab(cat, btn);
  startAutoRotate();
}

function startAutoRotate() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => {
    const next = (CATS.indexOf(currentCat) + 1) % CATS.length;
    switchTab(CATS[next]);
  }, 3200);
}

/* ---- DARK MODE ---- */
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

/* ---- MOBILE MENU ---- */
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

/* ---- ACTIVE NAV + SCROLLED CLASS ---- */
const allSections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  allSections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 140) current = sec.id; });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

/* ---- INTERSECTION OBSERVER: SCROLL REVEAL ---- */
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

/* ---- STATS COUNTER ---- */
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

/* ---- CHIBI MOMO MASCOT ---- */
const mascot       = document.getElementById('mascot');
const speechBubble = document.getElementById('speechBubble');
let lastScrollY    = window.scrollY;
let wobbleTimer    = null;
let isWobbling     = false;
let bubbleTimer    = null;
let bubbleIdx      = 0;

const bubbleMessages = [
  'Welcome to Himchi! 🥟',
  'Reserve a table? 🗓️',
  'Best momos in town! 😋',
  'Satisfy Your Tongue! 🍜',
  'You look hungry! 🧡',
  'Come, eat, vibe! ✨',
];

/* Scroll wobble */
window.addEventListener('scroll', () => {
  const delta = Math.abs(window.scrollY - lastScrollY);
  lastScrollY = window.scrollY;
  if (delta > 8 && !isWobbling) {
    isWobbling = true;
    mascot.classList.add('wobble');
    clearTimeout(wobbleTimer);
    wobbleTimer = setTimeout(() => {
      mascot.classList.remove('wobble');
      isWobbling = false;
    }, 500);
  }
}, { passive: true });

/* Click */
mascot.addEventListener('click', () => {
  mascot.classList.remove('clicked');
  void mascot.offsetWidth;
  mascot.classList.add('clicked');
  setTimeout(() => mascot.classList.remove('clicked'), 450);

  speechBubble.textContent = bubbleMessages[bubbleIdx % bubbleMessages.length];
  bubbleIdx++;
  speechBubble.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => speechBubble.classList.remove('show'), 2800);
});

/* ---- MODAL ---- */
function openModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  const d = document.getElementById('date');
  if (!d.value) d.min = new Date().toISOString().split('T')[0];
}
function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.body.style.overflow = '';
}
function handleOverlay(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ---- FORM SUBMIT ---- */
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

/* ---- LOADER ---- */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 850);
});

/* ---- INIT ---- */
renderFeaturedItems(currentCat);
startAutoRotate();
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.setAttribute('onclick', `onTabClick('${btn.dataset.cat}',this)`);
});
