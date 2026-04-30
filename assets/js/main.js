/* assets/js/main.js -------------------------------------------------------
   Shared UI logic for all pages: scroll, modal, toast, etc.
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = {};

  // ---- Scroll Progress ----
  const scrollProgress = document.getElementById('scrollProgress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      scrollProgress.style.width = scrolled + '%';
    });
  }

  // ---- Header Scroll Effect ----
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ---- Mobile Menu ----
  const burger = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobileNav.classList.toggle('open');
    });
  }

  // ---- Modal Functions ----
  CK.openModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
  };

  CK.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
  };

  // Close modal on overlay click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('open');
    }
  });

  // ---- Demo Modal ----
  CK.openDemoModal = () => CK.openModal('demoModal');
  CK.openLoginModal = () => CK.openModal('loginModal');

  // ---- Password Toggle ----
  CK.togglePwd = (inputId, btn) => {
    const input = document.getElementById(inputId);
    if (input) {
      const isPwd = input.type === 'password';
      input.type = isPwd ? 'text' : 'password';
      if (btn) btn.textContent = isPwd ? '🙈' : '👁';
    }
  };

  // ---- Scroll to Section ----
  CK.scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  // ---- Form Validation ----
  CK.validateForm = (form) => {
    let isValid = true;
    const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    fields.forEach(field => {
      const errorEl = document.getElementById(field.id + '-err');
      field.classList.remove('invalid');
      if (errorEl) errorEl.textContent = '';

      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('invalid');
        if (errorEl) errorEl.textContent = field.name + ' is required';
      }
    });
    return isValid;
  };

  // ---- Toast Notifications ----
  CK.showToast = (message, type = 'info') => {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.className = 'toast ' + type;
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  };

  // ---- FAQ Accordion ----
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('faq-q')) {
      const item = e.target.parentElement;
      const answer = item.querySelector('.faq-a');
      answer.classList.toggle('open');
    }
  });

  // ---- Reveal Animations ----
  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ---- Counters ----
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.dataset.target;
        let count = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
          count += increment;
          if (count >= target) {
            count = target;
            clearInterval(timer);
          }
          el.textContent = Math.floor(count);
        }, 20);
        counterObserver.unobserve(el);
      }
    });
  });

  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

  // ---- Chessboard Animation (simple placeholder) ----
  const chessboard = document.getElementById('chessboard');
  if (chessboard) {
    // Add some simple animation or interactivity if needed
    chessboard.addEventListener('click', () => {
      CK.showToast('Chessboard clicked! ♛', 'success');
    });
  }

  // ---- Back to Top ----
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      backToTopBtn.classList.toggle('visible', window.scrollY > 300);
    });
  }

  // ---- Preloader ----
  window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(() => preloader.classList.add('hidden'), 500);
    }
  });

})();