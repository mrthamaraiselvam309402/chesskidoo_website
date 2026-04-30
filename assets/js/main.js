/* assets/js/main.js -------------------------------------------------------
   Shared UI logic for ChessKidoo: scroll, modals, animations, etc.
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  // ---- Preloader ----
  const hidePreloader = () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(() => preloader.classList.add('hidden'), 600);
    }
  };
  window.addEventListener('load', hidePreloader);

  // ---- Scroll Effects ----
  const header = document.getElementById('header');
  const scrollProgress = document.getElementById('scrollProgress');

  window.addEventListener('scroll', () => {
    const s = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    
    if (scrollProgress) scrollProgress.style.width = (h > 0 ? (s / h) * 100 : 0) + '%';
    if (header) header.classList.toggle('scrolled', s > 50);
  }, { passive: true });

  // ---- Navigation & Scroll ----
  CK.scrollToSection = (id) => {
    // If not on landing page, switch to it first
    const landing = document.getElementById('landing-page');
    if (landing && !landing.classList.contains('active')) {
      if (typeof CK.showHome === 'function') {
        CK.showHome();
        setTimeout(() => performScroll(id), 100);
        return;
      }
    }
    performScroll(id);
  };

  function performScroll(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ---- Modals ----
  CK.openModal = (id) => {
    const modal = document.getElementById(id || 'contactModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  CK.closeModal = (id) => {
    const modal = document.getElementById(id || 'contactModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  CK.openDemoModal = () => CK.openModal('contactModal');

  CK.handleDemoSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      full_name: form.fullName.value,
      phone: form.phone.value,
      age: form.age.value,
      status: 'new',
      created_at: new Date()
    };

    try {
      CK.showToast("Submitting request...", "info");
      const { error } = await window.supabaseClient.from('leads').insert([data]);
      if (error) throw error;
      
      CK.showToast("Request sent! We will contact you soon. ✅", "success");
      CK.closeModal();
      form.reset();
    } catch (err) {
      console.error("Lead Error:", err);
      CK.showToast("Failed to submit. Please try again or WhatsApp us.", "error");
    }
  };

  // Close modal on overlay click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      CK.closeModal(e.target.id);
    }
  });

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
      }
    });
  }, { threshold: 0.1 });

  // ---- Gemini Chatbot ----
  CK.toggleChat = () => {
    const drawer = document.getElementById('chatDrawer');
    if (drawer) drawer.classList.toggle('active');
  };

  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');

  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      // Add user message
      addMessage(text, 'user');
      chatInput.value = '';

      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(window.APP_CONFIG.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(text);
        const responseText = result.response.text();
        addMessage(responseText, 'bot');
      } catch (err) {
        console.error("Gemini Error:", err);
        addMessage("Sorry, I'm having trouble connecting right now. Please try again later.", 'bot');
      }
    });
  }

  function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
    
    // Chessboard Generation
    const board = document.getElementById('chessboard');
    if (board) {
      const pieces = { 0: '♜', 1: '♞', 2: '♝', 3: '♛', 4: '♚', 5: '♝', 6: '♞', 7: '♜' };
      for (let i = 0; i < 64; i++) {
        const sq = document.createElement('div');
        const row = Math.floor(i / 8);
        const col = i % 8;
        sq.className = `board-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
        if (row === 0) sq.textContent = pieces[col];
        if (row === 1) sq.textContent = '♟';
        if (row === 6) sq.textContent = '♙';
        if (row === 7) sq.textContent = pieces[col].replace(/[♜♞♝♛♚]/g, m => ({'♜':'♖','♞':'♘','♝':'♗','♛':'♕','♚':'♔'}[m]));
        board.appendChild(sq);
      }
    }
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
      });

      // Close menu on link click
      navLinks.querySelectorAll('button, a').forEach(link => {
        link.addEventListener('click', () => {
          menuToggle.classList.remove('active');
          navLinks.classList.remove('active');
        });
      });
    }
  });

})();