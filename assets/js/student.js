/**
 * ChessKidoo Student Portal Logic
 * Managed under CK.student namespace
 */
CK.student = {
  user: {
    name: 'Emma Wilson',
    level: 'Intermediate',
    rating: 1120,
    ratingHistory: [800, 850, 920, 1050, 1100, 1120],
    puzzles: 45,
    lessons: 28,
    attendance: 94
  },

  db: {
    puzzles: [
      { id: 'P1', title: 'Back-rank Mate', type: 'Tactics', diff: 'Easy', coach: 'Sarah Chess', due: 'Today' },
      { id: 'P2', title: 'Minor Piece Endgame', type: 'Endgame', diff: 'Medium', coach: 'Sarah Chess', due: 'Tomorrow' }
    ],
    schedule: [
      { date: 'Today', class: 'Intermediate Strategy', coach: 'Sarah Chess', time: '4:00 PM', dur: '60m', status: 'p-badge-green' },
      { date: 'May 15', class: 'Tactics Workshop', coach: 'Michael Knight', time: '5:30 PM', dur: '45m', status: 'p-badge-blue' }
    ]
  },

  init() {
    console.log("Student Portal Initializing...");
    this.updateProfile();
    this.renderDashboard();
    this.initCharts();
    this.startCountdown();
  },

  nav(panelId) {
    document.querySelectorAll('#student-page .p-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`student-panel-${panelId}`).classList.add('active');
    
    document.querySelectorAll('#student-page .p-nav-item').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('onclick')?.includes(`'${panelId}'`)) {
        btn.classList.add('active');
      }
    });
    
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
    document.getElementById('studentSidebarName').innerText = this.user.name;
    document.getElementById('studentSidebarSub').innerText = `${this.user.level} · ELO ${this.user.rating}`;
    document.getElementById('studentSidebarAvatar').innerText = this.user.name.split(' ').map(n => n[0]).join('');
    
    document.getElementById('studentRatingNum').innerText = this.user.rating;
    document.getElementById('studentRatingLabel').innerText = `Level: ${this.user.level}`;
    
    document.getElementById('studentStatLessons').innerText = this.user.lessons;
    document.getElementById('studentStatPuzzles').innerText = this.user.puzzles;
    document.getElementById('studentStatAttend').innerText = this.user.attendance + '%';
    
    document.getElementById('studentPuzzleBadge').innerText = this.db.puzzles.length;
  },

  renderDashboard() {
    // Puzzles
    const pTable = document.getElementById('studentPendingPuzzles');
    pTable.innerHTML = this.db.puzzles.map(p => `
      <tr>
        <td style="font-weight:600">${p.title}</td>
        <td>${p.type}</td>
        <td><span class="p-badge ${p.diff==='Easy'?'p-badge-green':'p-badge-yellow'}">${p.diff}</span></td>
        <td>${p.coach}</td>
        <td style="color:var(--p-danger)">${p.due}</td>
        <td><button class="p-btn p-btn-blue p-btn-sm">Solve</button></td>
      </tr>
    `).join('');

    // Schedule
    const sTable = document.getElementById('studentUpcomingTable');
    if(sTable) {
      sTable.innerHTML = this.db.schedule.map(s => `
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

  initCharts() {
    const ctx = document.getElementById('ratingChart')?.getContext('2d');
    if(ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Now'],
          datasets: [{
            label: 'Rating',
            data: this.user.ratingHistory,
            borderColor: '#5b9cf6',
            backgroundColor: 'rgba(91,156,246,0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { grid: { color: '#252b35' } }, x: { grid: { display: false } } }
        }
      });
    }
  },

  startCountdown() {
    const el = document.getElementById('studentCountdown');
    const nextClass = "4:00 PM";
    document.getElementById('nextClassTime').innerText = nextClass;
    document.getElementById('nextClassName').innerText = "Intermediate Strategy";
    document.getElementById('nextClassSub').innerText = "with Coach Sarah Chess";
    
    let mins = 45;
    setInterval(() => {
      if(mins > 0) {
        mins--;
        el.innerText = `Starts in ${mins}m`;
      }
    }, 60000);
    el.innerText = `Starts in ${mins}m`;
  },

  joinClass() {
    CK.showToast("Opening class session...", "success");
    // Redirect to meeting or open internal board
    document.getElementById('studentSessionTitle').innerText = "Joining 'Intermediate Strategy'...";
    document.getElementById('studentJoinBtn').innerText = "Connecting...";
  }
};