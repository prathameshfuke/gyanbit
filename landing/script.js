// GyanBit Landing Page — Interactions

// ── Scroll Reveal ──────────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.feature-card, .step, .hw-spec, .game-entry, .section-title, .section-sub, .section-label, .how-img-wrap, .games-img, .pin-table-wrap, .hero-code-preview').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ── Nav shadow on scroll ───────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5)';
    nav.style.background = 'rgba(4,6,10,0.97)';
  } else {
    nav.style.boxShadow = '';
    nav.style.background = 'rgba(4,6,10,0.85)';
  }
}, { passive: true });

// ── Hero typewriter for code preview ──────────────────
(function typewriterLoop() {
  const pre = document.querySelector('.code-block');
  if (!pre) return;
  const html = pre.innerHTML;
  pre.innerHTML = '';
  let i = 0;
  const cursor = document.createElement('span');
  cursor.style.cssText = 'border-right:2px solid #39ff14;margin-left:1px;animation:blink 0.8s step-end infinite;';
  pre.appendChild(cursor);

  function typeChar() {
    if (i <= html.length) {
      pre.innerHTML = html.slice(0, i);
      pre.appendChild(cursor);
      i++;
      setTimeout(typeChar, i < 20 ? 60 : 18);
    }
    // Once done, stop cursor blinking after 2s
    else { setTimeout(() => cursor.remove(), 2000); }
  }
  setTimeout(typeChar, 800);
})();

// ── Pixel button hover sound (no audio, just visual pop) ──
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    btn.style.letterSpacing = '0.15em';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.letterSpacing = '';
  });
});

// ── Active nav link highlight ──────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(a => {
          a.style.color = a.getAttribute('href') === '#' + e.target.id
            ? 'var(--green)' : '';
        });
      }
    });
  },
  { rootMargin: '-40% 0px -55% 0px' }
);
sections.forEach(s => sectionObserver.observe(s));
