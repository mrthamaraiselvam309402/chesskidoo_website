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
    
    const titles = {
      home: 'My Dashboard',
      progress: 'My Progress',
      schedule: 'My Schedule',
      session: 'Join Class',
      puzzles: 'My Puzzles',
      reviews: 'Coach Reviews',
      achievements: 'Achievements'
    };
    document.getElementById('studentPanelTitle').innerText = titles[panelId] || 'Dashboard';
  },

  updateProfile() {
    const p = this.userProfile;
    const initial = p.full_name ? p.full_name.charAt(0).toUpperCase() : '♛';
    
    // Sidebar details
    document.getElementById('studentSidebarName').innerText = p.full_name || 'Chess Student';
    document.getElementById('studentSidebarSub').innerText = `${p.level || 'Beginner'} · ELO ${p.rating}`;
    document.getElementById('studentSidebarAvatar').innerText = initial;
    
    // Main profile banner ELO details
    document.getElementById('studentRatingNum').innerText = p.rating;
    document.getElementById('studentRatingLabel').innerText = `Level: ${p.level || 'Beginner'}`;
    
    // Stats counters
    document.getElementById('studentStatLessons').innerText = p.game || '0';
    document.getElementById('studentStatPuzzles').innerText = p.puzzle || '0';
    
    // Calculate attendance percentage dynamically
    this.updateAttendanceStats();
  },

  async updateAttendanceStats() {
    const logs = await CK.db.getAttendance(this.userProfile.id);
    const presentCount = logs.filter(l => l.status === 'present').length;
    const totalCount = logs.length;
    const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;
    
    document.getElementById('studentStatAttend').innerText = percentage + '%';
    document.getElementById('attendanceSummaryText').innerText = `Present: ${presentCount} of ${totalCount} recorded sessions (${percentage}%)`;
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

    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    let html = daysOfWeek.map(d => `<div style="font-weight:800; color:var(--p-text-muted); font-size:0.8rem; padding-bottom:5px;">${d}</div>`).join('');

    // Let's render May 2026. May 1st, 2026 is a Friday (index 5)
    const firstDayIndex = 5;
    const totalDays = 31;

    // Fetch attendance from DB
    const logs = await CK.db.getAttendance(this.userProfile.id);
    const attendanceMap = {};
    logs.forEach(l => {
      const day = new Date(l.date).getDate();
      attendanceMap[day] = l.status;
    });

    // Empty spaces for first week
    for (let i = 0; i < firstDayIndex; i++) {
      html += `<div></div>`;
    }

    // Days cells
    for (let day = 1; day <= totalDays; day++) {
      let bgStyle = 'background:var(--p-surface2); border:1px solid rgba(255,255,255,0.05);';
      let content = `${day}`;
      let tooltip = '';

      if (attendanceMap[day] === 'present') {
        bgStyle = 'background:rgba(0,201,167,0.15); border:1px solid var(--p-teal); color:var(--p-teal); font-weight:bold;';
        content += `<div style="font-size:0.6rem; margin-top:2px;">✅</div>`;
        tooltip = 'Present';
      } else if (attendanceMap[day] === 'absent') {
        bgStyle = 'background:rgba(255,107,107,0.15); border:1px solid var(--p-danger); color:var(--p-danger); font-weight:bold;';
        content += `<div style="font-size:0.6rem; margin-top:2px;">❌</div>`;
        tooltip = 'Absent';
      }

      html += `
        <div style="${bgStyle} border-radius:8px; padding:8px 4px; font-size:0.9rem;" title="${tooltip}">
          ${content}
        </div>
      `;
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

  
  renderResources() {
    const list = document.getElementById('studentResourcesList');
    if (!list) return;
    
    const myBatch = this.userProfile.batch || 1;
    // Mock files from db or hardcode for demo
    const mockFiles = [
      { name: 'Mating_Puzzles.pdf', batch: 1, notes: 'Review before Friday' },
      { name: 'Endgame_Basics.pdf', batch: 2, notes: 'Read chapter 1' },
      { name: 'Opening_Traps.pdf', batch: 1, notes: 'Memorize lines' }
    ];
    
    const myFiles = mockFiles.filter(f => f.batch === myBatch);
    if(myFiles.length === 0) {
      list.innerHTML = '<div style="opacity:0.6; padding:20px; text-align:center;">No resources assigned to your batch.</div>';
      return;
    }
    
    list.innerHTML = myFiles.map(f => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:var(--p-surface3); border-radius:8px; margin-bottom:10px;">
        <div>
          <div style="font-weight:600; color:var(--p-blue)">📄 ${f.name}</div>
          <div style="font-size:0.85rem; color:var(--p-text-muted); margin-top:4px;">📝 Note: ${f.notes}</div>
        </div>
        <button class="p-btn p-btn-blue p-btn-sm" onclick="CK.showToast('Downloading ${f.name}...', 'success')">Download</button>
      </div>
    `).join('');
  },

  renderPuzzlesList() {
    const container = document.getElementById('puzzlesListPanel');
    if (!container) return;

    container.innerHTML = this.puzzlesDb.map(p => `
      <div class="p-live-card" style="cursor:pointer; background:var(--p-surface2); transition:transform 0.2s;" onclick="CK.student.loadPuzzle('${p.id}')">
        <div class="p-live-avatar" style="background:var(--p-surface3); color:var(--p-gold); font-size:1.3rem;">🧩</div>
        <div class="p-live-info">
          <div class="p-live-name" style="font-size:0.95rem;">${p.title}</div>
          <div class="p-live-sub">${p.type} · <span style="color:var(--p-gold); font-weight:700;">${p.diff}</span></div>
        </div>
        <button class="p-btn p-btn-ghost p-btn-sm" style="padding:4px 8px;">Load</button>
      </div>
    `).join('');
  },

  loadAndGoToPuzzle(id) {
    this.nav('puzzles');
    this.loadPuzzle(id);
  },

  loadPuzzle(id) {
    const p = this.puzzlesDb.find(x => x.id === id);
    if (!p) return;

    this.activePuzzleId = id;
    document.getElementById('puzzleTitle').innerText = p.title;
    document.getElementById('puzzleInstructions').innerHTML = `
      <span class="p-badge p-badge-blue" style="margin-bottom:8px;">${p.type} (${p.diff})</span>
      <p style="margin:5px 0;">${p.instruction}</p>
    `;

    // Render puzzle board view
    const boardEl = document.getElementById('studentPuzzleBoardContainer');
    if (boardEl) {
      boardEl.innerHTML = '';
      boardEl.style.display = 'block';
      boardEl.style.width = '100%';
      boardEl.style.border = 'none';

      let positionFen = 'start';
      if (p.id === 'P1') positionFen = '5k2/6pp/8/8/8/8/8/3R4 w - - 0 1'; // Back-Rank
      else if (p.id === 'P2') positionFen = 'r3k3/8/8/3N4/8/8/8/8 w - - 0 1';
      else if (p.id === 'P3') positionFen = '6rk/5ppp/5N2/8/8/8/8/8 w - - 0 1';

      if (window.studentBoard) {
        window.studentBoard.destroy();
      }

      window.studentBoard = Chessboard('studentPuzzleBoardContainer', {
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        position: positionFen,
        draggable: true,
        onDrop: (source, target) => {
          // Check if solved
          if (target === p.solution) {
            CK.student.onSquareClick(target);
            return;
          } else {
            CK.showToast("Incorrect move. Try again!", "error");
            return 'snapback';
          }
        }
      });
    }
  },

  async onSquareClick(squareId) {
    const p = this.puzzlesDb.find(x => x.id === this.activePuzzleId);
    if (!p) return;

    if (squareId === p.solution) {
      // Puzzle solved successfully!
      CK.showToast("🎉 Correct Move! Puzzle Solved!", "success");
      
      // Update puzzle count score
      this.userProfile.puzzle += 1;
      
      // Increment star count on every solved puzzle (up to max 5)
      if (this.userProfile.star < 5) {
        this.userProfile.star += 1;
        CK.showToast(`⭐ Star progress updated to ${this.userProfile.star}/5!`, "info");
      }

      await CK.db.saveProfile(this.userProfile);
      
      // Refresh UI
      this.updateProfile();
      this.renderDashboard();
      this.loadPuzzle(this.activePuzzleId); // refresh puzzle display
      this.renderAchievementsTab(); // refresh trophies
    } else {
      CK.showToast("❌ Try again! That move is not the best solution.", "warning");
    }
  },

  renderCoachReviews() {
    const container = document.getElementById('studentReviewsContainer');
    if (!container) return;

    const defaultReviews = [
      { coach: "Sarah Chess (FIDE Instructor)", date: "May 6, 2026", text: "Emma shows fantastic calculation skills in open tactical lines. Focus on rook endgames and pawn structures in the coming week. Keep up the high puzzle count!" },
      { coach: "Michael Knight (Academy Coach)", date: "April 28, 2026", text: "Excellent concentration during our class match. Make sure to review basic opening concepts, specifically the Italian game sidelines." }
    ];

    container.innerHTML = defaultReviews.map(r => `
      <div style="background:var(--p-surface2); border:1px solid rgba(255,255,255,0.05); padding:16px; border-radius:12px; margin-bottom:15px; border-left:4px solid var(--p-gold);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4 style="margin:0; font-family:var(--font-display);">${r.coach}</h4>
          <span style="font-size:0.8rem; color:var(--p-text-muted);">${r.date}</span>
        </div>
        <p style="margin:0; font-size:0.92rem; line-height:1.5; color:rgba(255,255,255,0.85); font-style:italic;">"${r.text}"</p>
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
        <div style="background:${a.unlocked ? 'var(--p-surface2)' : 'rgba(255,255,255,0.02)'}; border:1px solid ${a.unlocked ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.02)'}; padding:15px; border-radius:12px; display:flex; align-items:center; gap:12px; opacity:${a.unlocked ? 1 : 0.4};">
          <div style="font-size:2rem; filter:${a.unlocked ? 'none' : 'grayscale(100%)'}">${a.icon}</div>
          <div>
            <div style="font-weight:700; font-size:0.9rem; color:${a.unlocked ? 'var(--p-gold)' : '#fff'}">${a.title}</div>
            <div style="font-size:0.75rem; color:var(--p-text-muted); line-height:1.3; margin-top:3px;">${a.desc}</div>
          </div>
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
    
    const nextClass = "4:00 PM";
    document.getElementById('nextClassTime').innerText = nextClass;
    document.getElementById('nextClassName').innerText = `${this.userProfile.level || 'Intermediate'} Strategy Session`;
    document.getElementById('nextClassSub').innerText = `with Coach ${this.userProfile.coach || 'Sarah Chess'}`;
    
    let mins = 45;
    if (window.studentCountdownTimer) clearInterval(window.studentCountdownTimer);
    
    window.studentCountdownTimer = setInterval(() => {
      if (mins > 0) {
        mins--;
        el.innerText = `Starts in ${mins}m`;
      }
    }, 60000);
    el.innerText = `Starts in ${mins}m`;
  },

  joinClass() {
    CK.showToast("Opening secure class session with Coach...", "success");
    document.getElementById('studentSessionTitle').innerText = `Connecting to '${this.userProfile.level || 'Intermediate'} Strategy' Meeting...`;
    
    const joinBtn = document.getElementById('studentJoinBtn');
    joinBtn.innerText = "Connecting...";
    joinBtn.disabled = true;

    setTimeout(() => {
      CK.showToast("Successfully connected! Opening Google Meet class room.", "success");
      joinBtn.innerText = "Connected";
      
      // Dynamically load class URL fallback
      const meetUrl = "https://meet.google.com/abc-defg-hij";
      window.open(meetUrl, '_blank');
      
      setTimeout(() => {
        joinBtn.innerText = "▶ Rejoin Class Room";
        joinBtn.disabled = false;
        document.getElementById('studentSessionTitle').innerText = "Class session is currently active!";
      }, 3000);
    }, 1500);
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