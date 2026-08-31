/**
 * ChessKidoo — Landing Page Interactive Suite (v3.0)
 * ─────────────────────────────────────────────────────────────────
 * 1. Interactive ELO Level Evaluator Quiz (5-question dynamic quiz with custom recommendations)
 * 2. Live Global Batch Schedule & Timezone Converter (IST, EST, PST, CST, BST, GST, SGT, AEST)
 * 3. 3D Chess Piece Sound & Tilt Hover Effects
 */
(function () {
  'use strict';

  window.CK = window.CK || {};

  // ── Web Audio Synthesizer for Interactive FX ──
  let audioCtx = null;
  function playBeep(freq = 440, type = 'sine', duration = 0.12) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  // ─────────────────────────────────────────────────────────────────
  // 1. INTERACTIVE ELO LEVEL EVALUATOR QUIZ
  // ─────────────────────────────────────────────────────────────────
  const QUIZ_QUESTIONS = [
    {
      q: "1. Has your child played chess before?",
      options: [
        { text: "No, they are completely new to chess rules", score: 0 },
        { text: "Yes, they know how pieces move and capture", score: 1 },
        { text: "Yes, they play on Chess.com / Lichess regularly", score: 2 },
        { text: "Yes, they have played in school or local rated tournaments", score: 3 }
      ]
    },
    {
      q: "2. Can they solve basic tactics like Knight Forks or Back-Rank Checkmates?",
      options: [
        { text: "What is a Knight fork? (Not yet)", score: 0 },
        { text: "They recognize simple checkmates in 1 move", score: 1 },
        { text: "Yes, they easily find forks, pins, and skewers in games", score: 2 },
        { text: "They calculate multi-move tactical combinations effortlessly", score: 3 }
      ]
    },
    {
      q: "3. What is their current online or FIDE rating (approximate)?",
      options: [
        { text: "Unrated / Under 500 ELO", score: 0 },
        { text: "500 – 900 ELO", score: 1 },
        { text: "900 – 1400 ELO", score: 2 },
        { text: "1400+ ELO / Official FIDE Rating", score: 3 }
      ]
    },
    {
      q: "4. How comfortable are they with opening principles and castling early?",
      options: [
        { text: "They tend to move random pawns or bring the Queen out too early", score: 0 },
        { text: "They know to control the center and castle kingside", score: 1 },
        { text: "They have a repertoire (Italian, Sicilian, Queen's Gambit, etc.)", score: 2 },
        { text: "They study deep master opening theory and positional plans", score: 3 }
      ]
    },
    {
      q: "5. What is the primary learning goal for your child?",
      options: [
        { text: "Develop concentration, screen-free focus & have fun learning", score: 0 },
        { text: "Beat friends and parents and win school chess matches", score: 1 },
        { text: "Climb rating ladders and compete in district/state tournaments", score: 2 },
        { text: "Achieve International FIDE Rating & Grandmaster masterclasses", score: 3 }
      ]
    }
  ];

  let currentQuizStep = 0;
  let quizScores = [];

  window.initLevelQuiz = function () {
    currentQuizStep = 0;
    quizScores = [];
    window.renderQuizStep();
  };

  window.renderQuizStep = function () {
    const container = document.getElementById('ck-quiz-container');
    if (!container) return;

    if (currentQuizStep >= QUIZ_QUESTIONS.length) {
      window.renderQuizResults();
      return;
    }

    const item = QUIZ_QUESTIONS[currentQuizStep];
    const progressPercent = Math.round(((currentQuizStep + 1) / QUIZ_QUESTIONS.length) * 100);

    container.innerHTML = `
      <div style="background:linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95)); border:1.5px solid rgba(218, 163, 62, 0.35); border-radius:20px; padding:28px; box-shadow:0 20px 40px rgba(0,0,0,0.5); position:relative; overflow:hidden;">
        <!-- Glowing Top Bar -->
        <div style="position:absolute; top:0; left:0; width:100%; height:4px; background:rgba(255,255,255,0.08);">
          <div style="width:${progressPercent}%; height:100%; background:linear-gradient(90deg, var(--gold), #fbbf24); transition:width 0.4s ease;"></div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <span style="font-size:12px; font-weight:800; color:var(--gold); text-transform:uppercase; letter-spacing:1px;">
            Question ${currentQuizStep + 1} of ${QUIZ_QUESTIONS.length}
          </span>
          <span style="font-size:12px; font-weight:700; color:#94a3b8;">${progressPercent}% Complete</span>
        </div>

        <h4 style="color:#fff; font-size:18px; font-weight:700; margin:0 0 20px; line-height:1.4;">
          ${item.q}
        </h4>

        <div style="display:grid; gap:12px;">
          ${item.options.map((opt, idx) => `
            <button type="button" class="quiz-opt-btn" onclick="window.selectQuizOption(${opt.score})"
                    style="text-align:left; padding:14px 18px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:#e2e8f0; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.25s ease; display:flex; align-items:center; gap:12px;">
              <span style="width:26px; height:26px; border-radius:50%; background:rgba(218,163,62,0.15); border:1px solid var(--gold); color:var(--gold); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:800; flex-shrink:0;">
                ${String.fromCharCode(65 + idx)}
              </span>
              <span>${opt.text}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  };

  window.selectQuizOption = function (score) {
    playBeep(520, 'sine', 0.08);
    quizScores.push(score);
    currentQuizStep++;
    window.renderQuizStep();
  };

  window.renderQuizResults = function () {
    const totalScore = quizScores.reduce((a, b) => a + b, 0);
    const container = document.getElementById('ck-quiz-container');
    if (!container) return;

    let recommendation = {
      level: 'Pawn — Beginner Level',
      badge: '♟️ BEGINNER CHAMPION',
      color: '#9A7B1C',
      elo: 'Unrated – 800 ELO',
      desc: 'Perfect starting ground! We focus on board mastery, legal moves, piece values, and simple 1-move checkmate patterns through playful interactive puzzles.',
      course: 'Beginner'
    };

    if (totalScore >= 11) {
      recommendation = {
        level: 'King — Master FIDE Level',
        badge: '♚ MASTER / COMPETITIVE',
        color: '#DC2626',
        elo: '1800 – 2400+ ELO',
        desc: 'Advanced competitive track! Focused on deep Grandmaster opening theory, dynamic pawn structures, psychological stamina, and international FIDE title training.',
        course: 'Master'
      };
    } else if (totalScore >= 7) {
      recommendation = {
        level: 'Rook — Advanced Level',
        badge: '♜ ADVANCED TACTICIAN',
        color: '#EA580C',
        elo: '1400 – 1800 ELO',
        desc: 'Tournament readiness! Deep exploration of opening systems, strategic planning, Lucena/Philidor endgame technique, and clock management under pressure.',
        course: 'Advanced'
      };
    } else if (totalScore >= 3) {
      recommendation = {
        level: 'Knight — Intermediate Level',
        badge: '♞ INTERMEDIATE STRATEGIST',
        color: '#D97706',
        elo: '800 – 1400 ELO',
        desc: 'Tactics & Middle-game mastery! Learning multi-move calculation, knight forks, skewer attacks, pins, opening traps, and winning endgame conversions.',
        course: 'Intermediate'
      };
    }

    playBeep(659, 'triangle', 0.2);

    container.innerHTML = `
      <div style="background:linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.95)); border:2px solid var(--gold); border-radius:20px; padding:32px; box-shadow:0 25px 50px rgba(0,0,0,0.6); text-align:center;">
        <div style="display:inline-flex; align-items:center; gap:8px; background:${recommendation.color}22; color:${recommendation.color}; border:1px solid ${recommendation.color}66; padding:6px 16px; border-radius:99px; font-size:12px; font-weight:800; text-transform:uppercase; margin-bottom:14px;">
          ${recommendation.badge}
        </div>

        <h3 style="color:#fff; font-size:24px; font-weight:800; margin:0 0 8px;">
          Recommended Path: <span style="color:var(--gold);">${recommendation.level}</span>
        </h3>
        <div style="font-size:14px; font-weight:700; color:#cbd5e1; margin-bottom:14px;">
          Target Rating Bracket: <span style="color:#38bdf8;">${recommendation.elo}</span>
        </div>

        <p style="color:#94a3b8; font-size:14px; line-height:1.6; max-width:540px; margin:0 auto 24px;">
          ${recommendation.desc}
        </p>

        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
          <button class="btn btn-gold" onclick="if(window.CK && window.CK.openDemoModal) window.CK.openDemoModal();" style="padding:12px 28px; font-weight:800; font-size:15px; box-shadow:0 8px 24px rgba(218,163,62,0.3);">
            🚀 Book Free 1-on-1 Trial Class
          </button>
          <button class="btn btn-outline" onclick="window.initLevelQuiz()" style="padding:12px 20px; font-size:13px;">
            🔄 Retake Quiz
          </button>
        </div>
      </div>
    `;
  };

  // ─────────────────────────────────────────────────────────────────
  // 2. LIVE GLOBAL TIMEZONE & BATCH SCHEDULE CONVERTER
  // ─────────────────────────────────────────────────────────────────
  const TIMEZONES = [
    { code: 'IST', name: '🇮🇳 India (IST)', offset: 5.5 },
    { code: 'EST', name: '🇺🇸 US Eastern (EST/EDT)', offset: -4 },
    { code: 'CST', name: '🇺🇸 US Central (CST/CDT)', offset: -5 },
    { code: 'PST', name: '🇺🇸 US Pacific (PST/PDT)', offset: -7 },
    { code: 'BST', name: '🇬🇧 UK / Europe (BST/GMT)', offset: 1 },
    { code: 'GST', name: '🇦🇪 UAE & Gulf (GST)', offset: 4 },
    { code: 'SGT', name: '🇸🇬 Singapore / Malaysia (SGT)', offset: 8 },
    { code: 'AEST', name: '🇦🇺 Australia (AEST)', offset: 10 }
  ];

  const BATCH_SLOTS_IST = [
    { title: 'Morning Beginner Foundation', days: 'Mon, Wed, Fri', timeIST: '10:00 AM', category: 'Beginner' },
    { title: 'Afternoon Tactical Sharpening', days: 'Tue, Thu, Sat', timeIST: '03:00 PM', category: 'Intermediate' },
    { title: 'Evening Grandmaster Repertoire', days: 'Mon, Wed, Fri', timeIST: '06:00 PM', category: 'Advanced' },
    { title: 'Night International Blitz & Prep', days: 'Sat & Sun', timeIST: '08:30 PM', category: 'Master / FIDE' }
  ];

  let selectedTimezoneCode = 'IST';

  function convertTimeFromIST(timeStr, targetTzCode) {
    const targetTz = TIMEZONES.find(t => t.code === targetTzCode) || TIMEZONES[0];
    const diffHours = targetTz.offset - 5.5; // Difference from IST

    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return timeStr;

    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const isPM = match[3].toUpperCase() === 'PM';
    if (isPM && h !== 12) h += 12;
    if (!isPM && h === 12) h = 0;

    let totalMinutes = h * 60 + m + (diffHours * 60);
    totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;

    const outH = Math.floor(totalMinutes / 60);
    const outM = Math.floor(totalMinutes % 60);
    const ampm = outH >= 12 ? 'PM' : 'AM';
    const displayH = outH % 12 === 0 ? 12 : outH % 12;
    const displayM = String(outM).padStart(2, '0');

    return `${displayH}:${displayM} ${ampm} ${targetTz.code}`;
  }

  window.setTimezone = function (tzCode) {
    selectedTimezoneCode = tzCode;
    playBeep(480, 'sine', 0.08);
    window.renderScheduleMatrix();
  };

  window.renderScheduleMatrix = function () {
    const container = document.getElementById('ck-live-schedule-container');
    if (!container) return;

    const tzPills = TIMEZONES.map(t => {
      const active = t.code === selectedTimezoneCode;
      return `
        <button type="button" onclick="window.setTimezone('${t.code}')"
                style="padding:6px 14px; border-radius:99px; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.2s; border:1px solid ${active ? 'var(--gold)' : 'rgba(255,255,255,0.15)'}; background:${active ? 'var(--gold)' : 'rgba(255,255,255,0.04)'}; color:${active ? '#0f172a' : '#cbd5e1'};">
          ${t.name}
        </button>
      `;
    }).join('');

    const cardsHtml = BATCH_SLOTS_IST.map(slot => {
      const localTime = convertTimeFromIST(slot.timeIST, selectedTimezoneCode);
      return `
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:18px; display:flex; flex-direction:column; justify-content:space-between; gap:10px; transition:transform 0.2s;" onmouseenter="this.style.borderColor='rgba(218,163,62,0.4)'; this.style.transform='translateY(-3px)'" onmouseleave="this.style.borderColor='rgba(255,255,255,0.08)'; this.style.transform='none'">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11px; font-weight:800; background:rgba(218,163,62,0.15); color:var(--gold); padding:3px 8px; border-radius:6px; border:1px solid rgba(218,163,62,0.3);">${slot.category}</span>
            <span style="font-size:12px; color:#94a3b8; font-weight:600;">📅 ${slot.days}</span>
          </div>
          <h4 style="margin:0; color:#fff; font-size:15px; font-weight:700;">${slot.title}</h4>
          <div style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
            <span style="font-size:14px;">⏰</span>
            <span style="font-size:14px; font-weight:800; color:var(--gold);">${localTime}</span>
            <span style="font-size:11px; color:#64748b; margin-left:auto;">(IST: ${slot.timeIST})</span>
          </div>
          <button class="btn btn-outline btn-sm" onclick="if(window.CK && window.CK.openDemoModal) window.CK.openDemoModal();" style="width:100%; font-size:12px; padding:6px; border-color:rgba(218,163,62,0.4); color:var(--gold);">
            Book This Slot
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="background:linear-gradient(135deg, #0b1329, #111c38); border:1px solid var(--border); border-radius:20px; padding:28px; box-shadow:0 20px 40px rgba(0,0,0,0.5);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px; margin-bottom:20px;">
          <div>
            <span style="font-size:11px; font-weight:800; color:var(--gold); text-transform:uppercase; letter-spacing:1px;">🌐 Global Live Timings</span>
            <h3 style="color:#fff; font-size:20px; font-weight:800; margin:4px 0 0;">Live Weekly Batch Schedules</h3>
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; max-width:600px;">
            ${tzPills}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(250px, 1fr)); gap:16px;">
          ${cardsHtml}
        </div>
      </div>
    `;
  };

  // ─────────────────────────────────────────────────────────────────
  // 3. 3D CHESS PIECE SHOWCASE & TILT HOVER FX
  // ─────────────────────────────────────────────────────────────────
  window.init3dPieceShowcase = function () {
    const stations = document.querySelectorAll('.lj-station, .level-card');
    stations.forEach(card => {
      card.addEventListener('mouseenter', () => {
        playBeep(600, 'triangle', 0.05);
      });
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - (rect.width / 2);
        const y = e.clientY - rect.top - (rect.height / 2);
        const tiltX = (y / (rect.height / 2)) * -6;
        const tiltY = (x / (rect.width / 2)) * 6;
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  };

  // Auto-initialize on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    window.initLevelQuiz();
    window.renderScheduleMatrix();
    setTimeout(() => window.init3dPieceShowcase(), 200);
  });
})();
