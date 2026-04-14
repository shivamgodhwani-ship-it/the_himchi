/* ===== FEATURED DATA ===== */
const featuredData = {
  momos: [
    { emoji:'🥟', name:'Tandoori Momos',   desc:'Smoky & char-grilled',  price:'₹149' },
    { emoji:'🥟', name:'Steamed Momos',    desc:'Soft & classic',        price:'₹109' },
    { emoji:'🥟', name:'Fried Momos',      desc:'Golden & crispy',       price:'₹129' },
    { emoji:'🥟', name:'Chilli Momos',     desc:'Fiery gravy toss',      price:'₹139' },
  ],
  noodles: [
    { emoji:'🍜', name:'Garlic Noodles',   desc:'Wok-fired bold',        price:'₹129' },
    { emoji:'🍜', name:'Schezwan Noodles', desc:'Fiery & saucy',         price:'₹139' },
    { emoji:'🍜', name:'Hakka Noodles',    desc:'Street classic',        price:'₹119' },
    { emoji:'🍜', name:'Veg Chow Mein',    desc:'Loaded veggies',        price:'₹119' },
  ],
  shakes: [
    { emoji:'🍫', name:'Chocolate Shake',  desc:'Thick & indulgent',     price:'₹119' },
    { emoji:'🍓', name:'Strawberry Shake', desc:'Fresh & fruity',        price:'₹109' },
    { emoji:'🥭', name:'Mango Shake',      desc:'Summer special',        price:'₹109' },
    { emoji:'🍌', name:'Banana Shake',     desc:'Creamy & smooth',       price:'₹99'  },
  ],
  beverages: [
    { emoji:'🧋', name:'Iced Tea',         desc:'Refreshing & light',    price:'₹89'  },
    { emoji:'🍋', name:'Lemonade',         desc:'Tangy & cool',          price:'₹79'  },
    { emoji:'☕', name:'Cold Coffee',      desc:'Iced & strong',         price:'₹99'  },
    { emoji:'🥤', name:'Mojito',           desc:'Minty & fizzy',         price:'₹99'  },
  ]
};

const CATS = ['momos', 'noodles', 'shakes', 'beverages'];
let currentCat = 'momos';
let autoTimer = null;

function renderFeaturedItems(cat) {
  const container = document.getElementById('featuredItems');
  container.classList.add('fade');
  setTimeout(() => {
    container.innerHTML = featuredData[cat].map(item => `
      <div class="feat-card">
        <div class="feat-emoji">${item.emoji}</div>
        <h4>${item.name}</h4>
        <p>${item.desc}</p>
        <p style="color:var(--accent);font-weight:600;margin-top:6px;font-size:13px">${item.price}</p>
      </div>
    `).join('');
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

/* ===== DARK MODE ===== */
function toggleDark() {
  document.body.classList.toggle('light');
  document.getElementById('darkToggle').textContent =
    document.body.classList.contains('light') ? '🌑' : '🌙';
  localStorage.setItem('himchi-theme', document.body.classList.contains('light') ? 'light' : 'dark');
}

/* ===== MOBILE MENU ===== */
function toggleMenu() {
  document.getElementById('navMenu').classList.toggle('open');
}
// close menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navMenu').classList.remove('open');
  });
});

/* ===== SMOOTH SCROLL + ACTIVE NAV ===== */
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

const allSections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  allSections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
  });
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
  // scrolled navbar style
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 80);
});

/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // stagger siblings
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 100);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ===== STATS COUNTER ANIMATION ===== */
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.stat-num').forEach(el => animateCounter(el));
    statObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) statObserver.observe(statsBar);

function animateCounter(el) {
  const target  = parseFloat(el.dataset.target);
  const suffix  = el.dataset.suffix || '';
  const decimal = el.dataset.decimal === 'true';
  const duration = 1800;
  let start = null;

  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value = eased * target;
    el.textContent = (decimal ? value.toFixed(1) : Math.floor(value).toLocaleString()) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ===== MODAL ===== */
function openModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  // set min date to today
  const dateInput = document.getElementById('date');
  if (!dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
}
function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.body.style.overflow = '';
}
function handleOverlay(e) {
  if (e.target === document.getElementById('modal')) closeModal();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ===== FORM SUBMIT ===== */
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
      el.addEventListener('input', () => {
        el.style.borderColor = '';
        el.classList.remove('shake');
      }, { once: true });
      hasError = true;
    }
  });
  if (hasError) return;

  const formattedDate = new Date(date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
  const formattedTime = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });

  const msg = [
    'Hello Himchi! 🥟',
    '',
    '🗓 New Table Reservation',
    `👤 Name: ${name}`,
    `📅 Date: ${formattedDate}`,
    `⏰ Time: ${formattedTime}`,
    `👥 Guests: ${guests}`,
    '',
    'Please confirm the booking. Thank you!'
  ].join('%0A');

  window.open(`https://wa.me/917042377168?text=${msg}`, '_blank');
  closeModal();
}

/* ===== LOADER ===== */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
  }, 900);
});

/* ===== RESTORE THEME ===== */
if (localStorage.getItem('himchi-theme') === 'light') {
  document.body.classList.add('light');
  const btn = document.getElementById('darkToggle');
  if (btn) btn.textContent = '🌑';
}

/* ===== INIT ===== */
renderFeaturedItems(currentCat);
startAutoRotate();
// fix tab onclick to reset timer on click
document.querySelectorAll('.tab-btn').forEach(btn => {
  const cat = btn.getAttribute('data-cat');
  btn.setAttribute('onclick', `onTabClick('${cat}',this)`);
});
