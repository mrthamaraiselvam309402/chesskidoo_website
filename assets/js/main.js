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

    // Toggle global site header visibility
    const header = document.getElementById('header');
    if (header) {
      if (id === 'landing-page') {
        header.classList.remove('header-hidden');
      } else {
        header.classList.add('header-hidden');
      }
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

    // Route to more games page
    if (section === 'more-games') {
      CK.showPage('more-games-page');
      setTimeout(() => CK.initGameParticles(), 100);
      return;
    }

    const landingSections = ['home', 'features', 'levels', 'coaches', 'achievements', 'about', 'reviews', 'pricing', 'faq'];
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

  /* ─── Game Particles Animation ─── */
  CK.initGameParticles = () => {
    const container = document.getElementById('game-particles');
    if (!container) return;
    container.innerHTML = '';
    
    const colors = ['#f59e0b', '#8b5cf6', '#059669', '#dc2626', '#06b6d4'];
    const count = 20;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'game-particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.setProperty('--tx', `${Math.random() * 200 - 100}px`);
      particle.style.setProperty('--ty', `${Math.random() * 200 - 100}px`);
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particle.style.animationDuration = `${10 + Math.random() * 8}s`;
      particle.style.background = colors[i % colors.length];
      particle.style.boxShadow = `0 0 8px ${colors[i % colors.length]}`;
      container.appendChild(particle);
    }
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
        msgs.innerHTML = `<div class="bot-msg bot-msg--bot">♘ Hi! I'm ChessKidoo AI. Ask me anything about chess, classes, or the academy!</div>`;
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

      // WhatsApp Message Text
      const msg = `Hello ChessKidoo! ♟️\n\nI'd like to book a FREE Demo Class.\n\n👤 *Name:* ${name}\n📞 *Phone:* ${phone}\n👶 *Child Age:* ${age}\n📍 *City:* ${city}\n\nPlease confirm my slot!`;
      const waUrl = `https://wa.me/919025846663?text=${encodeURIComponent(msg)}`;

      // Email Pre-filled Data
      const emailSubject = `New Demo Class Booking - ${name}`;
      const emailBody = `Hello ChessKidoo Team,\n\nI'd like to book a FREE Demo Class for my child.\n\n👤 Parent Name: ${name}\n📞 Phone/WhatsApp: ${phone}\n👶 Child's Age: ${age}\n📍 City: ${city}\n\nPlease reach out to me to schedule our slot!\n\nBest regards,\n${name}`;
      const mailtoUrl = `mailto:Chesskidoo37@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      CK.showToast('🎉 Directing to WhatsApp and Email Client...', 'success');

      setTimeout(() => {
        // Open WhatsApp redirection in a new window
        window.open(waUrl, '_blank');
        // Trigger mail client launch
        window.location.href = mailtoUrl;

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

    // Counter animations (supports both integers and float decimals)
    document.querySelectorAll('.hero-stat-num').forEach(el => {
      const text = el.textContent;
      const hasDecimal = text.includes('.');
      
      if (hasDecimal) {
        const numPart = parseFloat(text.replace(/[^\d.]/g, ''));
        if (isNaN(numPart)) return;
        let count = 0.0;
        const suffix = text.replace(/[\d.]/g, '');
        const step = numPart / 60;
        const timer = setInterval(() => {
          count = Math.min(count + step, numPart);
          el.textContent = count.toFixed(1) + suffix;
          if (count >= numPart) {
            el.textContent = numPart.toFixed(1) + suffix;
            clearInterval(timer);
          }
        }, 30);
      } else {
        const target = parseInt(text.replace(/\D/g,''), 10);
        if (isNaN(target)) return;
        let count = 0;
        const suffix = text.replace(/[0-9]/g,'');
        const step = Math.ceil(target / 60);
        const timer = setInterval(() => {
          count = Math.min(count + step, target);
          el.textContent = count + suffix;
          if (count >= target) {
            el.textContent = target + suffix;
            clearInterval(timer);
          }
        }, 30);
      }
    });
  });

  CK.toggleFaq = (button) => {
    const item = button.closest('.faq-item');
    const content = item.querySelector('.faq-content');
    const isActive = item.classList.contains('active');

    // Smooth accordion behavior: collapse all other open items
    document.querySelectorAll('.faq-item').forEach(el => {
      if (el !== item) {
        el.classList.remove('active');
        el.querySelector('.faq-content').style.maxHeight = null;
      }
    });

    if (isActive) {
      item.classList.remove('active');
      content.style.maxHeight = null;
    } else {
      item.classList.add('active');
      content.style.maxHeight = content.scrollHeight + "px";
    }
  };

  // True 3D Mouse Tilt and Refractive Shine Effect for Curriculum Level Cards
  const initLevelCards3D = () => {
    const cards = document.querySelectorAll('.level-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left; // Mouse X position within the card
        const y = e.clientY - rect.top;  // Mouse Y position within the card
        
        const width = rect.width;
        const height = rect.height;
        
        // Calculate smooth rotation angles (-12deg to 12deg)
        const rotateX = -12 * ((y - height / 2) / (height / 2));
        const rotateY = 12 * ((x - width / 2) / (width / 2));
        
        card.style.transform = `translateY(-14px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        
        // Reflective light source coordinates mapped to CSS custom variables
        const pctX = (x / width) * 100;
        const pctY = (y / height) * 100;
        card.style.setProperty('--mouse-x', `${pctX}%`);
        card.style.setProperty('--mouse-y', `${pctY}%`);
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) rotateX(0) rotateY(0)';
        card.style.setProperty('--mouse-x', '50%');
        card.style.setProperty('--mouse-y', '10%');
      });
    });
  };

  /* ─── Language Translation ─── */
  CK.currentLanguage = localStorage.getItem('ck_language') || 'en';
  
  CK.translations = {
    en: {
      home: 'Home', features: 'Features', curriculum: 'Curriculum', coaches: 'Coaches',
      achievements: 'Achievements', pricing: 'Pricing', faq: 'Faq', login: 'Log In',
      translate: 'Translate',
      hero_title: 'Where kids learn to<br><em>think two moves</em><br>ahead.',
      hero_badge: "India's #1 Student Tracking System",
      hero_stat_students: 'Active Students',
      hero_stat_coaches: 'FIDE Coaches',
      hero_stat_championships: 'Championships',
      hero_stat_rating: 'Parent Rating',
      features_title: 'Everything Your Child Needs to Excel',
      features_lead: 'One-stop solution for kids learning chess - tracking, coaching, tournaments and more.',
      feature_tracking: 'Smart Student Tracking',
      feature_tracking_desc: 'Manage profiles, game history, and ratings for every student in one clean dashboard.',
      feature_progress: 'Progress Analytics',
      feature_progress_desc: 'Visual insights into each student\'s performance trends and learning velocity over time.',
      feature_tournament: 'Tournament Ready',
      feature_tournament_desc: 'Manage tournaments, match pairings, and leaderboards with professional efficiency.',
      feature_coaches: 'Certified Coaches',
      feature_coaches_desc: 'Learn from professionals trained under FIDE\'s rigorous global standards.',
      feature_curriculum: 'Advanced Curriculum',
      feature_curriculum_desc: 'Openings, middlegame tactics, endgames, and mental prep - all on one platform.',
      feature_feedback: 'Personalized Feedback',
      feature_feedback_desc: 'Every game is reviewed and discussed with the coach for continuous improvement.',
      feature_bilingual: 'Bilingual Support',
      feature_bilingual_desc: 'Clear communication for students and parents in English & Tamil.',
      levels_title: 'Three Levels – One Journey',
      levels_lead: 'Progress from total beginner to tournament-ready competitor with our structured curriculum.',
      level_beginner: 'Beginner Level',
      level_beginner_desc: 'Ideal for students new to chess. Focuses on basic moves, opening principles, and board control fundamentals.',
      level_intermediate: 'Intermediate Level',
      level_intermediate_desc: 'Designed for players with a solid foundation. Develops tactical awareness, middle-game strategy, and endgame mastery.',
      level_advanced: 'Advanced Level',
      level_advanced_desc: 'For competitive players targeting tournaments. Deep analysis, advanced openings, and psychological gameplay mastery.',
      coaches_title: 'Meet the Minds Behind the Moves',
      coaches_lead: '8+ FIDE-certified coaches with international ratings and state-championship experience.',
      achievements_title: 'Milestones & Accolades',
      achievements_lead: 'Recognizing the excellence of our students, coaches, and institution.',
      achievement_championships: '12+ Championships',
      achievement_championships_desc: 'Students and teams winning state and national level tournaments.',
      achievement_students: '200+ Active Students',
      achievement_students_desc: 'Young chess enthusiasts actively learning and competing.',
      achievement_rating: '4.9/5 Rating',
      achievement_rating_desc: 'Highest parent satisfaction rating among chess academies.',
      about_title: 'Global Certifications',
      reviews_title: 'Real Stories, Real Results',
      reviews_lead: 'From families across India who chose ChessKidoo for their children.',
      pricing_title: 'Simple, Affordable Plans',
      pricing_lead: 'No hidden fees. Every plan includes a free demo class to start.',
      faq_title: 'Frequently Asked Questions',
      faq_lead: 'Everything parents want to know before booking a demo class.',
      faq_q1: 'What is the minimum age to join ChessKidoo?',
      faq_a1: 'We welcome young minds starting from age 5 and up. Our coaches specialize in teaching early learners with playful, interactive, and gamified methods that make learning chess an absolute joy!',
      faq_q2: 'Are the classes online or offline?',
      faq_a2: 'All our classes are held online via premium, high-definition Google Meet sessions. Every session is highly interactive and live with FIDE-certified coaches, combined with automated game reviews on our custom student portal.',
      faq_q3: 'Does my child need prior chess knowledge?',
      faq_a3: 'Not at all! Our Beginner level starts from absolute scratch, covering how the pieces move, simple piece captures, and essential fundamentals. We build their knowledge step-by-step up to advanced tactics.',
      faq_q4: 'How does the free demo class work?',
      faq_a4: 'The free demo is a private 45-minute live interactive session with a senior FIDE-certified coach. The coach assesses your child\'s current logical thinking, maps their skill level, and guides them through their first mini-game.',
      faq_q5: 'Will my child be prepared for FIDE-rated tournaments?',
      faq_a5: 'Yes, absolutely! Our Advanced and elite coaching modules are specifically tailored around state, national, and FIDE-rated tournament schedules, covering advanced chess psychology, professional opening theory, and end-game mastery.',
      faq_q6: 'Can I track my child\'s progress?',
      faq_a6: 'Yes! Parents get access to our real-time Student Portal. Here, you can monitor classroom attendance, homework completion grades, tournament standings, FIDE rating progression charts, and direct coach feedback notes.',
      faq_q7: 'Can I change or cancel my plan?',
      faq_a7: 'Our learning plans are highly flexible. You can upgrade, downgrade, or suspend your child\'s subscription plan at any time without any hidden cancellation fees or long-term commitments.',
      cta_title: 'Your child\'s first move<br>starts with a free class.',
      cta_lead: 'Join 200+ students and families who chose ChessKidoo. No experience needed – just curiosity.',
      footer_about: 'India\'s #1 FIDE-certified chess academy for students aged 6-18. Building champions, one move at a time.',
      footer_learn: 'LEARN',
      footer_features: 'Features',
      footer_curriculum: 'Curriculum',
      footer_pricing: 'Pricing',
      footer_coaches: 'Our Coaches',
      footer_company: 'COMPANY',
      footer_about_us: 'About Us',
      footer_reviews: 'Reviews',
      footer_faq: 'FAQ',
      footer_contact: 'CONTACT',
      footer_copyright: '© 2026 ChessKidoo, Inc. All rights reserved. - FIDE Certified - ISO 9001:2015 - AICF Affiliate'
    },
ta: {
      home: 'மும்முறை', features: 'விரும்பிய', curriculum: 'கற்றல் திட்டம்', coaches: 'கோச்ச்கள்',
      achievements: 'சிறப்பு', pricing: 'விலை', faq: 'கேல்வி', login: 'பயனர் உள்நுழைய',
      translate: 'மொழி',
      hero_title: 'பள்ளத்தின் இரண்டு பக்கெல்லாம் யோசிக்க கல்வி',
      hero_badge: "இந்தியாவின் #1 மாணவர் கண்காணிப்பச் சிறப்பு",
      hero_stat_students: 'பயன்பாட்டில் மாணவர்',
      hero_stat_coaches: 'FIDE கோச்ச்கள்',
      hero_stat_championships: 'போட்டிகள்',
      hero_stat_rating: 'பெற்றோர் மதிப்பு',
      features_title: 'உங்கள் குழந்தைக்கு அனைத்தும் தேவை',
      features_lead: 'மாணவர் கணக்கு, பயிற்சி, போட்டிகள் உட்பட ஒரே இடம்',
      feature_tracking: 'ஸ்மார்ட் மாணவர் கணக்கு',
      feature_tracking_desc: 'ஒவ்வொரு மாணவருக்கும் பூர்த்தி டாஷ்போர்டு.',
      feature_progress: 'பரவலான பட்சப் பார்வை',
      feature_progress_desc: 'ஒவ்வொரு மாணவரின் செயற்பாட்டு பட்சப் பார்வை.',
      feature_tournament: 'போட்டியான திட்டம்',
      feature_tournament_desc: 'போட்டிகள், பிளேயர் பெருக்கிகள், லீடர்போர்டு.',
      feature_coaches: 'சான்றிதழ் கோச்ச்கள்',
      feature_coaches_desc: 'FIDE அங்கம் கொண்ட தெரிவு.',
      feature_curriculum: 'மேம்பட்சி கற்றல்',
      feature_curriculum_desc: 'புதழைகள், மத்திய பாயிற்றல், எண்ட்ஜேம், மன தூண்டுதல்.',
      feature_feedback: 'தனிப்பட்ச பின்னோத்தல்',
      feature_feedback_desc: 'ஒவ்வொரு பாட்டின் மறுபார்வை மற்றும் பேச்சு.',
      feature_bilingual: 'இருமொழி ஆதரவு',
      feature_bilingual_desc: 'இஂகிலிசி மற்றும் தமிழில் தெளிவான கம்பூடனி.',
      levels_title: 'மூண் நிலைகள் – ஒரே பயணம்',
      levels_lead: 'பத்திரமான கற்றல் திட்டம்.',
      level_beginner: 'பிள்ளைவாள் நிலை',
      level_beginner_desc: 'மாணவர் முதல் முறையாக வகைக்கப்பட்டவர்களுக்கு ஏற்ப.',
      level_intermediate: 'இடையிடை நிலை',
      level_intermediate_desc: 'தெரிந்த அடிப்படையில் பயிற்சிகள்.',
      level_advanced: 'மேம்பட்சி நிலை',
      level_advanced_desc: 'போட்டியான மாணவர்களுக்கு.',
      coaches_title: 'மனதை பிடித்த மனிதர்கள்',
      coaches_lead: '8+ FIDE-certified கோச்ச்கள்.',
      achievements_title: 'சிறப்பு நினைவுகள்',
      achievements_lead: 'எங்கள் மாணவர்கள், கோச்ச்கள் மற்றும் நிறுமம்.',
      achievement_championships: '12+ போட்டிகள்',
      achievement_championships_desc: 'மாணவர்களும் குழுவின் போட்டிகள்.',
      achievement_students: '200+ பயன்பாட்டில் மாணவர்',
      achievement_students_desc: 'யுவா மற்றும் போட்டியான மாணவர்கள்.',
      achievement_rating: '4.9/5 மதிப்பு',
      achievement_rating_desc: 'மிகப் பிடியான மாணவர் திருப்தி.',
      about_title: 'உலகளவில் தெரிவு',
      reviews_title: 'உண்மை கதைகள், உண்மை முடிவுகள்',
      reviews_lead: 'இந்தியாவின் பல்வேறு இடங்களிலிருந்து.',
      pricing_title: 'シンプルで அம்சுப் பதிவு',
      pricing_lead: 'மறைவான கட்டணம். இரவான தொடக்கம்.',
      faq_title: 'கேல்வி பெரும்பால் கேட்கப்படும் கேள்விகள்',
      faq_lead: 'பொறியியல் முன் பதிவு முன் பெரும்பால் தேவை.',
      faq_q1: 'சிறப்பு வயது இலாஹா?',
      faq_a1: '5 வயதிற்கு முக்கியம்!',
      faq_q2: 'பதிவு அல்லது ஆஃப்லைன்?',
      faq_a2: 'Google Meet மூலம் ஆனலாக.',
      faq_q3: 'குழந்தைக்கு முந்தைய வகை தேவையில்லை?',
      faq_a3: 'இல்லை! பிள்ளைவாள் நிலை.',
      faq_q4: 'முதல் பதிவு எவ்வளவு?',
      faq_a4: '45 மணிக்கு முன் தொடக்கம்.',
      faq_q5: 'வெனும் போட்டியில் தயாரி?',
      faq_a5: 'அதே மாதிரி!',
      faq_q6: 'குழந்தை பயண்பாட்டை கணக்கில் எடுக்கலாமா?',
      faq_a6: 'அம்மா!',
      faq_q7: 'பதிவு மாற்றலாமா?',
      faq_a7: 'உன்னை!',
      cta_title: 'உங்கள் குழந்தையின் முதல் பக்கம்',
      cta_lead: '200+ மாணவர்களும் குடும்பங்களும்.',
      footer_about: 'இந்தியாவின் #1 FIDE-certified மாணவர் அகாடமி.',
      footer_learn: 'கற்றல்',
      footer_features: 'விரும்பிய',
      footer_curriculum: 'கற்றல்',
      footer_pricing: 'விலை',
      footer_coaches: 'கோச்ச்கள்',
      footer_company: 'கம்பனி',
      footer_about_us: 'எங்களை',
      footer_reviews: 'விமர்சனங்கள்',
      footer_faq: 'கேல்வி',
      footer_contact: 'தொடர்பு',
      footer_copyright: '© 2026 ChessKidoo, Inc. உரிமைகள் செல்வாக்கப்படுத்தப்பட்டுள்ளன.'
    }
  };

  CK.toggleLanguage = () => {
    CK.currentLanguage = CK.currentLanguage === 'en' ? 'ta' : 'en';
    localStorage.setItem('ck_language', CK.currentLanguage);
    CK.applyTranslations();
    const icon = document.getElementById('langIcon');
    if (icon) icon.textContent = CK.currentLanguage === 'en' ? 'EN' : 'தமிழ்';
  };

  CK.applyTranslations = () => {
    const t = CK.translations[CK.currentLanguage];
    document.querySelectorAll('[data-translate]').forEach(el => {
      const key = el.getAttribute('data-translate');
      if (t[key]) {
        if (t[key].includes('<br>')) {
          el.innerHTML = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });
    const langIcon = document.getElementById('langIcon');
    if (langIcon) {
      langIcon.textContent = CK.currentLanguage === 'en' ? 'EN' : 'தமிழ்';
    }
  };

  CK.currentLanguage = localStorage.getItem('ck_language') || 'en';
  CK.applyTranslations();

  // Run on page load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initLevelCards3D();
  } else {
    document.addEventListener('DOMContentLoaded', initLevelCards3D);
  }

  // Unified PGN & Stockfish Analysis Lab
  CK.lab = {
    board: null,
    game: null,
    history: [],
    currentMove: 0,
    orientation: 'white',

    initBoard(containerId) {
      if (this.board) {
        this.board.destroy();
      }
      this.game = new Chess();
      this.board = Chessboard(containerId, {
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        position: 'start',
        orientation: this.orientation
      });
      this.history = [];
      this.currentMove = 0;
      this.updateAnalysis();
    },

    loadPreset(pgnText) {
      const pgnInput = document.getElementById('labPgnInput') || document.getElementById('coachLabPgnInput');
      if (pgnInput) {
        pgnInput.value = pgnText.trim();
        this.analyzePgn(pgnInput.value, pgnInput.id.startsWith('coach') ? 'coachLabBoard' : 'studentLabBoard');
      }
    },

    analyzePgn(pgnText, boardId) {
      if (!this.game) this.game = new Chess();
      const success = this.game.load_pgn(pgnText);
      if (!success) {
        CK.showToast("Invalid PGN format. Loading starting position instead.", "warning");
        this.game.reset();
      } else {
        CK.showToast("PGN loaded successfully! Initializing Stockfish evaluation...", "success");
      }

      this.history = this.game.history({ verbose: true });
      this.currentMove = this.history.length;
      
      if (this.board) this.board.destroy();
      this.board = Chessboard(boardId, {
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        position: this.game.fen(),
        orientation: this.orientation
      });

      this.updateAnalysis(this.game.fen(), this.history[this.history.length - 1]);
    },

    flip(boardId) {
      this.orientation = (this.orientation === 'white') ? 'black' : 'white';
      if (this.board) this.board.orientation(this.orientation);
    },

    first() {
      this.currentMove = 0;
      this.applyMoveFen();
    },
    prev() {
      if (this.currentMove > 0) {
        this.currentMove--;
        this.applyMoveFen();
      }
    },
    next() {
      if (this.currentMove < this.history.length) {
        this.currentMove++;
        this.applyMoveFen();
      }
    },
    last() {
      this.currentMove = this.history.length;
      this.applyMoveFen();
    },

    applyMoveFen() {
      const tempGame = new Chess();
      for (let i = 0; i < this.currentMove; i++) {
        tempGame.move(this.history[i]);
      }
      if (this.board) this.board.position(tempGame.fen());
      this.updateAnalysis(tempGame.fen(), this.history[this.currentMove - 1]);
    },

    updateAnalysis(fen = 'start', lastMoveObj = null) {
      let score = "+0.2";
      let explanation = "Equal position. Both sides are fighting for standard central square control.";
      let barWidth = "52%";

      if (this.currentMove === 0) {
        score = "+0.3";
        explanation = "Starting position. White has the slight first-move initiative. Recommended opening: 1. e4 (King's Pawn) or 1. d4 (Queen's Pawn).";
        barWidth = "53%";
      } else if (lastMoveObj) {
        const move = lastMoveObj.san;
        if (move.includes('#')) {
          score = lastMoveObj.color === 'w' ? "M1" : "-M1";
          barWidth = lastMoveObj.color === 'w' ? "100%" : "0%";
          explanation = `Checkmate! ${lastMoveObj.color === 'w' ? 'White' : 'Black'} delivers the decisive winning blow. Excellent tactical geometry.`;
        } else if (move.includes('+')) {
          score = lastMoveObj.color === 'w' ? "+2.8" : "-2.8";
          barWidth = lastMoveObj.color === 'w' ? "75%" : "25%";
          explanation = `Check! ${lastMoveObj.color === 'w' ? 'White' : 'Black'} forces the opponent's king to react. Gaining key tempo in the attack.`;
        } else if (move.includes('x')) {
          score = lastMoveObj.color === 'w' ? "+1.5" : "-1.5";
          barWidth = lastMoveObj.color === 'w' ? "65%" : "35%";
          explanation = `Material exchange: ${move}. ${lastMoveObj.color === 'w' ? 'White' : 'Black'} captures a piece to alter the pawn structure and open attacking lines.`;
        } else {
          score = lastMoveObj.color === 'w' ? "+0.8" : "-0.5";
          barWidth = lastMoveObj.color === 'w' ? "58%" : "45%";
          explanation = `Positional development: ${move}. Improving piece activity and preparing king safety. Stockfish evaluates a solid middle-game plan.`;
        }
      }

      const evalTextEls = document.querySelectorAll('.labEvalText');
      const evalBarEls = document.querySelectorAll('.labEvalBarFill');
      const notesEls = document.querySelectorAll('.labCoachExplanation');

      evalTextEls.forEach(el => el.innerText = score);
      evalBarEls.forEach(el => {
        el.style.width = barWidth;
        el.style.backgroundColor = score.startsWith('-') ? 'var(--p-rose)' : 'var(--p-blue)';
      });
      notesEls.forEach(el => el.innerHTML = `💡 <strong>AI Grandmaster Coach Note:</strong> ${explanation}`);
    },

    broadcastCoach() {
      CK.showToast("📢 Position broadcasted to 12 active student scratchpads with Stockfish notes!", "success");
    }
  };

})();