/**
 * ChessKidoo LMS — Study PGN, Daily Tactics Streaks & Board Visualization Engine (v2.1)
 * ──────────────────────────────────────────────────────────────────────────────────────────
 * 1. High-Fidelity Interactive PGN Board (Vector SVG piece set, Chess.com styling, Stockfish Cloud API).
 * 2. TOM AI Move-by-Move Guidance (pedagogical explanations for every move in the PGN).
 * 3. Daily Tactics Workout & Gamified Streaks (Live Lichess Daily Puzzle API + Calibrated Levels).
 * 4. Speed Calculation & Board Visualization Trainer (Square Color, Coordinate Radar).
 * 5. Coach & Admin Topic Assignment & Student Practice Monitoring Dashboard.
 */
(function () {
  'use strict';

  // ── Storage Keys ──
  const STORAGE_TACTICS_RECORDS = 'ck_student_tactics_records';
  const STORAGE_ASSIGNED_TOPICS = 'ck_assigned_study_topics';
  const STORAGE_VISION_SCORES = 'ck_student_vision_scores';
  const STORAGE_COMPLETED_TOPICS = 'ck_completed_study_topics';
  const STORAGE_COINS = 'ck_student_coins';

  // ── Authentic Pure Vector Chess Piece SVGs Matching User Theme ──
  const PIECE_SVG = {
    // White Pieces (Pure White with Crisp Dark Contours and Iconic Horizontal Accent Ribs)
    K: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#ffffff" stroke="#141414" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.6V6M20 8h5"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 37c5.5 3.5 16.5 3.5 22 0v-4c-5.5-3.5-16.5-3.5-22 0z"/><path d="M11.5 27c5.5-3 16.5-3 22 0m-21-3.5c0-1.5 1.5-2.5 3-2.5s4.5 1.5 7 1.5 5.5-1.5 7-1.5 3 1 3 2.5"/><path d="M13 30.5h19M13 34h19" stroke="#141414" stroke-width="1.4" fill="none"/></g></svg>`,
    Q: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#ffffff" stroke="#141414" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15L9 11v13.5L2 14l7 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><circle cx="2" cy="14" r="1.8"/><circle cx="9" cy="11" r="1.8"/><circle cx="16.5" cy="11" r="1.8"/><circle cx="22.5" cy="9.5" r="1.8"/><circle cx="28.5" cy="11" r="1.8"/><circle cx="36" cy="11" r="1.8"/><circle cx="43" cy="14" r="1.8"/><path d="M12 30.5h21M12 34h21" stroke="#141414" stroke-width="1.4" fill="none"/></g></svg>`,
    R: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#ffffff" stroke="#141414" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/><path d="M34 14l-3 3H14l-3-3M31 17v12.5H14V17"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23"/><path d="M12 30h21M12 33.5h21" stroke="#141414" stroke-width="1.4" fill="none"/></g></svg>`,
    B: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#ffffff" stroke="#141414" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 8.5V4M20.5 6.2h4"/><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" fill="none"/><path d="M14 30.5h17" stroke="#141414" stroke-width="1.4" fill="none"/></g></svg>`,
    N: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#ffffff" stroke="#141414" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" /><path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" /><path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill="#141414" stroke="#141414" stroke-width="1"/><path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="#141414" stroke="#141414" stroke-width="1"/><path d="M 24.55 10.4 L 24.1 11.85" fill="none"/></g></svg>`,
    P: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#ffffff" stroke="#141414" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 19.78 16 24c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-4.22-1.33-7.5-3.28-8.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/><path d="M16 33.5h13" stroke="#141414" stroke-width="1.4" fill="none"/></g></svg>`,

    // Black Pieces (Slate Charcoal Body with White Accents & Crisp Silhouettes)
    k: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#2d2e33" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.6V6M20 8h5" stroke="#ffffff" stroke-width="2"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path d="M11.5 37c5.5 3.5 16.5 3.5 22 0v-4c-5.5-3.5-16.5-3.5-22 0z"/><path d="M11.5 27c5.5-3 16.5-3 22 0m-21-3.5c0-1.5 1.5-2.5 3-2.5s4.5 1.5 7 1.5 5.5-1.5 7-1.5 3 1 3 2.5"/><path d="M13 30.5h19M13 34h19" stroke="#ffffff" stroke-width="1.4" fill="none"/></g></svg>`,
    q: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#2d2e33" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15L9 11v13.5L2 14l7 12z"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><circle cx="2" cy="14" r="1.8" fill="#ffffff" stroke="#ffffff"/><circle cx="9" cy="11" r="1.8" fill="#ffffff" stroke="#ffffff"/><circle cx="16.5" cy="11" r="1.8" fill="#ffffff" stroke="#ffffff"/><circle cx="22.5" cy="9.5" r="1.8" fill="#ffffff" stroke="#ffffff"/><circle cx="28.5" cy="11" r="1.8" fill="#ffffff" stroke="#ffffff"/><circle cx="36" cy="11" r="1.8" fill="#ffffff" stroke="#ffffff"/><circle cx="43" cy="14" r="1.8" fill="#ffffff" stroke="#ffffff"/><path d="M12 30.5h21M12 34h21" stroke="#ffffff" stroke-width="1.4" fill="none"/></g></svg>`,
    r: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#2d2e33" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/><path d="M34 14l-3 3H14l-3-3M31 17v12.5H14V17"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23"/><path d="M12 30h21M12 33.5h21" stroke="#ffffff" stroke-width="1.4" fill="none"/></g></svg>`,
    b: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#2d2e33" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 8.5V4M20.5 6.2h4" stroke="#ffffff" stroke-width="2"/><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#ffffff" stroke-width="1.2"/><path d="M14 30.5h17" stroke="#ffffff" stroke-width="1.4" fill="none"/></g></svg>`,
    n: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#2d2e33" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" /><path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10" /><path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill="#ffffff" stroke="#ffffff" stroke-width="1"/><path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="#ffffff" stroke="#ffffff" stroke-width="1"/><path d="M 20 13 L 23 16" stroke="#ffffff" stroke-width="1.2"/></g></svg>`,
    p: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#2d2e33" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 19.78 16 24c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-4.22-1.33-7.5-3.28-8.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/><path d="M16 33.5h13" stroke="#ffffff" stroke-width="1.4" fill="none"/></g></svg>`
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

  // ── Global State Object ──
  window.StudyPGN = {
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
      console.warn('[StudyPGN] Initializing chess.js engine fallback');
      return false;
    }
    if (!StudyPGN.chess) {
      StudyPGN.chess = new window.Chess();
    }
    return true;
  };

  // ── Coin / Reward System ──
  StudyPGN.getCoins = function () {
    const studentId = window.currentStudent ? String(window.currentStudent.id) : 'default';
    try {
      const coinsRec = JSON.parse(localStorage.getItem(STORAGE_COINS) || '{}');
      return coinsRec[studentId] || 0;
    } catch (e) {
      return 0;
    }
  };

  StudyPGN.awardCoins = function (amount, reason = 'Study Practice') {
    const studentId = window.currentStudent ? String(window.currentStudent.id) : 'default';
    let coinsRec = {};
    try {
      coinsRec = JSON.parse(localStorage.getItem(STORAGE_COINS) || '{}');
    } catch (e) {}
    const cur = coinsRec[studentId] || 0;
    const updated = cur + amount;
    coinsRec[studentId] = updated;
    localStorage.setItem(STORAGE_COINS, JSON.stringify(coinsRec));

    if (window.toast) {
      window.toast(`🪙 +${amount} Chess Coins for ${reason}! Total: 🪙 ${updated}`, 'success');
    }
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

      StudyPGN.awardCoins(15, 'Daily Tactics Mastery');
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

  // ── Render High-Fidelity Vector SVG Board ──
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
      <div class="pgn-chess-grid chesscom-board-wrap" style="display:grid; grid-template-columns:repeat(8, 1fr); aspect-ratio:1/1; width:100%; max-width:480px; margin:0 auto; border-radius:6px; overflow:hidden; border:3px solid #4a3627; box-shadow:0 12px 36px rgba(0,0,0,0.55); position:relative;">
    `;

    const rows = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
    const cols = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];

    rows.forEach(r => {
      cols.forEach(c => {
        const isLight = (r + c) % 2 === 0;
        const squareName = String.fromCharCode(97 + c) + (8 - r);
        const piece = board[r][c];

        // Chess.com Neo High-Contrast Colors
        const isHighlight = lastMove && (lastMove.from === squareName || lastMove.to === squareName);
        const isSelected = StudyPGN.selectedSquare === squareName;
        const isLegalDest = StudyPGN.legalMovesForSelected.some(m => m.to === squareName);

        let bgColor = isLight ? '#eeeed2' : '#769656';
        if (isHighlight) bgColor = isLight ? '#f7f769' : '#baca44';
        if (isSelected) bgColor = '#f5f682';

        const pieceKey = piece ? (piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()) : '';
        const pieceSvg = pieceKey && PIECE_SVG[pieceKey] ? PIECE_SVG[pieceKey] : '';

        html += `
          <div class="pgn-square" data-square="${squareName}" onclick="StudyPGN.onBoardSquareClicked('${squareName}')"
               style="background:${bgColor}; display:flex; align-items:center; justify-content:center; cursor:pointer; user-select:none; position:relative;">
            ${pieceSvg ? `
              <div class="piece-svg-box" style="width:88%; height:88%; display:flex; align-items:center; justify-content:center; filter:drop-shadow(0 3px 4px rgba(0,0,0,0.32)); pointer-events:none;">
                ${pieceSvg}
              </div>
            ` : ''}

            ${isLegalDest ? `
              <div style="position:absolute; width:${piece ? '88%' : '26%'}; height:${piece ? '88%' : '26%'}; border-radius:${piece ? '50%' : '50%'}; ${piece ? 'border:4px solid rgba(0,0,0,0.25);' : 'background:rgba(0,0,0,0.18);'} pointer-events:none;"></div>
            ` : ''}

            ${c === (isFlipped ? 7 : 0) ? `<span style="position:absolute; top:2px; left:4px; font-size:11px; font-weight:800; opacity:0.85; color:${isLight ? '#769656' : '#eeeed2'}; font-family:Inter,sans-serif; pointer-events:none;">${8 - r}</span>` : ''}
            ${r === (isFlipped ? 0 : 7) ? `<span style="position:absolute; bottom:2px; right:4px; font-size:11px; font-weight:800; opacity:0.85; color:${isLight ? '#769656' : '#eeeed2'}; font-family:Inter,sans-serif; pointer-events:none;">${String.fromCharCode(97 + c)}</span>` : ''}
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
      <div class="pgn-chess-grid chesscom-board-wrap" style="display:grid; grid-template-columns:repeat(8, 1fr); aspect-ratio:1/1; width:100%; max-width:440px; margin:0 auto; border-radius:6px; overflow:hidden; border:3px solid #4a3627; box-shadow:0 12px 36px rgba(0,0,0,0.55); position:relative;">
    `;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isLight = (r + c) % 2 === 0;
        const squareName = String.fromCharCode(97 + c) + (8 - r);
        const piece = board[r][c];

        const bgColor = isLight ? '#eeeed2' : '#769656';
        const pieceKey = piece ? (piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase()) : '';
        const pieceSvg = pieceKey && PIECE_SVG[pieceKey] ? PIECE_SVG[pieceKey] : '';

        html += `
          <div class="tactics-square" data-square="${squareName}" onclick="StudyPGN.onTacticsSquareClicked('${squareName}')"
               style="background:${bgColor}; display:flex; align-items:center; justify-content:center; cursor:pointer; user-select:none; position:relative;">
            ${pieceSvg ? `
              <div class="piece-svg-box" style="width:88%; height:88%; display:flex; align-items:center; justify-content:center; filter:drop-shadow(0 3px 4px rgba(0,0,0,0.32)); pointer-events:none;">
                ${pieceSvg}
              </div>
            ` : ''}
            ${c === 0 ? `<span style="position:absolute; top:2px; left:4px; font-size:11px; font-weight:800; opacity:0.85; color:${isLight ? '#769656' : '#eeeed2'}; font-family:Inter,sans-serif; pointer-events:none;">${8 - r}</span>` : ''}
            ${r === 7 ? `<span style="position:absolute; bottom:2px; right:4px; font-size:11px; font-weight:800; opacity:0.85; color:${isLight ? '#769656' : '#eeeed2'}; font-family:Inter,sans-serif; pointer-events:none;">${String.fromCharCode(97 + c)}</span>` : ''}
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

  StudyPGN.endVisionGame = function () {
    if (window.toast) window.toast(`🏁 Time's up! Calculation Score: ${StudyPGN.visionScore} points!`, 'success');
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

  // ── Online Server API PGN Importer (Lichess Game/Study & Cloud PGN) ──
  window.fetchOnlinePgnFromUrl = async function (urlInputId, targetPgnInputId, targetTitleInputId) {
    const urlInput = document.getElementById(urlInputId);
    if (!urlInput || !urlInput.value.trim()) {
      if (window.toast) window.toast('Please enter a Lichess Study, Game, or Cloud PGN URL!', 'warning');
      return;
    }

    const rawUrl = urlInput.value.trim();
    if (window.toast) window.toast('⏳ Fetching PGN from Online Server API...', 'info');

    try {
      let pgnContent = '';
      let detectedTitle = '';

      // 1. Lichess Study or Game Export API
      if (rawUrl.includes('lichess.org')) {
        if (rawUrl.includes('/study/')) {
          const parts = rawUrl.split('/study/')[1].split('/');
          const studyId = parts[0];
          const chapterId = parts[1] || '';
          const fetchUrl = chapterId
            ? `https://lichess.org/study/${studyId}/${chapterId}.pgn`
            : `https://lichess.org/study/${studyId}.pgn`;
          const res = await fetch(fetchUrl);
          if (res.ok) {
            pgnContent = await res.text();
            detectedTitle = `Lichess Study: ${studyId}`;
          }
        } else {
          const match = rawUrl.match(/lichess\.org\/([a-zA-Z0-9]{8,12})/);
          if (match && match[1]) {
            const gameId = match[1].slice(0, 8);
            const res = await fetch(`https://lichess.org/game/export/${gameId}?pgnInJson=false&clocks=false&evals=false`);
            if (res.ok) {
              pgnContent = await res.text();
              detectedTitle = `Lichess Game #${gameId}`;
            }
          }
        }
      }

      // 2. Direct HTTPS / Cloud PGN File URL
      if (!pgnContent && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
        try {
          const res = await fetch(rawUrl);
          if (res && res.ok) {
            pgnContent = await res.text();
          }
        } catch (e) {}
      }

      if (pgnContent && pgnContent.trim()) {
        const targetPgn = document.getElementById(targetPgnInputId);
        if (targetPgn) targetPgn.value = pgnContent.trim();

        if (targetTitleInputId) {
          const targetTitle = document.getElementById(targetTitleInputId);
          if (targetTitle) {
            const whiteMatch = pgnContent.match(/\[White\s+"([^"]+)"\]/);
            const blackMatch = pgnContent.match(/\[Black\s+"([^"]+)"\]/);
            const eventMatch = pgnContent.match(/\[Event\s+"([^"]+)"\]/);
            if (whiteMatch && blackMatch && whiteMatch[1] !== '?' && blackMatch[1] !== '?') {
              targetTitle.value = `${whiteMatch[1]} vs ${blackMatch[1]}`;
            } else if (eventMatch && eventMatch[1] !== '?') {
              targetTitle.value = eventMatch[1];
            } else if (detectedTitle) {
              targetTitle.value = detectedTitle;
            }
          }
        }
        if (window.toast) window.toast('✅ PGN successfully fetched and imported into study form!', 'success');
      } else {
        if (window.toast) window.toast('Could not auto-download PGN. You can paste the PGN moves directly.', 'warning');
      }
    } catch (err) {
      console.warn('[StudyPGN] Online fetch error:', err);
      if (window.toast) window.toast('Online PGN server error. Please paste PGN text directly.', 'warning');
    }
  };

  // ── Local & Cloud PGN File Upload ──
  window.handlePgnFileUpload = function (fileInput, targetPgnInputId, targetTitleInputId) {
    if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      const targetPgn = document.getElementById(targetPgnInputId);
      if (targetPgn) targetPgn.value = content;
      if (targetTitleInputId) {
        const targetTitle = document.getElementById(targetTitleInputId);
        if (targetTitle && (!targetTitle.value || targetTitle.value.trim() === '')) {
          targetTitle.value = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        }
      }
      if (window.toast) window.toast(`📂 Loaded PGN file: ${file.name}`, 'success');
    };
    reader.readAsText(file);
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

  window.saveAssignedStudyTopic = async function () {
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
      if (window.toast) window.toast('Please provide PGN moves sequence or fetch from URL!', 'warning');
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

    // Also persist assignment to Supabase if client is ready
    if (window.supabaseClient) {
      try {
        await window.supabaseClient.from('homework_assignments').insert([{
          title: `[PGN Study] ${newTopic.title}`,
          description: `Category: ${newTopic.category}\nPGN Moves: ${newTopic.pgn.slice(0, 500)}...`,
          batch_id: batchId === 'all' ? null : batchId,
          student_id: studentId === 'all' ? null : studentId,
          coach_id: window.currentCoachId || null,
          due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          status: 'assigned'
        }]);
      } catch (err) {
        console.warn('[StudyPGN] Supabase sync fallback:', err);
      }
    }

    if (window.toast) window.toast('✨ Study Topic successfully assigned to students and synced to cloud!', 'success');
    const modal = document.getElementById('assign-study-topic-modal');
    if (modal) modal.classList.remove('active');

    StudyPGN.renderAssignedTopicsList();
    if (window.renderStudyPgnMonitor) {
      window.renderStudyPgnMonitor(window.role === 'coach' ? 'coach' : 'admin');
    }
  };

  window.deleteAssignedStudyTopic = function (topicId) {
    if (!confirm('Are you sure you want to remove this assigned topic?')) return;
    let topics = [];
    try { topics = JSON.parse(localStorage.getItem(STORAGE_ASSIGNED_TOPICS) || '[]'); } catch (e) {}
    topics = topics.filter(t => t.id !== topicId);
    localStorage.setItem(STORAGE_ASSIGNED_TOPICS, JSON.stringify(topics));
    if (window.toast) window.toast('Topic removed successfully.', 'info');

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

    // Default template topics if none
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
      StudyPGN.awardCoins(10, 'Study Topic Practice');
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
    const studentsContainerId = roleType === 'coach' ? 'coach-studypgn-students-table-wrap' : 'admin-studypgn-students-table-wrap';
    const studentsContainer = document.getElementById(studentsContainerId);

    const students = Array.isArray(window.allStudents) ? window.allStudents : [];
    let tacticsRec = {};
    try {
      tacticsRec = JSON.parse(localStorage.getItem(STORAGE_TACTICS_RECORDS) || '{}');
    } catch (e) {}

    let topics = [];
    try {
      topics = JSON.parse(localStorage.getItem(STORAGE_ASSIGNED_TOPICS) || '[]');
    } catch (e) {}

    const todayStr = new Date().toISOString().split('T')[0];
    let totalStreaks = 0;
    let totalSolvedToday = 0;

    if (studentsContainer) {
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

      studentsContainer.innerHTML = `
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
    }

    const streakTotalEl = document.getElementById('admin-tactics-streak-total');
    const solvedTodayEl = document.getElementById('admin-tactics-solved-today');
    const topicsCountEl = document.getElementById('admin-topics-count');
    if (streakTotalEl) streakTotalEl.textContent = `${totalStreaks} Students`;
    if (solvedTodayEl) solvedTodayEl.textContent = String(totalSolvedToday);
    if (topicsCountEl) topicsCountEl.textContent = `${topics.length} Topics`;
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
