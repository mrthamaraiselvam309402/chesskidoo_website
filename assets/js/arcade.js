/* assets/js/arcade.js --------------------------------------------------------
   ChessKidoo Standalone Interactive Arcade
   Highly polished client-side chess games & brain boosters.
   --------------------------------------------------------------- */

window.CK = window.CK || {};

CK.arcade = (() => {
  const ARC = {};

  // Synthesize sound effects on-the-fly using Web Audio API
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSFX(type) {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'coin') {
        // Star collected sound - 8bit style
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'win') {
        // Major chord arpeggio
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'triangle';
          o.frequency.setValueAtTime(freq, now + idx * 0.08);
          g.gain.setValueAtTime(0.12, now + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.4);
          o.start(now + idx * 0.08);
          o.stop(now + idx * 0.08 + 0.45);
        });
      } else if (type === 'buzz') {
        // Wrong move sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'select') {
        // soft selection tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      console.warn("AudioContext block/error: ", e);
    }
  }

  // General state variables
  let currentGameType = '';
  let score = 0;
  let level = 1;
  let state = {};

  // Trigger overlays
  function showOverlay() {
    const el = document.getElementById('arcade-overlay');
    if (el) el.classList.add('active');
  }

  function hideOverlay() {
    const el = document.getElementById('arcade-overlay');
    if (el) el.classList.remove('active');
    // Clear interval timers
    if (state.timerInterval) clearInterval(state.timerInterval);
    currentGameType = '';
  }

  // Exported helpers
  ARC.exitGame = () => {
    hideOverlay();
  };

  /* ==========================================
     GAME 1: CHESS PUZZLE RUSH
     ========================================== */
  const PUZZLES = [
    {
      title: "Rook Mate-in-1",
      desc: "Find the back-rank mate with your White Rook!",
      fen: "6k1/5ppp/8/8/8/8/8/1R4K1 w - - 0 1",
      pieces: {
        'b1': { type: 'R', color: 'white', unicode: '♖' },
        'g8': { type: 'k', color: 'black', unicode: '♚' },
        'f7': { type: 'p', color: 'black', unicode: '♟' },
        'g7': { type: 'p', color: 'black', unicode: '♟' },
        'h7': { type: 'p', color: 'black', unicode: '♟' },
        'g1': { type: 'K', color: 'white', unicode: '♔' }
      },
      solution: { from: 'b1', to: 'b8' },
      hint: "Slide the rook all the way to the 8th rank to trap the king!"
    },
    {
      title: "Knight Fork!",
      desc: "Find the Knight fork on King and Queen!",
      fen: "4k3/8/5q2/8/3N4/8/8/4K3 w - - 0 1",
      pieces: {
        'd4': { type: 'N', color: 'white', unicode: '♘' },
        'e8': { type: 'k', color: 'black', unicode: '♚' },
        'f6': { type: 'q', color: 'black', unicode: '♛' },
        'e1': { type: 'K', color: 'white', unicode: '♔' }
      },
      solution: { from: 'd4', to: 'e6' },
      hint: "Your knight can jump to a square that attacks both the black king and queen!"
    },
    {
      title: "Scholar's Mate",
      desc: "Deliver the final checkmate with your Queen!",
      fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
      pieces: {
        'f3': { type: 'Q', color: 'white', unicode: '♕' },
        'c4': { type: 'B', color: 'white', unicode: '♗' },
        'e8': { type: 'k', color: 'black', unicode: '♚' },
        'f7': { type: 'p', color: 'black', unicode: '♟' },
        'e5': { type: 'p', color: 'black', unicode: '♟' },
        'c6': { type: 'n', color: 'black', unicode: '♞' }
      },
      solution: { from: 'f3', to: 'f7' },
      hint: "Attack the weakest pawn next to the black king, supported by your Bishop!"
    },
    {
      title: "Back-Rank Guard",
      desc: "White's king is trapped! Find the defensive rook move.",
      fen: "3r2k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1",
      pieces: {
        'e1': { type: 'R', color: 'white', unicode: '♖' },
        'd8': { type: 'r', color: 'black', unicode: '♜' },
        'g8': { type: 'k', color: 'black', unicode: '♚' },
        'f7': { type: 'p', color: 'black', unicode: '♟' },
        'g7': { type: 'p', color: 'black', unicode: '♟' },
        'h7': { type: 'p', color: 'black', unicode: '♟' },
        'g1': { type: 'K', color: 'white', unicode: '♔' }
      },
      solution: { from: 'e1', to: 'e8' },
      hint: "Capture the black rook directly on e8 to solve the back rank crisis!"
    }
  ];

  ARC.startPuzzleGame = () => {
    currentGameType = 'puzzle';
    score = 0;
    level = 1;
    state = {
      puzzleIndex: 0,
      selectedSquare: null,
      solved: false
    };
    showOverlay();
    renderPuzzle();
  };

  function renderPuzzle() {
    const puzzle = PUZZLES[state.puzzleIndex];
    if (!puzzle) {
      // Completed all puzzles
      playSFX('win');
      renderPuzzleComplete();
      return;
    }

    const content = document.getElementById('arcade-cabinet-content');
    if (!content) return;

    // Generate board grid html
    let boardHTML = '';
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    ranks.forEach(rank => {
      files.forEach(file => {
        const sq = file + rank;
        const isDark = (files.indexOf(file) + ranks.indexOf(rank)) % 2 !== 0;
        const piece = puzzle.pieces[sq];
        const pieceHTML = piece ? `<div class="arcade-piece ${piece.color}">${piece.unicode}</div>` : '';
        boardHTML += `
          <div class="arcade-sq ${isDark ? 'dark' : 'light'}" data-sq="${sq}">
            ${pieceHTML}
          </div>
        `;
      });
    });

    content.innerHTML = `
      <div class="arcade-header">
        <div class="arcade-title-area">
          <span class="arcade-game-icon">🧩</span>
          <div class="arcade-title">Puzzle <span>Rush</span></div>
        </div>
        <button class="arcade-exit-btn" onclick="CK.arcade.exitGame()">✕ Exit Arcade</button>
      </div>
      <div class="arcade-main">
        <div class="arcade-play-area">
          <div class="arcade-board-wrap">
            <div class="arcade-board" id="puzzle-board">
              ${boardHTML}
            </div>
          </div>
        </div>
        <div class="arcade-dashboard">
          <div class="arcade-hud-card">
            <div class="arcade-game-title">${puzzle.title}</div>
            <div class="arcade-game-desc">${puzzle.desc}</div>
            
            <div class="arcade-stats-row">
              <div class="arcade-stat-box">
                <div class="arcade-stat-label">Puzzles Solved</div>
                <div class="arcade-stat-val">${state.puzzleIndex} / ${PUZZLES.length}</div>
              </div>
              <div class="arcade-stat-box">
                <div class="arcade-stat-label">Score</div>
                <div class="arcade-stat-val">${score}</div>
              </div>
            </div>

            <div class="arcade-progress-container">
              <div class="arcade-progress-header">
                <span>Progress</span>
                <span>${Math.round((state.puzzleIndex / PUZZLES.length) * 100)}%</span>
              </div>
              <div class="arcade-progress-bar">
                <div class="arcade-progress-fill" style="width: ${(state.puzzleIndex / PUZZLES.length) * 100}%"></div>
              </div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.02); padding: 16px; border-radius: 12px; font-size: 0.88rem; line-height:1.5; border: 1px dashed rgba(255,255,255,0.06);">
              <span style="color:#fbbf24; font-weight:700;">💡 Hint:</span> ${puzzle.hint}
            </div>
          </div>
          
          <div class="arcade-btn-group">
            <button class="arcade-action-btn" onclick="CK.arcade.resetCurrentPuzzle()">Reset Puzzle</button>
            <button class="arcade-action-btn primary" onclick="CK.arcade.nextPuzzleSkip()">Skip &rarr;</button>
          </div>
        </div>
      </div>
    `;

    // Add board click listeners
    const squares = document.querySelectorAll('#puzzle-board .arcade-sq');
    squares.forEach(sq => {
      sq.addEventListener('click', () => handlePuzzleClick(sq.getAttribute('data-sq')));
    });
  }

  function handlePuzzleClick(sq) {
    if (state.solved) return;
    const puzzle = PUZZLES[state.puzzleIndex];
    const squares = document.querySelectorAll('#puzzle-board .arcade-sq');

    if (state.selectedSquare === null) {
      // First click: select piece to move
      const piece = puzzle.pieces[sq];
      if (piece && piece.color === 'white') {
        playSFX('select');
        state.selectedSquare = sq;
        squares.forEach(s => s.classList.remove('selected'));
        const el = document.querySelector(`[data-sq="${sq}"]`);
        if (el) el.classList.add('selected');
      }
    } else {
      // Second click: destination square
      const from = state.selectedSquare;
      const to = sq;

      if (puzzle.solution.from === from && puzzle.solution.to === to) {
        // CORRECT MOVE!
        playSFX('coin');
        state.solved = true;
        score += 25;

        // Visual flash success
        const targetSq = document.querySelector(`[data-sq="${to}"]`);
        if (targetSq) targetSq.classList.add('success-glow');

        // Move the piece visually on screen
        const fromSqEl = document.querySelector(`[data-sq="${from}"]`);
        const toSqEl = document.querySelector(`[data-sq="${to}"]`);
        if (fromSqEl && toSqEl) {
          const pieceEl = fromSqEl.querySelector('.arcade-piece');
          if (pieceEl) {
            toSqEl.innerHTML = '';
            toSqEl.appendChild(pieceEl);
            fromSqEl.innerHTML = '';
          }
        }

        setTimeout(() => {
          state.puzzleIndex++;
          state.selectedSquare = null;
          state.solved = false;
          renderPuzzle();
        }, 1000);
      } else {
        // WRONG MOVE!
        playSFX('buzz');
        // Flash wrong feedback
        const el = document.querySelector(`[data-sq="${to}"]`);
        if (el) {
          el.style.backgroundColor = 'rgba(239, 83, 80, 0.4)';
          setTimeout(() => {
            el.style.backgroundColor = '';
          }, 300);
        }
        // Deselect
        state.selectedSquare = null;
        squares.forEach(s => s.classList.remove('selected'));
      }
    }
  }

  ARC.resetCurrentPuzzle = () => {
    state.selectedSquare = null;
    state.solved = false;
    renderPuzzle();
  };

  ARC.nextPuzzleSkip = () => {
    state.puzzleIndex++;
    state.selectedSquare = null;
    state.solved = false;
    renderPuzzle();
  };

  function renderPuzzleComplete() {
    const content = document.getElementById('arcade-cabinet-content');
    if (!content) return;
    content.innerHTML = `
      <div style="text-align:center; padding: 40px 20px;">
        <div style="font-size: 5rem;">🏆</div>
        <h2 style="font-family:'Poppins', sans-serif; font-size:2.5rem; font-weight:800; color:#fff; margin: 16px 0;">All Puzzles Solved!</h2>
        <p style="color:var(--arena-text-muted); font-size:1.1rem; max-width:540px; margin: 0 auto 32px;">Incredible tactics skill! You have scored ${score} points in the Puzzle Challenge.</p>
        <div style="display:flex; justify-content:center; gap:16px;">
          <button class="arcade-action-btn primary" style="max-width:240px;" onclick="CK.arcade.startPuzzleGame()">Play Again</button>
          <button class="arcade-action-btn" style="max-width:200px;" onclick="CK.arcade.exitGame()">Exit Arcade</button>
        </div>
      </div>
    `;
  }

  /* ==========================================
     GAME 2: GUESS THE GRANDMASTER (TRIVIA)
     ========================================== */
  const GM_LIST = [
    {
      name: "Viswanathan Anand",
      photo: "https://images.chesscomfiles.com/uploads/v1/master_player/31980a3c-b0aa-11e6-99cb-005056bc0140.4fc74a96.250x250.jpeg",
      clues: [
        "First <span>Grandmaster</span> from India, born in Tamil Nadu.",
        "Famous for his blazing fast moves, earning him the nickname <span>'The Lightning Kid'</span>.",
        "Won the <span>FIDE World Chess Championship</span> five times!",
        "Awarded the prestigious Rajiv Gandhi Khel Ratna, Padma Vibhushan and first Padma Shri in sports."
      ],
      options: ["Viswanathan Anand", "Magnus Carlsen", "Praggnanandhaa", "Gukesh D"],
      correct: 0
    },
    {
      name: "Magnus Carlsen",
      photo: "https://images.chesscomfiles.com/uploads/v1/master_player/b90ae464-9dfc-11e7-9c98-005056bc0140.c7b1bc01.250x250.jpeg",
      clues: [
        "Born in <span>Norway</span> and became a GM at just 13 years old.",
        "Highest-rated chess player in history, reaching an astronomical <span>2882 FIDE Elo</span>.",
        "Known for his incredible endgames and refusal to accept quick draws.",
        "Held the world champion title in classical, rapid, and blitz chess formats simultaneously."
      ],
      options: ["Hikaru Nakamura", "Magnus Carlsen", "Bobby Fischer", "Garry Kasparov"],
      correct: 1
    },
    {
      name: "Praggnanandhaa",
      photo: "https://images.chesscomfiles.com/uploads/v1/master_player/8fdf870d-3ff6-4fa2-bf6d-23961168f869.86603bb9.250x250.jpeg",
      clues: [
        "Prominent Indian teenager GM from Chennai, Tamil Nadu.",
        "Became an <span>International Master</span> at age 10, the youngest in history.",
        "Defeated world champion Magnus Carlsen in multiple online matches.",
        "Reached the final of the 2023 FIDE World Cup to secure a spot in Candidates."
      ],
      options: ["Gukesh D", "Praggnanandhaa", "Vidit Gujrathi", "Nihal Sarin"],
      correct: 1
    },
    {
      name: "Garry Kasparov",
      photo: "https://images.chesscomfiles.com/uploads/v1/master_player/2ef419b4-b0aa-11e6-9e90-005056bc0140.f74fb166.250x250.jpeg",
      clues: [
        "Became the youngest undisputed World Champion in 1985 at age 22.",
        "Represented the Soviet Union and Russia, holding the <span>World No. 1</span> ranking for 225 out of 228 months.",
        "Famously played matches against IBM's supercomputer <span>Deep Blue</span>.",
        "Known for his aggressive, sharp tactical attacking style of play."
      ],
      options: ["Bobby Fischer", "Anatoly Karpov", "Garry Kasparov", "Mikhail Tal"],
      correct: 2
    }
  ];

  ARC.startGuessGMGame = () => {
    currentGameType = 'gm';
    score = 0;
    level = 1;
    state = {
      gmIndex: 0,
      answered: false
    };
    showOverlay();
    renderGM();
  };

  function renderGM() {
    const gm = GM_LIST[state.gmIndex];
    if (!gm) {
      playSFX('win');
      renderGMComplete();
      return;
    }

    const content = document.getElementById('arcade-cabinet-content');
    if (!content) return;

    let cluesHTML = '';
    gm.clues.forEach((clue, idx) => {
      cluesHTML += `
        <div class="gm-clue-item">🔍 <span>Clue ${idx + 1}:</span> ${clue}</div>
      `;
    });

    let optionsHTML = '';
    gm.options.forEach((opt, idx) => {
      optionsHTML += `
        <button class="gm-option-btn" onclick="CK.arcade.submitGMAnswer(${idx}, this)">
          ${opt}
          <span class="indicator"></span>
        </button>
      `;
    });

    content.innerHTML = `
      <div class="arcade-header">
        <div class="arcade-title-area">
          <span class="arcade-game-icon">🤔</span>
          <div class="arcade-title">Guess the <span>Grandmaster</span></div>
        </div>
        <button class="arcade-exit-btn" onclick="CK.arcade.exitGame()">✕ Exit Arcade</button>
      </div>
      <div class="arcade-main">
        <div class="gm-card-wrapper">
          <div style="position:relative; width: 140px; height: 140px; margin: 0 auto; border-radius: 50%; overflow:hidden; border: 3px solid #fbbf24; background: #1e293b; display:flex; align-items:center; justify-content:center;">
            <img id="gm-photo" src="${gm.photo}" style="width:100%; height:100%; object-fit:cover; filter: blur(12px); transition: filter 0.6s;">
            <div id="gm-question-mark" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:4rem; color:rgba(255,255,255,0.2); font-weight:800;">?</div>
          </div>
          
          <div class="gm-clues">
            ${cluesHTML}
          </div>
        </div>
        <div class="arcade-dashboard">
          <div class="arcade-hud-card" style="padding: 16px 24px;">
            <div class="arcade-game-title">Select Champion</div>
            <p class="arcade-game-desc" style="margin-bottom:12px;">Who is this legendary chess master?</p>
            
            <div class="gm-options">
              ${optionsHTML}
            </div>

            <div class="arcade-stats-row" style="margin-top: 20px; margin-bottom: 0;">
              <div class="arcade-stat-box" style="padding: 8px 12px;">
                <div class="arcade-stat-label">Progress</div>
                <div class="arcade-stat-val" style="font-size:1.25rem;">${state.gmIndex + 1} / ${GM_LIST.length}</div>
              </div>
              <div class="arcade-stat-box" style="padding: 8px 12px;">
                <div class="arcade-stat-label">Score</div>
                <div class="arcade-stat-val" style="font-size:1.25rem;">${score}</div>
              </div>
            </div>
          </div>
          
          <div class="arcade-btn-group">
            <button class="arcade-action-btn primary" id="gm-next-btn" disabled onclick="CK.arcade.nextGM()">Next GM &rarr;</button>
          </div>
        </div>
      </div>
    `;
  }

  ARC.submitGMAnswer = (idx, btn) => {
    if (state.answered) return;
    state.answered = true;

    const gm = GM_LIST[state.gmIndex];
    const optionBtns = document.querySelectorAll('.gm-option-btn');

    // Reveal Photo
    const photo = document.getElementById('gm-photo');
    const qMark = document.getElementById('gm-question-mark');
    if (photo) photo.style.filter = 'blur(0)';
    if (qMark) qMark.style.display = 'none';

    if (idx === gm.correct) {
      playSFX('coin');
      btn.classList.add('correct');
      score += 20;
    } else {
      playSFX('buzz');
      btn.classList.add('wrong');
      // Highlight the correct one
      optionBtns[gm.correct].classList.add('correct');
    }

    // Enable Next button
    const nextBtn = document.getElementById('gm-next-btn');
    if (nextBtn) nextBtn.disabled = false;
  };

  ARC.nextGM = () => {
    state.gmIndex++;
    state.answered = false;
    renderGM();
  };

  function renderGMComplete() {
    const content = document.getElementById('arcade-cabinet-content');
    if (!content) return;
    content.innerHTML = `
      <div style="text-align:center; padding: 40px 20px;">
        <div style="font-size: 5rem;">🏆</div>
        <h2 style="font-family:'Poppins', sans-serif; font-size:2.5rem; font-weight:800; color:#fff; margin: 16px 0;">Trivia Complete!</h2>
        <p style="color:var(--arena-text-muted); font-size:1.1rem; max-width:540px; margin: 0 auto 32px;">You are a true Chess Historian! You finished the Grandmaster challenge with ${score} points.</p>
        <div style="display:flex; justify-content:center; gap:16px;">
          <button class="arcade-action-btn primary" style="max-width:240px;" onclick="CK.arcade.startGuessGMGame()">Play Again</button>
          <button class="arcade-action-btn" style="max-width:200px;" onclick="CK.arcade.exitGame()">Exit Arcade</button>
        </div>
      </div>
    `;
  }

  /* ==========================================
     GAME 3: CHESS MATCH-3 (MEMORY MATCHING)
     ========================================== */
  const MEMORY_PIECES = [
    { code: 'K', unicode: '♚' },
    { code: 'Q', unicode: '♛' },
    { code: 'R', unicode: '♜' },
    { code: 'B', unicode: '♝' },
    { code: 'N', unicode: '♞' },
    { code: 'P', unicode: '♟' }
  ];

  ARC.startMemoryMatchGame = () => {
    currentGameType = 'memory';
    score = 0;
    level = 1;

    // Create 12 cards (6 pairs)
    let cards = [];
    MEMORY_PIECES.forEach(p => {
      cards.push({ id: Math.random(), piece: p, flipped: false, matched: false });
      cards.push({ id: Math.random(), piece: p, flipped: false, matched: false });
    });

    // Shuffle cards
    cards.sort(() => Math.random() - 0.5);

    state = {
      cards: cards,
      selectedCards: [],
      matchedPairs: 0,
      moves: 0,
      timeLeft: 60,
      timerInterval: null
    };

    showOverlay();
    renderMemoryMatch();
    startMemoryTimer();
  };

  function startMemoryTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      state.timeLeft--;
      const timeVal = document.getElementById('memory-time-val');
      if (timeVal) timeVal.innerText = `${state.timeLeft}s`;

      if (state.timeLeft <= 0) {
        clearInterval(state.timerInterval);
        playSFX('buzz');
        renderMemoryComplete(false);
      }
    }, 1000);
  }

  function renderMemoryMatch() {
    const content = document.getElementById('arcade-cabinet-content');
    if (!content) return;

    let cardsHTML = '';
    state.cards.forEach((card, idx) => {
      cardsHTML += `
        <div class="memory-card-element ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}" data-idx="${idx}" onclick="CK.arcade.flipCard(${idx})">
          <div class="memory-card-inner">
            <div class="memory-card-front">❓</div>
            <div class="memory-card-back">${card.piece.unicode}</div>
          </div>
        </div>
      `;
    });

    content.innerHTML = `
      <div class="arcade-header">
        <div class="arcade-title-area">
          <span class="arcade-game-icon">🎯</span>
          <div class="arcade-title">Memory <span>Match-3</span></div>
        </div>
        <button class="arcade-exit-btn" onclick="CK.arcade.exitGame()">✕ Exit Arcade</button>
      </div>
      <div class="arcade-main">
        <div class="arcade-play-area">
          <div class="memory-grid">
            ${cardsHTML}
          </div>
        </div>
        <div class="arcade-dashboard">
          <div class="arcade-hud-card">
            <div class="arcade-game-title">Find Matching Pieces!</div>
            <p class="arcade-game-desc">Flip pairs of cards to match the identical chess pieces before the time runs out.</p>
            
            <div class="arcade-stats-row">
              <div class="arcade-stat-box">
                <div class="arcade-stat-label">Matches</div>
                <div class="arcade-stat-val">${state.matchedPairs} / 6</div>
              </div>
              <div class="arcade-stat-box">
                <div class="arcade-stat-label">Time Left</div>
                <div class="arcade-stat-val" id="memory-time-val">${state.timeLeft}s</div>
              </div>
            </div>

            <div class="arcade-stats-row" style="margin-bottom:0;">
              <div class="arcade-stat-box" style="grid-column: span 2;">
                <div class="arcade-stat-label">Moves Taken</div>
                <div class="arcade-stat-val">${state.moves}</div>
              </div>
            </div>
          </div>
          
          <div class="arcade-btn-group">
            <button class="arcade-action-btn primary" onclick="window.CK.arcade.startMemoryMatchGame()">Restart Game</button>
          </div>
        </div>
      </div>
    `;
  }

  ARC.flipCard = (idx) => {
    const card = state.cards[idx];
    if (card.flipped || card.matched || state.selectedCards.length >= 2) return;

    playSFX('select');
    card.flipped = true;
    state.selectedCards.push({ idx, card });

    renderMemoryMatch();

    if (state.selectedCards.length === 2) {
      state.moves++;
      const first = state.selectedCards[0];
      const second = state.selectedCards[1];

      if (first.card.piece.code === second.card.piece.code) {
        // MATCH!
        playSFX('coin');
        first.card.matched = true;
        second.card.matched = true;
        state.matchedPairs++;
        state.selectedCards = [];

        renderMemoryMatch();

        if (state.matchedPairs === 6) {
          clearInterval(state.timerInterval);
          playSFX('win');
          score = Math.max(50, state.timeLeft * 2 + 10);
          setTimeout(() => renderMemoryComplete(true), 1000);
        }
      } else {
        // MISMATCH!
        setTimeout(() => {
          playSFX('buzz');
          first.card.flipped = false;
          second.card.flipped = false;
          state.selectedCards = [];
          renderMemoryMatch();
        }, 1000);
      }
    }
  };

  function renderMemoryComplete(win) {
    const content = document.getElementById('arcade-cabinet-content');
    if (!content) return;
    content.innerHTML = `
      <div style="text-align:center; padding: 40px 20px;">
        <div style="font-size: 5rem;">${win ? '🏆' : '⏰'}</div>
        <h2 style="font-family:'Poppins', sans-serif; font-size:2.5rem; font-weight:800; color:#fff; margin: 16px 0;">
          ${win ? 'Memory Champion!' : "Time's Up!"}
        </h2>
        <p style="color:var(--arena-text-muted); font-size:1.1rem; max-width:540px; margin: 0 auto 32px;">
          ${win ? `Splendid memory cells! You matched all pairs in ${state.moves} moves and won ${score} points.` : 'Better luck next time! Keep training your memory cards.'}
        </p>
        <div style="display:flex; justify-content:center; gap:16px;">
          <button class="arcade-action-btn primary" style="max-width:240px;" onclick="CK.arcade.startMemoryMatchGame()">Play Again</button>
          <button class="arcade-action-btn" style="max-width:200px;" onclick="CK.arcade.exitGame()">Exit Arcade</button>
        </div>
      </div>
    `;
  }

  /* ==========================================
     GAME 4: KNIGHT'S STAR CATCHER (TOUR MAZE)
     ========================================== */
  ARC.startKnightStarCatcher = () => {
    currentGameType = 'knight';
    score = 0;
    level = 1;

    // Place Knight at a starting cell
    const knightPos = 'd4';

    // Spawn 5 random targets
    const targets = [];
    const possibleSquares = [
      'a1','b1','c1','d1','e1','f1','g1','h1',
      'a2','b2','c2','d2','e2','f2','g2','h2',
      'a3','b3','c3','d3','e3','f3','g3','h3',
      'a4','b4','c4','d4','e4','f4','g4','h4',
      'a5','b5','c5','d5','e5','f5','g5','h5',
      'a6','b6','c6','d6','e6','f6','g6','h6',
      'a7','b7','c7','d7','e7','f7','g7','h7',
      'a8','b8','c8','d8','e8','f8','g8','h8'
    ];

    // Remove starting knight square
    possibleSquares.splice(possibleSquares.indexOf(knightPos), 1);

    // Pick 5 random squares
    while (targets.length < 5) {
      const idx = Math.floor(Math.random() * possibleSquares.length);
      const sq = possibleSquares.splice(idx, 1)[0];
      targets.push(sq);
    }

    state = {
      knightPos: knightPos,
      targets: targets,
      moves: 0,
      collected: 0,
      totalTargets: 5
    };

    showOverlay();
    renderKnightStarCatcher();
  };

  function getValidKnightMoves(square) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

    const fileIdx = files.indexOf(square[0]);
    const rankIdx = ranks.indexOf(square[1]);

    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    const validMoves = [];
    offsets.forEach(offset => {
      const newFileIdx = fileIdx + offset[0];
      const newRankIdx = rankIdx + offset[1];

      if (newFileIdx >= 0 && newFileIdx < 8 && newRankIdx >= 0 && newRankIdx < 8) {
        validMoves.push(files[newFileIdx] + ranks[newRankIdx]);
      }
    });

    return validMoves;
  }

  function renderKnightStarCatcher() {
    const content = document.getElementById('arcade-cabinet-content');
    if (!content) return;

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const validMoves = getValidKnightMoves(state.knightPos);

    let boardHTML = '';
    ranks.forEach(rank => {
      files.forEach(file => {
        const sq = file + rank;
        const isDark = (files.indexOf(file) + ranks.indexOf(rank)) % 2 !== 0;

        // Is Knight here?
        const isKnight = state.knightPos === sq;
        const isTarget = state.targets.includes(sq);
        const isValidDest = validMoves.includes(sq);

        let entityHTML = '';
        if (isKnight) {
          entityHTML = '<div class="arcade-piece white" style="font-size:3rem;">♞</div>';
        } else if (isTarget) {
          entityHTML = '<div class="arcade-star">⭐</div>';
        }

        boardHTML += `
          <div class="arcade-sq ${isDark ? 'dark' : 'light'} ${isValidDest ? 'valid-dest' : ''}" data-sq="${sq}">
            ${entityHTML}
          </div>
        `;
      });
    });

    content.innerHTML = `
      <div class="arcade-header">
        <div class="arcade-title-area">
          <span class="arcade-game-icon">⚡</span>
          <div class="arcade-title">Knight's <span>Star Catcher</span></div>
        </div>
        <button class="arcade-exit-btn" onclick="CK.arcade.exitGame()">✕ Exit Arcade</button>
      </div>
      <div class="arcade-main">
        <div class="arcade-play-area">
          <div class="arcade-board-wrap">
            <div class="arcade-board" id="knight-board">
              ${boardHTML}
            </div>
          </div>
        </div>
        <div class="arcade-dashboard">
          <div class="arcade-hud-card">
            <div class="arcade-game-title">Collect the Glowing Stars!</div>
            <p class="arcade-game-desc">Hop your Knight using standard L-moves to capture all 5 golden stars scattered across the map.</p>
            
            <div class="arcade-stats-row">
              <div class="arcade-stat-box">
                <div class="arcade-stat-label">Captured</div>
                <div class="arcade-stat-val">${state.collected} / ${state.totalTargets}</div>
              </div>
              <div class="arcade-stat-box">
                <div class="arcade-stat-label">Moves</div>
                <div class="arcade-stat-val">${state.moves}</div>
              </div>
            </div>

            <div class="arcade-progress-container" style="margin-bottom:0;">
              <div class="arcade-progress-header">
                <span>Maze Captured Progress</span>
                <span>${Math.round((state.collected / state.totalTargets) * 100)}%</span>
              </div>
              <div class="arcade-progress-bar">
                <div class="arcade-progress-fill" style="width: ${(state.collected / state.totalTargets) * 100}%"></div>
              </div>
            </div>
          </div>
          
          <div class="arcade-btn-group">
            <button class="arcade-action-btn primary" onclick="window.CK.arcade.startKnightStarCatcher()">Restart Maze</button>
          </div>
        </div>
      </div>
    `;

    // Click handlers for valid destinations
    const squares = document.querySelectorAll('#knight-board .arcade-sq');
    squares.forEach(sq => {
      const squareCode = sq.getAttribute('data-sq');
      if (validMoves.includes(squareCode)) {
        sq.addEventListener('click', () => handleKnightJump(squareCode));
      }
    });
  }

  function handleKnightJump(toSq) {
    state.moves++;
    state.knightPos = toSq;

    // Check if target collected
    const targetIdx = state.targets.indexOf(toSq);
    if (targetIdx !== -1) {
      playSFX('coin');
      state.targets.splice(targetIdx, 1);
      state.collected++;
      score += 30;
    } else {
      playSFX('select');
    }

    renderKnightStarCatcher();

    // Completed all targets?
    if (state.collected === state.totalTargets) {
      playSFX('win');
      setTimeout(() => renderKnightComplete(), 800);
    }
  }

  function renderKnightComplete() {
    const content = document.getElementById('arcade-cabinet-content');
    if (!content) return;
    content.innerHTML = `
      <div style="text-align:center; padding: 40px 20px;">
        <div style="font-size: 5rem;">🏆</div>
        <h2 style="font-family:'Poppins', sans-serif; font-size:2.5rem; font-weight:800; color:#fff; margin: 16px 0;">All Stars Collected!</h2>
        <p style="color:var(--arena-text-muted); font-size:1.1rem; max-width:540px; margin: 0 auto 32px;">Excellent Knight maneuvers! You collected all 5 stars in ${state.moves} moves and scored ${score} points.</p>
        <div style="display:flex; justify-content:center; gap:16px;">
          <button class="arcade-action-btn primary" style="max-width:240px;" onclick="CK.arcade.startKnightStarCatcher()">Play Again</button>
          <button class="arcade-action-btn" style="max-width:200px;" onclick="CK.arcade.exitGame()">Exit Arcade</button>
        </div>
      </div>
    `;
  }

  
  /* ==========================================
     GAME 5: PAWN STORM SURVIVAL DODGE
     ========================================== */
  ARC.startPawnStormGame = () => {
    currentGameType = 'pawnstorm';
    score = 0;
    level = 1;

    // Start White King in the middle of bottom rank
    state = {
      kingPos: 'e1',
      pawns: [], // array of { file, rank }
      moves: 0,
      survivalTicks: 0,
      gameOver: false,
      timerInterval: null
    };

    showOverlay();
    renderPawnStorm();
    startPawnStormLoop();
  };

  function startPawnStormLoop() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      if (state.gameOver) return;

      // 1. Slide existing pawns down
      const nextPawns = [];
      state.pawns.forEach(p => {
        const nextRank = p.rank - 1;
        if (nextRank >= 1) {
          nextPawns.push({ file: p.file, rank: nextRank });
        }
      });
      state.pawns = nextPawns;

      // 2. Spawn a new pawn raindrop at rank 8
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const randomFile = files[Math.floor(Math.random() * files.length)];
      state.pawns.push({ file: randomFile, rank: 8 });

      state.survivalTicks++;
      score += 5; // gain survival points!

      // 3. Evaluate collision
      checkPawnStormCollision();

      if (!state.gameOver) {
        renderPawnStorm();
      }
    }, 750); // Speed of raindrops descend
  }

  function checkPawnStormCollision() {
    // Check if any pawn has collided with the King
    const kingFile = state.kingPos[0];
    const kingRank = parseInt(state.kingPos[1]);

    const hit = state.pawns.some(p => p.file === kingFile && p.rank === kingRank);
    if (hit) {
      state.gameOver = true;
      clearInterval(state.timerInterval);
      playSFX('buzz');
      renderPawnStormComplete();
    }
  }

  function getValidKingMoves(square) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const fileIdx = files.indexOf(square[0]);
    const rank = parseInt(square[1]);

    const validMoves = [];
    for (let df = -1; df <= 1; df++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (df === 0 && dr === 0) continue;
        const nf = fileIdx + df;
        const nr = rank + dr;
        if (nf >= 0 && nf < 8 && nr >= 1 && nr <= 8) {
          validMoves.push(files[nf] + nr);
        }
      }
    }
    return validMoves;
  }

  function renderPawnStorm() {
    const content = document.getElementById('arcade-cabinet-content');
    if (!content) return;

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const validMoves = getValidKingMoves(state.kingPos);

    let boardHTML = '';
    ranks.forEach(rank => {
      files.forEach(file => {
        const sq = file + rank;
        const isDark = (files.indexOf(file) + ranks.indexOf(rank)) % 2 !== 0;

        const isKing = state.kingPos === sq;
        const hasPawn = state.pawns.some(p => p.file === file && p.rank === parseInt(rank));
        const isValidDest = validMoves.includes(sq);

        let entityHTML = '';
        if (isKing) {
          entityHTML = '<div class="arcade-piece white" style="font-size:3rem;">♔</div>';
        } else if (hasPawn) {
          entityHTML = '<div class="arcade-piece black" style="font-size:2.8rem; color:#ef5350;">♟</div>';
        }

        boardHTML += `
          <div class="arcade-sq ${isDark ? 'dark' : 'light'} ${isValidDest ? 'valid-dest' : ''}" data-sq="${sq}">
            ${entityHTML}
          </div>
        `;
      });
    });

    content.innerHTML = `
      <div class="arcade-header">
        <div class="arcade-title-area">
          <span class="arcade-game-icon">🌧️</span>
          <div class="arcade-title">Pawn Storm <span>Dodge</span></div>
        </div>
        <button class="arcade-exit-btn" onclick="CK.arcade.exitGame()">✕ Exit Arcade</button>
      </div>
      <div class="arcade-main">
        <div class="arcade-play-area">
          <div class="arcade-board-wrap">
            <div class="arcade-board" id="pawnstorm-board">
              ${boardHTML}
            </div>
          </div>
        </div>
        <div class="arcade-dashboard">
          <div class="arcade-hud-card">
            <div class="arcade-game-title">Dodge the Raindrops!</div>
            <p class="arcade-game-desc">Move your King (♔) to any adjacent highlighted square. Dodge the incoming black pawn raindrops (♟) as they pour down!</p>
            
            <div class="arcade-stats-row">
              <div class="arcade-stat-box">
                <div class="arcade-stat-label">Seconds Dodged</div>
                <div class="arcade-stat-val">${Math.floor(state.survivalTicks * 0.75)}s</div>
              </div>
              <div class="arcade-stat-box">
                <div class="arcade-stat-label">Score</div>
                <div class="arcade-stat-val">${score}</div>
              </div>
            </div>

            <div style="background: rgba(239, 83, 80, 0.08); padding: 12px; border-radius: 12px; border: 1px solid rgba(239, 83, 80, 0.15); font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
              <span style="font-size:1.2rem;">⚠️</span>
              <span style="color:#f87171; font-weight:600;">Survival Alert:</span> Pawns spawn randomly at the top and slide down every 0.75s!
            </div>
          </div>
          
          <div class="arcade-btn-group">
            <button class="arcade-action-btn primary" onclick="window.CK.arcade.startPawnStormGame()">Restart</button>
          </div>
        </div>
      </div>
    `;

    // Add click listeners to valid dests to move King
    const squares = document.querySelectorAll('#pawnstorm-board .arcade-sq');
    squares.forEach(sq => {
      const squareCode = sq.getAttribute('data-sq');
      if (validMoves.includes(squareCode)) {
        sq.addEventListener('click', () => {
          playSFX('select');
          state.moves++;
          state.kingPos = squareCode;
          checkPawnStormCollision();
          if (!state.gameOver) {
            renderPawnStorm();
          }
        });
      }
    });
  }

  function renderPawnStormComplete() {
    const content = document.getElementById('arcade-cabinet-content');
    if (!content) return;
    content.innerHTML = `
      <div style="text-align:center; padding: 40px 20px;">
        <div style="font-size: 5rem;">🌧️</div>
        <h2 style="font-family:'Poppins', sans-serif; font-size:2.5rem; font-weight:800; color:#fff; margin: 16px 0;">King Caught!</h2>
        <p style="color:var(--arena-text-muted); font-size:1.1rem; max-width:540px; margin: 0 auto 32px;">The pawn storm caught your King! You survived for ${Math.floor(state.survivalTicks * 0.75)} seconds and earned ${score} points.</p>
        <div style="display:flex; justify-content:center; gap:16px;">
          <button class="arcade-action-btn primary" style="max-width:240px;" onclick="CK.arcade.startPawnStormGame()">Play Again</button>
          <button class="arcade-action-btn" style="max-width:200px;" onclick="CK.arcade.exitGame()">Exit Arcade</button>
        </div>
      </div>
    `;
  }

  /* ==========================================
     GAME 6: QUEEN'S CAPTURE QUEST
     ========================================== */
  ARC.startQueenQuestGame = () => {
    currentGameType = 'queenquest';
    score = 0;
    level = 1;

    // Start White Queen at d4
    const queenPos = 'd4';

    // Spawn 5 random targets
    const targets = [];
    const possibleSquares = [
      'a1','b1','c1','d1','e1','f1','g1','h1',
      'a2','b2','c2','d2','e2','f2','g2','h2',
      'a3','b3','c3','d3','e3','f3','g3','h3',
      'a4','b4','c4','d4','e4','f4','g4','h4',
      'a5','b5','c5','d5','e5','f5','g5','h5',
      'a6','b6','c6','d6','e6','f6','g6','h6',
      'a7','b7','c7','d7','e7','f7','g7','h7',
      'a8','b8','c8','d8','e8','f8','g8','h8'
    ];

    possibleSquares.splice(possibleSquares.indexOf(queenPos), 1);

    // Pick 5 random squares
    while (targets.length < 5) {
      const idx = Math.floor(Math.random() * possibleSquares.length);
      const sq = possibleSquares.splice(idx, 1)[0];
      targets.push(sq);
    }

    state = {
      queenPos: queenPos,
      targets: targets,
      moves: 0,
      collected: 0,
      totalTargets: 5
    };

    showOverlay();
    renderQueenQuest();
  };

  function getValidQueenMoves(square) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

    const fileIdx = files.indexOf(square[0]);
    const rankIdx = ranks.indexOf(square[1]);

    const validMoves = [];

    // Directions for Queen: Horiz, Vert, Diagonals
    const directions = [
      [1, 0], [-1, 0], [0, 1], [0, -1], // straight
      [1, 1], [-1, -1], [1, -1], [-1, 1] // diagonals
    ];

    directions.forEach(dir => {
      let step = 1;
      while (true) {
        const nf = fileIdx + dir[0] * step;
        const nr = rankIdx + dir[1] * step;

        if (nf >= 0 && nf < 8 && nr >= 0 && nr < 8) {
          validMoves.push(files[nf] + ranks[nr]);
          step++;
        } else {
          break;
        }
      }
    });

    return validMoves;
  }

  function renderQueenQuest() {
    const content = document.getElementById('arcade-cabinet-content');
    if (!content) return;

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    const validMoves = getValidQueenMoves(state.queenPos);

    let boardHTML = '';
    ranks.forEach(rank => {
      files.forEach(file => {
        const sq = file + rank;
        const isDark = (files.indexOf(file) + ranks.indexOf(rank)) % 2 !== 0;

        const isQueen = state.queenPos === sq;
        const isTarget = state.targets.includes(sq);
        const isValidDest = validMoves.includes(sq);

        let entityHTML = '';
        if (isQueen) {
          entityHTML = '<div class="arcade-piece white" style="font-size:3rem;">♕</div>';
        } else if (isTarget) {
          entityHTML = '<div class="arcade-piece black" style="font-size:2.4rem; color:#10b981;">♜</div>';
        }

        boardHTML += `
          <div class="arcade-sq ${isDark ? 'dark' : 'light'} ${isValidDest ? 'valid-dest' : ''}" data-sq="${sq}">
            ${entityHTML}
          </div>
        `;
      });
    });

    content.innerHTML = `
      <div class="arcade-header">
        <div class="arcade-title-area">
          <span class="arcade-game-icon">👑</span>
          <div class="arcade-title">Queen's <span>Capture Quest</span></div>
        </div>
        <button class="arcade-exit-btn" onclick="CK.arcade.exitGame()">✕ Exit Arcade</button>
      </div>
      <div class="arcade-main">
        <div class="arcade-play-area">
          <div class="arcade-board-wrap">
            <div class="arcade-board" id="queenquest-board">
              ${boardHTML}
            </div>
          </div>
        </div>
        <div class="arcade-dashboard">
          <div class="arcade-hud-card">
            <div class="arcade-game-title">Unleash the Queen!</div>
            <p class="arcade-game-desc">Move your Queen (♕) diagonally, horizontally, or vertically to capture all 5 black target pieces (♜) scattered around.</p>
            
            <div class="arcade-stats-row">
              <div class="arcade-stat-box">
                <div class="arcade-stat-label">Captured</div>
                <div class="arcade-stat-val">${state.collected} / ${state.totalTargets}</div>
              </div>
              <div class="arcade-stat-box">
                <div class="arcade-stat-label">Moves</div>
                <div class="arcade-stat-val">${state.moves}</div>
              </div>
            </div>

            <div class="arcade-progress-container" style="margin-bottom:0;">
              <div class="arcade-progress-header">
                <span>Targets Cleared</span>
                <span>${Math.round((state.collected / state.totalTargets) * 100)}%</span>
              </div>
              <div class="arcade-progress-bar">
                <div class="arcade-progress-fill" style="width: ${(state.collected / state.totalTargets) * 100}%"></div>
              </div>
            </div>
          </div>
          
          <div class="arcade-btn-group">
            <button class="arcade-action-btn primary" onclick="window.CK.arcade.startQueenQuestGame()">Restart Quest</button>
          </div>
        </div>
      </div>
    `;

    // Click handlers for valid destinations
    const squares = document.querySelectorAll('#queenquest-board .arcade-sq');
    squares.forEach(sq => {
      const squareCode = sq.getAttribute('data-sq');
      if (validMoves.includes(squareCode)) {
        sq.addEventListener('click', () => {
          state.moves++;
          state.queenPos = squareCode;

          // Check if target collected
          const targetIdx = state.targets.indexOf(squareCode);
          if (targetIdx !== -1) {
            playSFX('coin');
            state.targets.splice(targetIdx, 1);
            state.collected++;
            score += 40;
          } else {
            playSFX('select');
          }

          renderQueenQuest();

          // Completed all targets?
          if (state.collected === state.totalTargets) {
            playSFX('win');
            setTimeout(() => renderQueenQuestComplete(), 800);
          }
        });
      }
    });
  }

  function renderQueenQuestComplete() {
    const content = document.getElementById('arcade-cabinet-content');
    if (!content) return;
    content.innerHTML = `
      <div style="text-align:center; padding: 40px 20px;">
        <div style="font-size: 5rem;">🏆</div>
        <h2 style="font-family:'Poppins', sans-serif; font-size:2.5rem; font-weight:800; color:#fff; margin: 16px 0;">Quest Cleared!</h2>
        <p style="color:var(--arena-text-muted); font-size:1.1rem; max-width:540px; margin: 0 auto 32px;">Incredible Queen maneuverability! You swept the board clean of all targets in only ${state.moves} moves and gained ${score} points.</p>
        <div style="display:flex; justify-content:center; gap:16px;">
          <button class="arcade-action-btn primary" style="max-width:240px;" onclick="CK.arcade.startQueenQuestGame()">Play Again</button>
          <button class="arcade-action-btn" style="max-width:200px;" onclick="CK.arcade.exitGame()">Exit Arcade</button>
        </div>
      </div>
    `;
  }

  return ARC;
})();
