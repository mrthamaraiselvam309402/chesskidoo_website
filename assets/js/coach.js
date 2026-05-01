/**
 * ChessKidoo Coach Portal Logic
 * Managed under CK.coach namespace
 */
CK.coach = {
  user: {
    name: 'Sarah Chess',
    title: 'FIDE Instructor',
    rating: 2100,
    students: 12,
    attendance: 98,
    classesPerWeek: 5
  },

  db: {
    students: [
      { id: '101', name: 'Emma Wilson', level: 'Intermediate', status: 'Online' },
      { id: '103', name: 'Leo Garcia', level: 'Advanced', status: 'Online' },
      { id: '105', name: 'Sophie Chen', level: 'Intermediate', status: 'Offline' }
    ],
    today: [
      { id: 'C1', class: 'Intermediate Strategy', level: 'Intermediate', time: '4:00 PM', students: 8, status: 'Upcoming' },
      { id: 'C2', class: 'Advanced Endgames', level: 'Advanced', time: '6:30 PM', students: 5, status: 'Scheduled' }
    ],
    notes: []
  },

  init() {
    console.log("Coach Portal Initializing...");
    this.updateProfile();
    this.renderDashboard();
  },

  nav(panelId) {
    document.querySelectorAll('#coach-page .p-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`coach-panel-${panelId}`).classList.add('active');
    
    document.querySelectorAll('#coach-page .p-nav-item').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('onclick')?.includes(`'${panelId}'`)) {
        btn.classList.add('active');
      }
    });
    
    const titles = {
      home: 'Coach Dashboard',
      session: 'Live Session',
      students: 'My Students',
      attendance: 'Mark Attendance',
      schedule: 'My Schedule',
      notes: 'Game Notes',
      puzzles: 'Assign Puzzles'
    };
    document.getElementById('coachPanelTitle').innerText = titles[panelId] || 'Dashboard';
    
    document.getElementById('coachTopBtn').style.display = (panelId === 'notes') ? 'block' : 'none';
  },

  updateProfile() {
    document.getElementById('coachSidebarName').innerText = this.user.name;
    document.getElementById('coachSidebarSub').innerText = `${this.user.title} · ${this.user.rating}`;
    document.getElementById('coachSidebarAvatar').innerText = this.user.name.split(' ').map(n => n[0]).join('');
    
    document.getElementById('coachStatStudents').innerText = this.user.students;
    document.getElementById('coachStatAttend').innerText = this.user.attendance + '%';
    document.getElementById('coachStatClasses').innerText = this.user.classesPerWeek;
  },

  renderDashboard() {
    const tbody = document.getElementById('coachTodayClasses');
    tbody.innerHTML = this.db.today.map(c => `
      <tr>
        <td style="font-weight:600">${c.class}</td>
        <td><span class="p-badge p-badge-blue">${c.level}</span></td>
        <td>${c.time}</td>
        <td>${c.students} Students</td>
        <td><span class="p-badge p-badge-green">${c.status}</span></td>
        <td><button class="p-btn p-btn-teal p-btn-sm" onclick="CK.coach.startSession('${c.id}')">Start</button></td>
      </tr>
    `).join('');

    const grid = document.getElementById('coachStudentsGrid');
    if(grid) {
      grid.innerHTML = this.db.students.map(s => `
        <div class="p-live-card ${s.status.toLowerCase()}">
          <div class="p-live-avatar" style="background:var(--p-surface3); color:var(--p-teal)">${s.name.charAt(0)}</div>
          <div class="p-live-info">
            <div class="p-live-name">${s.name}</div>
            <div class="p-live-sub">${s.level}</div>
            <div class="p-live-status"><span class="p-status-dot ${s.status.toLowerCase()}"></span> ${s.status}</div>
          </div>
          <button class="p-icon-btn">📊</button>
        </div>
      `).join('');
    }
  },

  startSession(classId) {
    const c = this.db.today.find(x => x.id === classId);
    this.nav('session');
    document.getElementById('coachSessionName').innerText = c.class;
    document.getElementById('coachSessionSub').innerText = `${c.level} · ${c.students} Students Checked-in`;
    CK.showToast("Session environment ready", "success");
  },

  toggleSession() {
    const btn = document.getElementById('coachStartBtn');
    if(btn.innerText.includes('Start')) {
      btn.innerText = '⏸ Pause Session';
      btn.classList.remove('p-btn-teal');
      btn.classList.add('p-btn-ghost');
      CK.showToast("Session started", "success");
    } else {
      btn.innerText = '▶ Resume Session';
      btn.classList.remove('p-btn-ghost');
      btn.classList.add('p-btn-teal');
    }
  },

  topAction() {
    const panel = document.querySelector('#coach-page .p-panel.active').id;
    if(panel === 'coach-panel-notes') {
      const select = document.getElementById('coach_note_student');
      select.innerHTML = this.db.students.map(s => `<option>${s.name}</option>`).join('');
      CK.openModal('coachNoteModal');
    }
  },

  saveNote() {
    const name = document.getElementById('coach_note_student').value;
    const text = document.getElementById('coach_note_text').value;
    if(!text) return CK.showToast("Note content required", "error");
    
    this.db.notes.push({ student: name, text, date: new Date().toLocaleDateString() });
    CK.showToast("Game note saved", "success");
    CK.closeModal('coachNoteModal');
    document.getElementById('coach_note_text').value = '';
  }
};