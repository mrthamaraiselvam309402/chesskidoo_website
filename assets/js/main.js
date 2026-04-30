/* assets/js/main.js -------------------------------------------------------
   Core UI, Router, Modals, Toast, Bot, Chessboard — ChessKidoo
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  /* ─── SPA Router ─── */
  CK.showPage = (id) => {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Alias navigate to handle both section scrolling (landing) and page routing
  CK.navigate = (section) => {
    const landingPage = document.getElementById('landing-page');
    if (landingPage && landingPage.classList.contains('active')) {
      // Scroll to section on landing page
      const el = document.getElementById(section);
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; }
    }
    // Route to a specific page
    CK.showPage(section + '-page');
  };

  /* ─── Modal System ─── */
  CK.openModal = (id) => {
    const m = document.getElementById(id);
    if (m) { m.classList.add('active'); m.style.display = 'flex'; }
  };

  CK.closeModal = () => {
    document.querySelectorAll('.modal-overlay.active, .modal-overlay[style*="flex"]').forEach(m => {
      m.classList.remove('active');
      m.style.display = 'none';
    });
  };

  CK.openDemoModal = () => CK.openModal('contactModal');

  // Close modal on overlay click
  document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) CK.closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') CK.closeModal();
  });

  /* ─── Toast Notification ─── */
  CK.showToast = (msg, type = 'info') => {
    let toast = document.getElementById('ck-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ck-toast';
      toast.style.cssText = `
        position:fixed; bottom:30px; right:30px; z-index:99999;
        padding:14px 24px; border-radius:12px; font-weight:600; font-size:0.9rem;
        color:#fff; box-shadow:0 8px 30px rgba(0,0,0,0.2);
        transition:all 0.4s ease; opacity:0; transform:translateY(20px);
      `;
      document.body.appendChild(toast);
    }
    const colors = { success: '#166534', error: '#991b1b', info: '#1e40af', warning: '#854d0e' };
    toast.style.background = colors[type] || colors.info;
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateY(20px)'; }, 3500);
  };

  /* ─── AI Bot ─── */
  CK.toggleBot = () => {
    const win = document.getElementById('bot-window');
    if (!win) return;
    const isOpen = win.style.display === 'flex';
    win.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen) {
      const msgs = document.getElementById('bot-messages');
      if (msgs && !msgs.innerHTML.trim()) {
        msgs.innerHTML = `<div class="bot-msg bot-msg--bot">♛ Hi! I'm ChessKidoo AI. Ask me anything about chess, classes, or the academy!</div>`;
      }
    }
  };

  CK.sendBotMessage = () => {
    const input = document.getElementById('bot-input-field');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    const msgs = document.getElementById('bot-messages');
    msgs.innerHTML += `<div class="bot-msg bot-msg--user">${msg}</div>`;
    input.value = '';
    msgs.scrollTop = msgs.scrollHeight;

    const replies = {
      fee: "Our fees range from ₹800 to ₹5,200/month depending on the session type. Group sessions start at ₹800! 💰",
      schedule: "We offer WEEKDAY (17:00) and WEEKEND sessions. Group and 1-on-1 options available! 📅",
      coach: "We have 7 FIDE-certified coaches: Ranjith, Vishnu, Rohith Selvaraj, Gyansurya, Saran, Yogesh, and Haris! ♞",
      beginner: "Beginners start with piece movements, basic tactics, and fun puzzles. Your child will love it! 🎯",
      demo: "Click 'Book Free Demo' in the menu to schedule a free trial class with one of our expert coaches! 🎉",
      default: "Great question! Our FIDE-certified coaches are here to guide you. Want to book a free demo class? 🏆"
    };

    const key = Object.keys(replies).find(k => msg.toLowerCase().includes(k)) || 'default';
    setTimeout(() => {
      msgs.innerHTML += `<div class="bot-msg bot-msg--bot">${replies[key]}</div>`;
      msgs.scrollTop = msgs.scrollHeight;
    }, 800);
  };

  /* ─── Demo Form Submission ─── */
  CK.handleDemoSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Booking...';
    btn.disabled = true;
    try {
      const { error } = await window.supabaseClient.from('leads').insert({
        name: form.fullName.value,
        phone: form.phone.value,
        parent_name: form.fullName.value,
        status: 'new',
        created_at: new Date().toISOString()
      });
      if (error) throw error;
      CK.showToast('🎉 Demo booked! We\'ll contact you within 24 hours.', 'success');
      CK.closeModal();
      form.reset();
    } catch (err) {
      CK.showToast('Failed to book demo. Please WhatsApp us directly!', 'error');
    } finally {
      btn.textContent = 'Confirm Booking';
      btn.disabled = false;
    }
  };

  /* ─── Admin Helpers (stubs that call admin.js) ─── */
  CK.handleAddUser = async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('[type="submit"]');
    btn.textContent = 'Creating...';
    btn.disabled = true;
    try {
      const { error } = await window.supabaseClient.from('users').insert({
        full_name: form.fullName.value,
        email: form.email.value,
        role: form.role.value,
        level: form.level ? form.level.value : null,
        coach: form.assignedCoach ? form.assignedCoach.value : null,
        phone: form.phone ? form.phone.value : null,
      });
      if (error) throw error;
      CK.showToast('User created successfully!', 'success');
      CK.closeModal();
      form.reset();
      if (typeof CK.loadAdminTab === 'function') CK.loadAdminTab('users');
    } catch (err) {
      CK.showToast(err.message || 'Failed to create user.', 'error');
    } finally {
      btn.textContent = 'Create User';
      btn.disabled = false;
    }
  };

  CK.handleResourceUpload = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const file = form.file.files[0];
      const path = `docs/${Date.now()}_${file.name}`;
      const { error: upErr } = await window.supabaseClient.storage.from('documents').upload(path, file);
      if (upErr) throw upErr;
      await window.supabaseClient.from('document').insert({
        name: form.fileName.value,
        file_name: path,
        level: form.level.value,
        batch: form.batch.value,
        link: form.refUrl.value,
        class_link: form.classLink.value,
      });
      CK.showToast('Resource uploaded!', 'success');
      CK.closeModal();
      form.reset();
      if (typeof CK.loadAdminTab === 'function') CK.loadAdminTab('files');
    } catch (err) {
      CK.showToast(err.message || 'Upload failed.', 'error');
    }
  };

  CK.handleTournUpload = async (e) => {
    e.preventDefault();
    CK.showToast('Tournament upload coming soon!', 'info');
  };

  CK.handleAchUpload = async (e) => {
    e.preventDefault();
    CK.showToast('Achievement saved!', 'success');
    CK.closeModal();
  };

  CK.toggleUserFields = (role) => {
    const fields = document.getElementById('student-only-fields');
    if (fields) fields.style.display = role === 'student' ? 'block' : 'none';
  };

  CK.downloadFile = async (fileName) => {
    const { data } = window.supabaseClient.storage.from('documents').getPublicUrl(fileName);
    if (data?.publicUrl) window.open(data.publicUrl, '_blank');
  };

  CK.deleteFile = async (fileName) => {
    if (!confirm('Delete this file?')) return;
    await window.supabaseClient.storage.from('documents').remove([fileName]);
    await window.supabaseClient.from('document').delete().eq('file_name', fileName);
    CK.showToast('File deleted.', 'success');
    if (typeof CK.loadAdminTab === 'function') CK.loadAdminTab('files');
  };

  CK.editUser = (id) => CK.showToast('Edit user: coming soon!', 'info');

  /* ─── Guess Grandmaster Mini Game ─── */
  const GMs = [
    { name: 'Magnus Carlsen', clues: ['World Champion 2013-2023', 'From Norway', 'Peak rating 2882', 'Author of "Play 1.e4"'], icon: '♔' },
    { name: 'Garry Kasparov', clues: ['Youngest World Champion (1985)', 'Played Deep Blue', 'Russian Grandmaster', 'FIDE rating 2851'], icon: '♛' },
    { name: 'Bobby Fischer', clues: ['American legend', 'Won 1972 World Championship', 'Chess prodigy', 'Beat Spassky in Reykjavik'], icon: '♚' },
  ];
  let gmIdx = 0, clueShown = 0;

  CK.startGMGame = () => {
    gmIdx = Math.floor(Math.random() * GMs.length);
    clueShown = 0;
    renderGMGame();
    CK.openModal('gameModal');
  };

  CK.nextGMGame = () => {
    if (clueShown < GMs[gmIdx].clues.length - 1) { clueShown++; renderGMGame(); }
    else { CK.showToast(`It was ${GMs[gmIdx].name}!`, 'success'); CK.closeModal(); }
  };

  function renderGMGame() {
    const gm = GMs[gmIdx];
    const el = document.getElementById('game-content');
    if (!el) return;
    el.innerHTML = `
      <div style="text-align:center; padding:20px 0;">
        <div style="font-size:4rem; margin-bottom:20px;">${gm.icon}</div>
        <h4 style="margin-bottom:20px; opacity:0.6;">Clue ${clueShown + 1} of ${gm.clues.length}</h4>
        <div style="background:var(--cream); padding:20px; border-radius:12px; font-size:1.2rem; font-weight:700;">
          "${gm.clues[clueShown]}"
        </div>
        <p style="margin-top:20px; opacity:0.5; font-size:0.85rem;">Click "Next Game" for the next clue or reveal!</p>
      </div>
    `;
  }

  /* ─── 3D Autoplay Chessboard ─── */
  CK.initChessboard = () => {
    const board = document.getElementById('main-chessboard');
    if (!board) return;

    const pieces = {
      '0,0':'♜','0,1':'♞','0,2':'♝','0,3':'♛','0,4':'♚','0,5':'♝','0,6':'♞','0,7':'♜',
      '1,0':'♟','1,1':'♟','1,2':'♟','1,3':'♟','1,4':'♟','1,5':'♟','1,6':'♟','1,7':'♟',
      '6,0':'♙','6,1':'♙','6,2':'♙','6,3':'♙','6,4':'♙','6,5':'♙','6,6':'♙','6,7':'♙',
      '7,0':'♖','7,1':'♘','7,2':'♗','7,3':'♕','7,4':'♔','7,5':'♗','7,6':'♘','7,7':'♖'
    };

    // Famous Opera Game moves (Morphy vs Duke of Brunswick, 1858)
    const sequence = [
      ['6,4','4,4'],['1,4','3,4'],['7,6','5,5'],['0,3','2,5'],
      ['6,3','4,3'],['7,5','4,2'],['7,2','5,4'],['0,5','2,3'],
      ['5,5','3,4'],['0,6','2,5'],['5,4','3,6'],['2,3','4,1'],
      ['3,4','1,3'],['0,4','0,2'],['7,0','7,3'],['0,0','0,3']
    ];

    board.innerHTML = '';
    board.style.cssText = `display:grid; grid-template-columns:repeat(8,1fr); width:100%; aspect-ratio:1;`;

    const squareMap = {};
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        const isLight = (r + c) % 2 === 0;
        sq.style.cssText = `
          background: ${isLight ? '#f0d9b5' : '#b58863'};
          display:flex; align-items:center; justify-content:center;
          font-size:clamp(1.2rem, 3vw, 2.2rem);
          position:relative; cursor:default;
          transition: background 0.3s;
        `;
        if (pieces[`${r},${c}`]) {
          sq.textContent = pieces[`${r},${c}`];
          sq.style.color = (r <= 1) ? '#1a1512' : '#fff';
          sq.style.textShadow = '0 2px 4px rgba(0,0,0,0.4)';
        }
        board.appendChild(sq);
        squareMap[`${r},${c}`] = sq;
      }
    }

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= sequence.length) {
        clearInterval(interval);
        // Reset after pause
        setTimeout(() => { CK.initChessboard(); }, 2000);
        return;
      }
      const [from, to] = sequence[idx];
      const fromSq = squareMap[from];
      const toSq = squareMap[to];
      if (fromSq && toSq) {
        // Highlight move
        fromSq.style.background = '#f6f669';
        toSq.style.background = '#baca2b';
        setTimeout(() => {
          const piece = fromSq.textContent;
          const color = fromSq.style.color;
          const shadow = fromSq.style.textShadow;
          toSq.textContent = piece;
          toSq.style.color = color;
          toSq.style.textShadow = shadow;
          fromSq.textContent = '';
          // Restore square colors after highlight
          const [fr, fc] = from.split(',').map(Number);
          const [tr, tc] = to.split(',').map(Number);
          fromSq.style.background = ((fr + fc) % 2 === 0) ? '#f0d9b5' : '#b58863';
          toSq.style.background = ((tr + tc) % 2 === 0) ? '#f0d9b5' : '#b58863';
        }, 400);
      }
      idx++;
    }, 1800);
  };

  /* ─── Mobile Menu ─── */
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  /* ─── Scroll Effects ─── */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
    const progress = document.getElementById('scrollProgress');
    if (progress) {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      progress.style.width = pct + '%';
    }
  });

  /* ─── Intersection Observer (Reveal Animations) ─── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });

  /* ─── Init on DOMContentLoaded ─── */
  window.addEventListener('DOMContentLoaded', () => {
    // Hide preloader immediately
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        setTimeout(() => preloader.remove(), 600);
      }, 800);
    }

    // Initialize chessboard
    CK.initChessboard();

    // Observe reveal elements
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Restore session if present
    const savedUser = localStorage.getItem('ck_user');
    if (savedUser) {
      try {
        CK.currentUser = JSON.parse(savedUser);
      } catch(e) { localStorage.removeItem('ck_user'); }
    }

    // Counter animations
    document.querySelectorAll('.hero-stat-num').forEach(el => {
      const target = parseInt(el.textContent.replace(/\D/g,''));
      if (!target) return;
      let count = 0;
      const suffix = el.textContent.replace(/[0-9]/g,'');
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        count = Math.min(count + step, target);
        el.textContent = count + suffix;
        if (count >= target) clearInterval(timer);
      }, 30);
    });
  });

})();