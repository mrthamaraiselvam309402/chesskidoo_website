/* assets/js/main.js -------------------------------------------------------
   Core UI & Router for ChessKidoo - 3D Autoplay Edition
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  // 1. Navigation SPA Logic
  CK.showPage = (pageId) => {
    document.querySelectorAll('.page-container').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) {
      target.classList.add('active');
      window.scrollTo(0, 0);
    }
  };

  CK.navigate = (page) => CK.showPage(page);

  // 2. 3D Autoplay Chessboard Engine
  CK.initChessboard = () => {
    const board = document.getElementById('main-chessboard');
    if (!board) return;

    // Initial Position
    const initialPos = {
      '0,0': '♖', '0,1': '♘', '0,2': '♗', '0,3': '♕', '0,4': '♔', '0,5': '♗', '0,6': '♘', '0,7': '♖',
      '1,0': '♙', '1,1': '♙', '1,2': '♙', '1,3': '♙', '1,4': '♙', '1,5': '♙', '1,6': '♙', '1,7': '♙',
      '6,0': '♟', '6,1': '♟', '6,2': '♟', '6,3': '♟', '6,4': '♟', '6,5': '♟', '6,6': '♟', '6,7': '♟',
      '7,0': '♜', '7,1': '♞', '7,2': '♝', '7,3': '♛', '7,4': '♚', '7,5': '♝', '7,6': '♞', '7,7': '♜'
    };

    // Famous Game Sequence (Morphy vs Duke of Brunswick)
    const moves = [
      { from: '6,4', to: '4,4', p: '♟' }, { from: '1,4', to: '3,4', p: '♙' },
      { from: '7,6', to: '5,5', p: '♞' }, { from: '0,3', to: '4,7', p: '♕' },
      { from: '6,3', to: '4,3', p: '♟' }, { from: '0,6', to: '2,5', p: '♘' },
      { from: '7,2', to: '3,6', p: '♝' }, { from: '1,3', to: '3,3', p: '♙' }
    ];

    board.innerHTML = '';
    const squareMap = {};

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div');
        sq.className = `board-square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
        sq.dataset.pos = `${r},${c}`;
        board.appendChild(sq);
        squareMap[`${r},${c}`] = sq;

        if (initialPos[`${r},${c}`]) {
          const piece = document.createElement('div');
          piece.className = 'piece';
          piece.innerText = initialPos[`${r},${c}`];
          sq.appendChild(piece);
        }
      }
    }

    // Autoplay Loop
    let moveIdx = 0;
    setInterval(() => {
      const move = moves[moveIdx % moves.length];
      const fromSq = squareMap[move.from];
      const toSq = squareMap[move.to];
      const piece = fromSq.querySelector('.piece');

      if (piece) {
        // Simple "jump" for now in DOM, but CSS transitions make it look smooth
        toSq.appendChild(piece);
      } else {
        // Reset board if sequence ends or breaks
        CK.initChessboard();
      }
      moveIdx++;
    }, 3000);
  };

  // 3. AI Assistant Bot
  CK.toggleChat = () => {
    const bot = document.getElementById('ai-bot-window');
    bot.style.display = bot.style.display === 'flex' ? 'none' : 'flex';
  };

  CK.sendBotMessage = (e) => {
    if (e) e.preventDefault();
    const input = document.getElementById('bot-input');
    const msg = input.value.trim();
    if (!msg) return;

    const chatBody = document.getElementById('bot-chat-body');
    chatBody.innerHTML += `<div style="text-align:right; margin-bottom:10px;"><span style="background:var(--amber); color:white; padding:8px 12px; border-radius:15px; font-size:0.85rem;">${msg}</span></div>`;
    input.value = '';

    setTimeout(() => {
      chatBody.innerHTML += `<div style="text-align:left; margin-bottom:10px;"><span style="background:var(--cream); padding:8px 12px; border-radius:15px; font-size:0.85rem;">That is a great strategic question! Our Grandmaster coaches can help you master that concept in Batch 11. ♟✨</span></div>`;
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 1000);
  };

  // Initialize
  window.addEventListener('DOMContentLoaded', () => {
    CK.initChessboard();
    
    // Reveal animations on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  });

})();