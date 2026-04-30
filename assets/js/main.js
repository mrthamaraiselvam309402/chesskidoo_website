/* assets/js/main.js -------------------------------------------------------
   Core UI & Navigation Logic for ChessKidoo
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  // ============ Init ============
  window.addEventListener('load', () => {
    // Preloader
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 600);

    // Chessboard
    createBoard();
    
    // Reveal Init
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  });

  // ============ Scroll & Header ============
  window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    const scrollProgress = document.getElementById('scrollProgress');
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    scrollProgress.style.width = (winScroll / height) * 100 + '%';
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });

  // ============ Chessboard Logic ============
  function createBoard() {
    const board = document.getElementById('chessboard');
    if (!board) return;
    
    const pieces = { 0: '♜', 1: '♞', 2: '♝', 3: '♛', 4: '♚', 5: '♝', 6: '♞', 7: '♜' };
    board.innerHTML = '';
    
    for (let i = 0; i < 64; i++) {
      const sq = document.createElement('div');
      const row = Math.floor(i / 8);
      const col = i % 8;
      sq.className = 'board-square' + ((row + col) % 2 === 0 ? ' light' : ' dark');
      
      if (row === 0) sq.textContent = pieces[col];
      if (row === 1) sq.textContent = '♟';
      if (row === 6) sq.textContent = '♙';
      if (row === 7) sq.textContent = pieces[col].replace(/[♜♞♝♛♚]/g, m => ({'♜':'♖','♞':'♘','♝':'♗','♛':'♕','♚':'♔'}[m]));
      
      board.appendChild(sq);
    }
  }

  // ============ Navigation ============
  CK.navigate = (sectionId) => {
    // If we're not on the landing page, show it first
    const landing = document.getElementById('landing-page');
    const login = document.getElementById('login-page');
    
    if (sectionId === 'login') {
      CK.showPage('login');
      return;
    }

    if (!landing.classList.contains('active')) {
      CK.showPage('landing');
    }

    const target = document.getElementById(sectionId);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    
    // Close mobile menu
    const navLinks = document.getElementById('navLinks');
    if (window.innerWidth <= 768) navLinks.style.display = '';
  };

  CK.showPage = (pageId) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`${pageId}-page`).classList.add('active');
    window.scrollTo(0, 0);

    // Update Header visibility
    const header = document.getElementById('header');
    if (pageId.includes('admin') || pageId.includes('student') || pageId.includes('coach')) {
      header.style.display = 'none';
    } else {
      header.style.display = 'block';
    }
  };

  // ============ Modals ============
  CK.openModal = (id) => {
    document.getElementById(id).classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  CK.closeModal = () => {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
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
      CK.showToast("Failed to submit. Please try again.", "error");
    }
  };

  // ============ Mobile Menu ============
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      navLinks.style.display = (navLinks.style.display === 'flex') ? '' : 'flex';
      if (navLinks.style.display === 'flex') {
        navLinks.style.cssText = `display:flex; flex-direction:column; position:absolute; top:100%; left:0; right:0; background:var(--cream); padding:16px; border-bottom:1px solid var(--border-light); box-shadow:var(--shadow-md); z-index:1001;`;
      }
    });
  }

  // ============ Chatbot ============
  CK.toggleChat = () => {
    document.getElementById('chat-drawer').classList.toggle('active');
  };

  CK.handleChatSend = async (e) => {
    e.preventDefault();
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;

    appendMessage('user', msg);
    input.value = '';

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${window.APP_CONFIG.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are ChessMaster AI, an expert coach at ChessKiddo academy. Be encouraging, professional, and knowledgeable. Answer this student: ${msg}` }] }]
        })
      });
      const data = await response.json();
      const botMsg = data.candidates[0].content.parts[0].text;
      appendMessage('bot', botMsg);
    } catch (err) {
      appendMessage('bot', "I'm having a hard time thinking right now. Please try again later!");
    }
  };

  function appendMessage(role, text) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  // ============ Toast ============
  CK.showToast = (msg, type = "success") => {
    const toast = document.createElement('div');
    toast.className = `snackbar ${type} show`;
    toast.style.cssText = `position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:3000; padding:12px 24px; border-radius:12px; color:white; font-weight:600; background: ${type === 'error' ? '#DC2626' : (type === 'info' ? '#3B82F6' : '#059669')}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  };

})();