// ── Retro Loader ───────────────────────────────────────
const loader = document.getElementById('retro-loader');
if (loader) {
  const hideLoader = () => {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 800);
  };

  if (document.readyState === 'complete') {
    // If we're already fully loaded in production, dismiss instantly
    hideLoader();
  } else {
    // Otherwise wait for the load event
    window.addEventListener('load', hideLoader);
  }
}

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

// ── Pixel button hover effect ──

// ── Pixel button hover sound (no audio, just visual pop) ──
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    btn.style.letterSpacing = '0.15em';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.letterSpacing = '';
  });
});

// ── Launch Studio Animation ──────────────────────────────
document.querySelectorAll('.launch-studio').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Create wipe overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = '#000';
    overlay.style.zIndex = '10000';
    overlay.style.clipPath = 'circle(0% at x y)';
    
    // Get click coords for origin
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    overlay.style.clipPath = `circle(0% at ${x}px ${y}px)`;
    overlay.style.transition = 'clip-path 0.5s cubic-bezier(0.5, 0, 0.1, 1)';
    
    document.body.appendChild(overlay);
    
    // Force reflow
    overlay.getBoundingClientRect();
    
    // Expand circle
    overlay.style.clipPath = `circle(150% at ${x}px ${y}px)`;
    
    // Navigate after animation
    setTimeout(() => {
      window.location.href = '/studio.html';
    }, 600);
  });
});
