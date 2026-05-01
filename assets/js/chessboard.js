/**
 * ChessKidoo — Animated Chess Replay Engine v2.5 (Multi-Game Support)
 * ─────────────────────────────────────────────────
 * Features "The Immortal Game" and "The Opera Game"
 * Auto-initialises into #main-chessboard on DOMContentLoaded.
 */

(function () {
  'use strict';

  /* ── SVG Piece Map ────────────────────────────────────────────────── */
  const SVG_BASE = 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/staunty/';
  const PIECES = {
    'K': SVG_BASE + 'wK.svg', 'Q': SVG_BASE + 'wQ.svg', 'R': SVG_BASE + 'wR.svg', 'B': SVG_BASE + 'wB.svg', 'N': SVG_BASE + 'wN.svg', 'P': SVG_BASE + 'wP.svg',
    'k': SVG_BASE + 'bK.svg', 'q': SVG_BASE + 'bQ.svg', 'r': SVG_BASE + 'bR.svg', 'b': SVG_BASE + 'bB.svg', 'n': SVG_BASE + 'bN.svg', 'p': SVG_BASE + 'bP.svg'
  };

  const INIT_POS = {
    a1:'R', b1:'N', c1:'B', d1:'Q', e1:'K', f1:'B', g1:'N', h1:'R',
    a2:'P', b2:'P', c2:'P', d2:'P', e2:'P', f2:'P', g2:'P', h2:'P',
    a7:'p', b7:'p', c7:'p', d7:'p', e7:'p', f7:'p', g7:'p', h8:'p',
    a8:'r', b8:'n', c8:'b', d8:'q', e8:'k', f8:'b', g8:'n', h8:'r'
  };

  /* ── Games Database ─────────────────────────────────────────────────── */
  const GAMES = [
    {
      id: 'immortal',
      title: 'The Immortal Game',
      event: 'London, 1851',
      white: 'Adolf Anderssen', wElo: '~2600', wIcon: '♔',
      black: 'L. Kieseritzky', bElo: '~2400', bIcon: '♚',
      moves: [
        ['e2','e4','e4'], ['e7','e5','e5'], ['f2','f4','f4'], ['e5','f4','exf4'],
        ['f1','c4','Bc4'], ['d8','h4','Qh4+'], ['e1','f1','Kf1'], ['b7','b5','b5'],
        ['c4','b5','Bxb5'], ['g8','f6','Nf6'], ['g1','f3','Nf3'], ['h4','h6','Qh6'],
        ['d2','d3','d3'], ['f6','h5','Nh5'], ['f3','h4','Nh4'], ['h6','g5','Qg5'],
        ['h4','f5','Nf5'], ['c7','c6','c6'], ['g2','g4','g4'], ['h5','f6','Nf6'],
        ['h1','g1','Rg1'], ['c6','b5','cxb5'], ['h2','h4','h4'], ['g5','g6','Qg6'],
        ['h4','h5','h5'], ['g6','g5','Qg5'], ['d1','f3','Qf3'], ['f6','g8','Ng8'],
        ['c1','f4','Bxf4'], ['g5','f6','Qf6'], ['b1','c3','Nc3'], ['f8','c5','Bc5'],
        ['c3','d5','Nd5'], ['f6','b2','Qxb2'], ['f4','d6','Bd6'], ['c5','g1','Bxg1'],
        ['e4','e5','e5'], ['b2','a1','Qxa1+'], ['f1','e2','Ke2'], ['b8','a6','Na6'],
        ['f5','g7','Nxg7+'], ['e8','d8','Kd8'], ['f3','f6','Qf6+'], ['g8','f6','Nxf6'],
        ['d6','e7','Be7#']
      ]
    },
    {
      id: 'carlsen-karjakin',
      title: 'Carlsen vs Karjakin',
      event: 'WCh Tie-break, 2016',
      white: 'Magnus Carlsen', wElo: '2853', wIcon: '👑',
      black: 'Sergey Karjakin', bElo: '2772', bIcon: '♔',
      moves: [
        ['e2','e4','e4'], ['c7','c5','c5'], ['g1','f3','Nf3'], ['d7','d6','d6'],
        ['d2','d4','d4'], ['c5','d4','cxd4'], ['f3','d4','Nxd4'], ['g8','f6','Nf6'],
        ['f2','f3','f3'], ['e7','e6','e6'], ['c1','e3','Be3'], ['f8','e7','Be7'],
        ['d1','d2','Qd2'], ['a7','a6','a6'], ['O-O-O','O-O','O-O-O'], ['d8','c7','Qc7'],
        ['g2','g4','g4'], ['b7','b5','b5'], ['f3','f4','f4'], ['b8','c6','Nc6'],
        ['e3','c1','Be3'], ['c6','a5','Na5'], ['g4','g5','g5'], ['f6','d7','Nd7'],
        ['f4','f5','f5'], ['a5','c4','Nc4'], ['d2','f2','Qf2'], ['h7','h6','h6'],
        ['d4','c6','Nxc6'], ['c7','c6','Qxc6'], ['g5','h6','gxh6'], ['f2','h4','Qh4'],
        ['c4','e5','Ne5'], ['c1','f4','Bf4'], ['c6','c4','Qc4'], ['f1','e2','Be2'],
        ['e7','f6','Bf6'], ['f4','e5','Bxe5'], ['d6','e5','dxe5'], ['h4','e7','Qe7+'],
        ['f8','e7','Bxe7'], ['e2','c4','Bc4'], ['g8','h7','Kh7'], ['h1','f1','Rf1'],
        ['f7','f5','f5'], ['h4','e7','Qe7'], ['a8','g8','Rg8'], ['f1','f5','Rxf5'],
        ['e6','f5','exf5'], ['d2','d7','Rd7'], ['g8','g6','Rg6'], ['d7','d8','Rd8'],
        ['g6','g5','Rg5'], ['d8','e8','Re8'], ['g5','g6','Rg6'], ['e8','a8','Ra8'],
        ['g6','g5','Rg5'], ['a8','c8','Rc8'], ['g5','g6','Rg6'], ['c8','c7','Rc7'],
        ['g6','g5','Rg5'], ['e7','f8','Bf8'], ['c7','f7','Rxf7'], ['g5','g6','Rg6'],
        ['f7','f8','Rxf8'], ['h7','h6','Kh6'], ['d7','d5','d5'], ['e5','d4','exd4'],
        ['d7','d8','Qd8'], ['h6','h7','Kh7'], ['d8','h4','Qh4'], ['h7','g7','Kg7'],
        ['h4','c9','Qc8+!!']
      ]
    },
    {
      id: 'opera',
      title: 'The Opera Game',
      event: 'Paris, 1858',
      white: 'Morphy', wElo: '2700', wIcon: '♔',
      black: 'Duke/Count', bElo: '2300', bIcon: '♚',
      moves: [
        ['e2','e4','e4'], ['e7','e5','e5'], ['g1','f3','Nf3'], ['d7','d6','d6'],
        ['d2','d4','d4'], ['c8','g4','Bg4'], ['d4','e5','dxe5'], ['g4','f3','Bxf3'],
        ['d1','f3','Qxf3'], ['d6','e5','dxe5'], ['f1','c4','Bc4'], ['g8','f6','Nf6'],
        ['f3','b3','Qb3'], ['d8','e7','Qe7'], ['b1','c3','Nc3'], ['c7','c6','c6'],
        ['c1','g5','Bg5'], ['b7','b5','b5'], ['c3','b5','Nxb5'], ['c6','b5','cxb5'],
        ['c4','b5','Bxb5+'], ['b8','d7','Nbd7'], ['e1','c1','O-O-O'], ['a8','d8','Rd8'],
        ['d1','d7','Rxd7'], ['d8','d7','Rxd7'], ['h1','d1','Rd1'], ['e7','e6','Qe6'],
        ['b5','d7','Bxd7+'], ['f6','d7','Nxd7'], ['b3','b8','Qb8+'], ['d7','b8','Nxb8'],
        ['d1','d8','Rd8#']
      ]
    }
  ];

  /* ── State ──────────────────────────────────────────────────────────── */
  let activeGame  = GAMES[0];
  let board       = {};
  let currentMove = -1;
  let autoTimer   = null;
  let speed       = 1400;
  let isPlaying   = false;
  let SQ          = 0;
  let boardEl     = null;

  function toXY(sq) {
    return {
      x: (sq.charCodeAt(0) - 97) * SQ,
      y: (8 - parseInt(sq[1])) * SQ
    };
  }

  /* ── Castling Helper ────────────────────────────────────────────────── */
  function getCastlingRookMove(from, to) {
    if (from === 'e1' && to === 'g1') return ['h1', 'f1'];
    if (from === 'e1' && to === 'c1') return ['a1', 'd1'];
    if (from === 'e8' && to === 'g8') return ['h8', 'f8'];
    if (from === 'e8' && to === 'c8') return ['a8', 'd8'];
    return null;
  }

  /* ── Main Init ──────────────────────────────────────────────────────── */
  function init() {
    const container = document.getElementById('main-chessboard');
    if (!container) return;

    board       = Object.assign({}, INIT_POS);
    currentMove = -1;
    isPlaying   = false;

    const parentW = container.parentElement ? container.parentElement.offsetWidth || 380 : 380;
    const BSZ = Math.min(parentW - 200, 480); 
    SQ = BSZ / 8;

    if (!document.getElementById('ck-replay-css')) {
      const s = document.createElement('style');
      s.id = 'ck-replay-css';
      s.textContent = `
        .ck-wrap{display:flex;flex-direction:column;gap:12px;font-family:'DM Sans',sans-serif;max-width:700px;background:#0c0a08;padding:24px;border-radius:12px;border:8px solid #1c1917;box-shadow:0 30px 60px rgba(0,0,0,0.5);}
        .ck-header{display:flex;align-items:center;gap:15px;padding:0 0 15px 0;color:#fff;border-bottom:1px solid rgba(255,255,255,0.05);}
        .ck-player{display:flex;align-items:center;gap:10px;flex:1;}
        .ck-avatar{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;background:#fff;color:#000;}
        .ck-pname{font-weight:700;font-size:.95rem;line-height:1.2;}
        .ck-pelo{font-size:.75rem;opacity:.5;}
        .ck-center{text-align:center;flex-shrink:0;}
        .ck-live{display:inline-block;background:#ef4444;color:#fff;font-size:.6rem;font-weight:800;padding:2px 8px;border-radius:20px;letter-spacing:1px;animation:ck-pulse 1.8s ease-in-out infinite;}
        .ck-event{font-size:.65rem;opacity:.4;margin-top:2px;}
        .ck-layout{display:flex;gap:20px;align-items:flex-start;padding:10px 0;}
        #ck-board{position:relative;flex-shrink:0;background:#3d2b1f;border:2px solid #3d2b1f;border-radius:2px;overflow:visible;}
        .ck-sq{position:absolute;}
        .ck-sq-light{background:#F0D9B5;}
        .ck-sq-dark{background:#B58863;}
        .ck-coord{position:absolute;font-size:11px;font-weight:800;pointer-events:none;color:#F59E0B;opacity:0.8;}
        .ck-coord-v{left:-18px;top:2px;}
        .ck-coord-h{bottom:-18px;right:4px;}
        .ck-piece{position:absolute;display:flex;align-items:center;justify-content:center;z-index:10;user-select:none;transition:all .4s ease;filter:drop-shadow(0 6px 12px rgba(0,0,0,0.8));}
        .ck-hl{position:absolute;pointer-events:none;z-index:7;}
        .ck-hl-from{background:rgba(217,119,6,0.3);}
        .ck-hl-to{background:rgba(217,119,6,0.5);}
        .ck-movelist{overflow-y:auto;background:transparent;padding:0;flex:1;}
        .ck-movelist::-webkit-scrollbar{width:5px;}
        .ck-movelist::-webkit-scrollbar-thumb{background:rgba(245,158,11,0.4);border-radius:3px;}
        .ck-ml-row{display:flex;align-items:center;padding:2px 0;}
        .ck-ml-num{font-size:.75rem;color:#666;font-weight:700;width:32px;text-align:right;padding-right:12px;}
        .ck-ml-mv{flex:1;font-size:.8rem;color:#fff;font-weight:700;padding:4px 8px;border-radius:4px;cursor:pointer;transition:all .2s;}
        .ck-ml-mv:hover{background:rgba(255,255,255,0.05);}
        .ck-ml-mv.active{background:#F59E0B!important;color:#000!important;box-shadow:0 4px 12px rgba(245,158,11,0.3);font-weight:800;}
        .ck-controls{display:flex;flex-direction:column;gap:12px;padding-top:15px;border-top:1px solid rgba(255,255,255,0.05);}
        .ck-btn{background:#222;color:#fff;border:none;border-radius:8px;padding:8px 12px;cursor:pointer;font-size:1.1rem;transition:all .2s;display:flex;align-items:center;justify-content:center;}
        .ck-btn:hover{background:#333;transform:translateY(-1px);}
        .ck-btn-play{background:#F59E0B!important;color:#000!important;font-weight:900;font-size:.85rem;min-width:120px;box-shadow:0 4px 15px rgba(245,158,11,0.2);}
        .ck-btn-ai{background:#10b981!important;color:#fff!important;font-weight:900;font-size:.85rem;padding:10px 18px;margin-left:auto;}
        .ck-game-select{background:#222;color:#fff;border:1px solid #333;padding:8px 12px;border-radius:8px;font-size:.85rem;min-width:180px;cursor:pointer;}
        .ck-speed-lbl{color:#555;font-size:.7rem;font-weight:700;text-transform:uppercase;margin-left:auto;letter-spacing:1px;}
        @keyframes ck-pulse{0%,100%{opacity:1}50%{opacity:.5}}
      `;
      document.head.appendChild(s);
    }

    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'ck-wrap';

    const hdr = document.createElement('div');
    hdr.className = 'ck-header';
    hdr.id = 'ck-hdr';
    wrap.appendChild(hdr);

    const layout = document.createElement('div');
    layout.className = 'ck-layout';

    boardEl = document.createElement('div');
    boardEl.id = 'ck-board';
    boardEl.style.width  = BSZ + 'px';
    boardEl.style.height = BSZ + 'px';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        sq.className = 'ck-sq ' + ((r + c) % 2 === 0 ? 'ck-sq-light' : 'ck-sq-dark');
        sq.style.cssText = `width:${SQ}px;height:${SQ}px;left:${c*SQ}px;top:${r*SQ}px;`;
        const file = String.fromCharCode(97 + c);
        const rank = 8 - r;
        sq.dataset.sq = file + rank;
        boardEl.appendChild(sq);

        if (c === 0) {
          const lbl = document.createElement('div');
          lbl.className = 'ck-coord ck-coord-v';
          lbl.textContent = rank;
          sq.appendChild(lbl);
        }
        if (r === 7) {
          const lbl = document.createElement('div');
          lbl.className = 'ck-coord ck-coord-h';
          lbl.textContent = file;
          sq.appendChild(lbl);
        }
      }
    }

    layout.appendChild(boardEl);

    const mlEl = document.createElement('div');
    mlEl.id = 'ck-movelist';
    mlEl.className = 'ck-movelist';
    mlEl.style.height = BSZ + 'px';
    layout.appendChild(mlEl);
    wrap.appendChild(layout);

    const ctrl = document.createElement('div');
    ctrl.className = 'ck-controls';
    
    let gameOpts = GAMES.map((g,i) => `<option value="${i}">${g.title}</option>`).join('');
    
    ctrl.innerHTML = `
      <div style="display:flex;width:100%;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <select class="ck-game-select" onchange="CKReplay.switchGame(this.value)">
          ${gameOpts}
        </select>
        <button class="ck-btn ck-btn-ai" onclick="CK.showToast('AI coming soon!', 'info')">♟ Play vs AI</button>
      </div>
      <div style="display:flex;width:100%;justify-content:space-between;align-items:center;">
        <div style="display:flex;gap:8px;">
          <button class="ck-btn" onclick="CKReplay.first()">⏮</button>
          <button class="ck-btn" onclick="CKReplay.prev()">◀</button>
        </div>
        
        <button class="ck-btn ck-btn-play" id="ck-playbtn" onclick="CKReplay.togglePlay()">⏸ Pause</button>
        
        <div style="display:flex;gap:8px;">
          <button class="ck-btn" onclick="CKReplay.next()">▶</button>
          <button class="ck-btn" onclick="CKReplay.last()">⏭</button>
        </div>

        <div style="display:flex;align-items:center;gap:8px;">
          <span class="ck-speed-lbl">Speed</span>
          <input type="range" min="400" max="2800" step="400" value="1400" oninput="CKReplay.setSpeed(this.value)" style="width:80px;accent-color:#F59E0B;">
        </div>
      </div>
    `;
    wrap.appendChild(ctrl);
    container.appendChild(wrap);

    loadGameData();
    setTimeout(() => startPlay(), 1200);
  }

  function mkEl(tag, cls, txt) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (txt) el.textContent = txt;
    return el;
  }

  function mkMvEl(idx) {
    const el = mkEl('div', 'ck-ml-mv', activeGame.moves[idx][2]);
    el.id = 'ck-mv-' + idx;
    el.onclick = () => { CKReplay.stop(); jumpTo(idx); };
    return el;
  }

  function loadGameData() {
    const hdr = document.getElementById('ck-hdr');
    hdr.innerHTML = `
      <div class="ck-player">
        <div class="ck-avatar">♛</div>
        <div>
          <div class="ck-pname">${activeGame.white}</div>
          <div class="ck-pelo">White · ELO ${activeGame.wElo}</div>
        </div>
      </div>
      <div class="ck-center">
        <div><span class="ck-live" id="ck-live-badge">● LIVE</span></div>
        <div class="ck-event">${activeGame.event}</div>
      </div>
      <div class="ck-player" style="justify-content:flex-end;text-align:right;">
        <div>
          <div class="ck-pname">${activeGame.black}</div>
          <div class="ck-pelo">Black · ELO ${activeGame.bElo}</div>
        </div>
        <div class="ck-avatar" style="background:#1e293b;color:#fff;">♛</div>
      </div>`;

    const mlEl = document.getElementById('ck-movelist');
    mlEl.innerHTML = '';
    const MOVES = activeGame.moves;
    for (let i = 0; i < MOVES.length; i += 2) {
      const num = Math.floor(i / 2) + 1;
      const row = document.createElement('div');
      row.className = 'ck-ml-row';
      row.appendChild(mkEl('div', 'ck-ml-num', num + '.'));
      row.appendChild(mkMvEl(i));
      if (i + 1 < MOVES.length) {
        row.appendChild(mkMvEl(i + 1));
      }
      mlEl.appendChild(row);
    }
    
    board = Object.assign({}, INIT_POS);
    currentMove = -1;
    renderBoard();
  }


  function renderBoard() {
    boardEl.querySelectorAll('.ck-piece').forEach(p => p.remove());
    boardEl.querySelectorAll('.ck-hl').forEach(h => h.remove());
    Object.entries(board).forEach(([sq, pc]) => spawnPiece(sq, pc));
  }

  function spawnPiece(sq, pc) {
    const { x, y } = toXY(sq);
    const el = document.createElement('div');
    el.className = 'ck-piece';
    el.dataset.sq = sq;
    el.innerHTML = `<img src="${PIECES[pc]}" style="width:100%;height:100%;object-fit:contain;">`;
    el.style.cssText = `left:${x}px;top:${y}px;width:${SQ}px;height:${SQ}px;`;
    boardEl.appendChild(el);
    return el;
  }

  function highlight(from, to, isCheck) {
    boardEl.querySelectorAll('.ck-hl').forEach(h => h.remove());
    [[from,'ck-hl-from'],[to,'ck-hl-to']].forEach(([sq, cls]) => {
      const { x, y } = toXY(sq);
      const h = document.createElement('div');
      h.className = 'ck-hl ' + cls;
      h.style.cssText = `width:${SQ}px;height:${SQ}px;left:${x}px;top:${y}px;`;
      boardEl.appendChild(h);
    });
    if (isCheck) {
      const kingColor = currentMove % 2 === 0 ? 'k' : 'K';
      const kingSq = Object.entries(board).find(([,p]) => p === kingColor)?.[0];
      if (kingSq) {
        const { x, y } = toXY(kingSq);
        const h = document.createElement('div');
        h.className = 'ck-hl ck-hl-check';
        h.style.cssText = `width:${SQ}px;height:${SQ}px;left:${x}px;top:${y}px;`;
        boardEl.appendChild(h);
      }
    }
  }

  function applyMoveAnim(idx) {
    const [from, to, notation] = activeGame.moves[idx];
    const piece = board[from];
    const isCheck = notation.includes('+') || notation.includes('#');
    const isMate  = notation.includes('#');

    if (board[to]) {
      const cap = boardEl.querySelector(`.ck-piece[data-sq="${to}"]`);
      if (cap) cap.remove();
    }

    board[to] = piece;
    delete board[from];

    const pieceEl = boardEl.querySelector(`.ck-piece[data-sq="${from}"]`);
    if (pieceEl) {
      const { x, y } = toXY(to);
      pieceEl.dataset.sq = to;
      pieceEl.style.left = x + 'px';
      pieceEl.style.top  = y + 'px';
    }
    
    // Handle Castling Rook Animation
    const rookMove = getCastlingRookMove(from, to);
    if (notation.includes('O-O') && rookMove) {
      const [rFrom, rTo] = rookMove;
      board[rTo] = board[rFrom];
      delete board[rFrom];
      const rEl = boardEl.querySelector(`.ck-piece[data-sq="${rFrom}"]`);
      if (rEl) {
        const rPos = toXY(rTo);
        rEl.dataset.sq = rTo;
        rEl.style.left = rPos.x + 'px';
        rEl.style.top  = rPos.y + 'px';
      }
    }

    highlight(from, to, isCheck);

    const annotEl = document.getElementById('ck-annot');
    if (annotEl) {
      const txt = activeGame.annot[idx];
      annotEl.textContent = txt || '';
      annotEl.style.opacity = txt ? '1' : '0';
    }

    if (isMate) {
      const badge = document.getElementById('ck-live-badge');
      if (badge) {
        badge.style.animation = 'none';
        badge.style.background = '#6b7280';
        badge.textContent = '✓ FINAL';
      }
    }
  }

  function rebuildTo(targetIdx) {
    board = Object.assign({}, INIT_POS);
    for (let i = 0; i <= targetIdx; i++) {
      const [from, to, notation] = activeGame.moves[i];
      const piece = board[from];
      if (board[to]) delete board[to];
      board[to] = piece;
      delete board[from];
      
      const rookMove = getCastlingRookMove(from, to);
      if (notation.includes('O-O') && rookMove) {
        board[rookMove[1]] = board[rookMove[0]];
        delete board[rookMove[0]];
      }
    }
    renderBoard();
    if (targetIdx >= 0) {
      const [from, to, notation] = activeGame.moves[targetIdx];
      highlight(from, to, notation.includes('+') || notation.includes('#'));
    }
  }

  function jumpTo(idx) {
    if (idx === currentMove) return;
    if (idx > currentMove) {
      for (let i = currentMove + 1; i <= idx; i++) {
        if (i < idx) {
          const [from, to, notation] = activeGame.moves[i];
          const pc = board[from];
          if (board[to]) {
            const cap = boardEl.querySelector(`.ck-piece[data-sq="${to}"]`);
            if (cap) cap.remove();
          }
          board[to] = pc;
          delete board[from];
          
          const rookMove = getCastlingRookMove(from, to);
          if (notation.includes('O-O') && rookMove) {
            board[rookMove[1]] = board[rookMove[0]];
            delete board[rookMove[0]];
          }
        } else {
          rebuildTo(idx - 1);
          applyMoveAnim(i);
        }
      }
    } else {
      rebuildTo(idx);
      if (idx >= 0) {
        const annotEl = document.getElementById('ck-annot');
        const txt = activeGame.annot[idx];
        if (annotEl) { annotEl.textContent = txt || ''; annotEl.style.opacity = txt ? '1' : '0'; }
      }
    }
    currentMove = idx;
    updateMoveList();
  }

  function updateMoveList() {
    document.querySelectorAll('.ck-ml-mv').forEach(el => el.classList.remove('active'));
    if (currentMove >= 0) {
      const el = document.getElementById('ck-mv-' + currentMove);
      const list = document.getElementById('ck-movelist');
      if (el && list) {
        el.classList.add('active');
        list.scrollTo({
          top: el.offsetTop - list.clientHeight / 2 + el.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }

  function startPlay() {
    if (isPlaying) return;
    isPlaying = true;
    const btn = document.getElementById('ck-playbtn');
    if (btn) btn.textContent = '⏸ Pause';
    const badge = document.getElementById('ck-live-badge');
    if (badge && !badge.textContent.includes('FINAL')) {
      badge.style.animation = '';
    }

    function step() {
      if (currentMove >= activeGame.moves.length - 1) {
        stopPlay();
        setTimeout(() => {
          CKReplay.first();
          setTimeout(startPlay, 1200);
        }, 3000);
        return;
      }
      currentMove++;
      applyMoveAnim(currentMove);
      updateMoveList();
      autoTimer = setTimeout(step, speed);
    }
    autoTimer = setTimeout(step, currentMove < 0 ? 600 : speed);
  }

  function stopPlay() {
    isPlaying = false;
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    const btn = document.getElementById('ck-playbtn');
    if (btn) btn.textContent = '▶ Play';
  }

  window.CKReplay = {
    switchGame(idx) {
      stopPlay();
      activeGame = GAMES[idx];
      loadGameData();
      const annotEl = document.getElementById('ck-annot');
      if (annotEl) { annotEl.textContent = ''; annotEl.style.opacity = '0'; }
      const badge = document.getElementById('ck-live-badge');
      if (badge) { badge.style.animation = ''; badge.style.background = '#ef4444'; badge.textContent = '● LIVE'; }
      setTimeout(startPlay, 800);
    },
    first() {
      stopPlay();
      board = Object.assign({}, INIT_POS);
      renderBoard();
      currentMove = -1;
      updateMoveList();
      const annotEl = document.getElementById('ck-annot');
      if (annotEl) { annotEl.textContent = ''; annotEl.style.opacity = '0'; }
      const badge = document.getElementById('ck-live-badge');
      if (badge) { badge.style.animation = ''; badge.style.background = '#ef4444'; badge.textContent = '● LIVE'; }
    },
    prev() {
      stopPlay();
      if (currentMove < 0) return;
      jumpTo(currentMove - 1);
    },
    next() {
      stopPlay();
      if (currentMove >= activeGame.moves.length - 1) return;
      jumpTo(currentMove + 1);
    },
    last() {
      stopPlay();
      jumpTo(activeGame.moves.length - 1);
    },
    togglePlay() { isPlaying ? stopPlay() : startPlay(); },
    stop() { stopPlay(); },
    setSpeed(v) { speed = parseInt(v); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 150));
  } else {
    setTimeout(init, 150);
  }

})();
