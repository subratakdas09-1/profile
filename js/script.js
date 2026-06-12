/* =====================================================
   Dr. Subrata Kumar Das — Portfolio Script
   Particles · Scroll Animations · Nav · Counter · Filter
   ===================================================== */

'use strict';

/* ── 1. Particle Canvas ─────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles, mouse = { x: -9999, y: -9999 };
  const COUNT      = 90;
  const MAX_DIST   = 140;
  const MOUSE_DIST = 120;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x:    randomBetween(0, W),
        y:    randomBetween(0, H),
        vx:   randomBetween(-0.25, 0.25),
        vy:   randomBetween(-0.25, 0.25),
        r:    randomBetween(1.5, 3.5),
        base: randomBetween(0.3, 0.8),
        phase:randomBetween(0, Math.PI * 2),
        speed:randomBetween(0.008, 0.02),
        hue:  Math.random() < 0.7 ? 190 : 160
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // Update & draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      // Mouse repulsion
      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const md  = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < MOUSE_DIST) {
        const force = (MOUSE_DIST - md) / MOUSE_DIST * 0.6;
        p.x += (mdx / md) * force;
        p.y += (mdy / md) * force;
      }

      // Breathing opacity
      const alpha = p.base * (0.6 + 0.4 * Math.sin(t * p.speed + p.phase));
      const isLight = window._currentTheme === 'light';

      // Draw particle — darker dots in light mode for visibility
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = isLight
        ? `hsla(${p.hue}, 80%, 35%, ${alpha * 0.7})`
        : `hsla(${p.hue}, 100%, 75%, ${alpha})`;
      ctx.fill();

      // Lines to nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const q   = particles[j];
        const dx  = p.x - q.x;
        const dy  = p.y - q.y;
        const d   = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          const lineAlpha = (1 - d / MAX_DIST) * (isLight ? 0.12 : 0.2);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = isLight
            ? `hsla(210, 80%, 40%, ${lineAlpha})`
            : `hsla(190, 100%, 70%, ${lineAlpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); createParticles(); });
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  resize();
  createParticles();
  requestAnimationFrame(draw);
})();

/* ── 2. Theme Toggle (Dark / Light) ─────────────────────── */
(function initTheme() {
  const html        = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const STORAGE_KEY = 'skd-portfolio-theme';

  // Load saved preference, else default dark
  const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
  html.setAttribute('data-theme', saved);

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
    // Update particle colours for new theme
    updateParticleTheme(next);
  });

  // Expose for particle system to call
  window._currentTheme = saved;
})();

function updateParticleTheme(theme) {
  window._currentTheme = theme;
}

/* ── 3. Navbar scroll effect ─────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/* ── 3. Hamburger menu ───────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
});
// Close menu on link click
navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ── 4. Active nav link on scroll ───────────────────── */
const sections  = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinkEls.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

sections.forEach(s => sectionObserver.observe(s));

/* ── 5. Scroll reveal ────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 6) * 80}ms`;
  revealObserver.observe(el);
});

/* ── 6. Counter animation ────────────────────────────── */
function animateCounter(el, target, duration = 1500) {
  const start = performance.now();
  const update = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

const counters = document.querySelectorAll('.stat-num');
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.target, 10);
      animateCounter(entry.target, target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

counters.forEach(el => counterObserver.observe(el));

/* ── 7. Publication filter ───────────────────────────── */
const filterBtns = document.querySelectorAll('.pfbtn');
const pubItems   = document.querySelectorAll('.pub-item');
const pubSections= document.querySelectorAll('.pub-section');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    if (filter === 'all') {
      pubSections.forEach(s => s.classList.remove('hidden'));
      pubItems.forEach(item => item.classList.remove('hidden'));
    } else {
      pubSections.forEach(s => {
        const id = s.id.replace('pub-', '');
        s.classList.toggle('hidden', id !== filter);
      });
      pubItems.forEach(item => {
        item.classList.toggle('hidden', item.dataset.type !== filter);
      });
    }
  });
});

/* ── 8. Back to top button ───────────────────────────── */
const btt = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  btt.classList.toggle('visible', window.scrollY > 500);
});
btt.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── 9. Smooth scroll for anchor links ───────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ── 10. Lab Video Player ───────────────────────────────── */
const labVideo   = document.getElementById('labVideo');
const playBtn    = document.getElementById('playBtn');
const videoOverlay = document.getElementById('videoOverlay');
if (labVideo && playBtn) {
  playBtn.addEventListener('click', () => {
    if (labVideo.paused) {
      labVideo.play();
      labVideo.muted = false;
      videoOverlay.classList.add('hidden-overlay');
      playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
      labVideo.pause();
      videoOverlay.classList.remove('hidden-overlay');
      playBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
  });
  labVideo.addEventListener('ended', () => {
    videoOverlay.classList.remove('hidden-overlay');
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
  });
  labVideo.addEventListener('click', () => playBtn.click());
}

/* ── 12. Stagger reveal delays for cards/items ─────────── */
document.querySelectorAll('.research-cards .rc').forEach((card, i) => {
  card.style.transitionDelay = `${i * 100}ms`;
});
document.querySelectorAll('.edu-grid .edu-card').forEach((card, i) => {
  card.style.transitionDelay = `${i * 120}ms`;
});
document.querySelectorAll('.expertise-grid .exp-chip').forEach((chip, i) => {
  chip.style.transitionDelay = `${i * 40}ms`;
});
