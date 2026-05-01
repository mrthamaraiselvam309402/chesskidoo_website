/* assets/js/chessboard.js ---------------------------------------------------
   High-Fidelity Chess Replay Engine — ChessKidoo
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  const FILES = ['a','b','c','d','e','f','g','h'];
  const RANKS_LABELS = ['8','7','6','5','4','3','2','1'];
  const GLYPH = {wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟'};

  /* ─── Legendary Games Collection ─── */
  const GAMES = [
    {
      title: 'The Immortal Game',
      white: { name: 'Adolf Anderssen', elo: '~2600' },
      black: { name: 'L. Kieseritzky', elo: '~2400' },
      meta: 'London, 1851',
      moves: [
        [6,4,4,4],[1,4,3,4],[6,5,4,5],[3,4,4,5],[7,5,4,2],[0,3,4,7],
        [7,4,7,5],[1,1,3,1],[4,2,3,1],[0,6,2,5],[7,6,5,5],[4,7,2,7],
        [6,3,5,3],[2,5,1,7],[5,5,4,7],[2,7,3,6],[4,7,3,5],[1,2,2,2],
        [6,6,4,6],[1,7,2,5],[7,7,6,6],[2,2,3,1],[6,7,4,7],[3,6,2,6],
        [4,7,3,7],[2,6,3,6],[7,3,5,5],[2,5,0,6],[3,1,4,5],[3,6,5,5],
        [7,1,5,2],[0,5,4,2],[5,2,3,4],[5,5,6,1],[2,3,4,5],[4,2,6,6],
        [4,4,3,4],[6,1,7,0],[7,5,6,4],[0,1,2,0],[3,5,1,6],[0,4,0,3],
        [5,5,0,5],[0,6,0,5],[4,5,0,4]
      ],
      san: [
        ['e4','e5'],['f4','exf4'],['Bc4','Qh4+'],['Kf1','b5'],
        ['Bxb5','Nf6'],['Nf3','Qh6'],['d3','Nh5'],['Nh4','Qg5'],
        ['Nf5','c6'],['g4','Nf6'],['Rg1','cxb5'],['h4','Qg6'],
        ['h5','Qg5'],['Qf3','Ng8'],['Bxf4','Qf6'],['Nc3','Bc5'],
        ['Nd5','Qxb2'],['Bd6','Bxg1'],['e5','Qa1+'],['Ke2','Na6'],
        ['Nxg7+','Kd8'],['Qf6+','Nxf6'],['Be7#','']
      ]
    },
    {
      title: 'The Opera Game',
      white: { name: 'Paul Morphy', elo: '~2700' },
      black: { name: 'Duke & Count', elo: '~2100' },
      meta: 'Paris, 1858',
      moves: [
        [6,4,4,4],[1,4,3,4],[7,6,5,5],[1,3,2,3],[6,3,4,3],[1,2,3,6],
        [4,3,3,4],[3,6,5,5],[7,3,5,3],[3,4,5,5],[7,5,4,2],[0,6,2,5],
        [7,1,5,2],[1,2,2,2],[7,2,3,6],[0,3,1,4],[4,2,3,1],[1,1,3,1],
        [5,2,3,1],[3,1,4,2],[3,6,4,2],[0,1,2,3],[7,4,7,2],[0,3,0,1],
        [7,3,1,3],[0,1,1,3],[7,5,1,5],[1,4,2,4],[4,2,1,5],[2,5,0,6],
        [5,3,0,1],[0,6,1,7],[1,5,0,3]
      ],
      san: [
        ['e4','e5'],['Nf3','d6'],['d4','Bg4'],['dxe5','Bxf3'],
        ['Qxf3','dxe5'],['Bc4','Nf6'],['Qb3','Qe7'],['Nc3','c6'],
        ['Bg5','b5'],['Nxb5','cxb5'],['Bxb5+','Nbd7'],['0-0-0','Rd8'],
        ['Rxd7','Rxd7'],['Rd1','Qe6'],['Bxd7+','Nxd7'],['Qb8+','Nxb8'],
        ['Rd8#','']
      ]
    },
    {
      title: 'The Evergreen Game',
      white: { name: 'Adolf Anderssen', elo: '~2650' },
      black: { name: 'Jean Dufresne', elo: '~2450' },
      meta: 'Berlin, 1852',
      moves: [
        [6,4,4,4],[1,4,3,4],[7,6,5,5],[0,1,2,2],[7,5,4,2],[0,2,3,2],
        [6,1,4,1],[3,2,4,1],[6,2,5,2],[4,1,5,0],[6,3,4,3],[3,4,4,3],
        [7,4,7,6],[1,3,2,3],[7,3,5,3],[0,3,2,5],[6,4,5,4],[2,5,3,6],
        [7,7,7,4],[0,6,2,5],[7,2,5,0],[1,1,2,1],[5,3,3,1],[2,1,3,1],
        [3,3,1,0],[0,0,0,1],[1,0,3,0],[0,1,2,1],[7,1,5,3],[2,1,1,2],
        [5,3,4,4],[3,6,5,5],[4,2,5,3],[5,5,3,7],[5,4,3,5],[3,7,4,6],
        [3,5,1,5],[4,6,1,5],[1,5,1,3],[2,5,1,5],[7,0,7,3],[1,5,5,5],
        [7,4,1,4],[5,5,1,4],[3,0,1,3],[2,1,1,3],[5,3,3,5],[1,3,2,3],
        [3,5,1,3],[2,3,1,3],[3,3,1,3],[2,1,1,3],[1,3,0,4]
      ],
      san: [
        ['e4','e5'],['Nf3','Nc6'],['Bc4','Bc5'],['b4','Bxb4'],
        ['c3','Ba5'],['d4','exd4'],['O-O','d3'],['Qb3','Qf6'],
        ['e5','Qg6'],['Re1','Nge7'],['Ba3','b5'],['Qxb5','Rb8'],
        ['Qa4','Bb6'],['Nbd2','Bb7'],['Ne4','Qf5'],['Bxf3','Qh5'],
        ['Nf6+','gxf6'],['exf6','Rg8'],['Rad1','Qxf3'],['Rxe7+','Nxe7'],
        ['Qxd7+','Kxd7'],['Bf5+','Ke8'],['Bd7+','Kf8'],['Bxe7#','']
      ]
    }
  ];

  let currentGame = GAMES[0];
  let board = null;
  let moveIdx = 0;
  let playing = true;
  let timer = null;
  const speeds = [2800, 1800, 1100, 650, 320];
  let spd = 2;

  function initBoardState() {
    return [
      ['bR','bN','bB','bQ','bK','bB','bN','bR'],
      ['bP','bP','bP','bP','bP','bP','bP','bP'],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      ['wP','wP','wP','wP','wP','wP','wP','wP'],
      ['wR','wN','wB','wQ','wK','wB','wN','wR']
    ];
  }

  function renderBoard(hf, ht) {
    const boardEl = document.getElementById('board');
    if (!boardEl) return;
    boardEl.innerHTML = '';
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = document.createElement('div');
        sq.className = 'sq ' + ((r+f)%2===0 ? 'light' : 'dark');
        if (hf && hf[0]===r && hf[1]===f) sq.classList.add('hl-from');
        if (ht && ht[0]===r && ht[1]===f) sq.classList.add('hl-to');
        const pc = board[r][f];
        if (pc) {
          const span = document.createElement('span');
          span.className = 'piece';
          span.textContent = GLYPH[pc];
          sq.appendChild(span);
        }
        boardEl.appendChild(sq);
      }
    }
  }

  function renderMoves() {
    const ml = document.getElementById('move-list');
    if (!ml) return;
    
    // Initial build if empty
    if (!ml.children.length) {
      currentGame.san.forEach((pair, i) => {
        const row = document.createElement('div');
        row.className = 'move-row';
        const num = document.createElement('div');
        num.className = 'move-n';
        num.textContent = (i+1)+'.';
        row.appendChild(num);
        [0,1].forEach(s => {
          const m = document.createElement('div');
          m.className = 'move-san';
          m.dataset.moveIdx = (i * 2 + s + 1);
          m.textContent = pair[s]||'';
          if (pair[s]) m.onclick = ()=>{ stopReplay(); goTo(parseInt(m.dataset.moveIdx)); };
          row.appendChild(m);
        });
        ml.appendChild(row);
      });
    }

    // Just update active class
    ml.querySelectorAll('.move-san').forEach(m => {
      const idx = parseInt(m.dataset.moveIdx);
      if (idx === moveIdx) m.classList.add('active');
      else m.classList.remove('active');
    });

    const active = ml.querySelector('.active');
    if (active) {
      // Localized scroll: only scroll the container, NOT the whole page
      const container = ml.parentElement; // .moves-panel
      const activeTop = active.offsetTop;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.offsetHeight;

      // Only scroll if move is out of visible area of the panel
      if (activeTop < containerScrollTop || activeTop > (containerScrollTop + containerHeight - 40)) {
        container.scrollTop = activeTop - (containerHeight / 2);
      }
    }
  }

  function applyMv(idx) {
    if (idx >= currentGame.moves.length) return;
    const [fr,ff,tr,tf] = currentGame.moves[idx];
    board[tr][tf] = board[fr][ff];
    board[fr][ff] = null;
    renderBoard([fr,ff],[tr,tf]);
  }

  function goTo(target) {
    board = initBoardState();
    for (let i = 0; i < target && i < currentGame.moves.length; i++) {
      const [fr,ff,tr,tf] = currentGame.moves[i];
      board[tr][tf] = board[fr][ff];
      board[fr][ff] = null;
    }
    moveIdx = target;
    const lm = target > 0 ? currentGame.moves[target-1] : null;
    renderBoard(lm ? [lm[0],lm[1]] : null, lm ? [lm[2],lm[3]] : null);
    renderMoves();
  }

  function step() {
    if (moveIdx >= currentGame.moves.length) { 
      // Cycle to next game or restart
      setTimeout(() => {
        const nextIdx = (GAMES.indexOf(currentGame) + 1) % GAMES.length;
        loadGame(nextIdx);
      }, 3000);
      stopReplay(); 
      playing = false; 
      const btn = document.getElementById('b-pause');
      if (btn) btn.textContent = '▶ Play'; 
      return; 
    }
    applyMv(moveIdx++);
    renderMoves();
  }

  function startReplay() { 
    stopReplay(); 
    if (moveIdx >= currentGame.moves.length) return; 
    timer = setInterval(step, speeds[spd]); 
  }
  
  function stopReplay() { 
    if (timer) { clearInterval(timer); timer = null; } 
  }

  function loadGame(index) {
    stopReplay();
    currentGame = GAMES[index];
    moveIdx = 0;
    playing = true;
    
    // Update UI Elements
    const update = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    const q = (sel, val) => { const el = document.querySelector(sel); if(el) el.textContent = val; };
    
    q('.panel-head', currentGame.title);
    q('.player-chip:not(.right) .pname', currentGame.white.name);
    q('.player-chip:not(.right) .pelo', `White · ELO ${currentGame.white.elo}`);
    q('.player-chip.right .pname', currentGame.black.name);
    q('.player-chip.right .pelo', `Black · ELO ${currentGame.black.elo}`);
    q('.match-loc', currentGame.meta);
    
    const ml = document.getElementById('move-list');
    if(ml) ml.innerHTML = ''; // Clear for new game
    
    board = initBoardState();
    renderBoard();
    renderMoves();
    startReplay();
    
    const bPause = document.getElementById('b-pause');
    if(bPause) bPause.textContent = '⏸ Pause';
  }

  function initChessboardUI() {
    const ranksCol = document.getElementById('ranks-col');
    if (ranksCol) {
      ranksCol.innerHTML = '';
      RANKS_LABELS.forEach(r => { const d=document.createElement('div');d.className='coord';d.textContent=r;ranksCol.appendChild(d); });
    }

    const filesRow = document.getElementById('files-row');
    if (filesRow) {
      filesRow.innerHTML = '';
      FILES.forEach(f => { const d=document.createElement('div');d.className='coord';d.textContent=f;filesRow.appendChild(d); });
    }

    // Bind Controls
    const bPause = document.getElementById('b-pause');
    if (bPause) {
      bPause.onclick = () => {
        playing = !playing;
        if (playing) { startReplay(); bPause.textContent = '⏸ Pause'; }
        else { stopReplay(); bPause.textContent = '▶ Play'; }
      };
    }

    const bNext = document.getElementById('b-next');
    if (bNext) bNext.onclick = () => { stopReplay(); playing=false; if(bPause) bPause.textContent='▶ Play'; if(moveIdx<currentGame.moves.length){applyMv(moveIdx++);renderMoves();} };

    const bPrev = document.getElementById('b-prev');
    if (bPrev) bPrev.onclick = () => { stopReplay(); playing=false; if(bPause) bPause.textContent='▶ Play'; if(moveIdx>0)goTo(moveIdx-1); };

    const bStart = document.getElementById('b-start');
    if (bStart) bStart.onclick = () => { stopReplay(); playing=false; if(bPause) bPause.textContent='▶ Play'; goTo(0); };

    const bEnd = document.getElementById('b-end');
    if (bEnd) bEnd.onclick = () => { stopReplay(); playing=false; if(bPause) bPause.textContent='▶ Play'; goTo(currentGame.moves.length); };

    const speedRange = document.getElementById('speed');
    if (speedRange) speedRange.oninput = e => { spd=parseInt(e.target.value)-1; if(playing) startReplay(); };

    // Pick random starting game
    const startIdx = Math.floor(Math.random() * GAMES.length);
    loadGame(startIdx);
  }

  // Export to CK namespace
  CK.initChessboard = initChessboardUI;

  // Auto-init on DOM load if we are on landing page
  window.addEventListener('load', () => {
    if (document.getElementById('board')) {
      CK.initChessboard();
    }
  });

})();
