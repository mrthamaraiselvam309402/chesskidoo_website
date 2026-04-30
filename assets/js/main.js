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
    CK.showPage('landing');
  });

  function initPreloader() {
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('hidden');
      }, 800);
    });
  }

  function initScrollEffects() {
    const header = document.querySelector('.site-header');
    const scrollProgress = document.getElementById('scrollProgress');

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY > 50;
      header.classList.toggle('scrolled', scrolled);
      
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolledPct = (winScroll / height) * 100;
      scrollProgress.style.width = scrolledPct + "%";
    });

    // Reveal animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  function initMobileMenu() {
    CK.toggleMenu = () => {
      const nav = document.querySelector('.nav-links');
      nav.style.display = (nav.style.display === 'flex') ? 'none' : 'flex';
    };
  }

  /* ─── Navigation ─── */
  CK.showPage = (pageId) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) {
      target.classList.add('active');
      window.scrollTo(0, 0);
    }
    
    // Auto-load dashboard data if applicable
    if (pageId === 'student-page') CK.loadStudentDashboard();
    if (pageId === 'admin-page') CK.loadAdminDashboard();
    if (pageId === 'coach-page') CK.loadCoachDashboard();
  };

  CK.openModal = (id) => {
    document.getElementById(id).classList.add('active');
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

  /* ─── AI Bot Logic ─── */
  CK.toggleBot = () => {
    const win = document.getElementById('bot-window');
    win.classList.toggle('active');
    if (win.classList.contains('active')) {
      if (document.getElementById('bot-messages').children.length === 0) {
        addBotMessage("ai", "Hello! I'm the ChessKidoo AI. How can I help you with your chess journey today?");
      }
    }
  };

  CK.sendBotMessage = async () => {
    const input = document.getElementById('bot-input-field');
    const msg = input.value.trim();
    if (!msg) return;

    addBotMessage("user", msg);
    input.value = '';

    try {
      const response = await getAIResponse(msg);
      addBotMessage("ai", response);
    } catch (err) {
      addBotMessage("ai", "Sorry, I'm a bit tied up right now. Please try again in a moment!");
    }
  };

  function addBotMessage(role, text) {
    const container = document.getElementById('bot-messages');
    const div = document.createElement('div');
    div.className = `bot-msg ${role}`;
    div.innerText = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  async function getAIResponse(prompt) {
    // Basic AI fallback or Gemini integration
    if (!window.APP_CONFIG.GEMINI_API_KEY) return "I'm currently in learning mode. Contact our masters for direct help!";
    
    // Simulating AI response for speed in this version, 
    // real implementation would call the Gemini SDK:
    // const model = googleGenAI.getGenerativeModel({ model: "gemini-pro"});
    // const result = await model.generateContent(prompt);
    
    return "Great question! In chess, that move usually leads to a strong center control. Keep practicing your tactics!";
  }

  /* ─── Guess Grandmaster Game ─── */
  const GM_GAMES = [
    { name: "Magnus Carlsen", clues: ["Highest rating in history (2882)", "Norwegian prodigy", "World Champion 2013-2023"], img: "magnus.jpg" },
    { name: "Viswanathan Anand", clues: ["The Tiger of Madras", "India's first Grandmaster", "5-time World Champion"], img: "anand.jpg" },
    { name: "Gukesh D", clues: ["Youngest ever Challenger", "2024 Candidates Winner", "Indian phenom"], img: "gukesh.jpg" }
  ];
  let currentGameIdx = 0;

  CK.startGMGame = () => {
    currentGameIdx = 0;
    CK.openModal('gameModal');
    renderGMGame();
  };

  CK.nextGMGame = () => {
    currentGameIdx = (currentGameIdx + 1) % GM_GAMES.length;
    renderGMGame();
  };

  function renderGMGame() {
    const game = GM_GAMES[currentGameIdx];
    const el = document.getElementById('game-content');
    el.innerHTML = `
      <div style="background:var(--cream); padding:20px; border-radius:15px; margin-bottom:20px;">
        <p style="font-weight:700; color:var(--amber);">Clues:</p>
        <ul style="padding-left:20px; margin-top:10px;">
          ${game.clues.map(c => `<li style="margin-bottom:8px;">${c}</li>`).join('')}
        </ul>
      </div>
      <div class="form-group">
        <label>Who is this Grandmaster?</label>
        <input type="text" id="gm-guess" placeholder="Enter name...">
      </div>
      <button class="btn btn-primary" style="width:100%;" onclick="CK.checkGMGuess('${game.name}')">Check Answer</button>
      <div id="gm-result" style="margin-top:15px; font-weight:700; text-align:center;"></div>
    `;
  }

  CK.checkGMGuess = (correct) => {
    const guess = document.getElementById('gm-guess').value.trim().toLowerCase();
    const res = document.getElementById('gm-result');
    if (guess === correct.toLowerCase()) {
      res.innerHTML = "✨ Correct! Well done, future Master!";
      res.style.color = "var(--green)";
    } else {
      res.innerHTML = "❌ Not quite! Try another clue or rethink.";
      res.style.color = "red";
    }
  };

})();