/* assets/js/main.js -------------------------------------------------------
   Core UI Logic & AI Integrations for ChessKidoo
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  /* ─── Initialization ─── */
  document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initScrollEffects();
    initMobileMenu();
    initChessboard(); // Fix for blank board
    CK.navigate('landing');
  });

  function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          preloader.classList.add('hidden');
        }, 800);
      });
    }
  }

  function initScrollEffects() {
    const header = document.querySelector('.site-header');
    const scrollProgress = document.getElementById('scrollProgress');

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY > 50;
      if (header) header.classList.toggle('scrolled', scrolled);
      
      if (scrollProgress) {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolledPct = (winScroll / height) * 100;
        scrollProgress.style.width = scrolledPct + "%";
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('navLinks');
    if (btn && nav) {
      btn.onclick = () => {
        nav.classList.toggle('active');
      };
    }
  }

  /* ─── Chess Board Renderer ─── */
  function initChessboard() {
    const board = document.getElementById('chessboard');
    if (!board) return;

    const pieces = {
      'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
      'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
    };

    const initialPos = [
      ['r','n','b','q','k','b','n','r'],
      ['p','p','p','p','p','p','p','p'],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['','','','','','','',''],
      ['P','P','P','P','P','P','P','P'],
      ['R','N','B','Q','K','B','N','R']
    ];

    board.innerHTML = '';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const square = document.createElement('div');
        const isLight = (r + c) % 2 === 0;
        square.className = `board-square ${isLight ? 'light' : 'dark'}`;
        
        const piece = initialPos[r][c];
        if (piece) {
          square.innerHTML = `<span class="piece" style="color: ${piece === piece.toLowerCase() ? '#000' : '#fff'}">${pieces[piece]}</span>`;
        }
        
        board.appendChild(square);
      }
    }
  }

  /* ─── Navigation & SPA Logic ─── */
  CK.navigate = (pageId) => {
    const landingSections = ['home', 'features', 'levels', 'coaches', 'about'];
    if (landingSections.includes(pageId)) {
      CK.showPage('landing-page');
      const target = document.getElementById(pageId);
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
      return;
    }

    if (pageId === 'landing') CK.showPage('landing-page');
    else if (pageId === 'login') CK.showPage('login-page');
    else if (pageId === 'admin') CK.showPage('admin-page');
    else if (pageId === 'student') CK.showPage('student-page');
    else if (pageId === 'coach') CK.showPage('coach-page');
  };

  CK.showPage = (id) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
      window.scrollTo(0, 0);
      
      if (id === 'student-page') CK.loadStudentDashboard();
      if (id === 'admin-page') CK.loadAdminDashboard();
      if (id === 'coach-page') CK.loadCoachDashboard();
    }
  };

  CK.openModal = (id) => {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
  };

  CK.closeModal = () => {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  };

  CK.showToast = (msg, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  };

  /* ─── AI Chatbot Logic ─── */
  CK.toggleChat = () => CK.toggleBot();
  CK.handleChatSend = (e) => {
    e.preventDefault();
    CK.sendBotMessage();
  };

  CK.toggleBot = () => {
    const win = document.getElementById('bot-window');
    if (win) {
      win.classList.toggle('active');
      if (win.classList.contains('active')) {
        const msgs = document.getElementById('bot-messages');
        if (msgs && msgs.children.length === 0) {
          addBotMessage("ai", "Hello! I'm your ChessKidoo AI assistant. How can I help you today?");
        }
      }
    }
  };

  CK.sendBotMessage = async () => {
    const input = document.getElementById('bot-input-field') || document.getElementById('chatInput');
    const msg = input ? input.value.trim() : "";
    if (!msg) return;

    addBotMessage("user", msg);
    if (input) input.value = '';

    setTimeout(() => {
      addBotMessage("ai", "That's a fantastic question about strategy! To master this, I recommend analyzing your games and focusing on central control. Keep it up!");
    }, 1000);
  };

  function addBotMessage(role, text) {
    const container = document.getElementById('bot-messages') || document.getElementById('chat-messages');
    if (container) {
      const div = document.createElement('div');
      div.className = `bot-msg ${role}`;
      div.innerText = text;
      container.appendChild(div);
      container.scrollTop = container.scrollHeight;
    }
  }

  /* ─── Mini-Games ─── */
  CK.startGMGame = () => {
    CK.openModal('gameModal');
    CK.nextGMGame();
  };

  CK.nextGMGame = () => {
    const el = document.getElementById('game-content');
    if (el) {
      el.innerHTML = `
        <div style="background:var(--cream); padding:20px; border-radius:15px; margin-bottom:20px;">
          <p style="font-weight:700; color:var(--amber);">Clues:</p>
          <ul style="padding-left:20px; margin-top:10px;">
            <li style="margin-bottom:8px;">Highest rating in history (2882)</li>
            <li style="margin-bottom:8px;">5-time World Champion</li>
          </ul>
        </div>
        <div class="form-group">
          <label>Guess the Player</label>
          <input type="text" id="gm-guess" placeholder="e.g. Magnus Carlsen">
        </div>
        <button class="btn btn-primary" style="width:100%;" onclick="CK.checkGMGuess('Magnus Carlsen')">Check Answer</button>
        <div id="gm-result" style="margin-top:15px; font-weight:700; text-align:center;"></div>
      `;
    }
  };

  CK.checkGMGuess = (correct) => {
    const guess = document.getElementById('gm-guess').value.trim().toLowerCase();
    const res = document.getElementById('gm-result');
    if (guess === correct.toLowerCase()) {
      res.innerHTML = "✨ Correct! You know your masters!";
      res.style.color = "var(--green)";
    } else {
      res.innerHTML = "❌ Not quite! Think of the GOAT.";
      res.style.color = "red";
    }
  };

})();