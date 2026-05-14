/* assets/js/student.js ----------------------------------------------------
   ChessKidoo Student Portal Logic
   Fully connected to CK.db layer with support for dynamic profiles, dual-curve
   rating spline charts, attendance calendar grids, and interactive mini-puzzles.
   ------------------------------------------------------------------------- */

CK.student = {
  userProfile: null,
  activePuzzleId: null,

  // List of interactive mock tactical puzzles
  puzzlesDb: [
    { id: 'P1', title: 'Back-Rank Mate', type: 'Tactics', diff: 'Easy', coach: 'Sarah Chess', due: 'Today', instruction: 'White to move. Find the back-rank checkmate!', boardSetup: 'black-king-f8-pawns-g7-h7-white-rook-d1', solution: 'd8', desc: 'Rook to d8 delivers checkmate as the Black king is trapped behind its own pawns.' },
    { id: 'P2', title: 'Tactical Fork Opportunity', type: 'Tactics', diff: 'Medium', coach: 'Sarah Chess', due: 'Tomorrow', instruction: 'White to move. Fork the black King and Rook with your Knight!', boardSetup: 'black-king-e8-rook-a8-white-knight-d5', solution: 'c7', desc: 'Knight to c7 forks both the king on e8 and the rook on a8, winning material.' },
    { id: 'P3', title: 'Smothered Mate', type: 'Endgame', diff: 'Hard', coach: 'Michael Knight', due: 'May 18', instruction: 'White to move. Deliver the famous smothered mate with your Knight!', boardSetup: 'black-king-h8-rook-g8-pawns-h7-g7-f7-white-knight-f5', solution: 'f7', desc: 'Knight to f7 delivers checkmate because the king is completely boxed in by its own pieces.' }
  ],

  async init() {
    console.log("Student Portal Initializing...");
    
    // 1. Fetch current user profile dynamically from DB layer
    const currentUser = CK.currentUser || JSON.parse(localStorage.getItem('ck_user'));
    if (!currentUser) {
      CK.showToast("Session expired. Please log in again.", "error");
      CK.showPage('login-page');
      return;
    }

    this.userProfile = await CK.db.getProfile(currentUser.id) || currentUser;
    
    // Ensure numeric values and proper defaults
    this.userProfile.rating = parseInt(this.userProfile.rating) || 800;
    this.userProfile.star = parseInt(this.userProfile.star) || 0;
    this.userProfile.puzzle = parseInt(this.userProfile.puzzle) || 0;
    this.userProfile.game = parseInt(this.userProfile.game) || 0;

    // 2. Load UI elements
    this.updateProfile();
    this.renderDashboard();
    this.renderAttendanceCalendar();
    this.renderTournamentHistory();
    this.renderPuzzlesList();
    this.renderCoachReviews();
    this.renderAchievementsTab();
    this.renderFeesGateway();
    this.renderReportCard();
    this.initCharts();
    this.startCountdown();
  },

  nav(panelId) {
    document.querySelectorAll('#student-page .p-panel').forEach(p => p.classList.remove('active'));
    
    const target = document.getElementById(`student-panel-${panelId}`);
    if (target) target.classList.add('active');
    
    document.querySelectorAll('#student-page .p-nav-item').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('onclick')?.includes(`'${panelId}'`)) {
        btn.classList.add('active');
      }
    });

    // Re-render dynamic panels when navigated to
    if (panelId === 'achievements') this.renderAchievementsTab();
    if (panelId === 'progress') this.initCharts();
    if (panelId === 'report') this.renderReportCard();
    if (panelId === 'fees') this.renderFeesGateway();
    if (panelId === 'reviews') this.renderCoachReviews();
    if (panelId === 'resources') this.renderResources();
    
    const titles = {
      home: 'My Dashboard',
      progress: 'My Progress',
      schedule: 'My Schedule',
      session: 'Join Class',
      puzzles: 'My Puzzles',
      reviews: 'Coach Reviews',
      achievements: 'Achievements',
      path: 'Adaptive Mastery Skill Tree',
      vault: 'The Replay Vault',
      fees: 'Fee Payment Gateway',
      report: 'Official Student Report Card',
      resources: 'Learning Resources',
      lab: 'PGN Stockfish Lab',
      tournaments: 'Tournaments'
    };
    document.getElementById('studentPanelTitle').innerText = titles[panelId] || 'Dashboard';
  },

  updateProfile() {
    const p = this.userProfile;
    const firstName = p.full_name ? p.full_name.split(' ')[0] : 'Champion';
    const initial = p.full_name ? p.full_name.charAt(0).toUpperCase() : '♛';

    // Sidebar details
    const sbName = document.getElementById('studentSidebarName');
    const sbSub = document.getElementById('studentSidebarSub');
    const sbAvatar = document.getElementById('studentSidebarAvatar');
    if (sbName) sbName.innerText = p.full_name || 'Chess Student';
    if (sbSub) sbSub.innerText = `${p.level || 'Beginner'} · ELO ${p.rating || 800}`;
    if (sbAvatar) sbAvatar.innerText = initial;

    // Welcome banner
    const welcomeName = document.getElementById('studentWelcomeName');
    const welcomeSub = document.getElementById('studentWelcomeSub');
    if (welcomeName) welcomeName.textContent = firstName;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    if (welcomeSub) welcomeSub.textContent = `${greeting}! You have ${p.puzzle || 3} puzzles pending and a class scheduled today. Keep pushing!`;
    
    // Main profile banner / FIDE level card details
    const ratNum = document.getElementById('studentRatingNum');
    const ratLbl = document.getElementById('studentRatingLabel');
    const curRat = document.getElementById('studentCurrentRating');
    const curLvl = document.getElementById('studentCurrentLevel');
    
    if (ratNum) ratNum.innerText = p.rating || 800;
    if (ratLbl) ratLbl.innerText = `Level: ${p.level || 'Beginner'}`;
    if (curRat) curRat.innerText = `${p.rating || 800} ELO`;
    if (curLvl) curLvl.innerText = p.level || 'Beginner';
    
    // Stats counters
    const stLess = document.getElementById('studentStatLessons');
    const stPuz = document.getElementById('studentStatPuzzles');
    const stStar = document.getElementById('studentStatStars');
    
    if (stLess) stLess.innerText = p.game || '12';
    if (stPuz) stPuz.innerText = p.puzzle || '45';
    if (stStar) stStar.innerText = p.star || '8';
    
    // Calculate attendance percentage dynamically
    this.updateAttendanceStats();
  },

  async updateAttendanceStats() {
    const logs = await CK.db.getAttendance(this.userProfile.id);
    const presentCount = logs.filter(l => l.status === 'present').length;
    const totalCount = logs.length;
    const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;
    
    const elAtt = document.getElementById('studentStatAttend');
    const elSum = document.getElementById('attendanceSummaryText');
    if (elAtt) elAtt.innerText = percentage + '%';
    if (elSum) elSum.innerText = `Present: ${presentCount} of ${totalCount} recorded sessions (${percentage}%)`;
  },

  renderDashboard() {
    // 1. Pending Puzzles table in dashboard home
    const pTable = document.getElementById('studentPendingPuzzles');
    if (pTable) {
      pTable.innerHTML = this.puzzlesDb.slice(0, 2).map(p => `
        <tr>
          <td style="font-weight:600">${p.title}</td>
          <td>${p.type}</td>
          <td><span class="p-badge ${p.diff==='Easy'?'p-badge-green':p.diff==='Medium'?'p-badge-yellow':'p-badge-red'}">${p.diff}</span></td>
          <td>${p.coach}</td>
          <td style="color:var(--p-danger)">${p.due}</td>
          <td><button class="p-btn p-btn-blue p-btn-sm" onclick="CK.student.loadAndGoToPuzzle('${p.id}')">Solve</button></td>
        </tr>
      `).join('');
    }

    // Update puzzle notification count badge in sidebar
    const badge = document.getElementById('studentPuzzleBadge');
    if (badge) badge.innerText = this.puzzlesDb.length;

    // 2. Upcoming class details
    const sTable = document.getElementById('studentUpcomingTable');
    if (sTable) {
      const schedule = [
        { date: 'Today', class: `${this.userProfile.level || 'Intermediate'} Strategy`, coach: this.userProfile.coach || 'Sarah Chess', time: '4:00 PM', dur: '60m', status: 'p-badge-green' },
        { date: 'May 15, 2026', class: 'Tactics & Calculation Workshop', coach: 'Michael Knight', time: '5:30 PM', dur: '45m', status: 'p-badge-blue' },
        { date: 'May 18, 2026', class: 'Opening Prep: Italian & Sicilian', coach: this.userProfile.coach || 'Sarah Chess', time: '4:00 PM', dur: '60m', status: 'p-badge-blue' }
      ];
      sTable.innerHTML = schedule.map(s => `
        <tr>
          <td>${s.date}</td>
          <td style="font-weight:600">${s.class}</td>
          <td>${s.coach}</td>
          <td>${s.time}</td>
          <td>${s.dur}</td>
          <td><span class="p-badge ${s.status}">${s.date==='Today'?'Upcoming':'Scheduled'}</span></td>
        </tr>
      `).join('');
    }
  },

  async renderAttendanceCalendar() {
    const calendar = document.getElementById('studentAttendanceCalendar');
    if (!calendar) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const monthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    let html = `<div style="grid-column:1/-1; font-family:var(--font-display); font-size:0.92rem; font-weight:700; color:var(--p-gold); margin-bottom:4px;">${monthName}</div>`;
    html += daysOfWeek.map(d => `<div class="p-cal-cell header">${d}</div>`).join('');

    // Fetch attendance from DB
    const logs = await CK.db.getAttendance(this.userProfile.id);
    const attendanceMap = {};
    logs.forEach(l => {
      const d = new Date(l.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        attendanceMap[d.getDate()] = l.status;
      }
    });

    for (let i = 0; i < firstDayIndex; i++) {
      html += `<div></div>`;
    }

    for (let day = 1; day <= totalDays; day++) {
      const status = attendanceMap[day];
      let cls = 'p-cal-cell';
      let content = `<div>${day}</div>`;
      let tooltip = '';
      if (status === 'present') {
        cls += ' present';
        content += `<div style="font-size:0.55rem; margin-top:1px;">✅</div>`;
        tooltip = 'Present';
      } else if (status === 'absent') {
        cls += ' absent';
        content += `<div style="font-size:0.55rem; margin-top:1px;">❌</div>`;
        tooltip = 'Absent';
      }
      html += `<div class="${cls}" title="${tooltip}">${content}</div>`;
    }

    calendar.innerHTML = html;
  },

  async renderTournamentHistory() {
    const tbody = document.getElementById('studentTournamentTable');
    if (!tbody) return;

    const tournaments = await CK.db.getTourRatings(this.userProfile.userid);
    if (!tournaments || tournaments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; opacity:0.5;">No tournament history recorded yet.</td></tr>';
      return;
    }

    tbody.innerHTML = tournaments.map(t => `
      <tr>
        <td style="font-weight:600">${t.name}</td>
        <td>${t.result}</td>
        <td style="font-weight:700; color:${t.change.startsWith('+') ? 'var(--p-teal)' : 'var(--p-danger)'}">${t.change} ELO</td>
      </tr>
    `).join('');
  },

  
  async renderResources() {
    const list = document.getElementById('studentResourcesList');
    if (!list) return;

    const myLevel = this.userProfile.level || 'Beginner';
    const docs = await CK.db.getDocuments(myLevel);

    if (!docs || docs.length === 0) {
      list.innerHTML = '<div style="opacity:0.6; padding:20px; text-align:center;">No resources assigned to your level yet. Check back soon!</div>';
      return;
    }

    list.innerHTML = docs.map(f => `
      <div class="p-resource-item">
        <div>
          <div class="p-resource-name">📄 ${f.name}</div>
          <div class="p-resource-note">📝 ${f.level} · Added by ${f.coach || 'Coach'}</div>
        </div>
        <button class="p-btn p-btn-blue p-btn-sm" onclick="CK.showToast('Downloading ${f.name}...', 'success')">Download</button>
      </div>
    `).join('');
  },

  _PUZZLE_SETUPS: {
    P1: { 'f8': '♚', 'g7': '♟', 'h7': '♟', 'd1': '♖' },
    P2: { 'e8': '♚', 'a8': '♜', 'd5': '♘' },
    P3: { 'h8': '♚', 'g8': '♜', 'h7': '♟', 'g7': '♟', 'f7': '♟', 'f5': '♘' },
  },

  _solvedPuzzles: new Set(),

  renderPuzzlesList() {
    const container = document.getElementById('puzzlesListPanel');
    if (!container) return;
    const diffColor = { Easy: 'p-badge-green', Medium: 'p-badge-yellow', Hard: 'p-badge-red' };
    container.innerHTML = this.puzzlesDb.map(p => {
      const solved = this._solvedPuzzles.has(p.id);
      return `
        <div class="p-puzzle-card ${this.activePuzzleId === p.id ? 'active' : ''}" onclick="CK.student.loadPuzzle('${p.id}')">
          <div class="p-puzzle-icon">${solved ? '✅' : '🧩'}</div>
          <div class="p-puzzle-info">
            <div class="p-puzzle-title">${p.title}</div>
            <div class="p-puzzle-sub">${p.type} · <span class="p-badge ${diffColor[p.diff] || 'p-badge-blue'}" style="font-size:0.7rem; padding:1px 6px;">${p.diff}</span></div>
          </div>
          <button class="p-btn ${solved ? 'p-btn-ghost' : 'p-btn-gold'} p-btn-sm">${solved ? 'Redo' : 'Solve'}</button>
        </div>`;
    }).join('');

    // Update stats bar
    const pzSolvedEl = document.getElementById('pzStatSolved');
    if (pzSolvedEl) pzSolvedEl.textContent = `${this._solvedPuzzles.size}/${this.puzzlesDb.length}`;
    const pzStarEl = document.getElementById('pzStatStars');
    if (pzStarEl && this.userProfile) pzStarEl.textContent = `${this.userProfile.star || 0}/5`;
  },

  loadAndGoToPuzzle(id) {
    this.nav('puzzles');
    setTimeout(() => this.loadPuzzle(id), 80);
  },

  loadPuzzle(id) {
    const p = this.puzzlesDb.find(x => x.id === id);
    if (!p) return;

    this.activePuzzleId = id;

    // Show active area, hide placeholder
    const placeholder = document.getElementById('pzPlaceholder');
    const activeArea = document.getElementById('pzActiveArea');
    if (placeholder) placeholder.style.display = 'none';
    if (activeArea) activeArea.style.display = 'flex';

    // Highlight active puzzle in list
    document.querySelectorAll('#puzzlesListPanel .p-puzzle-card').forEach(el => el.classList.remove('active'));
    const matchEl = [...document.querySelectorAll('#puzzlesListPanel .p-puzzle-card')].find(el => el.onclick && el.getAttribute('onclick') && el.getAttribute('onclick').includes(id));
    if (matchEl) matchEl.classList.add('active');

    // Update title
    const titleEl = document.getElementById('puzzleTitle');
    if (titleEl) titleEl.textContent = p.title;

    // Update instructions
    const instrEl = document.getElementById('puzzleInstructions');
    if (instrEl) instrEl.innerHTML = `
      <span class="p-badge ${p.diff === 'Easy' ? 'p-badge-green' : p.diff === 'Hard' ? 'p-badge-red' : 'p-badge-yellow'}" style="font-size:0.72rem; padding:2px 8px;">${p.type} · ${p.diff}</span>
      <p style="margin:8px 0 0; color:rgba(255,255,255,0.7);">${p.instruction}</p>
    `;

    // Hide previous feedback
    const fb = document.getElementById('puzzleFeedback');
    if (fb) { fb.style.display = 'none'; fb.className = 'pz-feedback'; fb.textContent = ''; }

    // Render board
    const boardEl = document.getElementById('studentPuzzleBoardContainer');
    if (!boardEl) return;

    const setup = this._PUZZLE_SETUPS[id] || {};
    const files = ['a','b','c','d','e','f','g','h'];
    let html = `<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:0;border:3px solid rgba(232,184,75,0.35);border-radius:10px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.55),0 0 0 1px rgba(232,184,75,0.12);">`;
    for (let r = 8; r >= 1; r--) {
      for (let f = 0; f < 8; f++) {
        const sq = files[f] + r;
        const isDark = (r + f) % 2 === 0;
        const bg = isDark ? '#b58863' : '#f0d9b5';
        const tc = isDark ? 'rgba(240,217,181,0.55)' : 'rgba(181,136,99,0.55)';
        const piece = setup[sq] || '';
        const isBlack = piece === '♚' || piece === '♜' || piece === '♟';
        const pc = isBlack ? '#0d0d1a' : (piece ? '#fff' : '');
        html += `<div style="aspect-ratio:1;background:${bg};display:flex;align-items:center;justify-content:center;font-size:clamp(1.4rem,2.5vw,2.4rem);cursor:pointer;user-select:none;position:relative;transition:filter 0.15s,transform 0.15s;" onclick="CK.student.onSquareClick('${sq}')" onmouseover="this.style.filter='brightness(1.2)';this.style.transform='scale(1.05)';" onmouseout="this.style.filter='';this.style.transform='';" title="${sq}">
          <span style="text-shadow:0 2px 5px rgba(0,0,0,0.55);color:${pc};line-height:1;">${piece}</span>
          <span style="position:absolute;bottom:1px;left:2px;font-size:0.52rem;opacity:0.5;color:${tc};font-weight:700;">${f === 0 ? r : ''}</span>
          <span style="position:absolute;bottom:1px;right:2px;font-size:0.52rem;opacity:0.5;color:${tc};font-weight:700;">${r === 1 ? files[f] : ''}</span>
        </div>`;
      }
    }
    html += `</div>`;
    boardEl.innerHTML = html;
  },

  showPuzzleHint() {
    const p = this.puzzlesDb.find(x => x.id === this.activePuzzleId);
    if (!p) return;
    const fb = document.getElementById('puzzleFeedback');
    if (!fb) return;
    const hints = {
      P1: '💡 Hint: Your rook can slide all the way up the d-file to the back rank!',
      P2: '💡 Hint: Your knight jumps in an L-shape. Look for a square that attacks both the king and rook.',
      P3: '💡 Hint: The black king is trapped in the corner by its own pieces. A knight jump can end the game!'
    };
    fb.style.display = 'block';
    fb.className = 'pz-feedback hint';
    fb.textContent = hints[p.id] || '💡 Look for forcing moves — checks, captures, and threats!';
  },

  showPuzzleSolution() {
    const p = this.puzzlesDb.find(x => x.id === this.activePuzzleId);
    if (!p) return;
    const fb = document.getElementById('puzzleFeedback');
    if (!fb) return;
    fb.style.display = 'block';
    fb.className = 'pz-feedback hint';
    fb.innerHTML = `👁 <strong>Solution:</strong> Click square <strong>${p.solution.toUpperCase()}</strong>. ${p.desc}`;
  },

  nextPuzzle() {
    const idx = this.puzzlesDb.findIndex(x => x.id === this.activePuzzleId);
    const next = this.puzzlesDb[idx + 1];
    if (next) {
      this.loadPuzzle(next.id);
    } else {
      CK.showToast('🏆 All puzzles completed! Great work!', 'success');
    }
  },

  async onSquareClick(squareId) {
    const p = this.puzzlesDb.find(x => x.id === this.activePuzzleId);
    if (!p) return;

    const fb = document.getElementById('puzzleFeedback');

    if (squareId === p.solution) {
      CK.showToast('🎉 Brilliant! Puzzle Solved!', 'success');
      this._solvedPuzzles.add(p.id);

      if (fb) {
        fb.style.display = 'block';
        fb.className = 'pz-feedback success';
        fb.innerHTML = `✅ <strong>Correct! ${p.title} solved!</strong><br><span style="font-size:0.85rem;opacity:0.85;">${p.desc}</span>`;
      }

      // Flash the solution square green
      const sqs = document.querySelectorAll('#studentPuzzleBoardContainer [title="' + squareId + '"]');
      sqs.forEach(el => { el.style.boxShadow = 'inset 0 0 0 3px #22c55e'; el.style.background = '#15803d'; });

      this.userProfile.puzzle = (parseInt(this.userProfile.puzzle) || 0) + 1;
      if ((this.userProfile.star || 0) < 5) {
        this.userProfile.star = (this.userProfile.star || 0) + 1;
      }
      await CK.db.saveProfile(this.userProfile);
      this.updateProfile();
      this.renderDashboard();
      this.renderPuzzlesList();
      this.renderAchievementsTab();
    } else {
      CK.showToast('❌ Not quite — try again!', 'warning');
      if (fb) {
        fb.style.display = 'block';
        fb.className = 'pz-feedback error';
        fb.textContent = '❌ Incorrect square. Think carefully — look for the move that forces an immediate decisive result.';
      }
      // Flash the wrong square red briefly
      const sqs = document.querySelectorAll('#studentPuzzleBoardContainer [title="' + squareId + '"]');
      sqs.forEach(el => {
        el.style.boxShadow = 'inset 0 0 0 3px #ef4444';
        setTimeout(() => { el.style.boxShadow = ''; }, 600);
      });
    }
  },

  renderCoachReviews() {
    const container = document.getElementById('studentReviewsContainer');
    if (!container) return;

    const myReviews = CK.tracker.getReviews(this.userProfile ? this.userProfile.full_name : 'Emma Wilson');

    if (!myReviews.length) {
      container.innerHTML = '<div style="opacity:0.6; padding:30px; text-align:center;">No coach reviews posted yet. Keep attending classes!</div>';
      return;
    }

    container.innerHTML = myReviews.map(r => `
      <div class="p-review-note">
        <div class="p-review-note-header">
          <span class="p-review-note-coach">🎓 ${r.coach}</span>
          <span class="p-review-note-date">${r.date}</span>
        </div>
        <p class="p-review-note-text">"${r.text}"</p>
      </div>
    `).join('');
  },

  async renderAchievementsTab() {
    const stars = this.userProfile.star || 0;
    
    // Star display
    let starStr = '';
    for (let i = 0; i < 5; i++) {
      starStr += i < stars ? '⭐' : '☆';
    }
    document.getElementById('achievementStarsDisplay').innerText = starStr;
    document.getElementById('achievementLevelProgressText').innerText = `You have earned ${stars} out of 5 stars!`;

    // Fetch actual attendance stats for dynamic milestone unlock
    const logs = await CK.db.getAttendance(this.userProfile.id);
    const presentCount = logs.filter(l => l.status === 'present').length;
    const totalCount = logs.length;
    const attendancePercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

    // Achievements grid
    const grid = document.getElementById('achievementsListGrid');
    if (grid) {
      const achievements = [
        { title: "Academy Pioneer", desc: "First-time registered academy member.", icon: "🎖️", unlocked: true },
        { title: "Puzzle Prodigy", desc: `Solve 20+ academy puzzles (Current: ${this.userProfile.puzzle}).`, icon: "🧠", unlocked: this.userProfile.puzzle >= 20 },
        { title: "Century Contender", desc: `Surpass 1000+ rating on the academy (Current: ${this.userProfile.rating}).`, icon: "👑", unlocked: this.userProfile.rating >= 1000 },
        { title: "Flawless Learner", desc: `Surpass 90% attendance record (Current: ${attendancePercentage}%).`, icon: "📚", unlocked: attendancePercentage >= 90 }
      ];

      grid.innerHTML = achievements.map(a => `
        <div class="p-achievement-card ${a.unlocked ? 'unlocked' : 'locked'}">
          <div class="p-achievement-icon" style="${!a.unlocked ? 'filter:grayscale(1)' : ''}">${a.icon}</div>
          <div>
            <div class="p-achievement-title">${a.title}</div>
            <div class="p-achievement-desc">${a.desc}</div>
          </div>
          ${a.unlocked ? '<span class="p-badge p-badge-gold" style="margin-left:auto; flex-shrink:0;">Unlocked</span>' : ''}
        </div>
      `).join('');
    }

    // Certificate details
    const hasCert = this.userProfile.certificate && this.userProfile.certificate !== "";
    document.getElementById('certificateDownloadStatus').innerText = hasCert 
      ? `Congratulations on completing your ${this.userProfile.level || 'Beginner'} training! Your certificate is ready.`
      : `Complete all assignments and raise your star rating to 5 to unlock your official graduation certificate. Current stars: ${stars}/5.`;
    
    const downloadBtn = document.getElementById('downloadCertBtn');
    if (downloadBtn) {
      downloadBtn.disabled = !hasCert;
      if (!hasCert) {
        downloadBtn.className = "p-btn p-btn-ghost";
        downloadBtn.style.opacity = '0.3';
      } else {
        downloadBtn.className = "p-btn p-btn-gold";
        downloadBtn.style.opacity = '1';
      }
    }
  },

  async initCharts() {
    const ctx = document.getElementById('ratingChart')?.getContext('2d');
    if (!ctx) return;

    // Fetch historical ratings from DB
    const history = await CK.db.getRatings(this.userProfile.userid);
    
    let labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Now'];
    let onlineData = [800, 850, 920, 1050, 1100, 1120];
    let intData = [0, 0, 1000, 1050, 1080, 1100];

    if (history && history.length > 0) {
      labels = history.map(h => {
        const d = new Date(h.date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      onlineData = history.map(h => h.online || this.userProfile.rating);
      intData = history.map(h => h.international || 0);
    }

    // Destroy existing chart if present to prevent rendering bugs
    if (window.studentRatingChartInstance) {
      window.studentRatingChartInstance.destroy();
    }

    window.studentRatingChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Online Chess Rating',
            data: onlineData,
            borderColor: '#5b9cf6',
            backgroundColor: 'rgba(91,156,246,0.06)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#5b9cf6',
            pointRadius: 4
          },
          {
            label: 'International / FIDE Rating',
            data: intData,
            borderColor: '#e8b84b',
            backgroundColor: 'rgba(232,184,75,0.03)',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4,
            fill: false,
            pointBackgroundColor: '#e8b84b',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            display: true,
            labels: { color: '#7a8499', boxWidth: 15, font: { size: 11 } }
          } 
        },
        scales: { 
          y: { 
            grid: { color: 'rgba(255,255,255,0.05)' }, 
            ticks: { color: '#7a8499' } 
          }, 
          x: { 
            grid: { display: false }, 
            ticks: { color: '#7a8499' } 
          } 
        }
      }
    });
  },

  startCountdown() {
    const el = document.getElementById('studentCountdown');
    if (!el) return;

    const p = this.userProfile || {};
    const scheduleRaw = p.schedule || '17:00';
    const coach = p.coach || 'Sarah Chess';
    const level = p.level || 'Intermediate';

    // Parse schedule into a Date for today
    const parseScheduleTime = (raw) => {
      const match = raw.match(/(\d{1,2}):(\d{2})/);
      if (!match) return null;
      const d = new Date();
      d.setHours(parseInt(match[1]), parseInt(match[2]), 0, 0);
      return d;
    };

    const classTime = parseScheduleTime(scheduleRaw);
    const now = new Date();

    let displayTime = '5:00 PM';
    let minsUntil = 45;

    if (classTime) {
      const diff = classTime - now;
      if (diff > 0) {
        minsUntil = Math.round(diff / 60000);
      } else {
        minsUntil = 0;
      }
      displayTime = classTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    const nameEl = document.getElementById('nextClassTime');
    const classEl = document.getElementById('nextClassName');
    const subEl = document.getElementById('nextClassSub');
    if (nameEl) nameEl.innerText = displayTime;
    if (classEl) classEl.innerText = `${level} Strategy Session`;
    if (subEl) subEl.innerText = `with Coach ${coach}`;

    if (window.studentCountdownTimer) clearInterval(window.studentCountdownTimer);

    const tick = () => {
      const remaining = classTime ? Math.max(0, Math.round((classTime - new Date()) / 60000)) : minsUntil;
      el.innerText = remaining > 0 ? `Starts in ${remaining}m` : 'Starting now!';
    };
    tick();
    window.studentCountdownTimer = setInterval(tick, 60000);
  },

  joinClass() {
    CK.showToast("Opening secure class session with Coach...", "success");
    document.getElementById('studentSessionTitle').innerText = `Connecting to '${this.userProfile ? this.userProfile.level : 'Intermediate'} Strategy' Meeting...`;
    
    const joinBtn = document.getElementById('studentJoinBtn');
    joinBtn.innerText = "Connecting...";
    joinBtn.disabled = true;

    setTimeout(() => {
      CK.showToast("Successfully connected! Opening Google Meet class room.", "success");
      joinBtn.innerText = "Connected";
      
      const links = window.CK && CK.batchManager ? CK.batchManager.getLinks() : {};
      const meetUrl = links[this.userProfile ? this.userProfile.level : 'Intermediate'] || "https://meet.google.com/abc-defg-hij";
      window.open(meetUrl, '_blank');
      
      setTimeout(() => {
        joinBtn.innerText = "▶ Rejoin Class Room";
        joinBtn.disabled = false;
        document.getElementById('studentSessionTitle').innerText = "Class session is currently active!";
      }, 3000);
    }, 1500);
  },

  renderReportCard() {
    const p = this.userProfile || {};
    const rc = p.report_card || {
      opening: 84,
      middlegame: 76,
      tactics: 88,
      endgame: 62,
      time: 71,
      sports: 95,
      remarks: "Excellent concentration and tactical calculation. Shows great promise when navigating complex middlegame positions. Focus on active rook placements in pawn endgames.",
      goals: ["Participate in State Level Rapid U-14", "Master Lucena and Philidor Rook Endgames", "Maintain blunder rate under 3% in tournaments"]
    };

    const getGrade = (mark) => {
      if (mark >= 90) return 'A+';
      if (mark >= 80) return 'A';
      if (mark >= 70) return 'B';
      if (mark >= 60) return 'C';
      return 'D';
    };

    const elBody = document.querySelector('#student-panel-report .p-card-body');
    if (elBody) {
      elBody.innerHTML = `
        <div class="report-card-wrapper" id="printableReportCard">
          <!-- Crest Header -->
          <div class="rc-crest">
            <div class="rc-crest-icon">♔</div>
            <h1 class="rc-title">ChessKidoo Academy</h1>
            <div class="rc-subtitle">Official Student Performance Report</div>
          </div>

          <!-- Student Profile Block -->
          <div class="rc-student-block">
            <div class="rc-student-info">
              <div class="rc-info-item">
                <span class="rc-info-label">Student Name</span>
                <span class="rc-info-val">${p.full_name || 'Emma Wilson'}</span>
              </div>
              <div class="rc-info-item">
                <span class="rc-info-label">Current Level</span>
                <span class="rc-info-val">${p.level || 'Intermediate'}</span>
              </div>
              <div class="rc-info-item">
                <span class="rc-info-label">Assigned Coach</span>
                <span class="rc-info-val">${p.coach || 'Sarah Chess'}</span>
              </div>
              <div class="rc-info-item">
                <span class="rc-info-label">Academic Term</span>
                <span class="rc-info-val">Summer Term 2026</span>
              </div>
            </div>
            <div class="rc-rating-badge">
              <div class="rc-rating-val">${p.rating || 1120}</div>
              <div class="rc-rating-label">FIDE / ELO Rating</div>
            </div>
          </div>

          <!-- Subject-Wise Assessment -->
          <div class="rc-section-title">Subject-Wise Assessment</div>
          <table class="rc-table">
            <thead>
              <tr>
                <th>Curriculum Subject</th>
                <th>Proficiency Mini-Bar</th>
                <th>Score</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Opening Theory & Repertoire</td>
                <td><div class="rc-bar-wrap"><div class="rc-bar-fill" style="width:${rc.opening}%"></div></div></td>
                <td>${rc.opening}/100</td>
                <td class="rc-grade">${getGrade(rc.opening)}</td>
              </tr>
              <tr>
                <td>Middlegame Strategy & Planning</td>
                <td><div class="rc-bar-wrap"><div class="rc-bar-fill" style="width:${rc.middlegame}%"></div></div></td>
                <td>${rc.middlegame}/100</td>
                <td class="rc-grade">${getGrade(rc.middlegame)}</td>
              </tr>
              <tr>
                <td>Tactical Awareness & Calculation</td>
                <td><div class="rc-bar-wrap"><div class="rc-bar-fill" style="width:${rc.tactics}%"></div></div></td>
                <td>${rc.tactics}/100</td>
                <td class="rc-grade">${getGrade(rc.tactics)}</td>
              </tr>
              <tr>
                <td>Endgame Technique & Precision</td>
                <td><div class="rc-bar-wrap"><div class="rc-bar-fill" style="width:${rc.endgame}%"></div></div></td>
                <td>${rc.endgame}/100</td>
                <td class="rc-grade">${getGrade(rc.endgame)}</td>
              </tr>
              <tr>
                <td>Time Management & Board Control</td>
                <td><div class="rc-bar-wrap"><div class="rc-bar-fill" style="width:${rc.time}%"></div></div></td>
                <td>${rc.time}/100</td>
                <td class="rc-grade">${getGrade(rc.time)}</td>
              </tr>
              <tr>
                <td>Sportsmanship & Tournament Etiquette</td>
                <td><div class="rc-bar-wrap"><div class="rc-bar-fill" style="width:${rc.sports}%"></div></div></td>
                <td>${rc.sports}/100</td>
                <td class="rc-grade">${getGrade(rc.sports)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Coach's Remarks -->
          <div class="rc-section-title">Coach's Diagnostic Remarks</div>
          <div class="rc-remarks-box">
            <div class="rc-remarks-content">"${rc.remarks}"</div>
          </div>

          <!-- Next Term Goals -->
          <div class="rc-section-title">Goals for Next Term</div>
          <div class="rc-goals-grid">
            ${rc.goals.map(g => `<div class="rc-goal-item"><span class="rc-goal-check">✓</span><span>${g}</span></div>`).join('')}
          </div>

          <!-- Signatures -->
          <div class="rc-signatures">
            <div class="rc-sig-box">
              <div class="rc-sig-line">${p.coach || 'Sarah Chess'}</div>
              <div class="rc-sig-title">Master Coach Signature</div>
            </div>
            <div class="rc-sig-box">
              <div class="rc-sig-line">Dr. V. Hariharan</div>
              <div class="rc-sig-title">Academy Director</div>
            </div>
          </div>
        </div>
      `;
    }
  },

  renderFeesGateway() {
    const p = this.userProfile || {};
    const status = p.status || 'Pending';
    const tuition = parseInt(p.fee) || 4000;
    const gst = Math.round(tuition * 0.18);
    const total = tuition + gst;
    const isPaid = status === 'Paid';

    const fmt = n => '₹' + n.toLocaleString('en-IN');

    // Populate order summary
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('payStudentName', 'Student: ' + (p.full_name || 'Chess Student'));
    set('payBatch', p.batch || 'Advanced FIDE Masterclass');
    set('payLevel', p.level || 'Intermediate');
    set('payTuition', fmt(tuition));
    set('payGst', fmt(gst));
    set('payTotal', fmt(total));
    set('payAmountDisplay', fmt(total));

    const badge = document.getElementById('payStatusBadge');
    if (badge) {
      badge.textContent = isPaid ? '✅ Paid' : '⚡ Pending';
      badge.className = 'pay-status-badge ' + (isPaid ? 'paid' : 'pending');
    }

    const formCard = document.getElementById('payFormCard');
    const successCard = document.getElementById('paySuccessCard');

    if (isPaid) {
      if (formCard) formCard.style.display = 'none';
      if (successCard) {
        successCard.style.display = 'block';
        const box = document.getElementById('payReceiptBox');
        if (box && !box.dataset.filled) {
          box.dataset.filled = '1';
          box.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>Txn ID</span><span>${p.last_txn_id || 'CK_TXN_—'}</span></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>Amount</span><span>${fmt(total)}</span></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span>Date</span><span>${p.paid_date || new Date().toLocaleDateString('en-GB')}</span></div>
            <div style="display:flex;justify-content:space-between;"><span>Method</span><span>${p.pay_method || 'Razorpay'}</span></div>
          `;
        }
      }
    } else {
      if (formCard) formCard.style.display = 'block';
      if (successCard) successCard.style.display = 'none';
    }
  },

  selectPayMethod(el, method) {
    document.querySelectorAll('#student-panel-fees .pay-method').forEach(m => m.classList.remove('active'));
    if (el) el.classList.add('active');
    this._selectedPayMethod = method;
  },

  async processPayment() {
    const termsCheck = document.getElementById('payTermsCheck');
    if (!termsCheck || !termsCheck.checked) {
      CK.showToast('Please accept the Terms of Service before proceeding.', 'warning');
      return;
    }

    if (!window.Razorpay) {
      CK.showToast('Payment gateway is loading. Please try again in a moment.', 'warning');
      return;
    }

    const p = this.userProfile || {};
    const tuition = parseInt(p.fee) || 4000;
    const gst = Math.round(tuition * 0.18);
    const total = tuition + gst;

    const options = {
      key: window.CK_RAZORPAY_KEY || 'rzp_test_PLACEHOLDER',
      amount: total * 100, // paise
      currency: 'INR',
      name: 'ChessKidoo Academy',
      description: (p.batch || 'Chess Training') + ' — ' + (p.level || 'Intermediate') + ' Batch',
      image: 'assets/img/logo.png',
      handler: response => CK.student.onPaymentSuccess(response),
      prefill: {
        name: p.full_name || '',
        email: p.email || '',
        contact: p.phone_number || p.phone || ''
      },
      notes: {
        student_id: p.id || '',
        batch: p.batch || ''
      },
      theme: { color: '#D97706' },
      modal: {
        ondismiss: () => CK.showToast('Payment cancelled.', 'warning')
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', err => {
        CK.showToast('Payment failed: ' + (err.error?.description || 'Unknown error'), 'error');
      });
      rzp.open();
    } catch (e) {
      CK.showToast('Could not open payment gateway. Please refresh and try again.', 'error');
    }
  },

  async onPaymentSuccess(response) {
    const p = this.userProfile;
    if (p) {
      p.status = 'Paid';
      p.last_txn_id = response.razorpay_payment_id || ('CK_TXN_' + Math.floor(1e8 + Math.random() * 9e8));
      p.paid_date = new Date().toLocaleDateString('en-GB');
      p.pay_method = this._selectedPayMethod || 'Razorpay';
      p.due_date = '14-Jun-2026';
      await CK.db.saveProfile(p);
    }
    CK.showToast('Payment successful! Your account has been updated.', 'success');
    this.renderFeesGateway();
    if (window.CK && CK.admin && typeof CK.admin.loadStudents === 'function') {
      CK.admin.loadStudents();
    }
  },

  downloadReceipt() {
    const p = this.userProfile || {};
    const name = p.full_name ? p.full_name.toUpperCase() : 'SAI';
    const level = p.level || 'Beginner';
    const rating = p.rating || 800;
    const coach = p.coach ? p.coach.toUpperCase() : 'YOGESH';
    const feeAmount = p.fee || 1600;
    const dateStr = new Date().toLocaleDateString('en-GB');

    const words = feeAmount === 1600 ? 'One Thousand Six Hundred Rupees Only' :
                  feeAmount === 2200 ? 'Two Thousand Two Hundred Rupees Only' :
                  feeAmount === 4500 ? 'Four Thousand Five Hundred Rupees Only' :
                  `${feeAmount} Rupees Only`;

    const receiptWin = window.open('', '_blank', 'width=800,height=950');
    receiptWin.document.write(`
      <html>
        <head>
          <title>ChessKidoo Official Payment Receipt</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Montserrat', sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 0;
              background: #fff;
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
            .receipt-container {
              max-width: 720px;
              margin: 0 auto;
              background: #fff;
              border: 1px solid #e2e8f0;
              box-sizing: border-box;
              position: relative;
              overflow: hidden;
            }
            .r-header {
              background: #b4831f !important;
              color: #000;
              padding: 35px 20px 25px 20px;
              text-align: center;
            }
            .r-title-brand {
              font-family: 'Cinzel', serif;
              font-size: 2.4rem;
              font-weight: 700;
              letter-spacing: 5px;
              margin: 0 0 8px 0;
            }
            .r-slogan {
              font-style: italic;
              font-family: serif;
              font-size: 1.1rem;
              margin: 0 0 15px 0;
            }
            .r-contact {
              font-size: 0.9rem;
              font-weight: 600;
              display: flex;
              justify-content: center;
              gap: 25px;
            }
            .r-subhead {
              background: #f8fafc;
              text-align: center;
              padding: 16px;
              font-family: 'Cinzel', serif;
              font-size: 1.4rem;
              font-weight: 700;
              letter-spacing: 8px;
              border-bottom: 1px solid #cbd5e1;
            }
            .r-meta {
              display: flex;
              justify-content: space-between;
              padding: 16px 30px;
              font-size: 0.95rem;
              border-bottom: 1px solid #cbd5e1;
            }
            .r-body {
              padding: 30px;
              position: relative;
            }
            .watermark {
              position: absolute;
              top: 15%;
              right: 10%;
              font-size: 8rem;
              font-weight: 900;
              color: rgba(0, 201, 167, 0.08);
              border: 8px solid rgba(0, 201, 167, 0.08);
              border-radius: 16px;
              padding: 10px 40px;
              transform: rotate(-15deg);
              pointer-events: none;
              letter-spacing: 15px;
            }
            .sec-title {
              font-size: 1rem;
              font-weight: 700;
              color: #b4831f;
              letter-spacing: 2px;
              margin-bottom: 15px;
              text-transform: uppercase;
            }
            .r-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 35px;
            }
            .r-table td {
              padding: 10px 0;
              font-size: 0.95rem;
              border-bottom: 1px dashed #cbd5e1;
            }
            .r-table td.lbl {
              color: #64748b;
            }
            .r-table td.val {
              text-align: right;
              font-weight: 700;
              color: #0f172a;
            }
            .total-box {
              border-top: 2px solid #b4831f;
              border-bottom: 2px solid #b4831f;
              padding: 20px 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin: 10px 0 30px 0;
            }
            .total-lbl {
              font-size: 1.2rem;
              font-weight: 700;
            }
            .total-val {
              font-size: 2rem;
              font-weight: 700;
              color: #0f172a;
            }
            .words {
              font-style: italic;
              color: #475569;
              font-size: 0.95rem;
              margin-top: -15px;
              padding-left: 30px;
              margin-bottom: 40px;
            }
            .r-footer {
              text-align: center;
              padding: 30px;
              font-size: 0.85rem;
              color: #64748b;
              border-top: 1px solid #cbd5e1;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="r-header">
              <div class="r-title-brand">CHESSKIDOO ACADEMY</div>
              <div class="r-slogan">Building Champions, One Move at a Time</div>
              <div class="r-contact"><span>📞 +91 88257 31470</span><span>✉️ Chesskidoo37@gmail.com</span></div>
            </div>
            <div class="r-subhead">OFFICIAL RECEIPT</div>
            <div class="r-meta">
              <div>Receipt No: <strong>CK-8C1561</strong></div>
              <div>Date: <strong>${dateStr}</strong></div>
            </div>
            <div class="r-body">
              <div class="watermark">PAID</div>
              
              <div class="sec-title">STUDENT DETAILS</div>
              <table class="r-table">
                <tr><td class="lbl">Name</td><td class="val">${name}</td></tr>
                <tr><td class="lbl">Level</td><td class="val">${level}</td></tr>
                <tr><td class="lbl">ELO Rating</td><td class="val">${rating}</td></tr>
                <tr><td class="lbl">Coach</td><td class="val">${coach}</td></tr>
              </table>

              <div class="sec-title">PAYMENT DETAILS</div>
              <table class="r-table">
                <tr><td class="lbl">Tuition Fee</td><td class="val">₹ ${feeAmount.toLocaleString()}</td></tr>
                <tr><td class="lbl">Payment Mode</td><td class="val">Online</td></tr>
                <tr><td class="lbl">Status</td><td class="val" style="color:#16a34a;">✓ SUCCESS</td></tr>
              </table>

              <div class="total-box">
                <div class="total-lbl">Total Amount Paid</div>
                <div class="total-val">₹ ${feeAmount.toLocaleString()}</div>
              </div>
              <div class="words">${words}</div>
            </div>
            <div class="r-footer">
              <p style="margin:0 0 5px 0;">This is a computer-generated receipt. No signature required.</p>
              <p style="margin:0 0 15px 0;">For queries, contact Chesskidoo37@gmail.com</p>
              <div style="font-family:'Cinzel',serif; font-weight:700; color:#b4831f; font-size:1.1rem; font-style:italic;">♟ Thank you for your patronage! ♟</div>
            </div>
          </div>
          <script>
            setTimeout(() => window.print(), 500);
          </script>
        </body>
      </html>
    `);
    receiptWin.document.close();
  },

  downloadCertificate() {
    if (!this.userProfile.certificate) {
      CK.showToast("No certificate has been uploaded for this account.", "warning");
      return;
    }

    CK.showToast("Downloading Level Completion Certificate...", "success");
    // Dynamically retrieve public download URL from bucket or generate mock certificate
    if (window.supabaseClient) {
      const { data } = window.supabaseClient.storage.from('documents').getPublicUrl(this.userProfile.certificate);
      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank');
        return;
      }
    }
    
    // Fallback to static mock certificate window
    const certWindow = window.open("", "_blank");
    certWindow.document.write(`
      <html>
        <head>
          <title>ChessKidoo Graduation Certificate</title>
          <style>
            body { background: #111; color: #fff; font-family: 'DM Sans', sans-serif; text-align: center; padding: 40px; }
            .cert-border { border: 10px double var(--p-gold, #e8b84b); max-width: 800px; margin: 0 auto; padding: 60px; background: #1e2530; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            h1 { font-family: 'Playfair Display', serif; font-size: 3rem; color: #e8b84b; margin-top: 0; }
            h2 { font-size: 1.5rem; margin-bottom: 40px; text-transform: uppercase; letter-spacing: 2px; }
            .name { font-size: 2.5rem; font-weight: bold; border-bottom: 2px solid #5b9cf6; width: fit-content; margin: 20px auto 40px; padding-bottom: 10px; }
            .desc { font-size: 1.2rem; line-height: 1.6; max-width: 600px; margin: 0 auto 40px; color: #cbd5e1; }
            .signatures { display: flex; justify-content: space-between; max-width: 500px; margin: 60px auto 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
            .sig { font-family: cursive; font-size: 1.5rem; color: #cbd5e1; }
          </style>
        </head>
        <body>
          <div class="cert-border">
            <h1>♛ ChessKidoo Academy ♛</h1>
            <h2>Certificate of Excellence</h2>
            <p>This is proudly presented to</p>
            <div class="name">${this.userProfile.full_name}</div>
            <p class="desc">for successfully completing the rigorous <strong>${this.userProfile.level} Chess Curriculum</strong>, mastering strategic thinking, endgame principles, and core tournament tactics.</p>
            <div class="signatures">
              <div>
                <div class="sig">Sarah Chess</div>
                <div style="font-size:0.8rem; margin-top:5px; opacity:0.6;">Head Coach</div>
              </div>
              <div>
                <div class="sig">ChessKidoo AI</div>
                <div style="font-size:0.8rem; margin-top:5px; opacity:0.6;">Academy Director</div>
              </div>
            </div>
          </div>
          <button onclick="window.print()" style="margin-top: 30px; background: #e8b84b; color: #000; border: none; padding: 12px 24px; font-weight: bold; border-radius: 8px; cursor: pointer;">Print Certificate</button>
        </body>
      </html>
    `);
  }
};