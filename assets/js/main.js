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

  // Mobile Menu Logic
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      mobileBtn.classList.toggle('active');
    });
    navLinks.querySelectorAll('.nav-link').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navLinks.classList.remove('open');
          mobileBtn.classList.remove('active');
        }
      });
    });
  }

  // Alias navigate to handle both section scrolling (landing) and page routing
  CK.navigate = (section) => {
    // Route to arena page first (before landing section check)
    if (section === 'arena') {
      console.log('Main: Navigating to arena page');
      CK.showPage('arena-page');
      console.log('Main: Arena page shown, initializing...');
      setTimeout(() => {
        console.log('Main: Checking if CK.arena exists:', !!CK.arena);
        if (CK.arena) {
          console.log('Main: Calling arena.init()');
          CK.arena.init();
        } else {
          console.error('Main: CK.arena is not defined!');
        }
      }, 100);
      return;
    }

    const landingSections = ['home', 'features', 'levels', 'coaches', 'about', 'reviews', 'pricing', 'faq'];
    const isLandingSection = landingSections.includes(section);
    
    if (isLandingSection) {
      const landingPage = document.getElementById('landing-page');
      if (!landingPage.classList.contains('active')) {
        CK.showPage('landing-page');
      }
      
      // Delay slightly if we just switched pages to ensure DOM is ready for scroll
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }

    // Route to a specific page (like login-page)
    if (section === 'login' && CK.currentUser) {
      const role = CK.currentUser.role.toLowerCase();
      CK.showPage(`${role}-page`);
      // Re-init portal logic if needed
      setTimeout(() => {
        if (role === 'admin' && CK.admin) CK.admin.init();
        if (role === 'student' && CK.student) CK.student.init();
        if (role === 'coach' && CK.coach) CK.coach.init();
      }, 50);
      return;
    }
    
    CK.showPage(section + '-page');
  };

  /* ─── Modal System ─── */
  CK.openModal = (id) => {
    const m = document.getElementById(id);
    if (m) {
      m.classList.add('active');
      m.classList.add('open'); // For new portals
      m.style.display = 'flex';
      if (m.classList.contains('p-modal-overlay')) m.style.display = 'grid';
    }
  };

  CK.closeModal = (id) => {
    if (id) {
      const m = document.getElementById(id);
      if (m) {
        m.classList.remove('active');
        m.classList.remove('open');
        m.style.display = 'none';
      }
    } else {
      document.querySelectorAll('.modal-overlay, .p-modal-overlay').forEach(m => {
        m.classList.remove('active');
        m.classList.remove('open');
        m.style.display = 'none';
      });
    }
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
      toast.className = 'p-toast';
      document.body.appendChild(toast);
    }
    
    // Status icons
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.innerHTML = `<span>${icons[type] || '♟'}</span> <span>${msg}</span>`;
    
    // Apply status class
    toast.className = `p-toast show ${type}`;
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
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

  CK.handleDemoSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('[type="submit"]');
    const name = form.fullName.value;
    const phone = form.phone.value;
    const age = form.age.value;
    const city = form.city.value || 'Not specified';

    btn.textContent = 'Booking...';
    btn.disabled = true;
    try {
      if (window.supabaseClient) {
        try {
          const { error } = await window.supabaseClient.from('leads').insert({
            name,
            phone,
            parent_name: name,
            child_age: age,
            city,
            status: 'new',
            created_at: new Date().toISOString()
          });
          if (error) console.error('Supabase save error:', error);
        } catch (supaErr) {
          console.error('Supabase connection error:', supaErr);
        }
      }

      // WhatsApp Redirection - Always trigger even if Supabase fails
      const msg = `Hello ChessKidoo! ♟️\n\nI'd like to book a FREE Demo Class.\n\n👤 *Name:* ${name}\n📞 *Phone:* ${phone}\n👶 *Child Age:* ${age}\n📍 *City:* ${city}\n\nPlease confirm my slot!`;
      const waUrl = `https://wa.me/919025846663?text=${encodeURIComponent(msg)}`;

      CK.showToast('🎉 Demo details ready! Redirecting to WhatsApp...', 'success');

      setTimeout(() => {
        window.open(waUrl, '_blank');
        CK.closeModal();
        form.reset();
      }, 1500);

    } catch (err) {
      CK.showToast('Failed to prepare booking. Please WhatsApp us directly!', 'error');
    } finally {
      btn.textContent = 'Confirm Booking';
      btn.disabled = false;
    }
  };

  CK.togglePassword = (id) => {
    const input = document.querySelector(`#${id} input[name="password"]`) || document.querySelector(`input[name="${id}"]`);
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  };

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

  /* ─── Scroll Effects + Active Nav Highlighting ─── */
  const header = document.getElementById('header');
  const sections = ['home', 'features', 'levels', 'coaches', 'about', 'reviews', 'pricing', 'faq'];
  const navLinkEls = document.querySelectorAll('.nav-link[data-section]');

  function updateActiveNav() {
    const scrollY = window.scrollY + 120;
    let current = 'home';
    sections.forEach(sec => {
      const el = document.getElementById(sec);
      if (el && el.offsetTop <= scrollY) current = sec;
    });
    navLinkEls.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 50);
    const progress = document.getElementById('scrollProgress');
    if (progress) {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      progress.style.width = pct + '%';
    }
    updateActiveNav();
  });

  // Run once on load
  window.addEventListener('load', updateActiveNav);

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

    // Observe reveal elements
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


    // Restore session if present (In background only)
    const savedUser = localStorage.getItem('ck_user');
    if (savedUser) {
      try {
        CK.currentUser = JSON.parse(savedUser);
      } catch(e) { 
        localStorage.removeItem('ck_user'); 
      }
    }
    
    // ALWAYS start on landing page as requested by user
    CK.showPage('landing-page');

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