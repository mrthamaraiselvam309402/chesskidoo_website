import re

def rewrite_chessboard():
    # We will generate a new assets/js/chessboard.js that leverages Chessboard.js
    # and chess.js for the AI and replay functionality.
    
    code = """/* assets/js/chessboard.js ---------------------------------------------------
   High-Fidelity Chess Engine using Chessboard.js & chess.js — ChessKidoo
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  /* ─── Legendary Games Collection ─── */
  const GAMES = [
    {
      title: 'The Immortal Game',
      white: { name: 'Adolf Anderssen', elo: '~2600' },
      black: { name: 'L. Kieseritzky', elo: '~2400' },
      meta: 'London, 1851',
      moves: [
        'e4','e5','f4','exf4','Bc4','Qh4+','Kf1','b5',
        'Bxb5','Nf6','Nf3','Qh6','d3','Nh5','Nh4','Qg5',
        'Nf5','c6','g4','Nf6','Rg1','cxb5','h4','Qg6',
        'h5','Qg5','Qf3','Ng8','Bxf4','Qf6','Nc3','Bc5',
        'Nd5','Qxb2','Bd6','Bxg1','e5','Qa1+','Ke2','Na6',
        'Nxg7+','Kd8','Qf6+','Nxf6','Be7#'
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
    list.scrollTop = list.scrollHeight;
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
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd
    };
    if (document.getElementById('board')) {
      boardWidget = Chessboard('board', config);
      initControls();
      
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
"""
    with open('d:/MY/chessk/assets/js/chessboard.js', 'w', encoding='utf-8') as f:
        f.write(code)

rewrite_chessboard()
print("chessboard.js rewritten to use open source Chessboard.js.")
