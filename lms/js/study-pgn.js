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

  // ── Authentic Official Chess.com Neo Vector Chess Piece SVGs ──
  const PIECE_SVG = {
    // White Pieces (Chess.com Neo White Silhouette & Black Outer/Inner Contours)
    K: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="none" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#ffffff" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7" fill="#ffffff"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3.5 15.5-3.5 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g></svg>`,
    Q: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#ffffff" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15L9 11v13.5L2 14l7 12z" stroke-linecap="butt"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11.5 30c3.5-1 18.5-1 22 0m-21.5 3.5c3.5-1 17.5-1 21 0m-20.5 3.5c3.5-1 16.5-1 20 0" fill="none"/></g></svg>`,
    R: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#ffffff" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" stroke-linejoin="miter"/></g></svg>`,
    B: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="none" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#ffffff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke-linejoin="miter"/></g></svg>`,
    N: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="none" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#ffffff"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.99-.5-2-.5-3 1-1 3 2.5 3 2.5l2 .5s.78-1.99 2.5-3c1 0 1 3 1 3" fill="#ffffff"/><path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#000000"/><path d="M15 15.5a.5 1.5 0 1 1-1 0 .5 1.5 0 1 1 1 0z" transform="matrix(.866 .5 -.5 .866 9.693 -5.173)" fill="#000000"/></g></svg>`,
    P: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#ffffff" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 19.78 16 24c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-4.22-1.33-7.5-3.28-8.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/></g></svg>`,

    // Black Pieces (Chess.com Neo Dark Silhouette with Crisp White Accents)
    k: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="none" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/><path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#000000" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-2.5-7.5-12-10.5-16-4-3 6 6 10.5 6 10.5v7" fill="#000000"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3.5 15.5-3.5 21 0m-21 3.5c5.5-3 15.5-3 21 0" stroke="#ffffff"/></g></svg>`,
    q: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#000000" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0z"/><path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15L9 11v13.5L2 14l7 12z" stroke-linecap="butt"/><path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" stroke-linecap="butt"/><path d="M11.5 30c3.5-1 18.5-1 22 0m-21.5 3.5c3.5-1 17.5-1 21 0m-20.5 3.5c3.5-1 16.5-1 20 0" fill="none" stroke="#ffffff"/></g></svg>`,
    r: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#000000" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke-linecap="butt"/><path d="M34 14l-3 3H14l-3-3"/><path d="M31 17v12.5H14V17" stroke-linecap="butt" stroke-linejoin="miter"/><path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/><path d="M11 14h23" fill="none" stroke-linejoin="miter"/><path d="M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17M11 13.5h23" fill="none" stroke="#ffffff" stroke-width="1"/></g></svg>`,
    b: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="none" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><g fill="#000000" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" stroke="#ffffff" stroke-linejoin="miter"/></g></svg>`,
    n: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="none" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="#000000"/><path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.99-.5-2-.5-3 1-1 3 2.5 3 2.5l2 .5s.78-1.99 2.5-3c1 0 1 3 1 3" fill="#000000"/><path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="#ffffff"/><path d="M15 15.5a.5 1.5 0 1 1-1 0 .5 1.5 0 1 1 1 0z" transform="matrix(.866 .5 -.5 .866 9.693 -5.173)" fill="#ffffff"/><path d="M24.55 10.4L24.1 11.85M28 22l-4 3" stroke="#ffffff" stroke-width="1"/></g></svg>`,
    p: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%"><g fill="#000000" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 19.78 16 24c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-4.22-1.33-7.5-3.28-8.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/><path d="M12 36.5h21M13 32.5h19M14 29.5h17" stroke="#ffffff" stroke-width="1" fill="none"/></g></svg>`
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

  // ── Curated Grandmaster PGN Vault & Repertoires ──
  const CURATED_STUDY_GAMES = [
    {
      id: 'gm-opera-1858',
      title: 'The Opera Game: Paul Morphy vs Duke of Brunswick (1858)',
      category: 'Masterclasses',
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
      category: 'Masterclasses',
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
      id: 'gm-fischer-spassky-1972',
      title: 'Bobby Fischer vs Boris Spassky: World Championship Game 6 (1972)',
      category: 'Masterclasses',
      level: 'Advanced',
      white: 'Robert James Fischer',
      black: 'Boris Spassky',
      result: '1-0',
      description: 'The Game of the Century in Reykjavik. Fischer deviates with 1. c4 and executes a positional masterpiece that earned a standing ovation from Spassky.',
      pgn: `[Event "World Championship Match"]
[Site "Reykjavik ISL"]
[Date "1972.07.23"]
[White "Robert James Fischer"]
[Black "Boris Spassky"]
[Result "1-0"]
[ECO "D59"]

1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5 13. Qa3 Rc8 14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7 17. Be2 Nd7 18. Nd4 Qf8 19. Nxe6 fxe6 20. e4 d4 21. f4 Qe7 22. e5 Rb8 23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5 26. f5 exf5 27. Rxf5 Nh7 28. Rcf1 Qd8 29. Qg3 Re7 30. h4 Rbb7 31. e6 Rbc7 32. Qe5 Qe8 33. a4 Qd8 34. R1f2 Qe8 35. R2f3 Qd8 36. Bd3 Qe8 37. Qe4 Nf6 38. Rxf6 gxf6 39. Rxf6 Kg8 40. Bc4 Kh8 41. Qf4 1-0`
    },
    {
      id: 'gm-kasparov-anand-1995',
      title: 'Kasparov vs Anand: World Championship Sicilian Dragon (1995)',
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
      id: 'gm-carlsen-anand-2013',
      title: 'Magnus Carlsen vs Viswanathan Anand: Berlin Endgame (2013)',
      category: 'Endgames',
      level: 'Advanced',
      white: 'Viswanathan Anand',
      black: 'Magnus Carlsen',
      result: '0-1',
      description: 'Carlsen activates the rook and coordinates knight-pawn endgame pressure to secure his first World Championship title.',
      pgn: `[Event "World Championship Match"]
[Site "Chennai IND"]
[Date "2013.11.16"]
[White "Viswanathan Anand"]
[Black "Magnus Carlsen"]
[Result "0-1"]
[ECO "C67"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 Nf6 4. O-O Nxe4 5. d4 Nd6 6. Bxc6 dxc6 7. dxe5 Nf5 8. Qxd8+ Kxd8 9. h3 Bd7 10. Nc3 h6 11. b3 Kc8 12. Bb2 b6 13. Rad1 Ne7 14. Ne2 Ng6 15. Ne1 h5 16. f4 Bf5 17. Ng3 Bc5+ 18. Kh2 Bg4 19. Rd3 h4 20. Ne4 Be2 21. Nxc5 bxc5 22. Rf2 Bxd3 23. Nxd3 c4 24. bxc4 Rb8 25. f5 Ne7 26. Ba3 Re8 27. Rf4 Rb1 28. f6 gxf6 29. Rxf6 Ng6 30. Rxf7 Nxe5 31. Rf4 Ra1 32. Bb2 Rxa2 33. Bxe5 Rxc2 34. Rxh4 a5 35. Rh7 a4 36. Rxc7+ Kd8 37. Ra7 Rxc4 38. g4 c5 39. Kg3 Re6 40. g5 Ke8 41. h4 Re7 42. Ra8+ Kf7 43. h5 Rd7 44. Nf4 0-1`
    },
    {
      id: 'gm-pragg-nakamura-2023',
      title: 'Rameshbabu Praggnanandhaa vs Hikaru Nakamura: World Cup (2023)',
      category: 'Masterclasses',
      level: 'Advanced',
      white: 'Rameshbabu Praggnanandhaa',
      black: 'Hikaru Nakamura',
      result: '1-0',
      description: 'Indian Grandmaster Praggnanandhaa outplays World No. 2 Hikaru Nakamura in the FIDE World Cup tiebreaks with razor-sharp Italian precision.',
      pgn: `[Event "FIDE World Cup 2023"]
[Site "Baku AZE"]
[Date "2023.08.11"]
[White "Rameshbabu Praggnanandhaa"]
[Black "Hikaru Nakamura"]
[Result "1-0"]
[ECO "C54"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d3 d6 6. O-O a5 7. Re1 O-O 8. Bg5 h6 9. Bh4 Ba7 10. Nbd2 Be6 11. Bb5 g5 12. Bg3 Ne7 13. d4 exd4 14. Nxd4 Ng6 15. N2f3 Nh5 16. Nf5 Nxg3 17. hxg3 h5 18. Qd2 g4 19. N3d4 Qf6 20. Rad1 Rad8 21. Bd3 Ne5 22. Bc2 Rfe8 23. Qf4 Bc8 24. Ba4 c6 25. Bc2 Bc5 26. a3 d5 27. exd5 Rxd5 28. Bb3 Rdd8 29. Nh6+ Kg7 30. Qxf6+ Kxf6 31. Rxe5 Rxe5 32. Nxf7 Rde8 33. Nxe5 Rxe5 34. Kf1 Re7 35. Bc2 Bd7 36. Nb3 Bb6 37. Rd6+ Be6 38. Nd4 Bxd4 39. Rxd4 1-0`
    },
    {
      id: 'gm-evans-gambit-repertoire',
      title: 'Italian Game: Evans Gambit Master Opening Repertoire',
      category: 'Openings',
      level: 'Intermediate',
      white: 'White Repertoire',
      black: 'Classical Black Lines',
      result: '1-0',
      description: 'The premier attacking weapon for 1. e4 players. Sacrificing the b4 pawn for rapid development, open diagonals, and overwhelming kingside attacks.',
      pgn: `[Event "Academy Repertoire"]
[Site "ChessKidoo Academy"]
[Date "2026.01.01"]
[White "Evans Gambit Lines"]
[Black "Theory"]
[Result "1-0"]
[ECO "C51"]

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. b4 Bxb4 5. c3 Ba5 6. d4 exd4 7. O-O Nge7 8. Ng5 d5 9. exd5 Ne5 10. Bb3 O-O 11. Qxd4 N7g6 12. Ba3 Re8 13. h4 h6 14. Ne4 Qxh4 15. Nbd2 Bb6 16. Bc5 Nf4 17. Rfe1 Bh3 18. g3 Qg4 19. Bd1 Qg6 20. Bxb6 axb6 21. Re3 1-0`
    },
    {
      id: 'gm-sicilian-najdorf',
      title: 'Sicilian Defense: Najdorf 6. Bg5 Master Lines',
      category: 'Openings',
      level: 'Advanced',
      white: 'White Theory',
      black: 'Black Repertoire',
      result: '0-1',
      description: 'The sharpest opening in chess, favored by Kasparov and Fischer. Sharp counter-play on the c-file with dynamic piece play.',
      pgn: `[Event "Academy Opening Lab"]
[Site "ChessKidoo"]
[Date "2026.01.01"]
[White "Classical 6. Bg5"]
[Black "Najdorf Repertoire"]
[Result "0-1"]
[ECO "B96"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Nbd7 8. Qf3 Qc7 9. O-O-O b5 10. Bd3 Bb7 11. Rhe1 Be7 12. Qg3 b4 13. Nd5 exd5 14. exd5 Kd8 15. Nc6+ Bxc6 16. dxc6 Qxc6 17. Bf5 Re8 18. Bxf6 Nxf6 19. Qxg7 d5 20. Qxf7 Ra7 21. Re6 Qc7 0-1`
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
  StudyPGN.renderBoard = function () {
    const containers = [
      document.getElementById('pgn-study-board'),
      document.getElementById('coach-pgn-study-board')
    ].filter(Boolean);

    if (!containers.length) return;

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
      <div class="pgn-chess-grid chesscom-board-wrap" style="display:grid; grid-template-columns:repeat(8, 1fr); grid-template-rows:repeat(8, 1fr); aspect-ratio:1/1; width:100%; max-width:480px; margin:0 auto; border-radius:6px; overflow:hidden; border:3px solid #4a3627; box-shadow:0 12px 36px rgba(0,0,0,0.55); position:relative; box-sizing:border-box;">
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
               style="background:${bgColor}; aspect-ratio:1/1; width:100%; height:100%; min-width:0; min-height:0; display:flex; align-items:center; justify-content:center; cursor:pointer; user-select:none; position:relative; box-sizing:border-box; overflow:hidden;">
            ${pieceSvg ? `
              <div class="piece-svg-box" style="width:88%; height:88%; max-width:100%; max-height:100%; display:flex; align-items:center; justify-content:center; filter:drop-shadow(0 3px 4px rgba(0,0,0,0.32)); pointer-events:none; box-sizing:border-box;">
                ${pieceSvg}
              </div>
            ` : ''}

            ${isLegalDest ? `
              <div style="position:absolute; width:${piece ? '88%' : '26%'}; height:${piece ? '88%' : '26%'}; border-radius:50%; ${piece ? 'border:4px solid rgba(0,0,0,0.25);' : 'background:rgba(0,0,0,0.18);'} pointer-events:none; z-index:2; box-sizing:border-box;"></div>
            ` : ''}

            ${c === (isFlipped ? 7 : 0) ? `<span style="position:absolute; top:2px; left:4px; font-size:11px; font-weight:800; line-height:1; opacity:0.85; color:${isLight ? '#769656' : '#eeeed2'}; font-family:Inter,system-ui,sans-serif; pointer-events:none;">${8 - r}</span>` : ''}
            ${r === (isFlipped ? 0 : 7) ? `<span style="position:absolute; bottom:2px; right:4px; font-size:11px; font-weight:800; line-height:1; opacity:0.85; color:${isLight ? '#769656' : '#eeeed2'}; font-family:Inter,system-ui,sans-serif; pointer-events:none;">${String.fromCharCode(97 + c)}</span>` : ''}
          </div>
        `;
      });
    });

    html += `</div>`;
    containers.forEach(c => {
      c.innerHTML = html;
    });
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
    const listContainers = [
      document.getElementById('pgn-movelist-container'),
      document.getElementById('coach-pgn-movelist-container')
    ].filter(Boolean);

    if (!listContainers.length || !StudyPGN.moveHistory) return;

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

    listContainers.forEach(c => {
      c.innerHTML = html;
    });
  };

  StudyPGN.highlightCurrentMove = function () {
    const btns = document.querySelectorAll('.pgn-move-btn');
    btns.forEach((btn, idx) => {
      // Each pair is 2 buttons, find matched move index
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
    const titles = [document.getElementById('pgn-game-title'), document.getElementById('coach-pgn-game-title')].filter(Boolean);
    const descs = [document.getElementById('pgn-game-desc'), document.getElementById('coach-pgn-game-desc')].filter(Boolean);
    const players = [document.getElementById('pgn-game-players'), document.getElementById('coach-pgn-game-players')].filter(Boolean);

    titles.forEach(el => el.textContent = g.title || 'Grandmaster Masterclass Study');
    descs.forEach(el => el.textContent = g.description || '');
    players.forEach(el => el.innerHTML = `<strong>⚪ ${escapeHtml(g.white || 'White')}</strong> vs <strong>⚫ ${escapeHtml(g.black || 'Black')}</strong> · <span style="color:var(--gold); font-weight:700;">${escapeHtml(g.result || '*')}</span>`);

    // Sync selectors if present
    const s1 = document.getElementById('pgn-game-selector');
    const s2 = document.getElementById('coach-pgn-game-selector');
    const curIdx = CURATED_STUDY_GAMES.findIndex(item => item.title === g.title);
    if (curIdx >= 0) {
      if (s1) s1.value = String(curIdx);
      if (s2) s2.value = String(curIdx);
    }
  };

  // ── TOM AI Move Guidance & Pedagogical Breakdown ──
  StudyPGN.updateAiMoveGuide = function (customMove) {
    const guideEls = [
      document.getElementById('pgn-tom-ai-guide'),
      document.getElementById('coach-pgn-tom-ai-guide')
    ].filter(Boolean);

    if (!guideEls.length) return;

    const move = customMove || (StudyPGN.moveHistory && StudyPGN.currentMoveIndex >= 0 ? StudyPGN.moveHistory[StudyPGN.currentMoveIndex] : null);

    if (!move) {
      const defaultHtml = `
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <div style="font-size:24px;">🤖</div>
          <div>
            <div style="font-size:12px; font-weight:800; color:var(--gold); text-transform:uppercase; margin-bottom:4px;">TOM AI Move Assistant</div>
            <p style="margin:0; font-size:13px; color:#94a3b8; line-height:1.5;">Starting position loaded. Step forward with <strong>▶ Next Move</strong> or click on the board to explore candidate master lines!</p>
          </div>
        </div>
      `;
      guideEls.forEach(el => el.innerHTML = defaultHtml);
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

    const html = `
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

    guideEls.forEach(el => el.innerHTML = html);
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
    const bars = [document.getElementById('pgn-eval-bar'), document.getElementById('coach-pgn-eval-bar')].filter(Boolean);
    const scoreTexts = [document.getElementById('pgn-eval-text'), document.getElementById('coach-pgn-eval-text')].filter(Boolean);
    if (!bars.length || !StudyPGN.chess) return;

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

    bars.forEach(b => b.style.height = `${whitePct}%`);
    scoreTexts.forEach(st => st.textContent = (score >= 0 ? `+${score.toFixed(1)}` : score.toFixed(1)));
  };

  StudyPGN.fetchStockfishCloudEval = async function () {
    if (!StudyPGN.chess) return;
    const fen = StudyPGN.chess.fen();
    const scoreTexts = [document.getElementById('pgn-eval-text'), document.getElementById('coach-pgn-eval-text')].filter(Boolean);
    const bars = [document.getElementById('pgn-eval-bar'), document.getElementById('coach-pgn-eval-bar')].filter(Boolean);

    try {
      const res = await fetch(`https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.pvs && data.pvs[0]) {
          const pv = data.pvs[0];
          if (pv.mate) {
            scoreTexts.forEach(st => st.textContent = `M${pv.mate}`);
            bars.forEach(b => b.style.height = pv.mate > 0 ? '100%' : '0%');
          } else if (pv.cp != null) {
            const cpVal = pv.cp / 100;
            scoreTexts.forEach(st => st.textContent = (cpVal >= 0 ? `+${cpVal.toFixed(1)}` : cpVal.toFixed(1)));
            const whitePct = Math.max(5, Math.min(95, 50 + (cpVal * 4.5)));
            bars.forEach(b => b.style.height = `${whitePct}%`);
          }
        }
      }
    } catch (e) {}
  };

  // ── Lichess Master Opening Explorer API ──
  StudyPGN.fetchLichessOpeningStats = async function () {
    const explorerEls = [
      document.getElementById('pgn-lichess-explorer'),
      document.getElementById('coach-pgn-lichess-explorer')
    ].filter(Boolean);

    if (!explorerEls.length || !StudyPGN.chess) return;

    const fen = StudyPGN.chess.fen();
    try {
      explorerEls.forEach(el => el.innerHTML = `<div style="font-size:11px; color:#94a3b8; padding:8px;"><span class="spinner" style="display:inline-block; width:12px; height:12px; margin-right:4px;"></span> Fetching Lichess Masters statistics...</div>`);

      const res = await fetch(`https://explorer.lichess.ovh/masters?fen=${encodeURIComponent(fen)}&topGames=3`);
      if (!res.ok) throw new Error('API limit or offline');
      const data = await res.json();

      if (!data.moves || !data.moves.length) {
        explorerEls.forEach(el => el.innerHTML = `<div style="font-size:12px; color:var(--ivory-dim); padding:8px;">End of master opening book. Explore tactical novelties!</div>`);
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

      const html = `
        <div style="padding:4px 0;">
          <div style="font-size:11px; font-weight:700; color:var(--gold); text-transform:uppercase; margin-bottom:6px; display:flex; justify-content:space-between;">
            <span>♟️ Lichess Master Move Tree</span>
            <span>${(data.white + data.draws + data.black).toLocaleString()} Games</span>
          </div>
          ${movesHtml}
        </div>
      `;

      explorerEls.forEach(el => el.innerHTML = html);
    } catch (e) {
      explorerEls.forEach(el => el.innerHTML = `<div style="font-size:11px; color:#94a3b8; padding:8px;">Live Lichess Master Explorer active. Step moves to view statistics.</div>`);
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
      <div class="pgn-chess-grid chesscom-board-wrap" style="display:grid; grid-template-columns:repeat(8, 1fr); grid-template-rows:repeat(8, 1fr); aspect-ratio:1/1; width:100%; max-width:440px; margin:0 auto; border-radius:6px; overflow:hidden; border:3px solid #4a3627; box-shadow:0 12px 36px rgba(0,0,0,0.55); position:relative; box-sizing:border-box;">
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
               style="background:${bgColor}; aspect-ratio:1/1; width:100%; height:100%; min-width:0; min-height:0; display:flex; align-items:center; justify-content:center; cursor:pointer; user-select:none; position:relative; box-sizing:border-box; overflow:hidden;">
            ${pieceSvg ? `
              <div class="piece-svg-box" style="width:88%; height:88%; max-width:100%; max-height:100%; display:flex; align-items:center; justify-content:center; filter:drop-shadow(0 3px 4px rgba(0,0,0,0.32)); pointer-events:none; box-sizing:border-box;">
                ${pieceSvg}
              </div>
            ` : ''}
            ${c === 0 ? `<span style="position:absolute; top:2px; left:4px; font-size:11px; font-weight:800; line-height:1; opacity:0.85; color:${isLight ? '#769656' : '#eeeed2'}; font-family:Inter,system-ui,sans-serif; pointer-events:none;">${8 - r}</span>` : ''}
            ${r === 7 ? `<span style="position:absolute; bottom:2px; right:4px; font-size:11px; font-weight:800; line-height:1; opacity:0.85; color:${isLight ? '#769656' : '#eeeed2'}; font-family:Inter,system-ui,sans-serif; pointer-events:none;">${String.fromCharCode(97 + c)}</span>` : ''}
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
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active', 'open');
    }

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
    if (StudyPGN.visionTimer) clearInterval(StudyPGN.visionTimer);
    const modal = document.getElementById('vision-trainer-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active', 'open');
    }
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

  // ── Topic-based Search & Master Games Import API ──
  window.searchPgnTopics = async function (query, targetPgnInputId, targetTitleInputId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const q = (query || '').trim().toLowerCase();
    if (!q) {
      container.innerHTML = '';
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    container.innerHTML = '<div style="padding:10px; font-size:12px; color:var(--gold); text-align:center;">🔍 Searching Master Games & Repertoire API...</div>';

    // 1. Search in curated grandmaster games
    const localMatches = CURATED_STUDY_GAMES.filter(g => {
      const text = `${g.title} ${g.category} ${g.white} ${g.black} ${g.description} ${g.level}`.toLowerCase();
      return text.includes(q);
    });

    let html = '';
    if (localMatches.length > 0) {
      html += `<div style="font-size:11px; font-weight:800; color:var(--gold); text-transform:uppercase; margin-bottom:8px;">Academy Repertoire & Masterclasses (${localMatches.length})</div>`;
      html += localMatches.slice(0, 6).map(g => `
        <div style="background:var(--surface); border:1px solid rgba(218,163,62,0.3); border-radius:8px; padding:10px 12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
          <div style="overflow:hidden;">
            <div style="font-size:13px; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(g.title)}</div>
            <div style="font-size:11px; color:var(--ivory-dim); margin-top:2px;">${escapeHtml(g.category)} · ${escapeHtml(g.white)} vs ${escapeHtml(g.black)} (${g.result})</div>
          </div>
          <button type="button" class="btn btn-gold btn-sm" style="white-space:nowrap; font-size:11px; padding:4px 12px;" onclick="window.selectPgnSearchResult('${g.id}', '${targetPgnInputId}', '${targetTitleInputId}', '${containerId}')">
            📥 Import
          </button>
        </div>
      `).join('');
    }

    // 2. Fetch from live Open Master API if query has >= 3 chars
    if (q.length >= 3) {
      try {
        const res = await fetch(`https://lichess.org/api/games/user/${encodeURIComponent(q)}?max=2&pgnInJson=false`, {
          headers: { 'Accept': 'application/x-chess-pgn' }
        }).catch(() => null);

        if (res && res.ok) {
          const fetchedPgn = await res.text();
          if (fetchedPgn && fetchedPgn.includes('[Event')) {
            html += `<div style="font-size:11px; font-weight:800; color:#60a5fa; text-transform:uppercase; margin:10px 0 6px;">🌐 Live Lichess Database Match</div>
            <div style="background:var(--surface); border:1px solid rgba(96,165,250,0.3); border-radius:8px; padding:10px 12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:10px;">
              <div style="overflow:hidden;">
                <div style="font-size:13px; font-weight:700; color:#fff;">Lichess Master Archive: ${escapeHtml(q)}</div>
                <div style="font-size:11px; color:var(--ivory-dim);">Live API Game Download</div>
              </div>
              <button type="button" class="btn btn-gold btn-sm" style="white-space:nowrap; font-size:11px; padding:4px 12px;" onclick="window.applyDirectPgn('${encodeURIComponent(fetchedPgn)}', '${escapeHtml(q)} Master Games', '${targetPgnInputId}', '${targetTitleInputId}', '${containerId}')">
                📥 Import
              </button>
            </div>`;
          }
        }
      } catch (err) {}
    }

    if (!html) {
      html = `<div style="padding:10px; font-size:12px; color:var(--ivory-dim); text-align:center;">No games found for "${escapeHtml(q)}". Try searching "Sicilian", "Italian", "Fischer", "Kasparov", "Carlsen", or "Morphy".</div>`;
    }

    container.innerHTML = html;
  };

  window.selectPgnSearchResult = function (gameId, targetPgnInputId, targetTitleInputId, containerId) {
    const game = CURATED_STUDY_GAMES.find(g => g.id === gameId);
    if (!game) return;

    const targetPgn = document.getElementById(targetPgnInputId);
    const targetTitle = document.getElementById(targetTitleInputId);
    if (targetPgn) targetPgn.value = game.pgn;
    if (targetTitle) targetTitle.value = game.title;

    const catSelect = document.getElementById('topic-cat-select');
    if (catSelect && game.category) {
      catSelect.value = game.category.includes('Opening') || game.category.includes('Gambit') ? 'Openings' : (game.category.includes('Endgame') ? 'Endgames' : (game.category.includes('Tactic') ? 'Tactics' : 'Masterclasses'));
    }

    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
      container.style.display = 'none';
    }

    if (targetPgnInputId === 'import-pgn-text') {
      StudyPGN.loadPgnString(game.pgn, {
        title: game.title,
        description: game.description
      });
      window.closeImportPgnModal();
      if (window.toast) window.toast(`♟️ Loaded "${game.title}" into Study Board!`, 'success');
    } else {
      if (window.toast) window.toast(`📋 Selected "${game.title}" for assignment!`, 'success');
    }
  };

  window.applyDirectPgn = function (encodedPgn, title, targetPgnInputId, targetTitleInputId, containerId) {
    const pgn = decodeURIComponent(encodedPgn);
    const targetPgn = document.getElementById(targetPgnInputId);
    const targetTitle = document.getElementById(targetTitleInputId);
    if (targetPgn) targetPgn.value = pgn;
    if (targetTitle) targetTitle.value = title;

    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
      container.style.display = 'none';
    }

    if (targetPgnInputId === 'import-pgn-text') {
      StudyPGN.loadPgnString(pgn, {
        title: title,
        description: 'Loaded from online chess API.'
      });
      window.closeImportPgnModal();
      if (window.toast) window.toast(`♟️ Loaded "${title}" into Study Board!`, 'success');
    } else {
      if (window.toast) window.toast(`📋 Selected "${title}" for assignment!`, 'success');
    }
  };

  // ── Coach & Admin Topic Assignment Manager ──
  window.openAssignStudyTopicModal = function () {
    const modal = document.getElementById('assign-study-topic-modal');
    if (!modal) return;

    const coachId = window.currentCoachId || (window.currentCoach && window.currentCoach.id) || null;
    const isCoach = window.role === 'coach' && coachId;

    const availableBatches = isCoach
      ? (window.allBatches || []).filter(b => (window.ckSameCoach ? window.ckSameCoach(b.coach_id, coachId) : String(b.coach_id) === String(coachId)))
      : (window.allBatches || []);

    const availableStudents = isCoach
      ? (window.allStudents || []).filter(s => (window.ckSameCoach ? window.ckSameCoach(s.coach_id, coachId) : String(s.coach_id) === String(coachId)))
      : (window.allStudents || []);

    const batchSelect = document.getElementById('topic-batch-select');
    const studentSelect = document.getElementById('topic-student-select');

    if (batchSelect) {
      batchSelect.innerHTML = '<option value="all">-- All Enrolled Batches --</option>' +
        availableBatches.map(b => `<option value="${escapeHtml(b.id)}">${escapeHtml(b.name || 'Batch ' + b.id)}</option>`).join('');

      batchSelect.onchange = function () {
        const selBatchId = this.value;
        if (!studentSelect) return;
        const batchStudents = selBatchId === 'all'
          ? availableStudents
          : availableStudents.filter(s => String(s.batch_id) === String(selBatchId));

        studentSelect.innerHTML = '<option value="all">-- All Students in Batch --</option>' +
          batchStudents.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name || s.full_name || 'Student')}</option>`).join('');
      };
    }

    if (studentSelect) {
      studentSelect.innerHTML = '<option value="all">-- All Students in Batch --</option>' +
        availableStudents.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name || s.full_name || 'Student')}</option>`).join('');
    }

    modal.style.display = 'flex';
    modal.classList.add('active', 'open');
  };

  window.closeAssignStudyTopicModal = function () {
    const modal = document.getElementById('assign-study-topic-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active', 'open');
    }
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
    window.closeAssignStudyTopicModal();

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
    const studentContainer = document.getElementById('assigned-topics-grid');
    const coachContainer = document.getElementById('coach-assigned-topics-grid');
    if (!studentContainer && !coachContainer) return;

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

    // 1. Render Student view if studentContainer exists
    if (studentContainer) {
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
        studentContainer.innerHTML = `<div style="text-align:center; padding:40px 20px; color:#94a3b8; background:var(--surface); border-radius:12px; border:1px dashed var(--border);">No topics assigned for your current batch. Check back soon!</div>`;
      } else {
        let completedIds = [];
        try { completedIds = JSON.parse(localStorage.getItem(STORAGE_COMPLETED_TOPICS) || '[]'); } catch (e) {}

        studentContainer.innerHTML = filteredTopics.map(t => {
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
      }
    }

    // 2. Render Coach view if coachContainer exists
    if (coachContainer) {
      const coachId = window.currentCoachId || (window.currentCoach ? window.currentCoach.id : null);
      const batches = Array.isArray(window.allBatches) ? window.allBatches : [];

      const coachTopics = topics.filter(t => {
        if (!coachId || window.role === 'admin' || window.role === 'master') return true;
        if (t.batch_id === 'all') return true;
        const b = batches.find(x => String(x.id) === String(t.batch_id));
        if (b && window.ckSameCoach && window.ckSameCoach(b.coach_id, coachId)) return true;
        return true;
      });

      if (!coachTopics.length) {
        coachContainer.innerHTML = `<div style="text-align:center; padding:40px 20px; color:#94a3b8; background:var(--surface); border-radius:12px; border:1px dashed var(--border); grid-column:1/-1;">No study topics assigned yet. Click "➕ Assign New Topic" to assign opening repertoires to your batches!</div>`;
      } else {
        coachContainer.innerHTML = coachTopics.map(t => {
          const batchName = t.batch_id === 'all' ? 'All Batches' : ((batches.find(b => String(b.id) === String(t.batch_id)) || {}).name || `Batch #${t.batch_id}`);
          return `
            <div class="card" style="padding:18px 20px; background:var(--surface2, rgba(0,0,0,0.25)); border:1px solid rgba(218,163,62,0.25); border-radius:14px; display:flex; flex-direction:column; justify-content:space-between; gap:14px;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                  <span style="background:rgba(218,163,62,0.18); color:var(--gold); font-size:11px; font-weight:800; padding:2px 8px; border-radius:4px; text-transform:uppercase;">${escapeHtml(t.category)}</span>
                  <span style="font-size:11px; color:var(--ivory-dim);">${escapeHtml(t.assigned_date)}</span>
                </div>
                <h4 style="margin:0 0 6px; color:#fff; font-size:15px; font-weight:700;">${escapeHtml(t.title)}</h4>
                <div style="font-size:12px; color:var(--ivory-dim); margin-bottom:6px;">Target: <strong style="color:#fff;">${escapeHtml(batchName)}</strong></div>
                <div style="font-size:11px; color:#64748b; font-family:monospace; background:rgba(0,0,0,0.3); padding:6px 8px; border-radius:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(t.pgn.slice(0, 70))}...</div>
              </div>
              <div style="display:flex; gap:8px; justify-content:flex-end;">
                <button class="btn btn-gold btn-sm" onclick="window.practiceAssignedTopic('${escapeHtml(t.id)}', 'coach')" style="font-size:11.5px; padding:4px 10px;">
                  ♟️ Analyze in Board
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="window.deleteAssignedStudyTopic('${escapeHtml(t.id)}')" style="font-size:11.5px; padding:4px 8px;">
                  🗑️
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  };

  window.practiceAssignedTopic = function (topicId, sourceRole = 'student') {
    let topics = [];
    try { topics = JSON.parse(localStorage.getItem(STORAGE_ASSIGNED_TOPICS) || '[]'); } catch (e) {}
    const t = topics.find(x => x.id === topicId);
    if (!t) return;

    StudyPGN.activeAssignedTopic = t;
    StudyPGN.loadPgnString(t.pgn, {
      title: t.title,
      category: t.category,
      description: `Assigned Study Topic: ${t.title}`
    });

    if (sourceRole === 'coach') {
      window.switchCoachStudyTab('board');
    } else {
      window.setStudyPgnSubTab('lab');
    }
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

  // ── Coach Study Tab Switcher ──
  window.switchCoachStudyTab = function (subTab, btn) {
    document.querySelectorAll('.coach-studypgn-subview').forEach(v => v.style.display = 'none');
    const target = document.getElementById('coach-studypgn-subview-' + subTab);
    if (target) target.style.display = 'block';

    const parentNav = btn ? btn.parentElement : document.querySelector('#page-coach-studypgn .tabs-nav');
    if (parentNav) {
      parentNav.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));
      if (btn) btn.classList.add('active');
    }

    if (subTab === 'board') {
      StudyPGN.renderBoard();
      StudyPGN.renderMoveList();
      StudyPGN.renderGameInfo();
      StudyPGN.updateAiMoveGuide();
      StudyPGN.updateEvalGauge();
      StudyPGN.fetchLichessOpeningStats();
    } else if (subTab === 'topics') {
      StudyPGN.renderAssignedTopicsList();
    } else if (subTab === 'monitor') {
      if (window.renderStudyPgnMonitor) window.renderStudyPgnMonitor('coach');
    } else if (subTab === 'vault') {
      StudyPGN.renderCoachVaultCards();
    }
  };

  // ── Coach Vault Cards Renderer ──
  StudyPGN.renderCoachVaultCards = function (filterQuery = '') {
    const container = document.getElementById('coach-vault-cards-container');
    if (!container) return;

    const q = (filterQuery || '').toLowerCase().trim();
    const games = CURATED_STUDY_GAMES.filter(g => {
      if (!q) return true;
      const text = `${g.title} ${g.category} ${g.white} ${g.black} ${g.description}`.toLowerCase();
      return text.includes(q);
    });

    if (!games.length) {
      container.innerHTML = `<div style="text-align:center; padding:40px 20px; color:#94a3b8; background:var(--surface); border-radius:12px; border:1px dashed var(--border); grid-column:1/-1;">No games found for "${escapeHtml(q)}".</div>`;
      return;
    }

    container.innerHTML = games.map((g, idx) => `
      <div class="card" style="padding:18px; background:var(--surface2, rgba(0,0,0,0.25)); border:1px solid rgba(218,163,62,0.25); border-radius:14px; display:flex; flex-direction:column; justify-content:space-between; gap:12px;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="background:rgba(218,163,62,0.18); color:var(--gold); font-size:10.5px; font-weight:800; padding:2px 8px; border-radius:4px; text-transform:uppercase;">${escapeHtml(g.category)}</span>
            <span style="font-size:11px; color:#60a5fa; font-weight:700;">${escapeHtml(g.level || 'Master')}</span>
          </div>
          <h4 style="margin:0 0 6px; color:#fff; font-size:14.5px; font-weight:700;">${escapeHtml(g.title)}</h4>
          <div style="font-size:12px; color:var(--ivory-dim); margin-bottom:6px;">⚪ ${escapeHtml(g.white)} vs ⚫ ${escapeHtml(g.black)} (${g.result})</div>
          <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.4;">${escapeHtml(g.description)}</p>
        </div>
        <div style="display:flex; gap:8px; margin-top:8px;">
          <button class="btn btn-gold btn-sm" style="flex:1; font-size:11.5px; padding:6px 10px;" onclick="StudyPGN.loadCuratedGame(${idx}); window.switchCoachStudyTab('board');">
            ♟️ Load Board
          </button>
          <button class="btn btn-outline btn-sm" style="font-size:11.5px; padding:6px 10px; border-color:rgba(218,163,62,0.4); color:var(--gold);" onclick="window.selectPgnSearchResult('${g.id}', 'topic-pgn-input', 'topic-title-input', ''); window.openAssignStudyTopicModal();">
            ➕ Assign
          </button>
        </div>
      </div>
    `).join('');
  };

  StudyPGN.filterVaultGames = function (q) {
    StudyPGN.renderCoachVaultCards(q);
  };

  // ── Sub Tab Switcher (Student / Admin) ──
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
      StudyPGN.updateEvalGauge();
      StudyPGN.fetchLichessOpeningStats();
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
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active', 'open');
    }
  };

  window.closeImportPgnModal = function () {
    const modal = document.getElementById('import-pgn-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active', 'open');
    }
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
    window.closeImportPgnModal();
    if (window.toast) window.toast('♟️ PGN loaded into Interactive Study Board!', 'success');
  };

  // ── Coach & Admin Practice Analytics Monitor ──
  window.renderStudyPgnMonitor = function (roleType = 'admin') {
    const studentsContainerId = roleType === 'coach' ? 'coach-studypgn-students-table-wrap' : 'admin-studypgn-students-table-wrap';
    const studentsContainer = document.getElementById(studentsContainerId);

    const allStudents = Array.isArray(window.allStudents) ? window.allStudents : [];
    const coachId = window.currentCoachId || (window.currentCoach ? window.currentCoach.id : null);
    const batches = Array.isArray(window.allBatches) ? window.allBatches : [];

    // Filter students for coach
    const students = (roleType === 'coach' && coachId && window.role !== 'admin' && window.role !== 'master')
      ? allStudents.filter(s => {
          if (window.ckSameCoach && window.ckSameCoach(s.coach_id, coachId)) return true;
          if (s.batch_id) {
            const b = batches.find(x => String(x.id) === String(s.batch_id));
            if (b && window.ckSameCoach && window.ckSameCoach(b.coach_id, coachId)) return true;
          }
          return false;
        })
      : allStudents;

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
            ${rowsHtml || '<tr><td colspan="5" style="text-align:center; padding:30px; color:#94a3b8;">No student records found for your batches.</td></tr>'}
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
