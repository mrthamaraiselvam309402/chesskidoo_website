/* assets/js/arena.js -------------------------------------------------------
   AI Challenge Arena — ChessKidoo
   Engine (Stockfish WASM + minimax fallback), board logic, real-time
   analysis, post-game report, and digital certificate.
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};
  const A = CK.arena = {};

  /* ─── State ─── */
  let game = null; // chess.js instance
  let boardEl = null;
  let selectedSq = null;
  let legalMoves = [];
  let currentDifficulty = 'Intermediate';
  let isPlayerTurn = true;
  let isGameOver = false;
  let isThinking = false;
  let moveHistory = [];
  let evalHistory = [];
  let classificationHistory = [];
  let capturedWhite = [];
  let capturedBlack = [];
  let stockfish = null;
  let engineReady = false;
  let useWasm = true;
  let playerColor = 'w';
  let gameStartTime = null;
  let whiteClock = 600;
  let blackClock = 600;
  let clockInterval = null;
  let activeClock = 'w';

  const DIFFICULTY_DEPTH = { Beginner: 1, Intermediate: 2, Advanced: 3, Expert: 4 };
  const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const PIECE_UNICODE = {
    w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
    b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }
  };

  /* ─── Piece-square tables (simplified) ─── */
  const PST_PAWN = [
    [0,0,0,0,0,0,0,0],
    [50,50,50,50,50,50,50,50],
    [10,10,20,30,30,20,10,10],
    [5,5,10,25,25,10,5,5],
    [0,0,0,20,20,0,0,0],
    [5,-5,-10,0,0,-10,-5,5],
    [5,10,10,-20,-20,10,10,5],
    [0,0,0,0,0,0,0,0]
  ];

  /* ─── Init ─── */
  A.init = () => {
    console.log('Arena: Initializing AI Challenge Arena...');
    game = new Chess();
    boardEl = document.getElementById('arena-board');

    if (!boardEl) {
      console.error('Arena: Board element not found!');
      return;
    }

    moveHistory = [];
    evalHistory = [];
    classificationHistory = [];
    capturedWhite = [];
    capturedBlack = [];
    selectedSq = null;
    isPlayerTurn = true;
    isGameOver = false;
    isThinking = false;
    gameStartTime = Date.now();
    whiteClock = 600;
    blackClock = 600;
    activeClock = 'w';

    console.log('Arena: Rendering board...');
    renderBoard();
    console.log('Arena: Rendering analysis panel...');
    renderAnalysisPanel();
    updateStatus('Your turn — play as White');
    console.log('Arena: Initializing engine...');
    initEngine();
    console.log('Arena: Starting clock...');
    startClock();
    console.log('Arena: Initialization complete!');
  };

  function startClock() {
    if (clockInterval) clearInterval(clockInterval);
    clockInterval = setInterval(() => {
      if (isGameOver) { clearInterval(clockInterval); return; }
      if (activeClock === 'w' && isPlayerTurn && !isThinking) {
        whiteClock = Math.max(0, whiteClock - 1);
        if (whiteClock === 0) { endGame('timeout', 'b'); return; }
      } else if (activeClock === 'b' && !isPlayerTurn && !isThinking) {
        blackClock = Math.max(0, blackClock - 1);
        if (blackClock === 0) { endGame('timeout', 'w'); return; }
      }
      updateClockDisplay();
    }, 1000);
  }

  function updateClockDisplay() {
    const wEl = document.getElementById('arena-clock-white');
    const bEl = document.getElementById('arena-clock-black');
    if (wEl) wEl.textContent = formatTime(whiteClock);
    if (bEl) bEl.textContent = formatTime(blackClock);
    const wWrap = document.getElementById('arena-clock-white-wrap');
    const bWrap = document.getElementById('arena-clock-black-wrap');
    if (wWrap) wWrap.classList.toggle('active', activeClock === 'w');
    if (bWrap) bWrap.classList.toggle('active', activeClock === 'b');
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  }

  /* ─── Engine Init ─── */
  function initEngine() {
    console.log('Arena: Initializing engine (using minimax)...');
    engineReady = true;
    useWasm = false;
    const statusEl = document.getElementById('arena-engine-status');
    if (statusEl) statusEl.textContent = 'Engine ready (built-in)';
  }

  function handleEngineMessage(e) {
    const line = e.data;
    if (line === 'readyok') {
      engineReady = true;
      const statusEl = document.getElementById('arena-engine-status');
      if (statusEl) statusEl.textContent = 'Engine ready (Stockfish)';
    }
    if (line && line.startsWith('info depth')) {
      parseEngineInfo(line);
    }
    if (line && line.startsWith('bestmove')) {
      const parts = line.split(' ');
      const bestMove = parts[1];
      if (bestMove && bestMove !== '(none)') {
        makeAIMove(bestMove);
      }
    }
  }

  function parseEngineInfo(line) {
    const parts = line.split(' ');
    let eval_ = null;
    let depth = null;
    let bestLine = [];

    const evalIdx = parts.indexOf('score');
    if (evalIdx !== -1) {
      if (parts[evalIdx + 1] === 'cp') {
        eval_ = parseInt(parts[evalIdx + 2]) / 100;
      } else if (parts[evalIdx + 1] === 'mate') {
        const mateIn = parseInt(parts[evalIdx + 2]);
        eval_ = mateIn > 0 ? 999 : -999;
      }
    }

    const depthIdx = parts.indexOf('depth');
    if (depthIdx !== -1) depth = parseInt(parts[depthIdx + 1]);

    const pvIdx = parts.indexOf('pv');
    if (pvIdx !== -1) {
      bestLine = parts.slice(pvIdx + 1, pvIdx + 4);
    }

    updateEngineDisplay(eval_, depth, bestLine);
  }

  function updateEngineDisplay(eval_, depth, bestLine) {
    const evalEl = document.getElementById('arena-eval-value');
    const depthEl = document.getElementById('arena-engine-depth');
    const lineEl = document.getElementById('arena-best-line');

    if (evalEl && eval_ !== null) {
      const sign = eval_ > 0 ? '+' : '';
      evalEl.textContent = sign + eval_.toFixed(1);
      evalEl.className = 'engine-eval-value' + (eval_ < 0 ? ' negative' : '');
    }
    if (depthEl && depth) depthEl.textContent = `Depth: ${depth}`;
    if (lineEl && bestLine.length) lineEl.textContent = `Best: ${bestLine.join(' ')}`;

    // Update evaluation bar heights
    const barWhite = document.getElementById('eval-bar-white');
    const barBlack = document.getElementById('eval-bar-black');
    if (barWhite && barBlack && eval_ !== null) {
      let whitePercent = 50 + (eval_ * 5); // +1.0 cp = 55%, -1.0 cp = 45%
      whitePercent = Math.max(5, Math.min(95, whitePercent));
      const blackPercent = 100 - whitePercent;
      barWhite.style.height = `${whitePercent}%`;
      barBlack.style.height = `${blackPercent}%`;
    }
  }

  /* ─── Board Rendering ─── */
  function renderBoard() {
    console.log('Arena: Rendering board...');
    if (!boardEl) {
      console.error('Arena: Board element not found!');
      return;
    }
    boardEl.innerHTML = '';
    const fen = game.fen();
    console.log('Arena: Current FEN:', fen);
    const parts = fen.split(' ');

    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const sq = String.fromCharCode(97 + file) + (8 - rank);
        const isLight = (rank + file) % 2 === 1;
        const sqEl = document.createElement('div');
        sqEl.className = `a-sq ${isLight ? 'light' : 'dark'}`;
        sqEl.dataset.square = sq;

        const piece = game.get(sq);
        if (piece) {
          const unicode = PIECE_UNICODE[piece.color][piece.type];
          console.log(`Arena: Piece at ${sq}: ${piece.color}${piece.type} -> ${unicode}`);
          const pieceEl = document.createElement('span');
          pieceEl.className = `a-piece piece-${piece.color}`;
          pieceEl.textContent = unicode;
          sqEl.appendChild(pieceEl);
        }

        sqEl.addEventListener('click', () => handleSquareClick(sq));
        boardEl.appendChild(sqEl);
      }
    }

    console.log('Arena: Board rendered with', boardEl.children.length, 'squares');
    highlightLastMove();
    highlightCheck();
  }

  function highlightLastMove() {
    document.querySelectorAll('.a-sq').forEach(el => {
      el.classList.remove('hl-lastmove', 'hl-selected', 'hl-legal', 'hl-legal-capture');
    });
    if (moveHistory.length > 0) {
      const last = moveHistory[moveHistory.length - 1];
      const fromEl = document.querySelector(`.a-sq[data-square="${last.from}"]`);
      const toEl = document.querySelector(`.a-sq[data-square="${last.to}"]`);
      if (fromEl) fromEl.classList.add('hl-lastmove');
      if (toEl) toEl.classList.add('hl-lastmove');
    }
  }

  function highlightCheck() {
    document.querySelectorAll('.a-sq').forEach(el => el.classList.remove('hl-check'));
    if (game.in_check()) {
      const kingSq = findKing(game.turn());
      if (kingSq) {
        const el = document.querySelector(`.a-sq[data-square="${kingSq}"]`);
        if (el) el.classList.add('hl-check');
      }
    }
  }

  function findKing(color) {
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === color) {
          return String.fromCharCode(97 + c) + (8 - r);
        }
      }
    }
    return null;
  }

  function showLegalMoves(sq) {
    document.querySelectorAll('.a-sq').forEach(el => {
      el.classList.remove('hl-legal', 'hl-legal-capture');
    });
    const moves = game.moves({ square: sq, verbose: true });
    legalMoves = moves;
    moves.forEach(m => {
      const el = document.querySelector(`.a-sq[data-square="${m.to}"]`);
      if (el) {
        if (game.get(m.to)) {
          el.classList.add('hl-legal-capture');
        } else {
          el.classList.add('hl-legal');
        }
      }
    });
  }

  /* ─── Click Handler ─── */
  function handleSquareClick(sq) {
    if (isGameOver || isThinking) return;
    if (game.turn() !== playerColor) return;

    const piece = game.get(sq);

    if (selectedSq) {
      const move = legalMoves.find(m => m.to === sq);
      if (move) {
        executePlayerMove(move);
        selectedSq = null;
        return;
      }
    }

    if (piece && piece.color === game.turn()) {
      selectedSq = sq;
      const el = document.querySelector(`.a-sq[data-square="${sq}"]`);
      document.querySelectorAll('.a-sq').forEach(e => e.classList.remove('hl-selected'));
      if (el) el.classList.add('hl-selected');
      showLegalMoves(sq);
    } else {
      selectedSq = null;
      document.querySelectorAll('.a-sq').forEach(e => {
        e.classList.remove('hl-selected', 'hl-legal', 'hl-legal-capture');
      });
    }
  }

  /* ─── Execute Player Move ─── */
  function executePlayerMove(move) {
    const fenBefore = game.fen();
    const moveResult = game.move(move);
    if (!moveResult) return;

    // Track captured pieces
    if (moveResult.captured) {
      if (moveResult.color === 'w') {
        capturedBlack.push(moveResult.captured);
      } else {
        capturedWhite.push(moveResult.captured);
      }
    }

    moveHistory.push({
      from: moveResult.from,
      to: moveResult.to,
      san: moveResult.san,
      fen: game.fen(),
      color: moveResult.color,
      captured: moveResult.captured || null
    });

    // Get engine eval for classification
    getEvalForPosition(fenBefore, moveResult.san);

    renderBoard();
    renderAnalysisPanel();
    activeClock = 'b';

    if (game.game_over()) {
      handleGameOver();
      return;
    }

    isPlayerTurn = false;
    updateStatus('AI is thinking...');
    isThinking = true;

    setTimeout(() => {
      requestAIMove();
    }, 500 + Math.random() * 1000);
  }

  /* ─── AI Move ─── */
  function requestAIMove() {
    if (isGameOver) return;

    console.log('Arena: AI thinking...');
    const depth = DIFFICULTY_DEPTH[currentDifficulty] || 2;
    const bestMove = getBestMoveMinimax(depth);
    if (bestMove) {
      console.log('Arena: AI found best move:', bestMove);
      makeAIMove(bestMove.from + bestMove.to + (bestMove.promotion || ''));
    } else {
      console.log('Arena: No best move found, using random move');
      const moves = game.moves({ verbose: true });
      if (moves.length > 0) {
        const random = moves[Math.floor(Math.random() * moves.length)];
        makeAIMove(random.from + random.to + (random.promotion || ''));
      } else {
        console.error('Arena: No moves available!');
      }
    }
  }

  function makeAIMove(moveStr) {
    if (isGameOver) return;
    isThinking = false;

    let move;
    try {
      move = game.move({
        from: moveStr.substring(0, 2),
        to: moveStr.substring(2, 4),
        promotion: moveStr.length > 4 ? moveStr[4] : 'q'
      });
    } catch (e) {
      const moves = game.moves({ verbose: true });
      if (moves.length > 0) {
        move = game.move(moves[Math.floor(Math.random() * moves.length)]);
      }
    }

    if (!move) {
      handleGameOver();
      return;
    }

    if (move.captured) {
      if (move.color === 'w') {
        capturedBlack.push(move.captured);
      } else {
        capturedWhite.push(move.captured);
      }
    }

    moveHistory.push({
      from: move.from,
      to: move.to,
      san: move.san,
      fen: game.fen(),
      color: move.color,
      captured: move.captured || null
    });

    evalHistory.push(evalHistory.length > 0 ? evalHistory[evalHistory.length - 1] : 0);

    renderBoard();
    renderAnalysisPanel();
    activeClock = 'w';

    if (game.game_over()) {
      handleGameOver();
      return;
    }

    isPlayerTurn = true;
    updateStatus('Your turn');
  }

  /* ─── Minimax Fallback ─── */
  function getBestMoveMinimax(maxDepth) {
    console.log('Arena: Getting best move with depth', maxDepth);
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) {
      console.log('Arena: No moves available');
      return null;
    }

    console.log('Arena: Evaluating', moves.length, 'moves');

    let bestMove = null;
    let bestEval = game.turn() === 'w' ? -Infinity : Infinity;
    const isMaximizing = game.turn() === 'w';

    for (const move of moves) {
      game.move(move);
      const eval_ = minimax(maxDepth - 1, -Infinity, Infinity, !isMaximizing);
      game.undo();

      if (isMaximizing) {
        if (eval_ > bestEval) {
          bestEval = eval_;
          bestMove = move;
        }
      } else {
        if (eval_ < bestEval) {
          bestEval = eval_;
          bestMove = move;
        }
      }
    }

    return bestMove || moves[0];
  }

  function minimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0) return evaluateBoard();
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) {
      if (game.in_check()) return isMaximizing ? -9999 + depth : 9999 - depth;
      return 0;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of moves) {
        game.move(move);
        const eval_ = minimax(depth - 1, alpha, beta, false);
        game.undo();
        maxEval = Math.max(maxEval, eval_);
        alpha = Math.max(alpha, eval_);
        if (beta <= alpha) break; // Beta cut-off (Pruning)
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        game.move(move);
        const eval_ = minimax(depth - 1, alpha, beta, true);
        game.undo();
        minEval = Math.min(minEval, eval_);
        beta = Math.min(beta, eval_);
        if (beta <= alpha) break; // Alpha cut-off (Pruning)
      }
      return minEval;
    }
  }

  function evaluateBoard() {
    const board = game.board();
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p) continue;
        const val = PIECE_VALUES[p.type] * 10;
        score += p.color === 'w' ? val : -val;
      }
    }
    if (game.in_check()) {
      score += game.turn() === 'w' ? -50 : 50;
    }
    return score;
  }

  /* ─── Move Classification ─── */
  function getEvalForPosition(fenBefore, playerSan) {
    if (useWasm && engineReady && stockfish) {
      stockfish.postMessage(`position fen ${fenBefore}`);
      stockfish.postMessage(`go depth ${DIFFICULTY_DEPTH[currentDifficulty] || 2}`);
      const currentMoveNum = moveHistory.length;
      setTimeout(() => {
        classifyMoveFromEval(currentMoveNum);
      }, 300);
    } else {
      const depth = DIFFICULTY_DEPTH[currentDifficulty] || 2;
      const tempGame = new Chess(fenBefore);
      const moves = tempGame.moves({ verbose: true });
      let bestEval = tempGame.turn() === 'w' ? -Infinity : Infinity;
      let bestMove = null;
      const isMax = tempGame.turn() === 'w';

      for (const m of moves) {
        tempGame.move(m);
        const ev = minimax(depth - 1, -Infinity, Infinity, !isMax);
        tempGame.undo();
        if (isMax && ev > bestEval) { bestEval = ev; bestMove = m; }
        if (!isMax && ev < bestEval) { bestEval = ev; bestMove = m; }
      }

      const playerMove = moves.find(m => m.san === playerSan);
      let playerEval = 0;
      if (playerMove) {
        tempGame.move(playerMove);
        playerEval = minimax(depth - 1, -Infinity, Infinity, !isMax);
        tempGame.undo();
      }

      const diff = isMax ? (bestEval - playerEval) : (playerEval - bestEval);
      const classification = classifyFromDiff(diff, playerMove, bestMove);
      classificationHistory.push({ san: playerSan, classification, eval: playerEval });
      evalHistory.push(playerEval);
      renderAnalysisPanel();
    }
  }

  function classifyMoveFromEval(moveNum) {
    if (classificationHistory.length > moveNum) return;
    classificationHistory.push({ san: moveHistory[moveNum]?.san || '?', classification: 'good', eval: 0 });
    evalHistory.push(0);
    renderAnalysisPanel();
  }

  function classifyFromDiff(diff, playerMove, bestMove) {
    if (diff <= 0.05) {
      if (playerMove && playerMove.captured && bestMove && !bestMove.captured) return 'brilliant';
      return 'best';
    }
    if (diff <= 0.2) return 'excellent';
    if (diff <= 0.5) return 'good';
    if (diff <= 1.0) return 'inaccuracy';
    if (diff <= 2.0) return 'mistake';
    return 'blunder';
  }

  /* ─── Analysis Panel ─── */
  function renderAnalysisPanel() {
    // Move list
    const moveListEl = document.getElementById('arena-move-list');
    if (moveListEl) {
      let html = '';
      for (let i = 0; i < moveHistory.length; i += 2) {
        const moveNum = Math.floor(i / 2) + 1;
        const whiteMove = moveHistory[i];
        const blackMove = moveHistory[i + 1];
        const wClass = classificationHistory[i]?.classification || '';
        const bClass = classificationHistory[i + 1]?.classification || '';
        html += `<div class="amove-row">
          <span class="amove-num">${moveNum}.</span>
          <span class="amove-san class-${wClass}">${whiteMove?.san || ''}</span>
          <span class="amove-san class-${bClass}">${blackMove?.san || ''}</span>
        </div>`;
      }
      moveListEl.innerHTML = html;
      moveListEl.scrollTop = moveListEl.scrollHeight;
    }

    // Captured pieces
    const capWhiteEl = document.getElementById('arena-captured-white');
    const capBlackEl = document.getElementById('arena-captured-black');
    if (capWhiteEl) {
      capWhiteEl.innerHTML = capturedWhite.map(p => `<span class="captured-piece">${PIECE_UNICODE['w'][p]}</span>`).join('');
    }
    if (capBlackEl) {
      capBlackEl.innerHTML = capturedBlack.map(p => `<span class="captured-piece">${PIECE_UNICODE['b'][p]}</span>`).join('');
    }
  }

  /* ─── Status ─── */
  function updateStatus(msg, type = '') {
    const el = document.getElementById('arena-status');
    if (el) {
      el.textContent = msg;
      el.className = 'arena-status' + (type ? ` ${type}` : '');
    }
  }

  /* ─── Game Over ─── */
  function handleGameOver() {
    isGameOver = true;
    isThinking = false;
    if (clockInterval) clearInterval(clockInterval);

    let result, resultText;
    if (game.in_checkmate()) {
      if (game.turn() === 'b') {
        result = 'win'; resultText = 'You Win! — Checkmate';
      } else {
        result = 'loss'; resultText = 'AI Wins — Checkmate';
      }
    } else if (game.in_stalemate()) {
      result = 'draw'; resultText = 'Draw — Stalemate';
    } else if (game.in_threefold_repetition()) {
      result = 'draw'; resultText = 'Draw — Repetition';
    } else if (game.insufficient_material()) {
      result = 'draw'; resultText = 'Draw — Insufficient Material';
    } else {
      result = 'draw'; resultText = 'Game Drawn';
    }

    updateStatus(resultText, 'gameover');

    setTimeout(() => {
      showPostGameReport(result);
    }, 1200);
  }

  /* ─── Post-Game Report ─── */
  function showPostGameReport(result) {
    const overlay = document.getElementById('arena-report-overlay');
    if (!overlay) return;

    const totalMoves = moveHistory.length;
    const duration = Math.floor((Date.now() - gameStartTime) / 1000);
    const durationMin = Math.floor(duration / 60);
    const durationSec = duration % 60;

    // Calculate accuracy
    const classifications = classificationHistory.map(c => c.classification);
    const weights = { brilliant: 1, best: 1, excellent: 0.9, good: 0.7, inaccuracy: 0.4, mistake: 0.2, blunder: 0 };
    let totalWeight = 0;
    classifications.forEach(c => { totalWeight += weights[c] || 0.5; });
    const accuracy = classifications.length > 0 ? Math.round((totalWeight / classifications.length) * 100) : 50;

    // Count classifications
    const counts = { brilliant: 0, best: 0, excellent: 0, good: 0, inaccuracy: 0, mistake: 0, blunder: 0 };
    classifications.forEach(c => { if (counts[c] !== undefined) counts[c]++; });

    // Performance grade
    let grade, gradeClass;
    if (accuracy >= 90) { grade = 'S'; gradeClass = 'grade-s'; }
    else if (accuracy >= 75) { grade = 'A'; gradeClass = 'grade-a'; }
    else if (accuracy >= 60) { grade = 'B'; gradeClass = 'grade-b'; }
    else if (accuracy >= 40) { grade = 'C'; gradeClass = 'grade-c'; }
    else { grade = 'D'; gradeClass = 'grade-d'; }

    // Key moments
    const keyMoments = classificationHistory
      .map((c, i) => ({ ...c, moveNum: i + 1 }))
      .filter(c => c.classification === 'blunder' || c.classification === 'mistake' || c.classification === 'brilliant');

    // Build report HTML
    const resultClass = result === 'win' ? 'win' : result === 'loss' ? 'loss' : 'draw';
    const resultLabel = result === 'win' ? '🏆 Victory' : result === 'loss' ? '💔 Defeat' : '🤝 Draw';

    overlay.innerHTML = `
      <div class="arena-report-modal">
        <div class="arena-report-header">
          <div class="arena-report-result ${resultClass}">${resultLabel}</div>
          <div class="arena-report-sub">${currentDifficulty} difficulty · ${totalMoves} moves · ${durationMin}m ${durationSec}s</div>
        </div>
        <div class="arena-report-body">
          <div class="report-stats-grid">
            <div class="report-stat-card">
              <div class="report-stat-val">${accuracy}%</div>
              <div class="report-stat-label">Accuracy</div>
            </div>
            <div class="report-stat-card">
              <div class="report-stat-val">${counts.blunder + counts.mistake}</div>
              <div class="report-stat-label">Errors</div>
            </div>
            <div class="report-stat-card">
              <div class="report-stat-val">${counts.brilliant + counts.best}</div>
              <div class="report-stat-label">Best Moves</div>
            </div>
            <div class="report-stat-card">
              <div class="report-stat-val">${grade}</div>
              <div class="report-stat-label">Grade</div>
            </div>
          </div>

          <div class="move-breakdown">
            <div class="move-breakdown-title">Move Classification</div>
            <div class="breakdown-bars">
              ${renderBreakdownBar('Brilliant', counts.brilliant, 'brilliant', 'bar-brilliant')}
              ${renderBreakdownBar('Best', counts.best, 'best', 'bar-best')}
              ${renderBreakdownBar('Excellent', counts.excellent, 'excellent', 'bar-excellent')}
              ${renderBreakdownBar('Good', counts.good, 'good', 'bar-good')}
              ${renderBreakdownBar('Inaccuracy', counts.inaccuracy, 'inaccuracy', 'bar-inaccuracy')}
              ${renderBreakdownBar('Mistake', counts.mistake, 'mistake', 'bar-mistake')}
              ${renderBreakdownBar('Blunder', counts.blunder, 'blunder', 'bar-blunder')}
            </div>
          </div>

          <div class="eval-graph-container">
            <div class="eval-graph-title">Evaluation Over Time</div>
            <div id="arena-eval-chart" style="height: 160px; background: var(--arena-surface2); border-radius: 8px; padding: 16px; color: var(--arena-text-muted); display: flex; align-items: center; justify-content: center;">Evaluation graph will be displayed here</div>
          </div>

          ${keyMoments.length > 0 ? `
          <div class="key-moments">
            <div class="key-moments-title">Key Moments</div>
            ${keyMoments.slice(0, 6).map(km => `
              <div class="key-moment-item">
                <span class="km-move">${km.moveNum}. ${km.san}</span>
                <span class="km-type ${km.classification}">${km.classification}</span>
                <span class="km-desc">${km.classification === 'brilliant' ? 'Exceptional find!' : km.classification === 'blunder' ? 'Significant error' : 'Notable inaccuracy'}</span>
              </div>
            `).join('')}
          </div>` : ''}
        </div>
        <div class="arena-report-actions">
          <button class="report-btn report-btn-secondary" onclick="CK.arena.closeReport()">Close</button>
          <button class="report-btn report-btn-secondary" onclick="CK.arena.playAgain()">Play Again</button>
          <button class="report-btn report-btn-primary" onclick="CK.arena.showCertificate('${result}', '${grade}', '${gradeClass}', ${accuracy})">🏆 View Certificate</button>
        </div>
      </div>
    `;

    overlay.classList.add('active');

    // Render eval chart (simplified for now)
    setTimeout(() => {
      const chartEl = document.getElementById('arena-eval-chart');
      if (chartEl) {
        chartEl.textContent = `Evaluation data: ${evalHistory.slice(-10).join(', ')}`;
      }
    }, 100);
  }

  function renderBreakdownBar(label, count, type, barClass) {
    const total = Math.max(moveHistory.length, 1);
    const pct = (count / total) * 100;
    return `
      <div class="breakdown-row">
        <span class="breakdown-label">${label}</span>
        <div class="breakdown-bar-wrap">
          <div class="bar-seg ${barClass}" style="width: ${pct}%"></div>
        </div>
        <span class="breakdown-count">${count}</span>
      </div>
    `;
  }



  A.closeReport = () => {
    const overlay = document.getElementById('arena-report-overlay');
    if (overlay) overlay.classList.remove('active');
  };

  A.playAgain = () => {
    A.closeReport();
    setTimeout(() => A.init(), 200);
  };

  /* ─── Certificate ─── */
  A.showCertificate = (result, grade, gradeClass, accuracy) => {
    const overlay = document.getElementById('cert-overlay');
    if (!overlay) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const certId = 'CK-' + now.getFullYear() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const playerName = 'Chess Challenger';
    const resultText = result === 'win' ? 'Victory' : result === 'loss' ? 'Defeat' : 'Draw';

    overlay.innerHTML = `
      <div class="cert-modal">
        <div class="cert-border-outer">
          <div class="cert-border-inner">
            <div class="cert-logo">♛</div>
            <div class="cert-academy-name">Chess<span>Kidoo</span></div>
            <div class="cert-title">Certificate of Achievement</div>
            <div class="cert-subtitle">AI Challenge Arena</div>
            <div class="cert-presented">This certificate is proudly presented to</div>
            <div class="cert-player-name">${playerName}</div>
            <div class="cert-details-grid">
              <div class="cert-detail-item">
                <span class="cert-detail-label">Difficulty</span>
                <span class="cert-detail-value">${currentDifficulty}</span>
              </div>
              <div class="cert-detail-item">
                <span class="cert-detail-label">Result</span>
                <span class="cert-detail-value">${resultText}</span>
              </div>
              <div class="cert-detail-item">
                <span class="cert-detail-label">Accuracy</span>
                <span class="cert-detail-value">${accuracy}%</span>
              </div>
              <div class="cert-detail-item">
                <span class="cert-detail-label">Moves Played</span>
                <span class="cert-detail-value">${moveHistory.length}</span>
              </div>
            </div>
            <div class="cert-grade ${gradeClass}">${grade}</div>
            <div class="cert-id">Certificate ID: ${certId}</div>
            <div class="cert-date">${dateStr}</div>
            <div class="cert-actions">
              <button class="cert-btn cert-btn-print" onclick="window.print()">🖨️ Print / Save PDF</button>
              <button class="cert-btn cert-btn-close" onclick="CK.arena.closeCertificate()">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;

    overlay.classList.add('active');
  };

  A.closeCertificate = () => {
    const overlay = document.getElementById('cert-overlay');
    if (overlay) overlay.classList.remove('active');
  };

  /* ─── Game Controls ─── */
  A.resignGame = () => {
    if (isGameOver) return;
    isGameOver = true;
    isThinking = false;
    if (clockInterval) clearInterval(clockInterval);
    updateStatus('You resigned — AI Wins', 'gameover');
    setTimeout(() => showPostGameReport('loss'), 800);
  };

  A.offerDraw = () => {
    if (isGameOver) return;
    isGameOver = true;
    isThinking = false;
    if (clockInterval) clearInterval(clockInterval);
    updateStatus('Game Drawn by agreement', 'gameover');
    setTimeout(() => showPostGameReport('draw'), 800);
  };

  A.newGame = () => {
    if (clockInterval) clearInterval(clockInterval);
    A.closeReport();
    A.closeCertificate();
    A.init();
  };

  A.setDifficulty = (level) => {
    currentDifficulty = level;
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === level);
    });
  };

  /* ─── Navigate back to home ─── */
  A.goHome = () => {
    if (stockfish) {
      try { stockfish.terminate(); } catch(e) {}
      stockfish = null;
    }
    if (clockInterval) clearInterval(clockInterval);
    CK.showPage('landing-page');
  };

})();
