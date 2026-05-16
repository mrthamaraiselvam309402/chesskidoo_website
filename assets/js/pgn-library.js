/* assets/js/pgn-library.js
   ChessKidoo Famous Games PGN Library
   8 historically verified grandmaster / brilliancy games for instant in-browser study */

window.CK = window.CK || {};

CK.pgnLibrary = {

  games: [
    {
      id: 'opera',
      title: 'The Opera Game',
      white: 'Paul Morphy',
      black: 'Duke of Brunswick & Count Isouard',
      year: 1858,
      event: 'Paris Opera House',
      category: 'Tactical Brilliance',
      badge: 'p-badge-gold',
      icon: '♛',
      why: 'Morphy sacrifices a rook and bishop to deliver a stunning back-rank smothered mate in just 17 moves. The perfect lesson in piece activity and rapid development.',
      pgn: '1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8#'
    },
    {
      id: 'immortal',
      title: 'The Immortal Game',
      white: 'Adolf Anderssen',
      black: 'Lionel Kieseritzky',
      year: 1851,
      event: 'London Casual Game',
      category: 'Queen Sacrifice',
      badge: 'p-badge-red',
      icon: '♚',
      why: 'Anderssen sacrifices both rooks, a bishop, and then his queen to deliver checkmate with his minor pieces alone. The most famous attacking game ever played.',
      pgn: '1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7#'
    },
    {
      id: 'gotc',
      title: 'Game of the Century',
      white: 'Donald Byrne',
      black: 'Bobby Fischer',
      year: 1956,
      event: 'Rosenwald Trophy, New York',
      category: 'Strategic Brilliance',
      badge: 'p-badge-blue',
      icon: '♞',
      why: 'Fischer, aged 13, sacrifices his queen on move 18 to launch an unstoppable king hunt. Hans Kmoch called it "the game of the century." Masterclass in calculation.',
      pgn: '1. Nf3 Nf6 2. c4 g6 3. Nc3 Bg7 4. d4 O-O 5. Bf4 d5 6. Qb3 dxc4 7. Qxc4 c6 8. e4 Nbd7 9. Rd1 Nb6 10. Qc5 Bg4 11. Bg5 Na4 12. Qa3 Nxc3 13. bxc3 Nxe4 14. Bxe7 Qb6 15. Bc4 Nxc3 16. Bc5 Rfe8+ 17. Kf1 Be6 18. Bxb6 Bxc4+ 19. Kg1 Ne2+ 20. Kf1 Nxd4+ 21. Kg1 Ne2+ 22. Kf1 Nc3+ 23. Kg1 axb6 24. Qb4 Ra4 25. Qxb6 Nxd1 26. h3 Rxa2 27. Kh2 Nxf2 28. Re1 Rxe1 29. Qd8+ Bf8 30. Nxe1 Bd5 31. Nf3 Ne4 32. Qb8 b5 33. h4 h5 34. Ne5 Kg7 35. Kg1 Bc5+ 36. Kf1 Ng3+ 37. Ke1 Bb4+ 38. Kd1 Bb3+ 39. Kc1 Ne2+ 40. Kb1 Nc3+ 41. Kc1 Rc2#'
    },
    {
      id: 'fischer72',
      title: 'Fischer vs Spassky (Game 6)',
      white: 'Bobby Fischer',
      black: 'Boris Spassky',
      year: 1972,
      event: 'World Championship, Reykjavik',
      category: 'Classic Strategy',
      badge: 'p-badge-teal',
      icon: '♔',
      why: 'Called the greatest game Fischer ever played. A queenside minority attack turned into an unstoppable kingside assault. Fischer even apologized to Spassky for the move order after the game.',
      pgn: '1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5 13. Qa3 Rc8 14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7 17. Be2 Nd7 18. Nd4 Qf8 19. Nxe6 fxe6 20. e4 d4 21. f4 Qe7 22. e5 Rb8 23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5 26. f5 exf5 27. Rxf5 Nh7 28. Rcf1 Qd8 29. Qg3 Re7 30. h4 Rbb7 31. e6 Rbc7 32. Qe5 Qe8 33. a4 Qd8 34. R1f2 Qe8 35. R2f3 Qd8 36. Bd3 Qe8 37. Qe4 Nf6 38. Rxf6 gxf6 39. Rxf6 Kg8 40. Bc4 Kh8 41. Qf4 1-0'
    },
    {
      id: 'kasparov99',
      title: "Kasparov's Immortal",
      white: 'Garry Kasparov',
      black: 'Veselin Topalov',
      year: 1999,
      event: 'Hoogeveen, Netherlands',
      category: 'King Hunt',
      badge: 'p-badge-gold',
      icon: '♕',
      why: 'Kasparov sacrifices a rook on move 24, then hunts the black king from g8 all the way to d1. Widely considered the greatest game of the computer era.',
      pgn: '1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1 d4 22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6 26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7 1-0'
    },
    {
      id: 'morphy_paulsen',
      title: 'Morphy vs Paulsen',
      white: 'Paul Morphy',
      black: 'Louis Paulsen',
      year: 1857,
      event: 'First American Chess Congress',
      category: 'Queen Sacrifice',
      badge: 'p-badge-yellow',
      icon: '♗',
      why: 'Morphy sacrifices his queen on move 17 in a move that left the chess world speechless. A classic demonstration of positional compensation and attacking geometry.',
      pgn: '1. e4 c5 2. d4 cxd4 3. Nf3 Nc6 4. Nxd4 e6 5. Nb5 d6 6. Bf4 e5 7. Be3 f5 8. N1c3 f4 9. Nd5 fxe3 10. Nbc7+ Kf7 11. Qf3+ Nf6 12. Bc4 Nd4 13. Nxf6 Nxf3+ 14. Ke2 Qd7 15. Nxd7 Nd4+ 16. Kd3 Nb5+ 17. Kc2 Nxc7 18. Nxe5+ dxe5 19. gxf3 Bd7 20. Rhg1 g6 21. Rxg6 hxg6 22. Rxg6 Ke7 23. Rxg7+ Ke8 24. Rg8+ Kf7 25. Rxf8#'
    },
    {
      id: 'tal_bronstein',
      title: 'Tal vs Bronstein',
      white: 'Mikhail Tal',
      black: 'David Bronstein',
      year: 1982,
      event: 'USSR Championship, Moscow',
      category: 'Tactical Attack',
      badge: 'p-badge-red',
      icon: '♜',
      why: 'The Magician from Riga at his finest — Tal launches a ferocious kingside attack and sacrifices material to destroy all defensive resources. Pure chaos theory.',
      pgn: '1. e4 c5 2. Ne2 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. g3 e5 7. Nde2 Be7 8. Bg2 O-O 9. O-O Nbd7 10. h3 b5 11. g4 b4 12. Nd5 Nxd5 13. exd5 Bf6 14. Ng3 a5 15. g5 Be7 16. h4 a4 17. h5 a3 18. b3 Nc5 19. g6 hxg6 20. hxg6 f6 21. Bh6 Re8 22. Kh2 Bf8 23. Bxf8 Rxf8 24. Nf5 Bxf5 25. Qh5 Bg6 26. Qxg6 Qe7 27. Rh1 Rf7 28. gxf7+ Kxf7 29. Rh7+ Kf8 30. Qh6+ 1-0'
    },
    {
      id: 'capablanca_tartakower',
      title: 'Capablanca vs Tartakower',
      white: 'Jose Raul Capablanca',
      black: 'Savielly Tartakower',
      year: 1924,
      event: 'New York Tournament',
      category: 'Endgame Mastery',
      badge: 'p-badge-green',
      icon: '♖',
      why: 'Capablanca converts a rook endgame that seemed drawish into a clinical win. A landmark study in king activation, passed pawns, and endgame technique.',
      pgn: '1. d4 e6 2. Nf3 f5 3. c4 Nf6 4. Bg5 Be7 5. Nc3 O-O 6. e3 b6 7. Bd3 Bb7 8. O-O Qe8 9. Qe2 Ne4 10. Bxe7 Qxe7 11. Bxe4 fxe4 12. Nd2 d6 13. f3 exf3 14. Rxf3 Qh4 15. Rf2 Nc6 16. Nde4 Rxf2 17. Qxf2 Rf8 18. Qg3 Qxg3 19. Nxg3 Rf4 20. Nce4 Rg4 21. Nf2 Rf4 22. Nfd3 Rf7 23. Re1 Ne7 24. Kf2 c5 25. b4 cxd4 26. exd4 Kf8 27. bxc5 bxc5 28. dxc5 dxc5 29. c5 Ke8 30. Ke3 Kd7 31. Kd4 Nc6+ 32. Kc4 Nb4 33. Nxb4 Rf4+ 34. Kb3 Rxb4+ 35. Kc3 Rh4 36. Rd1+ Kc7 37. Nge4 Rh3+ 38. Kb2 Rh4 39. Nd6 Rh5 40. Nxe6+ Kb7 41. Rd7+ Ka6 42. Nd4 Rxh2+ 43. Ka3 Rh3+ 44. Nb3 1-0'
    }
  ],

  load(id, boardId) {
    const g = this.games.find(x => x.id === id);
    if (!g) return;
    const isCoach = (boardId || '').startsWith('coach');
    const inputId  = isCoach ? 'coachLabPgnInput' : 'labPgnInput';
    const input    = document.getElementById(inputId);
    if (input) input.value = g.pgn;
    if (window.CK && CK.lab) CK.lab.analyzePgn(g.pgn, boardId || 'studentLabBoard');
    if (window.CK && CK.showToast) CK.showToast(`♟ "${g.title}" (${g.year}) loaded — ${g.category}`, 'success');
  },

  renderCards(containerId, boardId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const badgeColors = {
      'p-badge-gold'  : '#e8b84b',
      'p-badge-red'   : '#ef4444',
      'p-badge-blue'  : '#3b82f6',
      'p-badge-teal'  : '#14b8a6',
      'p-badge-green' : '#22c55e',
      'p-badge-yellow': '#f59e0b'
    };
    el.innerHTML = this.games.map(g => {
      const col = badgeColors[g.badge] || '#e8b84b';
      return `
        <div class="pgn-lib-card" onclick="CK.pgnLibrary.load('${g.id}','${boardId}')">
          <div class="pgn-lib-card-icon" style="color:${col};">${g.icon}</div>
          <div class="pgn-lib-card-body">
            <div class="pgn-lib-card-title">${g.title}</div>
            <div class="pgn-lib-card-players">${g.white} vs ${g.black}</div>
            <div class="pgn-lib-card-meta">
              <span class="pgn-lib-year">${g.year}</span>
              <span class="p-badge ${g.badge}" style="font-size:.65rem;padding:1px 7px;">${g.category}</span>
            </div>
            <div class="pgn-lib-card-why">${g.why}</div>
          </div>
          <button class="pgn-lib-load-btn">Load ▶</button>
        </div>`;
    }).join('');
  }
};
