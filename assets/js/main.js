/* assets/js/main.js -------------------------------------------------------
   Shared UI logic for ChessKidoo: scroll, modals, animations, etc.
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  // ---- Preloader ----
  const hidePreloader = () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(() => preloader.classList.add('hidden'), 800);
    }
  };
  window.addEventListener('load', hidePreloader);

  // ---- Scroll Effects ----
  const header = document.getElementById('header');
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const s = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    
    if (scrollProgress) scrollProgress.style.width = (h > 0 ? (s / h) * 100 : 0) + '%';
    if (header) header.classList.toggle('scrolled', s > 50);
    if (backToTop) backToTop.classList.toggle('visible', s > 400);
  }, { passive: true });

  // ---- Navigation ----
  CK.scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  CK.toggleMobileMenu = () => {
    const nav = document.getElementById('mobileNav');
    const btn = document.getElementById('mobileMenuBtn');
    if (nav && btn) {
      const isOpen = nav.classList.toggle('open');
      btn.textContent = isOpen ? '✕' : '☰';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }
  };

  CK.closeMobileMenu = () => {
    const nav = document.getElementById('mobileNav');
    const btn = document.getElementById('mobileMenuBtn');
    if (nav && btn) {
      nav.classList.remove('open');
      btn.textContent = '☰';
      document.body.style.overflow = '';
    }
  };

  // ---- Modals ----
  CK.openModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  CK.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  CK.openDemoModal = () => CK.openModal('contactModal');

  // Close modal on click outside
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      CK.closeModal(e.target.id);
    }
  });

  // ---- Password Toggle ----
  CK.togglePwd = (id, trigger) => {
    const inp = document.getElementById(id);
    if (inp) {
      const isPwd = inp.type === 'password';
      inp.type = isPwd ? 'text' : 'password';
      trigger.textContent = isPwd ? '🙈' : '👁';
    }
  };

  // ---- Snackbar / Toast ----
  CK.showToast = (msg, type = 'info') => {
    const snack = document.getElementById('snackbar');
    if (snack) {
      snack.textContent = (type === 'success' ? '✅ ' : type === 'error' ? '❌ ' : 'ℹ️ ') + msg;
      snack.className = 'snackbar ' + type + ' show';
      clearTimeout(snack._t);
      snack._t = setTimeout(() => snack.classList.remove('show'), 4000);
    }
  };

  // ---- Reveal Animations ----
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ---- Counters ----
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        let count = 0;
        const duration = 1500;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          count += step;
          if (count >= target) {
            el.textContent = target;
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(count);
          }
        }, 16);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

})();