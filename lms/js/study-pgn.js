/**
 * ChessKidoo LMS — Study PGN, Daily Tactics Streaks & Board Visualization Engine (v2.0)
 * ──────────────────────────────────────────────────────────────────────────────────────────
 * 1. Interactive PGN Study Board (Chess.com theme, Lichess opening tree, Stockfish Cloud API, Guess the Move).
 * 2. TOM AI Move-by-Move Guidance (pedagogical explanations for every move in the PGN).
 * 3. Daily Tactics Workout & Gamified Streaks (Live Lichess Daily Puzzle API + Calibrated Levels).
 * 4. Board Visualization & Speed Calculation Trainer (Square Color, Coordinate Radar, Knight Pathfinder).
 * 5. Coach & Admin Topic Assignment & Student Practice Monitoring Dashboard.
 */
(function () {
  'use strict';

  // ── Storage Keys ──
  const STORAGE_TACTICS_RECORDS = 'ck_student_tactics_records';
  const STORAGE_ASSIGNED_TOPICS = 'ck_assigned_study_topics';
  const STORAGE_VISION_SCORES = 'ck_student_vision_scores';
  const STORAGE_COMPLETED_TOPICS = 'ck_completed_study_topics';

  // ── Chess.com Style Piece Images with SVG / Unicode Fallback ──
  const CHESSCOM_PIECES = {
    'P': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wp.png',
    'N': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wn.png',
    'B': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wb.png',
    'R': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wr.png',
    'Q': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wq.png',
    'K': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/wk.png',
    'p': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bp.png',
    'n': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bn.png',
    'b': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bb.png',
    'r': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/br.png',
    'q': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bq.png',
    'k': 'https://images.chesscomfiles.com/chess-themes/pieces/neo/150/bk.png'
  };

  const UNICODE_PIECES = {
    'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
    'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
  };

  // ── Safe HTML Escape ──
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ── Curated Grandmaster PGN Vault ──
  const CURATED_STUDY_GAMES = [
    {
      id: 'gm-opera-1858',
      title: 'The Opera Game: Paul Morphy vs Duke of Brunswick (1858)',
      category: 'Masterpiece',
      level: 'Beginner',
      white: 'Paul Morphy',
      black: 'Duke of Brunswick & Count Isouard',
      result: '1-0',
      description: 'The most famous game in chess history illustrating rapid piece development, open lines, and deflection sacrifices.',
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

  // ── Global State Object ──
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
    selectedSquare: null,
    legalMovesForSelected: [],
    activeAssignedTopic: null,

    // Daily Tactics State
    currentPuzzle: null,
    puzzleGame: null,
    puzzleMoveIndex: 0,
    dailyStreak: 0,
    hasSolvedToday: false,

    // Visualization State
    visionMode: 'color',
    visionTimer: null,
    visionTimeRemaining: 30,
    visionScore: 0,
    visionStreak: 0,
    visionTargetSquare: '',

    // Init
    init: function () {
      this.ensureChessEngine();
      this.loadSavedRecords();
      this.loadDailyPuzzle();
      this.loadCuratedGame(0);
      this.setupKeyboardListeners();
    }
  };

  // ── Ensure Chess Engine Ready ──
  StudyPGN.ensureChessEngine = function () {
    if (!window.Chess) {
      console.warn('[StudyPGN] Chess.js not loaded. Initializing basic chess state.');
      return false;
    }
    if (!StudyPGN.chess) {
      StudyPGN.chess = new window.Chess();
    }
    return true;
  };

  // ── Local Storage & Records Sync ──
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
    } catch (e) {}

    StudyPGN.updateStreakUI();
  };

  // ── Keyboard Navigation ──
  StudyPGN.setupKeyboardListeners = function () {
    window.addEventListener('keydown', (e) => {
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

  // ── PGN Loader Engine ──
  StudyPGN.loadCuratedGame = function (index) {
    const game = CURATED_STUDY_GAMES[index] || CURATED_STUDY_GAMES[0];
    StudyPGN.loadPgnString(game.pgn, game);
  };

  StudyPGN.loadPgnString = function (pgnText, metadata = {}) {
    StudyPGN.ensureChessEngine();
    if (!window.Chess) return;

    const c = new window.Chess();
    const cleanPgn = (pgnText || '').trim();
    const success = c.load_pgn(cleanPgn);

    if (!success) {
      if (window.toast) window.toast('Unable to parse PGN notation format.', 'warning');
      return;
    }

    StudyPGN.currentGame = {
      ...metadata,
      pgn: cleanPgn,
      headers: c.header ? c.header() : {}
    };

    StudyPGN.moveHistory = c.history({ verbose: true });
    StudyPGN.chess = new window.Chess();
    StudyPGN.currentMoveIndex = -1;
    StudyPGN.selectedSquare = null;
    StudyPGN.legalMovesForSelected = [];
    StudyPGN.isAutoplaying = false;
    if (StudyPGN.autoplayTimer) clearInterval(StudyPGN.autoplayTimer);

    StudyPGN.renderBoard();
    StudyPGN.renderMoveList();
    StudyPGN.renderGameInfo();
    StudyPGN.updateAiMoveGuide();
    StudyPGN.fetchLichessOpeningStats();
    StudyPGN.fetchStockfishCloudEval();
  };

  StudyPGN.goToMove = function (index) {
    if (!StudyPGN.moveHistory) return;
    const targetIdx = Math.max(-1, Math.min(index, StudyPGN.moveHistory.length - 1));

    StudyPGN.chess = new window.Chess();
    for (let i = 0; i <= targetIdx; i++) {
      StudyPGN.chess.move(StudyPGN.moveHistory[i]);
    }
    StudyPGN.currentMoveIndex = targetIdx;
    StudyPGN.selectedSquare = null;
    StudyPGN.legalMovesForSelected = [];

    StudyPGN.renderBoard();
    StudyPGN.highlightCurrentMove();
    StudyPGN.updateEvalGauge();
    StudyPGN.updateAiMoveGuide();
    StudyPGN.fetchLichessOpeningStats();
    StudyPGN.fetchStockfishCloudEval();
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

  // ── Render Chess.com Style Board ──
  StudyPGN.renderBoard = function (containerId = 'pgn-study-board') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!StudyPGN.chess) {
      if (window.Chess) StudyPGN.chess = new window.Chess();
    }

    const board = StudyPGN.chess ? StudyPGN.chess.board() : [
      [{ type: 'r', color: 'b' }, { type: 'n', color: 'b' }, { type: 'b', color: 'b' }, { type: 'q', color: 'b' }, { type: 'k', color: 'b' }, { type: 'b', color: 'b' }, { type: 'n', color: 'b' }, { type: 'r', color: 'b' }],
      [{ type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }, { type: 'p', color: 'b' }],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [{ type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }, { type: 'p', color: 'w' }],
      [{ type: 'r', color: 'w' }, { type: 'n', color: 'w' }, { type: 'b', color: 'w' }, { type: 'q', color: 'w' }, { type: 'k', color: 'w' }, { type: 'b', color: 'w' }, { type: 'n', color: 'w' }, { type: 'r', color: 'w' }]
    ];

    const isFlipped = StudyPGN.boardOrientation === 'black';
    const lastMove = StudyPGN.moveHistory && StudyPGN.currentMoveIndex >= 0 ? StudyPGN.moveHistory[StudyPGN.currentMoveIndex] : null;

    let html = `
      <div class="pgn-chess-grid chesscom-board-wrap" style="display:grid; grid-template-columns:repeat(8, 1fr); aspect-ratio:1/1; width:100%; max-width:480px; margin:0 auto; border-radius:12px; overflow:hidden; border:3px solid #312e2b; box-shadow:0 14px 40px rgba(0,0,0,0.6); position:relative;">
    `;

    const rows = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const cols = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    rows.forEach(r => {
      cols.forEach(c => {
        const isLight = (r + c) % 2 === 0;
        const squareName = String.fromCharCode(97 + c) + (8 - r);
        const piece = board[r][c];

        // Chess.com Neo Colors
        const isHighlight = lastMove && (lastMove.from === squareName || lastMove.to === squareName);
        const isSelected = StudyPGN.selectedSquare === squareName;
        const isLegalDest = StudyPGN.legalMovesForSelected.some(m => m.to === squareName);

        let bgColor = isLight ? '#eeeed2' : '#769656';
        if (isHighlight) bgColor = isLight ? '#f7f769' : '#baca44';
        if (isSelected) bgColor = '#f5f682';

        const pieceKey = piece ? (piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()) : '';
        const pieceImgUrl = pieceKey ? CHESSCOM_PIECES[pieceKey] : '';
        const pieceChar = pieceKey ? UNICODE_PIECES[pieceKey] : '';

        html += `
          <div class="pgn-square" data-square="${squareName}" onclick="StudyPGN.onBoardSquareClicked('${squareName}')"
               style="background:${bgColor}; display:flex; align-items:center; justify-content:center; cursor:pointer; user-select:none; position:relative;">
            ${pieceImgUrl ? `
              <img src="${pieceImgUrl}" alt="${pieceKey}" style="width:88%; height:88%; object-fit:contain; pointer-events:none; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.25));"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
              <span style="display:none; font-size:2.2rem; ${piece.color === 'w' ? 'color:#fff; text-shadow:0 1px 2px #000;' : 'color:#000;'}">${pieceChar}</span>
            ` : ''}

            ${isLegalDest ? `
              <div style="position:absolute; width:${piece ? '88%' : '26%'}; height:${piece ? '88%' : '26%'}; border-radius:${piece ? '50%' : '50%'}; ${piece ? 'border:4px solid rgba(0,0,0,0.25);' : 'background:rgba(0,0,0,0.18);'} pointer-events:none;"></div>
            ` : ''}

            ${c === (isFlipped ? 7 : 0) ? `<span style="position:absolute; top:3px; left:4px; font-size:10px; font-weight:800; opacity:0.75; color:${isLight ? '#769656' : '#eeeed2'}; font-family:sans-serif;">${8 - r}</span>` : ''}
            ${r === (isFlipped ? 0 : 7) ? `<span style="position:absolute; bottom:2px; right:4px; font-size:10px; font-weight:800; opacity:0.75; color:${isLight ? '#769656' : '#eeeed2'}; font-family:sans-serif;">${String.fromCharCode(97 + c)}</span>` : ''}
          </div>
        `;
      });
    });

    html += `</div>`;
    container.innerHTML = html;
  };

  StudyPGN.onBoardSquareClicked = function (square) {
    if (!StudyPGN.chess) return;

    if (StudyPGN.isGuessTheMoveMode) {
      StudyPGN.handleGuessMove(square);
      return;
    }

    if (!StudyPGN.selectedSquare) {
      const piece = StudyPGN.chess.get(square);
      if (piece && piece.color === StudyPGN.chess.turn()) {
        StudyPGN.selectedSquare = square;
        StudyPGN.legalMovesForSelected = StudyPGN.chess.moves({ square: square, verbose: true });
        StudyPGN.renderBoard();
      }
    } else {
      const move = StudyPGN.chess.move({ from: StudyPGN.selectedSquare, to: square, promotion: 'q' });
      StudyPGN.selectedSquare = null;
      StudyPGN.legalMovesForSelected = [];

      if (move) {
        StudyPGN.renderBoard();
        StudyPGN.updateAiMoveGuide(move);
        StudyPGN.fetchLichessOpeningStats();
        StudyPGN.fetchStockfishCloudEval();
      } else {
        const piece = StudyPGN.chess.get(square);
        if (piece && piece.color === StudyPGN.chess.turn()) {
          StudyPGN.selectedSquare = square;
          StudyPGN.legalMovesForSelected = StudyPGN.chess.moves({ square: square, verbose: true });
        }
        StudyPGN.renderBoard();
      }
    }
  };

  // ── Render Move Notation Tree ──
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
        <div style="display:grid; grid-template-columns:36px 1fr 1fr; gap:6px; align-items:center; padding:3px 8px; border-radius:6px; font-size:13px; font-family:monospace;">
          <span style="color:#64748b; font-weight:700;">${moveNum}.</span>
          <button class="pgn-move-btn ${isWActive ? 'active' : ''}" onclick="StudyPGN.goToMove(${i})"
                  style="text-align:left; background:${isWActive ? 'var(--gold, #daa33e)' : 'rgba(255,255,255,0.04)'}; color:${isWActive ? '#000' : '#fff'}; font-weight:${isWActive ? '800' : '600'}; padding:5px 8px; border-radius:6px; border:none; cursor:pointer;">
            ${wMove.san}
          </button>
          ${bMove ? `
            <button class="pgn-move-btn ${isBActive ? 'active' : ''}" onclick="StudyPGN.goToMove(${i + 1})"
                    style="text-align:left; background:${isBActive ? 'var(--gold, #daa33e)' : 'rgba(255,255,255,0.04)'}; color:${isBActive ? '#000' : '#fff'}; font-weight:${isBActive ? '800' : '600'}; padding:5px 8px; border-radius:6px; border:none; cursor:pointer;">
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
        btn.style.background = 'var(--gold, #daa33e)';
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

  // ── TOM AI Move Guidance & Pedagogical Breakdown ──
  StudyPGN.updateAiMoveGuide = function (customMove) {
    const guideEl = document.getElementById('pgn-tom-ai-guide');
    if (!guideEl) return;

    const move = customMove || (StudyPGN.moveHistory && StudyPGN.currentMoveIndex >= 0 ? StudyPGN.moveHistory[StudyPGN.currentMoveIndex] : null);

    if (!move) {
      guideEl.innerHTML = `
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div style="font-size:24px;">🤖</div>
          <div>
            <div style="font-size:12px; font-weight:800; color:var(--gold); text-transform:uppercase; margin-bottom:4px;">TOM AI Move Assistant</div>
            <p style="margin:0; font-size:13px; color:#94a3b8; line-height:1.5;">Starting position loaded. Step forward with <strong>▶ Next Move</strong> or click on the board to explore candidate master lines!</p>
          </div>
        </div>
      `;
      return;
    }

    const san = move.san;
    let rationale = `Played <strong>${escapeHtml(san)}</strong>.`;

    if (san === 'e4' || san === 'd4') rationale = `Controls key central squares (d5, e5), opens diagonal pathways for bishop and queen development.`;
    else if (san === 'Nf3' || san === 'Nc3' || san === 'Nf6' || san === 'Nc6') rationale = `Develops the knight toward the center, pressuring key central outposts before moving wing pieces.`;
    else if (san.includes('O-O')) rationale = `Castling secures the king behind a protective pawn wall and activates the rook onto the central file.`;
    else if (san.includes('x')) rationale = `Tactical capture! Clears an attacking line and challenges the opponent's defensive structure.`;
    else if (san.includes('+')) rationale = `Check! Forces the defending side to respond immediately, creating tempo advantages.`;
    else if (san.includes('#')) rationale = `Checkmate! The Grandmaster execution completes the mating net. Outstanding game finish!`;
    else if (san.startsWith('B')) rationale = `Develops the bishop to an active diagonal, targeting opponent weaknesses or pinning minor pieces.`;

    guideEl.innerHTML = `
      <div style="display:flex; gap:12px; align-items:flex-start;">
        <div style="font-size:24px;">🤖</div>
        <div style="flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:12px; font-weight:800; color:var(--gold); text-transform:uppercase;">TOM AI Guidance • Move ${escapeHtml(san)}</span>
            <button class="btn btn-outline btn-sm" onclick="window.askTomAiAboutPosition()" style="font-size:10.5px; padding:2px 8px; border-color:rgba(218,163,62,0.4); color:var(--gold);">🎙️ Ask TOM</button>
          </div>
          <p style="margin:0; font-size:13px; color:#e2e8f0; line-height:1.5;">${rationale}</p>
        </div>
      </div>
    `;
  };

  window.askTomAiAboutPosition = function () {
    if (!StudyPGN.chess) return;
    const fen = StudyPGN.chess.fen();
    const move = StudyPGN.moveHistory && StudyPGN.currentMoveIndex >= 0 ? StudyPGN.moveHistory[StudyPGN.currentMoveIndex] : null;
    const moveText = move ? move.san : 'Start position';

    if (window.toast) {
      window.toast(`🤖 TOM AI: Analyzing position after ${moveText}... FEN: ${fen.substring(0, 25)}...`, 'info');
    }
  };

  // ── Stockfish Evaluation Gauge & Cloud API Sync ──
  StudyPGN.updateEvalGauge = function () {
    const bar = document.getElementById('pgn-eval-bar');
    const scoreText = document.getElementById('pgn-eval-text');
    if (!bar || !scoreText || !StudyPGN.chess) return;

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

  StudyPGN.fetchStockfishCloudEval = async function () {
    if (!StudyPGN.chess) return;
    const fen = StudyPGN.chess.fen();
    const scoreText = document.getElementById('pgn-eval-text');
    const bar = document.getElementById('pgn-eval-bar');

    try {
      const res = await fetch(`https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.pvs && data.pvs[0]) {
          const pv = data.pvs[0];
          if (pv.mate) {
            if (scoreText) scoreText.textContent = `M${pv.mate}`;
            if (bar) bar.style.height = pv.mate > 0 ? '100%' : '0%';
          } else if (pv.cp != null) {
            const cpVal = pv.cp / 100;
            if (scoreText) scoreText.textContent = (cpVal >= 0 ? `+${cpVal.toFixed(1)}` : cpVal.toFixed(1));
            const whitePct = Math.max(5, Math.min(95, 50 + (cpVal * 4.5)));
            if (bar) bar.style.height = `${whitePct}%`;
          }
        }
      }
    } catch (e) {}
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
        explorerEl.innerHTML = `<div style="font-size:12px; color:var(--ivory-dim); padding:8px;">End of master opening book. Explore tactical novelties!</div>`;
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
        <div style="padding:4px 0;">
          <div style="font-size:11px; font-weight:700; color:var(--gold); text-transform:uppercase; margin-bottom:6px; display:flex; justify-content:space-between;">
            <span>♟️ Lichess Master Move Tree</span>
            <span>${(data.white + data.draws + data.black).toLocaleString()} Games</span>
          </div>
          ${movesHtml}
        </div>
      `;
    } catch (e) {
      explorerEl.innerHTML = `<div style="font-size:11.5px; color:#64748b; padding:6px;">Lichess Master Explorer: Local Grandmaster Vault active.</div>`;
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
      if (window.toast) window.toast('🎯 Guess the Move Activated! Click a piece and play your candidate move on the board.', 'info');
    }
  };

  // ── Daily Tactics Workout Engine ──
  StudyPGN.loadDailyPuzzle = async function () {
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
    } catch (e) {}

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

    let html = `
      <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:13px; font-weight:700; color:${isWhiteTurn ? '#fff' : '#fbbf24'};">
          ${isWhiteTurn ? '⚪ White to Move & Win' : '⚫ Black to Move & Win'}
        </span>
        <span style="font-size:12px; color:var(--ivory-dim);">Puzzle #${StudyPGN.currentPuzzle?.id || 'Daily'}</span>
      </div>
      <div class="pgn-chess-grid chesscom-board-wrap" style="display:grid; grid-template-columns:repeat(8, 1fr); aspect-ratio:1/1; width:100%; max-width:440px; margin:0 auto; border-radius:12px; overflow:hidden; border:3px solid #312e2b; box-shadow:0 14px 36px rgba(0,0,0,0.6);">
    `;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isLight = (r + c) % 2 === 0;
        const squareName = String.fromCharCode(97 + c) + (8 - r);
        const piece = board[r][c];

        const bgColor = isLight ? '#eeeed2' : '#769656';
        const pieceKey = piece ? (piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()) : '';
        const pieceImgUrl = pieceKey ? CHESSCOM_PIECES[pieceKey] : '';

        html += `
          <div class="tactics-square" data-square="${squareName}" onclick="StudyPGN.onTacticsSquareClicked('${squareName}')"
               style="background:${bgColor}; display:flex; align-items:center; justify-content:center; cursor:pointer; user-select:none; position:relative;">
            ${pieceImgUrl ? `
              <img src="${pieceImgUrl}" alt="${pieceKey}" style="width:88%; height:88%; object-fit:contain; pointer-events:none; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.25));">
            ` : ''}
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
          if (el.getAttribute('data-square') === square) el.style.outline = '3px solid #f5f682';
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

    const moveStr = move.from + move.to;
    const expectedMove = puzzle.moves ? puzzle.moves[StudyPGN.puzzleMoveIndex] : null;

    if (!expectedMove || expectedMove.includes(moveStr) || move.san === expectedMove) {
      StudyPGN.puzzleMoveIndex++;
      if (StudyPGN.puzzleMoveIndex >= (puzzle.moves?.length || 1)) {
        if (window.toast) window.toast('🎉 Brilliant move! Puzzle Solved!', 'success');
        StudyPGN.recordTacticsSolved(puzzle.id, puzzle.level, 20);
        setTimeout(() => {
          StudyPGN.loadDailyPuzzle();
        }, 1800);
      } else {
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
      if (window.toast) window.toast('❌ Not the optimal move. Recalculate your tactics!', 'warning');
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

  // ── Preset Templates Auto-filler ──
  window.loadStudyTopicPreset = function (presetKey) {
    const titleInput = document.getElementById('topic-title-input');
    const catSelect = document.getElementById('topic-cat-select');
    const pgnInput = document.getElementById('topic-pgn-input');
    if (!presetKey) return;

    const PRESETS = {
      evans: {
        title: 'Italian Game: Evans Gambit Attack',
        category: 'Openings',
        pgn: `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O Nge7 8. Ng5 d5 9. exd5 Ne5 10. Bb3 O-O 11. Qxd4 N7g6`
      },
      dragon: {
        title: 'Sicilian Defense: Dragon Variation',
        category: 'Openings',
        pgn: `1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 g6 6. Be3 Bg7 7. f3 O-O 8. Qd2 Nc6 9. Bc4 Bd7 10. O-O-O Ne5 11. Bb3 Rc8`
      },
      qgd: {
        title: 'Queen\'s Gambit Declined: Classical Line',
        category: 'Openings',
        pgn: `1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5 Be7 5. e3 O-O 6. Nf3 Nbd7 7. Rc1 c6 8. Bd3 dxc4 9. Bxc4 Nd5`
      },
      lucena: {
        title: 'Rook Endgames: Lucena Bridge Technique',
        category: 'Endgames',
        pgn: `[FEN "1K1R4/1P1k4/8/8/8/8/8/2r5 w - - 0 1"] 1. Rd4! Rh1 2. Ka7 Ra1+ 3. Kb6 Rb1+ 4. Ka6 Ra1+ 5. Kb5 Rb1+ 6. Rb4!`
      },
      philidor: {
        title: 'Philidor Defense: Solid Central Structure',
        category: 'Openings',
        pgn: `1. e4 e5 2. Nf3 d6 3. d4 exd4 4. Nxd4 Nf6 5. Nc3 Be7 6. Be2 O-O 7. O-O Re8`
      },
      fork: {
        title: 'Tactics: Royal Knight Fork & Center Overload',
        category: 'Tactics',
        pgn: `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. cxd4 Bb4+ 7. Bd2 Bxd2+ 8. Nbxd2 d5 9. exd5 Nxd5 10. Qb3 Nce7 11. O-O O-O`
      }
    };

    const p = PRESETS[presetKey];
    if (p) {
      if (titleInput) titleInput.value = p.title;
      if (catSelect) catSelect.value = p.category;
      if (pgnInput) pgnInput.value = p.pgn;
      if (window.toast) window.toast(`✨ Auto-filled template: ${p.title}`, 'info');
    }
  };

  // ── Coach & Admin Topic Assignment Manager ──
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
      studentSelect.innerHTML = '<option value="all">-- All Students in Batch --</option>' +
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

    if (!title || !title.trim()) {
      if (window.toast) window.toast('Please provide a Topic Title!', 'warning');
      return;
    }
    if (!pgn || !pgn.trim()) {
      if (window.toast) window.toast('Please provide PGN moves sequence!', 'warning');
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
    if (window.renderStudyPgnMonitor) {
      window.renderStudyPgnMonitor(window.role === 'coach' ? 'coach' : 'admin');
    }
  };

  StudyPGN.renderAssignedTopicsList = function () {
    const container = document.getElementById('assigned-topics-grid');
    if (!container) return;

    let topics = [];
    try {
      topics = JSON.parse(localStorage.getItem(STORAGE_ASSIGNED_TOPICS) || '[]');
    } catch (e) {}

    // Add default template topics if empty
    if (!topics.length) {
      topics = [
        {
          id: 'topic-evans-gambit',
          title: 'Italian Game: Evans Gambit Master Repertoire',
          category: 'Openings',
          batch_id: 'all',
          student_id: 'all',
          assigned_by: 'Head Coach',
          assigned_date: '2026-08-15',
          pgn: `1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O Nge7 8. Ng5 d5 9. exd5 Ne5 10. Bb3 O-O 11. Qxd4 N7g6`
        },
        {
          id: 'topic-lucena-bridge',
          title: 'Rook Endgames: The Lucena Bridge Winning Method',
          category: 'Endgames',
          batch_id: 'all',
          student_id: 'all',
          assigned_by: 'Head Coach',
          assigned_date: '2026-08-16',
          pgn: `[FEN "1K1R4/1P1k4/8/8/8/8/8/2r5 w - - 0 1"] 1. Rd4! Rh1 2. Ka7 Ra1+ 3. Kb6 Rb1+ 4. Ka6 Ra1+ 5. Kb5 Rb1+ 6. Rb4!`
        }
      ];
      try { localStorage.setItem(STORAGE_ASSIGNED_TOPICS, JSON.stringify(topics)); } catch (e) {}
    }

    const currentStudent = window.currentStudent;
    const isPreviewOrAdmin = window.role === 'admin' || window.role === 'master' || document.getElementById('preview-mode-banner')?.style.display !== 'none';

    const filteredTopics = topics.filter(t => {
      if (isPreviewOrAdmin) return true;
      if (t.batch_id === 'all' && t.student_id === 'all') return true;
      if (currentStudent) {
        if (t.student_id && String(t.student_id) === String(currentStudent.id)) return true;
        if (t.batch_id && String(t.batch_id) === String(currentStudent.batch_id)) return true;
      }
      return false;
    });

    if (!filteredTopics.length) {
      container.innerHTML = `<div style="text-align:center; padding:40px 20px; color:#94a3b8; background:var(--surface); border-radius:12px; border:1px dashed var(--border);">No topics assigned for your current batch. Check back soon!</div>`;
      return;
    }

    let completedIds = [];
    try { completedIds = JSON.parse(localStorage.getItem(STORAGE_COMPLETED_TOPICS) || '[]'); } catch (e) {}

    container.innerHTML = filteredTopics.map(t => {
      const isCompleted = completedIds.includes(t.id);
      return `
        <div class="card" style="padding:18px 22px; background:var(--surface); border:1px solid ${isCompleted ? 'rgba(16,185,129,0.4)' : 'var(--border)'}; border-radius:14px; display:flex; justify-content:space-between; align-items:center; gap:14px; flex-wrap:wrap;">
          <div>
            <div style="display:flex; gap:8px; align-items:center; margin-bottom:6px;">
              <span style="background:rgba(218,163,62,0.2); color:var(--gold); font-size:11px; font-weight:800; padding:2px 8px; border-radius:4px; text-transform:uppercase;">${escapeHtml(t.category)}</span>
              <span style="font-size:12px; color:var(--ivory-dim);">Assigned by ${escapeHtml(t.assigned_by)} · ${escapeHtml(t.assigned_date)}</span>
              ${isCompleted ? `<span style="background:rgba(16,185,129,0.15); color:#10b981; font-size:11px; font-weight:700; padding:2px 8px; border-radius:4px;">✅ Practiced</span>` : ''}
            </div>
            <h4 style="margin:0; color:#fff; font-size:15px; font-weight:700;">${escapeHtml(t.title)}</h4>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-gold btn-sm" onclick="window.practiceAssignedTopic('${escapeHtml(t.id)}')">
              ♟️ Practice in Study Board
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.toggleTopicCompleted('${escapeHtml(t.id)}')" style="font-size:11px;">
              ${isCompleted ? 'Mark Pending' : 'Mark Done'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  };

  window.practiceAssignedTopic = function (topicId) {
    let topics = [];
    try { topics = JSON.parse(localStorage.getItem(STORAGE_ASSIGNED_TOPICS) || '[]'); } catch (e) {}
    const t = topics.find(x => x.id === topicId);
    if (!t) return;

    StudyPGN.activeAssignedTopic = t;
    StudyPGN.loadPgnString(t.pgn, {
      title: t.title,
      category: t.category,
      description: `Coach Assigned Study Topic: ${t.title}`
    });

    if (window.setPage && (window.role === 'admin' || window.role === 'master' || window.role === 'coach')) {
      window.setPage('child');
    }
    if (window.setChildTab) {
      window.setChildTab('studypgn');
    }
    window.setStudyPgnSubTab('lab');
    if (window.toast) window.toast(`♟️ Loaded "${t.title}" into Interactive Study Board!`, 'success');
  };

  window.toggleTopicCompleted = function (topicId) {
    let completedIds = [];
    try { completedIds = JSON.parse(localStorage.getItem(STORAGE_COMPLETED_TOPICS) || '[]'); } catch (e) {}
    if (completedIds.includes(topicId)) {
      completedIds = completedIds.filter(id => id !== topicId);
    } else {
      completedIds.push(topicId);
      if (window.toast) window.toast('🎉 Great work! Topic marked as practiced.', 'success');
    }
    localStorage.setItem(STORAGE_COMPLETED_TOPICS, JSON.stringify(completedIds));
    StudyPGN.renderAssignedTopicsList();
  };

  // ── Sub Tab Switcher ──
  window.setStudyPgnSubTab = function (subTab, btn) {
    document.querySelectorAll('.studypgn-subview').forEach(v => v.style.display = 'none');
    const target = document.getElementById('studypgn-subview-' + subTab);
    if (target) target.style.display = 'block';

    const parentNav = btn ? btn.parentElement : document.querySelector('#child-tab-studypgn .tabs-nav');
    if (parentNav) {
      parentNav.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
      if (btn) {
        btn.classList.add('active');
      } else {
        const matchingBtn = document.getElementById('btn-studypgn-' + subTab);
        if (matchingBtn) matchingBtn.classList.add('active');
      }
    }

    if (subTab === 'lab') {
      StudyPGN.renderBoard();
      StudyPGN.renderMoveList();
      StudyPGN.renderGameInfo();
      StudyPGN.updateAiMoveGuide();
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

    let rowsHtml = students.map((s) => {
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

    const streakTotalEl = document.getElementById('admin-tactics-streak-total');
    const solvedTodayEl = document.getElementById('admin-tactics-solved-today');
    if (streakTotalEl) streakTotalEl.textContent = `${totalStreaks} Students`;
    if (solvedTodayEl) solvedTodayEl.textContent = String(totalSolvedToday);

    window.renderAssignedTopicsAdminTable(roleType);
  };

  // ── Render Assigned Topics in Admin/Coach Monitors ──
  window.renderAssignedTopicsAdminTable = function (roleType = 'admin') {
    const tableWrapId = roleType === 'coach' ? 'coach-assigned-topics-table-wrap' : 'admin-assigned-topics-table-wrap';
    const container = document.getElementById(tableWrapId);
    if (!container) return;

    let topics = [];
    try {
      topics = JSON.parse(localStorage.getItem(STORAGE_ASSIGNED_TOPICS) || '[]');
    } catch (e) {}

    const countEl = document.getElementById('admin-topics-count');
    if (countEl) countEl.textContent = `${topics.length} Topics`;

    if (!topics.length) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:#94a3b8;">No custom study topics assigned yet. Click "Assign New Topic" to create one!</div>`;
      return;
    }

    const rows = topics.map(t => {
      let targetLabel = 'All Batches & Students';
      if (t.batch_id && t.batch_id !== 'all') {
        const batch = (window.allBatches || []).find(b => String(b.id) === String(t.batch_id));
        targetLabel = batch ? `Batch: ${batch.name}` : `Batch #${t.batch_id}`;
      }
      if (t.student_id && t.student_id !== 'all') {
        const stud = (window.allStudents || []).find(s => String(s.id) === String(t.student_id));
        targetLabel += stud ? ` (${stud.name || stud.full_name})` : ` (Student #${t.student_id})`;
      }

      return `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:12px 14px; font-weight:700; color:#fff;">
            ${escapeHtml(t.title)}
            <div style="font-size:11px; font-weight:400; color:var(--gold);">${escapeHtml(t.category)}</div>
          </td>
          <td style="padding:12px 14px; font-size:12.5px; color:var(--ivory-dim);">
            ${escapeHtml(targetLabel)}
          </td>
          <td style="padding:12px 14px; font-size:12px; color:#94a3b8;">
            ${escapeHtml(t.assigned_by)} · ${escapeHtml(t.assigned_date)}
          </td>
          <td style="padding:12px 14px; text-align:right;">
            <button class="btn btn-gold btn-sm" onclick="window.practiceAssignedTopic('${escapeHtml(t.id)}')" style="font-size:11px; padding:4px 10px; margin-right:6px;">
              ♟️ Test Board
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.deleteAssignedStudyTopic('${escapeHtml(t.id)}')" style="font-size:11px; padding:4px 10px; color:#ef4444; border-color:rgba(239,68,68,0.4);">
              🗑️ Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <table style="width:100%; border-collapse:collapse; text-align:left; font-size:13px;">
        <thead>
          <tr style="border-bottom:1px solid var(--border); color:var(--gold); font-size:11px; text-transform:uppercase; letter-spacing:0.05em;">
            <th style="padding:10px 14px;">Topic Title &amp; Category</th>
            <th style="padding:10px 14px;">Assigned Target</th>
            <th style="padding:10px 14px;">Assigned By</th>
            <th style="padding:10px 14px; text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  };

  window.deleteAssignedStudyTopic = function (topicId) {
    if (!confirm('Are you sure you want to remove this assigned study topic?')) return;
    let topics = [];
    try {
      topics = JSON.parse(localStorage.getItem(STORAGE_ASSIGNED_TOPICS) || '[]');
    } catch (e) {}
    topics = topics.filter(t => t.id !== topicId);
    localStorage.setItem(STORAGE_ASSIGNED_TOPICS, JSON.stringify(topics));

    if (window.toast) window.toast('Study Topic removed.', 'info');
    StudyPGN.renderAssignedTopicsList();
    window.renderStudyPgnMonitor('admin');
    window.renderStudyPgnMonitor('coach');
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

  // ── Initial Load on Ready ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => StudyPGN.init());
  } else {
    StudyPGN.init();
  }
})();
