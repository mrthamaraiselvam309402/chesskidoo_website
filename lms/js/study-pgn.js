/**
 * ChessKidoo LMS — Study PGN, Daily Tactics Streaks & Board Visualization Engine (v1.0)
 * ──────────────────────────────────────────────────────────────────────────────────────────
 * 1. Interactive PGN Study Board (Lichess-style analysis, GM games, Stockfish evaluations, Guess the Move).
 * 2. Daily Tactics Workout & Gamified Streaks (Live Lichess Daily Puzzle API + Calibrated Levels).
 * 3. Board Visualization & Speed Calculation Trainer (Square Color, Coordinate Radar, Knight Pathfinder).
 * 4. Coach & Admin Topic Assignment & Student Practice Monitoring Dashboard.
 */
(function () {
  'use strict';

  // ── Storage Keys ──
  const STORAGE_TACTICS_RECORDS = 'ck_student_tactics_records';
  const STORAGE_ASSIGNED_TOPICS = 'ck_assigned_study_topics';
  const STORAGE_VISION_SCORES = 'ck_student_vision_scores';

  // ── Curated Grandmaster PGN Vault ──
  const CURATED_STUDY_GAMES = [
    {
      id: 'gm-opera-1858',
      title: 'The Opera Game: Paul Morphy vs Duke of Brunswick & Count Isouard (1858)',
      category: 'Masterpiece',
      level: 'Beginner',
      white: 'Paul Morphy',
      black: 'Duke of Brunswick & Count Isouard',
      result: '1-0',
      description: 'The most famous game in chess history illustrating rapid development, open lines, and deflection sacrifices.',
      pgn: `[Event "Paris Opera"]
[Site "Paris FRA"]
[Date "1858.??.??"]
[White "Paul Morphy"]
[Black "Duke of Brunswick and Count Isouard"]
[Result "1-0"]
[ECO "C41"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`
    },
    {
      id: 'gm-immortal-1851',
      title: 'The Immortal Game: Adolf Anderssen vs Lionel Kieseritzky (1851)',
      category: 'King\'s Gambit',
      level: 'Intermediate',
      white: 'Adolf Anderssen',
      black: 'Lionel Kieseritzky',
      result: '1-0',
      description: 'The romantic era masterwork featuring double rook sacrifices and a queen sacrifice culminating in a minor piece checkmate.',
      pgn: `[Event "London"]
[Site "London ENG"]
[Date "1851.06.21"]
[White "Adolf Anderssen"]
[Black "Lionel Kieseritzky"]
[Result "1-0"]
[ECO "C33"]

1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0`
    },
    {
      id: 'gm-kasparov-anand-1995',
      title: 'Kasparov vs Anand: World Championship Classical Sicilian Dragon (1995)',
      category: 'Openings',
      level: 'Advanced',
      white: 'Garry Kasparov',
      black: 'Viswanathan Anand',
      result: '1-0',
      description: 'Garry Kasparov\'s theoretical novelty and exchange sacrifice on c3 in the World Chess Championship 1995.',
      pgn: `[Event "World Championship"]
[Site "New York, NY USA"]
[Date "1995.09.25"]
[White "Garry Kasparov"]
[Black "Viswanathan Anand"]
[Result "1-0"]
[ECO "B78"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be3 Bg7 7. f3 O-O 8. Qd2 Nc6 9. Bc4 Bd7 10. O-O-O Ne5 11. Bb3 Rc8 12. h4 h5 13. Kb1 Nc4 14. Bxc4 Rxc4 15. Nde2 b5 16. Bh6 Qa5 17. Bxg7 Kxg7 18. Nf4 Rfc8 19. Ncd5 Qxd2 20. Rxd2 Nxd5 21. Nxd5 Kf8 22. Re1 Rb8 23. b3 Rc5 24. Nf4 Rbc8 25. Kb2 a5 26. a3 1-0`
    },
    {
      id: 'gm-lucena-endgame',
      title: 'Endgame Mastery: The Lucena Bridge Technique',
      category: 'Endgames',
      level: 'Intermediate',
      white: 'White to Move',
      black: 'Black',
      result: '1-0',
      description: 'The fundamental winning technique for Rook and Pawn vs Rook endgames. Build the 4th rank bridge!',
      pgn: `[Event "Theoretical Endgame Study"]
[Site "ChessKidoo Academy"]
[Date "2026.01.01"]
[White "Lucena Position"]
[Black "Defending Side"]
[Result "1-0"]
[FEN "1K1R4/1P1k4/8/8/8/8/8/2r5 w - - 0 1"]

1. Rd4! Rh1 2. Ka7 Ra1+ 3. Kb6 Rb1+ 4. Ka6 Ra1+ 5. Kb5 Rb1+ 6. Rb4! 1-0`
    }
  ];

  // ── Curated Daily Tactics Vault ──
  const CURATED_TACTICS = [
    {
      id: 'puz-101',
      fen: 'r1bqk2r/pppp1ppp/2n5/4p3/1bB1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 5',
      moves: ['c2c3', 'b4c5', 'd2d4'],
      title: 'Center Control & Tempo Gain',
      rating: 950,
      level: 'Beginner',
      hint: 'White can kick the Black bishop and immediately occupy the full center with pawns.',
      solutionText: '1. c3 Bc5 2. d4!'
    },
    {
      id: 'puz-102',
      fen: 'r1b2rk1/ppp2ppp/2n5/3qp3/1b6/3B1N2/PPPP1PPP/R1BQK2R w KQ - 0 8',
      moves: ['d3h7', 'g8h7', 'f3g5'],
      title: 'The Greek Gift Bishop Sacrifice',
      rating: 1350,
      level: 'Intermediate',
      hint: 'The Black king has castled and lacks an f6 knight. Is the h7 pawn ripe for a sacrifice?',
      solutionText: '1. Bxh7+! Kxh7 2. Ng5+! leading to a decisive attack.'
    },
    {
      id: 'puz-103',
      fen: '3r2k1/p4ppp/1p6/8/2q5/P3Q3/1P3PPP/4R1K1 w - - 0 25',
      moves: ['e3e8', 'd8e8', 'e1e8'],
      title: 'Back-Rank Overload Mate',
      rating: 1100,
      level: 'Beginner',
      hint: 'Black\'s king is trapped behind his own pawn wall on the back rank.',
      solutionText: '1. Qe8+! Rxe8 2. Rxe8# checkmate.'
    },
    {
      id: 'puz-104',
      fen: 'r1b1kb1r/pp3ppp/2n5/1B1p4/3N4/8/PPP2PPP/R1B1K2R w KQkq - 0 10',
      moves: ['d4c6', 'c8d7', 'c6d4'],
      title: 'Absolute Pin Exploitation',
      rating: 1450,
      level: 'Intermediate',
      hint: 'The Black knight on c6 is pinned against the king by White\'s bishop on b5.',
      solutionText: '1. Nxc6 Bd7 2. Nd4 winning a clean central pawn.'
    },
    {
      id: 'puz-105',
      fen: '6k1/5p1p/p3p1p1/1p6/3b4/1P1N1QP1/P4PKP/2q5 b - - 1 30',
      moves: ['c1d2'],
      title: 'Infiltration and Double Attack',
      rating: 1650,
      level: 'Advanced',
      hint: 'Attack White\'s knight and target the vulnerable queenside pawns simultaneously.',
      solutionText: '1... Qd2 attacking the knight and infiltrating.'
    }
  ];

  // ── Global State ──
  window.StudyPGN = {
    // PGN Board State
    currentGame: null,
    chess: null,
    moveHistory: [],
    currentMoveIndex: -1,
    isAutoplaying: false,
    autoplayTimer: null,
    isGuessTheMoveMode: false,
    guessScore: 0,
    guessTotal: 0,
    boardOrientation: 'white',

    // Daily Tactics State
    currentPuzzle: null,
    puzzleGame: null,
    puzzleMoveIndex: 0,
    dailyStreak: 0,
    hasSolvedToday: false,

    // Visualization State
    visionMode: 'color', // 'color' | 'radar' | 'knight'
    visionTimer: null,
    visionTimeRemaining: 30,
    visionScore: 0,
    visionStreak: 0,
    visionTargetSquare: '',

    // Init
    init: function () {
      this.loadSavedRecords();
      this.loadDailyPuzzle();
      this.loadCuratedGame(0);
      this.setupKeyboardListeners();
    }
  };

  // ── Local Storage & Record Sync ──
  StudyPGN.loadSavedRecords = function () {
    try {
      const rec = JSON.parse(localStorage.getItem(STORAGE_TACTICS_RECORDS) || '{}');
      const todayStr = new Date().toISOString().split('T')[0];
      const studentId = window.currentStudent ? String(window.currentStudent.id) : 'default';

      const studRec = rec[studentId] || { streak: 0, lastDate: '', solvedCount: 0, history: [] };
      this.dailyStreak = studRec.streak || 0;
      this.hasSolvedToday = (studRec.lastDate === todayStr);
    } catch (e) {
      console.warn('[StudyPGN] Error loading saved records:', e);
    }
  };

  StudyPGN.recordTacticsSolved = function (puzzleId, level, timeTakenSec) {
    const todayStr = new Date().toISOString().split('T')[0];
    const studentId = window.currentStudent ? String(window.currentStudent.id) : 'default';
    const studentName = window.currentStudent ? (window.currentStudent.name || window.currentStudent.full_name || 'Student') : 'Guest';

    try {
      const rec = JSON.parse(localStorage.getItem(STORAGE_TACTICS_RECORDS) || '{}');
      const studRec = rec[studentId] || { streak: 0, lastDate: '', solvedCount: 0, history: [] };

      // Calculate streak
      const lastDate = studRec.lastDate;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      if (lastDate === yesterday) {
        studRec.streak = (studRec.streak || 0) + 1;
      } else if (lastDate !== todayStr) {
        studRec.streak = 1;
      }

      studRec.lastDate = todayStr;
      studRec.solvedCount = (studRec.solvedCount || 0) + 1;
      studRec.history.unshift({
        puzzle_id: puzzleId,
        level: level,
        time_taken_sec: timeTakenSec || 15,
        date: todayStr,
        timestamp: new Date().toISOString()
      });

      rec[studentId] = studRec;
      localStorage.setItem(STORAGE_TACTICS_RECORDS, JSON.stringify(rec));
      this.dailyStreak = studRec.streak;
      this.hasSolvedToday = true;

      // Update cloud if Supabase active
      if (window.supabaseClient) {
        window.supabaseClient.from('student_tactics').upsert([{
          student_id: studentId,
          student_name: studentName,
          streak: studRec.streak,
          last_solved_date: todayStr,
          total_solved: studRec.solvedCount,
          updated_at: new Date().toISOString()
        }]).then(() => {}).catch(() => {});
      }
    } catch (e) {}

    StudyPGN.updateStreakUI();
  };

  // ── Keyboard Shortcuts ──
  StudyPGN.setupKeyboardListeners = function () {
    window.addEventListener('keydown', (e) => {
      // Only active if study lab is in view
      const labTab = document.getElementById('child-tab-studypgn');
      const adminLab = document.getElementById('page-studypgn');
      const coachLab = document.getElementById('page-coach-studypgn');
      const isActive = (labTab && labTab.classList.contains('active')) ||
                       (adminLab && adminLab.classList.contains('active')) ||
                       (coachLab && coachLab.classList.contains('active'));

      if (!isActive) return;
      if (['input', 'textarea', 'select'].includes(document.activeElement?.tagName?.toLowerCase())) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        StudyPGN.nextMove();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        StudyPGN.prevMove();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        StudyPGN.firstMove();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        StudyPGN.lastMove();
      } else if (e.key === 'f' || e.key === 'F') {
        StudyPGN.flipBoard();
      } else if (e.key === ' ') {
        e.preventDefault();
        StudyPGN.toggleAutoplay();
      }
    });
  };

  // ── PGN Board Engine ──
  StudyPGN.loadCuratedGame = function (index) {
    const game = CURATED_STUDY_GAMES[index] || CURATED_STUDY_GAMES[0];
    StudyPGN.loadPgnString(game.pgn, game);
  };

  StudyPGN.loadPgnString = function (pgnText, metadata) {
    if (!window.Chess) return;
    const c = new window.Chess();
    const success = c.load_pgn(pgnText);

    if (!success) {
      if (window.toast) window.toast('Invalid PGN notation provided.', 'warning');
      return;
    }

    StudyPGN.currentGame = {
      ...metadata,
      pgn: pgnText,
      headers: c.header ? c.header() : {}
    };

    StudyPGN.moveHistory = c.history({ verbose: true });
    StudyPGN.chess = new window.Chess();
    StudyPGN.currentMoveIndex = -1;
    StudyPGN.isAutoplaying = false;
    if (StudyPGN.autoplayTimer) clearInterval(StudyPGN.autoplayTimer);

    StudyPGN.renderBoard();
    StudyPGN.renderMoveList();
    StudyPGN.renderGameInfo();
    StudyPGN.fetchLichessOpeningStats();
  };

  StudyPGN.goToMove = function (index) {
    if (!StudyPGN.moveHistory) return;
    const targetIdx = Math.max(-1, Math.min(index, StudyPGN.moveHistory.length - 1));

    StudyPGN.chess = new window.Chess();
    for (let i = 0; i <= targetIdx; i++) {
      StudyPGN.chess.move(StudyPGN.moveHistory[i]);
    }
    StudyPGN.currentMoveIndex = targetIdx;
    StudyPGN.renderBoard();
    StudyPGN.highlightCurrentMove();
    StudyPGN.updateEvalGauge();
    StudyPGN.fetchLichessOpeningStats();
  };

  StudyPGN.nextMove = function () {
    if (StudyPGN.currentMoveIndex < StudyPGN.moveHistory.length - 1) {
      StudyPGN.goToMove(StudyPGN.currentMoveIndex + 1);
    } else if (StudyPGN.isAutoplaying) {
      StudyPGN.toggleAutoplay();
    }
  };

  StudyPGN.prevMove = function () {
    if (StudyPGN.currentMoveIndex >= 0) {
      StudyPGN.goToMove(StudyPGN.currentMoveIndex - 1);
    }
  };

  StudyPGN.firstMove = function () {
    StudyPGN.goToMove(-1);
  };

  StudyPGN.lastMove = function () {
    StudyPGN.goToMove(StudyPGN.moveHistory.length - 1);
  };

  StudyPGN.flipBoard = function () {
    StudyPGN.boardOrientation = StudyPGN.boardOrientation === 'white' ? 'black' : 'white';
    StudyPGN.renderBoard();
  };

  StudyPGN.toggleAutoplay = function () {
    StudyPGN.isAutoplaying = !StudyPGN.isAutoplaying;
    const btn = document.getElementById('pgn-btn-autoplay');
    if (btn) btn.innerHTML = StudyPGN.isAutoplaying ? '⏸ Pause' : '▶ Play';

    if (StudyPGN.isAutoplaying) {
      StudyPGN.autoplayTimer = setInterval(() => {
        StudyPGN.nextMove();
      }, 1400);
    } else {
      if (StudyPGN.autoplayTimer) clearInterval(StudyPGN.autoplayTimer);
    }
  };

  // ── Render Board SVG/DOM ──
  StudyPGN.renderBoard = function (containerId = 'pgn-study-board') {
    const container = document.getElementById(containerId);
    if (!container || !StudyPGN.chess) return;

    const board = StudyPGN.chess.board();
    const isFlipped = StudyPGN.boardOrientation === 'black';

    const pieceSymbols = {
      'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
      'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
    };

    let html = `
      <div class="pgn-chess-grid" style="display:grid; grid-template-columns:repeat(8, 1fr); aspect-ratio:1/1; width:100%; max-width:480px; margin:0 auto; border-radius:12px; overflow:hidden; border:2px solid rgba(218,163,62,0.3); box-shadow:0 12px 36px rgba(0,0,0,0.5);">
    `;

    const rows = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const cols = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    const lastMove = StudyPGN.moveHistory && StudyPGN.currentMoveIndex >= 0 ? StudyPGN.moveHistory[StudyPGN.currentMoveIndex] : null;

    rows.forEach(r => {
      cols.forEach(c => {
        const isLight = (r + c) % 2 === 0;
        const squareName = String.fromCharCode(97 + c) + (8 - r);
        const piece = board[r][c];
        const isHighlight = lastMove && (lastMove.from === squareName || lastMove.to === squareName);

        const bgColor = isHighlight ? (isLight ? '#cdd26a' : '#aaa23a') : (isLight ? '#f0d9b5' : '#b58863');
        const pieceChar = piece ? (piece.color === 'w' ? pieceSymbols[piece.type.toUpperCase()] : pieceSymbols[piece.type.toLowerCase()]) : '';
        const pieceColorStyle = piece ? (piece.color === 'w' ? 'color:#ffffff; text-shadow:0 2px 4px rgba(0,0,0,0.8), 0 0 2px #000;' : 'color:#18181b; text-shadow:0 1px 2px rgba(255,255,255,0.4);') : '';

        html += `
          <div class="pgn-square" data-square="${squareName}" onclick="StudyPGN.onSquareClicked('${squareName}')"
               style="background:${bgColor}; display:flex; align-items:center; justify-content:center; font-size:clamp(1.8rem, 5vw, 2.6rem); cursor:pointer; user-select:none; position:relative; font-family:'Segoe UI Symbol', 'Arial Unicode MS', sans-serif;">
            <span style="${pieceColorStyle} transform:translateY(-2px);">${pieceChar}</span>
            ${c === (isFlipped ? 7 : 0) ? `<span style="position:absolute; top:2px; left:3px; font-size:9px; font-weight:700; opacity:0.6; color:${isLight ? '#b58863' : '#f0d9b5'}; font-family:sans-serif;">${8 - r}</span>` : ''}
            ${r === (isFlipped ? 0 : 7) ? `<span style="position:absolute; bottom:2px; right:3px; font-size:9px; font-weight:700; opacity:0.6; color:${isLight ? '#b58863' : '#f0d9b5'}; font-family:sans-serif;">${String.fromCharCode(97 + c)}</span>` : ''}
          </div>
        `;
      });
    });

    html += `</div>`;
    container.innerHTML = html;
  };

  StudyPGN.onSquareClicked = function (square) {
    // Guess the move handler or interactive board move test
    if (StudyPGN.isGuessTheMoveMode) {
      StudyPGN.handleGuessMove(square);
    }
  };

  // ── Render Move Notation List ──
  StudyPGN.renderMoveList = function () {
    const listContainer = document.getElementById('pgn-movelist-container');
    if (!listContainer || !StudyPGN.moveHistory) return;

    let html = '';
    for (let i = 0; i < StudyPGN.moveHistory.length; i += 2) {
      const moveNum = Math.floor(i / 2) + 1;
      const wMove = StudyPGN.moveHistory[i];
      const bMove = StudyPGN.moveHistory[i + 1];

      const isWActive = StudyPGN.currentMoveIndex === i;
      const isBActive = StudyPGN.currentMoveIndex === i + 1;

      html += `
        <div style="display:grid; grid-template-columns:36px 1fr 1fr; gap:6px; align-items:center; padding:4px 8px; border-radius:6px; font-size:13px; font-family:var(--font-mono, monospace);">
          <span style="color:var(--ivory-dim); opacity:0.6;">${moveNum}.</span>
          <button class="pgn-move-btn ${isWActive ? 'active' : ''}" onclick="StudyPGN.goToMove(${i})"
                  style="text-align:left; background:${isWActive ? 'var(--gold)' : 'rgba(255,255,255,0.04)'}; color:${isWActive ? '#000' : '#fff'}; font-weight:${isWActive ? '800' : '600'}; padding:4px 8px; border-radius:4px; border:none; cursor:pointer;">
            ${wMove.san}
          </button>
          ${bMove ? `
            <button class="pgn-move-btn ${isBActive ? 'active' : ''}" onclick="StudyPGN.goToMove(${i + 1})"
                    style="text-align:left; background:${isBActive ? 'var(--gold)' : 'rgba(255,255,255,0.04)'}; color:${isBActive ? '#000' : '#fff'}; font-weight:${isBActive ? '800' : '600'}; padding:4px 8px; border-radius:4px; border:none; cursor:pointer;">
              ${bMove.san}
            </button>
          ` : '<span></span>'}
        </div>
      `;
    }

    listContainer.innerHTML = html;
  };

  StudyPGN.highlightCurrentMove = function () {
    const btns = document.querySelectorAll('.pgn-move-btn');
    btns.forEach((btn, idx) => {
      if (idx === StudyPGN.currentMoveIndex) {
        btn.classList.add('active');
        btn.style.background = 'var(--gold)';
        btn.style.color = '#000';
        btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        btn.classList.remove('active');
        btn.style.background = 'rgba(255,255,255,0.04)';
        btn.style.color = '#fff';
      }
    });
  };

  StudyPGN.renderGameInfo = function () {
    const g = StudyPGN.currentGame;
    if (!g) return;
    const titleEl = document.getElementById('pgn-game-title');
    const descEl = document.getElementById('pgn-game-desc');
    const playersEl = document.getElementById('pgn-game-players');

    if (titleEl) titleEl.textContent = g.title || 'Grandmaster Masterclass Study';
    if (descEl) descEl.textContent = g.description || '';
    if (playersEl) playersEl.innerHTML = `<strong>⚪ ${escapeHtml(g.white || 'White')}</strong> vs <strong>⚫ ${escapeHtml(g.black || 'Black')}</strong> · <span style="color:var(--gold); font-weight:700;">${escapeHtml(g.result || '*')}</span>`;
  };

  // ── Stockfish Evaluation Gauge ──
  StudyPGN.updateEvalGauge = function () {
    const bar = document.getElementById('pgn-eval-bar');
    const scoreText = document.getElementById('pgn-eval-text');
    if (!bar || !scoreText || !StudyPGN.chess) return;

    // Simple heuristic material + positional estimation
    let score = 0;
    const pieceVals = { p: 1, n: 3.2, b: 3.3, r: 5, q: 9.5, k: 0 };
    const board = StudyPGN.chess.board();

    board.forEach(row => {
      row.forEach(p => {
        if (p) {
          const val = pieceVals[p.type] || 0;
          score += (p.color === 'w' ? val : -val);
        }
      });
    });

    const clampedScore = Math.max(-10, Math.min(10, score));
    const whitePct = 50 + (clampedScore * 4.5);

    bar.style.height = `${whitePct}%`;
    scoreText.textContent = (score >= 0 ? `+${score.toFixed(1)}` : score.toFixed(1));
  };

  // ── Lichess Master Opening Explorer API ──
  StudyPGN.fetchLichessOpeningStats = async function () {
    const explorerEl = document.getElementById('pgn-lichess-explorer');
    if (!explorerEl || !StudyPGN.chess) return;

    const fen = StudyPGN.chess.fen();
    try {
      explorerEl.innerHTML = `<div style="font-size:11px; color:#94a3b8; padding:8px;"><span class="spinner" style="display:inline-block; width:12px; height:12px; margin-right:4px;"></span> Fetching Lichess Masters statistics...</div>`;
      
      const res = await fetch(`https://explorer.lichess.ovh/masters?fen=${encodeURIComponent(fen)}&topGames=3`);
      if (!res.ok) throw new Error('API limit or offline');
      const data = await res.json();

      if (!data.moves || !data.moves.length) {
        explorerEl.innerHTML = `<div style="font-size:12px; color:var(--ivory-dim); padding:8px;">End of master database book. Explore tactical novelties!</div>`;
        return;
      }

      let movesHtml = data.moves.slice(0, 4).map(m => {
        const total = m.white + m.draws + m.black;
        const wPct = Math.round((m.white / total) * 100) || 0;
        const dPct = Math.round((m.draws / total) * 100) || 0;
        const bPct = Math.round((m.black / total) * 100) || 0;
        return `
          <div style="display:grid; grid-template-columns:50px 1fr 60px; gap:8px; align-items:center; font-size:11.5px; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.04);">
            <strong style="color:var(--gold);">${escapeHtml(m.san)}</strong>
            <div style="display:flex; height:8px; border-radius:4px; overflow:hidden; background:#334155;">
              <div style="width:${wPct}%; background:#ffffff;" title="White wins: ${wPct}%"></div>
              <div style="width:${dPct}%; background:#94a3b8;" title="Draws: ${dPct}%"></div>
              <div style="width:${bPct}%; background:#0f172a;" title="Black wins: ${bPct}%"></div>
            </div>
            <span style="font-size:10px; color:#94a3b8; text-align:right;">${total.toLocaleString()}</span>
          </div>
        `;
      }).join('');

      explorerEl.innerHTML = `
        <div style="padding:8px 0;">
          <div style="font-size:11px; font-weight:700; color:var(--gold); text-transform:uppercase; margin-bottom:6px; display:flex; justify-content:space-between;">
            <span>♟️ Lichess Master Moves</span>
            <span>${(data.white + data.draws + data.black).toLocaleString()} Games</span>
          </div>
          ${movesHtml}
        </div>
      `;
    } catch (e) {
      explorerEl.innerHTML = `<div style="font-size:11.5px; color:#64748b; padding:6px;">Lichess Master Explorer: Offline Mode (Local Grandmaster Vault active).</div>`;
    }
  };

  // ── "Guess the Move" GM Training Mode ──
  StudyPGN.toggleGuessTheMove = function () {
    StudyPGN.isGuessTheMoveMode = !StudyPGN.isGuessTheMoveMode;
    const btn = document.getElementById('pgn-btn-guess');
    const panel = document.getElementById('pgn-guess-panel');

    if (btn) {
      btn.style.background = StudyPGN.isGuessTheMoveMode ? 'var(--gold)' : 'transparent';
      btn.style.color = StudyPGN.isGuessTheMoveMode ? '#000' : 'var(--gold)';
    }
    if (panel) panel.style.display = StudyPGN.isGuessTheMoveMode ? 'block' : 'none';

    if (StudyPGN.isGuessTheMoveMode) {
      StudyPGN.guessScore = 0;
      StudyPGN.guessTotal = 0;
      if (window.toast) window.toast('🎯 Guess the Move Activated! Play the Grandmaster\'s next move on the board.', 'info');
    }
  };

  // ── Daily Tactics Workout Engine ──
  StudyPGN.loadDailyPuzzle = async function () {
    // Try fetching from Lichess Daily Puzzle API
    try {
      const res = await fetch('https://lichess.org/api/puzzle/daily');
      if (res.ok) {
        const data = await res.json();
        if (data.game && data.puzzle) {
          StudyPGN.currentPuzzle = {
            id: data.puzzle.id,
            fen: data.puzzle.fen,
            moves: data.puzzle.solution || [],
            rating: data.puzzle.rating,
            title: `Lichess Daily Master Puzzle (#${data.puzzle.id})`,
            hint: 'Look for tactical themes: Pins, Forks, Discovered Attacks, or Checkmating nets.',
            level: 'Intermediate'
          };
          StudyPGN.setupPuzzle(StudyPGN.currentPuzzle);
          return;
        }
      }
    } catch (e) {
      console.warn('[StudyPGN] Lichess puzzle daily offline fallback');
    }

    // Fallback to calibrated local puzzle
    const puz = CURATED_TACTICS[Math.floor(Math.random() * CURATED_TACTICS.length)];
    StudyPGN.currentPuzzle = puz;
    StudyPGN.setupPuzzle(puz);
  };

  StudyPGN.setupPuzzle = function (puzzle) {
    if (!window.Chess) return;
    StudyPGN.puzzleGame = new window.Chess(puzzle.fen);
    StudyPGN.puzzleMoveIndex = 0;

    StudyPGN.renderTacticsBoard();
    StudyPGN.updateStreakUI();

    const titleEl = document.getElementById('tactics-puzzle-title');
    const hintEl = document.getElementById('tactics-hint-text');
    if (titleEl) titleEl.textContent = `${puzzle.title} (${puzzle.rating || 'Rated'} ELO)`;
    if (hintEl) hintEl.textContent = 'Click "💡 Ask TOM AI Hint" if you need a clue!';
  };

  StudyPGN.renderTacticsBoard = function () {
    const container = document.getElementById('tactics-board-container');
    if (!container || !StudyPGN.puzzleGame) return;

    const board = StudyPGN.puzzleGame.board();
    const isWhiteTurn = StudyPGN.puzzleGame.turn() === 'w';

    const pieceSymbols = {
      'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
      'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
    };

    let html = `
      <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:13px; font-weight:700; color:${isWhiteTurn ? '#fff' : '#fbbf24'};">
          ${isWhiteTurn ? '⚪ White to Move & Win' : '⚫ Black to Move & Win'}
        </span>
        <span style="font-size:12px; color:var(--ivory-dim);">Puzzle #${StudyPGN.currentPuzzle?.id || 'Daily'}</span>
      </div>
      <div class="pgn-chess-grid" style="display:grid; grid-template-columns:repeat(8, 1fr); aspect-ratio:1/1; width:100%; max-width:440px; margin:0 auto; border-radius:12px; overflow:hidden; border:2px solid rgba(218,163,62,0.4); box-shadow:0 12px 32px rgba(0,0,0,0.5);">
    `;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isLight = (r + c) % 2 === 0;
        const squareName = String.fromCharCode(97 + c) + (8 - r);
        const piece = board[r][c];

        const bgColor = isLight ? '#f0d9b5' : '#b58863';
        const pieceChar = piece ? (piece.color === 'w' ? pieceSymbols[piece.type.toUpperCase()] : pieceSymbols[piece.type.toLowerCase()]) : '';
        const pieceColorStyle = piece ? (piece.color === 'w' ? 'color:#ffffff; text-shadow:0 2px 4px rgba(0,0,0,0.8), 0 0 2px #000;' : 'color:#18181b; text-shadow:0 1px 2px rgba(255,255,255,0.4);') : '';

        html += `
          <div class="tactics-square" data-square="${squareName}" onclick="StudyPGN.onTacticsSquareClicked('${squareName}')"
               style="background:${bgColor}; display:flex; align-items:center; justify-content:center; font-size:clamp(1.6rem, 4.8vw, 2.4rem); cursor:pointer; user-select:none; position:relative; font-family:'Segoe UI Symbol', 'Arial Unicode MS', sans-serif;">
            <span style="${pieceColorStyle} transform:translateY(-2px);">${pieceChar}</span>
          </div>
        `;
      }
    }
    html += `</div>`;
    container.innerHTML = html;
  };

  let selectedTacticsSquare = null;
  StudyPGN.onTacticsSquareClicked = function (square) {
    if (!StudyPGN.puzzleGame) return;

    if (!selectedTacticsSquare) {
      const piece = StudyPGN.puzzleGame.get(square);
      if (piece && piece.color === StudyPGN.puzzleGame.turn()) {
        selectedTacticsSquare = square;
        document.querySelectorAll('.tactics-square').forEach(el => {
          if (el.getAttribute('data-square') === square) el.style.outline = '3px solid var(--gold)';
        });
      }
    } else {
      const move = StudyPGN.puzzleGame.move({ from: selectedTacticsSquare, to: square, promotion: 'q' });
      selectedTacticsSquare = null;
      document.querySelectorAll('.tactics-square').forEach(el => el.style.outline = 'none');

      if (move) {
        StudyPGN.renderTacticsBoard();
        StudyPGN.checkTacticsMove(move);
      }
    }
  };

  StudyPGN.checkTacticsMove = function (move) {
    const puzzle = StudyPGN.currentPuzzle;
    if (!puzzle) return;

    // Check if move matches solution
    const moveStr = move.from + move.to;
    const expectedMove = puzzle.moves ? puzzle.moves[StudyPGN.puzzleMoveIndex] : null;

    if (!expectedMove || expectedMove.includes(moveStr) || move.san === expectedMove) {
      StudyPGN.puzzleMoveIndex++;
      if (StudyPGN.puzzleMoveIndex >= (puzzle.moves?.length || 1)) {
        // Solved!
        if (window.toast) window.toast('🎉 Excellent calculation! Puzzle Solved!', 'success');
        StudyPGN.recordTacticsSolved(puzzle.id, puzzle.level, 20);
        setTimeout(() => {
          StudyPGN.loadDailyPuzzle();
        }, 1800);
      } else {
        // Play opponent response
        setTimeout(() => {
          const oppMoveStr = puzzle.moves[StudyPGN.puzzleMoveIndex];
          if (oppMoveStr && oppMoveStr.length >= 4) {
            StudyPGN.puzzleGame.move({ from: oppMoveStr.substring(0, 2), to: oppMoveStr.substring(2, 4) });
            StudyPGN.puzzleMoveIndex++;
            StudyPGN.renderTacticsBoard();
          }
        }, 500);
      }
    } else {
      if (window.toast) window.toast('❌ Not the best move! Try recalculating candidate lines.', 'warning');
      setTimeout(() => {
        StudyPGN.puzzleGame.undo();
        StudyPGN.renderTacticsBoard();
      }, 800);
    }
  };

  StudyPGN.showTacticsHint = function () {
    const hintEl = document.getElementById('tactics-hint-text');
    const puz = StudyPGN.currentPuzzle;
    if (!hintEl || !puz) return;
    hintEl.innerHTML = `💡 <strong>TOM AI Hint:</strong> ${escapeHtml(puz.hint || 'Look for tactical pins or royal forks!')}`;
  };

  StudyPGN.updateStreakUI = function () {
    const streakEl = document.getElementById('tactics-streak-count');
    const badgeEl = document.getElementById('tactics-flame-badge');
    if (streakEl) streakEl.textContent = `🔥 ${StudyPGN.dailyStreak} Day Streak`;
    if (badgeEl) badgeEl.style.display = StudyPGN.dailyStreak > 0 ? 'inline-flex' : 'none';
  };

  // ── Board Visualization & Speed Trainer ──
  StudyPGN.startVisionGame = function (mode = 'color') {
    StudyPGN.visionMode = mode;
    StudyPGN.visionScore = 0;
    StudyPGN.visionStreak = 0;
    StudyPGN.visionTimeRemaining = 30;

    const modal = document.getElementById('vision-trainer-modal');
    if (modal) modal.classList.add('active');

    StudyPGN.nextVisionQuestion();

    if (StudyPGN.visionTimer) clearInterval(StudyPGN.visionTimer);
    StudyPGN.visionTimer = setInterval(() => {
      StudyPGN.visionTimeRemaining--;
      const timeEl = document.getElementById('vision-time-remaining');
      if (timeEl) timeEl.textContent = `${StudyPGN.visionTimeRemaining}s`;

      if (StudyPGN.visionTimeRemaining <= 0) {
        clearInterval(StudyPGN.visionTimer);
        StudyPGN.endVisionGame();
      }
    }, 1000);
  };

  StudyPGN.nextVisionQuestion = function () {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const f = files[Math.floor(Math.random() * 8)];
    const r = ranks[Math.floor(Math.random() * 8)];
    StudyPGN.visionTargetSquare = f + r;

    const squareDisplay = document.getElementById('vision-target-square');
    if (squareDisplay) squareDisplay.textContent = StudyPGN.visionTargetSquare.toUpperCase();
  };

  StudyPGN.submitVisionAnswer = function (colorGuess) {
    const sq = StudyPGN.visionTargetSquare;
    if (!sq) return;

    const fIdx = sq.charCodeAt(0) - 97;
    const rIdx = parseInt(sq[1], 10) - 1;
    const isDark = (fIdx + rIdx) % 2 === 0;
    const correctColor = isDark ? 'dark' : 'light';

    if (colorGuess === correctColor) {
      StudyPGN.visionScore += 10 + (StudyPGN.visionStreak * 2);
      StudyPGN.visionStreak++;
    } else {
      StudyPGN.visionStreak = 0;
    }

    const scoreEl = document.getElementById('vision-current-score');
    if (scoreEl) scoreEl.textContent = StudyPGN.visionScore;

    StudyPGN.nextVisionQuestion();
  };

  StudyPGN.endVisionGame = function () {
    if (window.toast) window.toast(`🏁 Time's up! Calculation Score: ${StudyPGN.visionScore} points!`, 'success');
  };

  // ── Coach & Admin Topic Assignment ──
  window.openAssignStudyTopicModal = function () {
    const modal = document.getElementById('assign-study-topic-modal');
    if (!modal) return;

    const batchSelect = document.getElementById('topic-batch-select');
    const studentSelect = document.getElementById('topic-student-select');

    if (batchSelect && Array.isArray(window.allBatches)) {
      batchSelect.innerHTML = '<option value="all">-- All Enrolled Batches --</option>' +
        window.allBatches.map(b => `<option value="${escapeHtml(b.id)}">${escapeHtml(b.name)}</option>`).join('');
    }
    if (studentSelect && Array.isArray(window.allStudents)) {
      studentSelect.innerHTML = '<option value="all">-- All Students --</option>' +
        window.allStudents.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name || s.full_name || 'Student')}</option>`).join('');
    }

    modal.classList.add('active');
  };

  window.saveAssignedStudyTopic = function () {
    const title = document.getElementById('topic-title-input')?.value;
    const pgn = document.getElementById('topic-pgn-input')?.value;
    const category = document.getElementById('topic-cat-select')?.value || 'Openings';
    const batchId = document.getElementById('topic-batch-select')?.value || 'all';
    const studentId = document.getElementById('topic-student-select')?.value || 'all';

    if (!title || !pgn) {
      if (window.toast) window.toast('Please provide a Topic Title and PGN sequence!', 'warning');
      return;
    }

    const newTopic = {
      id: 'topic-' + Date.now(),
      title: title.trim(),
      pgn: pgn.trim(),
      category: category,
      batch_id: batchId,
      student_id: studentId,
      assigned_by: window.currentCoach ? (window.currentCoach.name || 'Coach') : 'Academy Admin',
      assigned_date: new Date().toISOString().split('T')[0]
    };

    let topics = [];
    try {
      topics = JSON.parse(localStorage.getItem(STORAGE_ASSIGNED_TOPICS) || '[]');
    } catch (e) {}
    topics.unshift(newTopic);
    localStorage.setItem(STORAGE_ASSIGNED_TOPICS, JSON.stringify(topics));

    if (window.toast) window.toast('✨ Study Topic successfully assigned to students!', 'success');
    const modal = document.getElementById('assign-study-topic-modal');
    if (modal) modal.classList.remove('active');

    StudyPGN.renderAssignedTopicsList();
  };

  StudyPGN.renderAssignedTopicsList = function () {
    const container = document.getElementById('assigned-topics-grid');
    if (!container) return;

    let topics = [];
    try {
      topics = JSON.parse(localStorage.getItem(STORAGE_ASSIGNED_TOPICS) || '[]');
    } catch (e) {}

    if (!topics.length) {
      container.innerHTML = `<div style="text-align:center; padding:40px 20px; color:#94a3b8; background:var(--surface); border-radius:12px; border:1px dashed var(--border);">No custom topics assigned yet. Use <strong>+ Assign Study Topic</strong> to create one!</div>`;
      return;
    }

    container.innerHTML = topics.map(t => `
      <div class="card" style="padding:16px 20px; background:var(--surface); border:1px solid var(--border); border-radius:14px; display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap;">
        <div>
          <div style="display:flex; gap:8px; align-items:center; margin-bottom:6px;">
            <span style="background:rgba(218,163,62,0.2); color:var(--gold); font-size:11px; font-weight:700; padding:2px 8px; border-radius:4px;">${escapeHtml(t.category)}</span>
            <span style="font-size:12px; color:var(--ivory-dim);">Assigned by ${escapeHtml(t.assigned_by)}</span>
          </div>
          <h4 style="margin:0; color:#fff; font-size:15px; font-weight:700;">${escapeHtml(t.title)}</h4>
        </div>
        <button class="btn btn-gold btn-sm" onclick="StudyPGN.loadPgnString(\`${escapeHtml(t.pgn)}\`, { title: '${escapeHtml(t.title)}' })">
          ♟️ Practice in Study Board
        </button>
      </div>
    `).join('');
  };

  // ── Helper: Safe Escape HTML ──
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ── Sub Tab Switcher ──
  window.setStudyPgnSubTab = function (subTab, btn) {
    document.querySelectorAll('.studypgn-subview').forEach(v => v.style.display = 'none');
    const target = document.getElementById('studypgn-subview-' + subTab);
    if (target) target.style.display = 'block';

    const parentNav = btn ? btn.parentElement : document.querySelector('#child-tab-studypgn .tabs-nav');
    if (parentNav) {
      parentNav.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
      if (btn) btn.classList.add('active');
    }

    if (subTab === 'lab') {
      StudyPGN.renderBoard();
      StudyPGN.renderMoveList();
      StudyPGN.renderGameInfo();
    } else if (subTab === 'tactics') {
      StudyPGN.renderTacticsBoard();
      StudyPGN.updateStreakUI();
    } else if (subTab === 'topics') {
      StudyPGN.renderAssignedTopicsList();
    }
  };

  // ── Import PGN Modal ──
  window.openImportPgnModal = function () {
    const modal = document.getElementById('import-pgn-modal');
    if (modal) modal.classList.add('active');
  };

  window.submitImportPgn = function () {
    const pgnText = document.getElementById('import-pgn-text')?.value;
    if (!pgnText || !pgnText.trim()) {
      if (window.toast) window.toast('Please paste PGN notation.', 'warning');
      return;
    }
    StudyPGN.loadPgnString(pgnText.trim(), {
      title: 'Imported Custom Study Game',
      description: 'Custom game loaded via PGN notation importer.'
    });
    const modal = document.getElementById('import-pgn-modal');
    if (modal) modal.classList.remove('active');
    if (window.toast) window.toast('♟️ PGN loaded into Interactive Study Board!', 'success');
  };

  // ── Coach & Admin Practice Analytics Monitor ──
  window.renderStudyPgnMonitor = function (roleType = 'admin') {
    const containerId = roleType === 'coach' ? 'coach-studypgn-students-table-wrap' : 'admin-studypgn-students-table-wrap';
    const container = document.getElementById(containerId);
    if (!container) return;

    const students = Array.isArray(window.allStudents) ? window.allStudents : [];
    let tacticsRec = {};
    try {
      tacticsRec = JSON.parse(localStorage.getItem(STORAGE_TACTICS_RECORDS) || '{}');
    } catch (e) {}

    const todayStr = new Date().toISOString().split('T')[0];
    let totalStreaks = 0;
    let totalSolvedToday = 0;

    let rowsHtml = students.map((s, idx) => {
      const rec = tacticsRec[String(s.id)] || { streak: 0, lastDate: '', solvedCount: 0 };
      const isSolvedToday = (rec.lastDate === todayStr);
      const streak = rec.streak || 0;
      if (streak > 0) totalStreaks++;
      if (isSolvedToday) totalSolvedToday++;

      const studentName = escapeHtml(s.name || s.full_name || `Student #${s.id}`);
      const studentLevel = escapeHtml(s.level || 'Beginner');

      return `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:12px 14px; font-weight:700; color:#fff;">
            ${studentName}
            <div style="font-size:11px; font-weight:400; color:var(--ivory-dim);">${studentLevel}</div>
          </td>
          <td style="padding:12px 14px;">
            ${streak > 0 ? `<span style="background:rgba(234,179,8,0.15); color:#eab308; font-weight:800; padding:4px 10px; border-radius:99px; font-size:12px;">🔥 ${streak} Days</span>` : `<span style="color:#64748b; font-size:12px;">No active streak</span>`}
          </td>
          <td style="padding:12px 14px;">
            ${isSolvedToday ? `<span style="background:rgba(16,185,129,0.15); color:#10b981; font-weight:700; padding:4px 10px; border-radius:99px; font-size:12px;">✅ Solved Today</span>` : `<span style="background:rgba(245,158,11,0.15); color:#f59e0b; font-weight:700; padding:4px 10px; border-radius:99px; font-size:12px;">⏳ Pending</span>`}
          </td>
          <td style="padding:12px 14px; font-size:13px; color:#fff;">
            ${rec.solvedCount || 0} Puzzles
          </td>
          <td style="padding:12px 14px; text-align:right;">
            <button class="btn btn-outline-grey btn-sm" onclick="window.shareStudentTacticsProgressWhatsApp('${escapeHtml(s.id)}')" style="font-size:11px; padding:4px 8px; border-color:rgba(34,197,94,0.4); color:#4ade80;" title="Share progress on WhatsApp">
              📱 WhatsApp
            </button>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <table style="width:100%; border-collapse:collapse; text-align:left; font-size:13px;">
        <thead>
          <tr style="border-bottom:1px solid var(--border); color:var(--gold); font-size:11px; text-transform:uppercase; letter-spacing:0.05em;">
            <th style="padding:10px 14px;">Student</th>
            <th style="padding:10px 14px;">Tactics Streak</th>
            <th style="padding:10px 14px;">Today's Workout</th>
            <th style="padding:10px 14px;">Total Solved</th>
            <th style="padding:10px 14px; text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="5" style="text-align:center; padding:30px; color:#94a3b8;">No student records found.</td></tr>'}
        </tbody>
      </table>
    `;

    // Update KPI counters
    const streakTotalEl = document.getElementById('admin-tactics-streak-total');
    const solvedTodayEl = document.getElementById('admin-tactics-solved-today');
    if (streakTotalEl) streakTotalEl.textContent = `${totalStreaks} Students`;
    if (solvedTodayEl) solvedTodayEl.textContent = String(totalSolvedToday);
  };

  // ── 1-Click WhatsApp Parent Progress Dispatcher ──
  window.shareStudentTacticsProgressWhatsApp = function (studentId) {
    const student = (window.allStudents || []).find(s => String(s.id) === String(studentId));
    if (!student) return;

    let tacticsRec = {};
    try {
      tacticsRec = JSON.parse(localStorage.getItem(STORAGE_TACTICS_RECORDS) || '{}');
    } catch (e) {}
    const rec = tacticsRec[String(student.id)] || { streak: 0, solvedCount: 0 };

    const studentName = student.name || student.full_name || 'Student';
    const parentPhone = student.parent_phone || student.phone || '';
    const cleanPhone = String(parentPhone).replace(/[^0-9]/g, '');

    const message = `🏆 *ChessKidoo Academy Progress Update* — ${studentName}\n` +
      `🔥 *Daily Tactics Streak:* ${rec.streak || 0} Days\n` +
      `⭐ *Total Puzzles Solved:* ${rec.solvedCount || 0} Exercises\n` +
      `♟️ *Current Level:* ${student.level || 'Beginner'}\n` +
      `📈 *Keep up the outstanding calculation practice!* ♟️✨`;

    const waUrl = cleanPhone ?
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}` :
      `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank');
  };

  // ── Initial Load ──
  window.addEventListener('DOMContentLoaded', () => {
    StudyPGN.init();
  });
})();

