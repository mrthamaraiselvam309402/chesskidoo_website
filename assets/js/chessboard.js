/* assets/js/chessboard.js ---------------------------------------------------
   High-Fidelity Chess Engine using Chessboard.js & chess.js — ChessKidoo
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  /* ─── Legendary Games Collection ─── */
  const GAMES = [
    {
      title: 'The Evergreen Game',
      white: { name: 'Adolf Anderssen', elo: '~2650' },
      black: { name: 'Jean Dufresne', elo: '~2450' },
      meta: 'Berlin, 1852',
      moves: [
        'e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3', 'Ba5',
        'd4', 'exd4', 'O-O', 'd3', 'Qb3', 'Qf6', 'e5', 'Qg6', 'Re1', 'Nge7',
        'Ba3', 'b5', 'Qxb5', 'Rb8', 'Qa4', 'Bb6', 'Nbd2', 'Bb7', 'Ne4', 'Qf5',
        'Bxd3', 'Qh5', 'Nf6+', 'gxf6', 'exf6', 'Rg8', 'Rad1', 'Qxf3', 'Rxe7+', 'Nxe7',
        'Qxd7+', 'Kxd7', 'Bf5+', 'Ke8', 'Bd7+', 'Kf8', 'Bxe7#'
      ]
    }
  ];

  let currentGame = GAMES[0];
  let boardWidget = null;
  let game = new Chess();
  let moveIdx = 0;
  let playing = true;
  let timer = null;
  const speeds = [2800, 1800, 1100, 650, 320];
  let spd = 2;

  let gameMode = 'REPLAY'; // 'REPLAY' or 'PLAY'

  // Minimax AI
  const pieceValues = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };
  
  function evaluateBoard(g) {
    let total = 0;
    const b = g.board();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = b[r][f];
        if (p) {
          total += (p.color === 'w' ? pieceValues[p.type] : -pieceValues[p.type]);
        }
      }
    }
    return total;
  }

  function getBestMove(g) {
    const moves = g.moves();
    if (moves.length === 0) return null;
    let bestMove = null;
    let bestVal = -9999;
    
    // Very simple 1-ply search for speed in browser
    for (let m of moves) {
      g.move(m);
      let val = -evaluateBoard(g); // from black's perspective
      g.undo();
      if (val > bestVal) {
        bestVal = val;
        bestMove = m;
      }
    }
    // Randomize slightly if multiple equal moves
    return bestMove || moves[Math.floor(Math.random() * moves.length)];
  }

  function makeRandomMove() {
    if (game.game_over()) return;
    const move = getBestMove(game);
    if (move) {
      game.move(move);
      boardWidget.position(game.fen());
      renderMoves();
    }
  }

  function onDragStart(source, piece, position, orientation) {
    if (gameMode !== 'PLAY') return false;
    if (game.game_over()) return false;
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false;
    }
  }

  function onDrop(source, target) {
    if (gameMode !== 'PLAY') return 'snapback';
    
    // see if the move is legal
    let move = game.move({
      from: source,
      to: target,
      promotion: 'q' // always promote to queen for simplicity
    });

    if (move === null) return 'snapback';
    renderMoves();
    
    // make random legal move for black
    window.setTimeout(makeRandomMove, 250);
  }

  function onSnapEnd() {
    boardWidget.position(game.fen());
  }

  /* ─── UI & Rendering ─── */
  function renderMoves() {
    const list = document.getElementById('move-list');
    if (!list) return;
    list.innerHTML = '';
    
    const history = game.history();
    for (let i = 0; i < history.length; i += 2) {
      const row = document.createElement('div');
      row.className = 'move-row';
      const n = document.createElement('div');
      n.className = 'move-n';
      n.innerText = (i/2 + 1) + '.';
      row.appendChild(n);

      const w = document.createElement('div');
      w.className = 'move-san';
      if (i === moveIdx - 1) w.classList.add('active');
      w.innerText = history[i];
      w.onclick = () => jumpTo(i + 1);
      row.appendChild(w);

      const b = document.createElement('div');
      b.className = 'move-san';
      if (i + 1 < history.length) {
        if (i + 1 === moveIdx - 1) b.classList.add('active');
        b.innerText = history[i + 1];
        b.onclick = () => jumpTo(i + 2);
      }
      row.appendChild(b);

      list.appendChild(row);
    }
    const panel = document.querySelector('.moves-panel');
    if (panel) panel.scrollTop = panel.scrollHeight;
  }

  function applyState() {
    boardWidget.position(game.fen());
    renderMoves();
  }

  function nextMove() {
    if (gameMode === 'PLAY') return;
    if (moveIdx < currentGame.moves.length) {
      game.move(currentGame.moves[moveIdx]);
      moveIdx++;
      applyState();
    } else {
      playing = false;
      updateControls();
    }
  }

  function prevMove() {
    if (gameMode === 'PLAY') return;
    if (moveIdx > 0) {
      game.undo();
      moveIdx--;
      applyState();
    }
  }

  function jumpTo(idx) {
    if (gameMode === 'PLAY') return;
    game.reset();
    for (let i = 0; i < idx; i++) {
      game.move(currentGame.moves[i]);
    }
    moveIdx = idx;
    applyState();
  }

  function autoPlay() {
    if (!playing || gameMode === 'PLAY') return;
    nextMove();
    if (playing) {
      timer = setTimeout(autoPlay, speeds[spd]);
    }
  }

  function updateControls() {
    const pBtn = document.getElementById('b-pause');
    if (pBtn) pBtn.innerText = playing ? '⏸ Pause' : '▶ Play';
  }

  function initControls() {
    document.getElementById('b-start')?.addEventListener('click', () => { jumpTo(0); });
    document.getElementById('b-prev')?.addEventListener('click', () => { playing=false; updateControls(); prevMove(); });
    document.getElementById('b-next')?.addEventListener('click', () => { playing=false; updateControls(); nextMove(); });
    document.getElementById('b-end')?.addEventListener('click', () => { jumpTo(currentGame.moves.length); });
    
    document.getElementById('b-pause')?.addEventListener('click', () => {
      playing = !playing;
      updateControls();
      if (playing) autoPlay();
    });

    const spdEl = document.getElementById('speed');
    if (spdEl) {
      spdEl.addEventListener('input', e => {
        spd = parseInt(e.target.value) - 1;
      });
    }
  }

  CK.startPlayMode = () => {
    gameMode = 'PLAY';
    playing = false;
    clearTimeout(timer);
    game.reset();
    boardWidget.position('start');
    boardWidget.orientation('white');
    renderMoves();
    
    document.querySelector('.panel-head').innerText = 'You vs AI';
    document.querySelector('.pname').innerText = 'You';
    document.querySelector('.pelo').innerText = 'White · 1200';
    document.querySelectorAll('.player-chip.right .pname')[0].innerText = 'ChessKidoo Engine';
    document.querySelectorAll('.player-chip.right .pelo')[0].innerText = 'Black · AI';
    
    CK.showToast('Play vs AI Started! You are White.', 'success');
  };

  CK.initBoard = () => {
    const config = {
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
      position: 'start',
      draggable: true,
      showNotation: false,
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd
    };
    if (document.getElementById('board')) {
      boardWidget = Chessboard('board', config);
      initControls();

      // Draw external coordinates if present
      const ranksCol = document.getElementById('ranks-col');
      const filesRow = document.getElementById('files-row');
      if (ranksCol && ranksCol.children.length === 0) {
        ['8','7','6','5','4','3','2','1'].forEach(r => {
          const d = document.createElement('div');
          d.className = 'coord';
          d.innerText = r;
          ranksCol.appendChild(d);
        });
      }
      if (filesRow && filesRow.children.length === 0) {
        ['a','b','c','d','e','f','g','h'].forEach(f => {
          const d = document.createElement('div');
          d.className = 'coord';
          d.innerText = f;
          filesRow.appendChild(d);
        });
      }
      
      // Dynamic loading of currentGame details into the UI
      const wName = document.querySelector('.player-chip .pname');
      const wElo = document.querySelector('.player-chip .pelo');
      const bName = document.querySelector('.player-chip.right .pname');
      const bElo = document.querySelector('.player-chip.right .pelo');
      const mCenterLoc = document.querySelector('.match-loc');
      const mTitle = document.querySelector('.panel-head');
      
      if (wName) wName.innerText = currentGame.white.name;
      if (wElo) wElo.innerText = `White · ELO ${currentGame.white.elo}`;
      if (bName) bName.innerText = currentGame.black.name;
      if (bElo) bElo.innerText = `Black · ELO ${currentGame.black.elo}`;
      if (mCenterLoc) mCenterLoc.innerText = currentGame.meta;
      if (mTitle) mTitle.innerText = currentGame.title.toUpperCase();

      // Load initial game
      game.reset();
      moveIdx = 0;
      applyState();
      
      // Delay auto-play slightly
      setTimeout(() => {
        playing = true;
        updateControls();
        autoPlay();
      }, 1000);
    }
  };

  // Auto-init if we are on landing page
  window.addEventListener('load', () => {
    if (document.getElementById('board')) {
        setTimeout(() => CK.initBoard(), 200);
    }
  });

})();
