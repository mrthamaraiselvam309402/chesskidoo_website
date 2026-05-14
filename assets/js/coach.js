/* assets/js/coach.js ------------------------------------------------------
   ChessKidoo Coach Portal Logic
   Fully connected to CK.db unified layer, supporting dynamic teacher profile,
   live session controls, real-time assigned students loading, and game note taking.
   ------------------------------------------------------------------------- */

CK.coach = {
  coachProfile: null,
  classesDb: [],

  async init() {
    console.log("Coach Portal Initializing...");

    // 1. Fetch current coach profile dynamically
    const currentUser = CK.currentUser || JSON.parse(localStorage.getItem('ck_user'));
    if (!currentUser) {
      CK.showToast("Session expired. Please log in again.", "error");
      CK.showPage('login-page');
      return;
    }

    this.coachProfile = await CK.db.getProfile(currentUser.id) || currentUser;

    // Load mock schedule classes
    this.classesDb = [
      { id: 'C1', class: 'Intermediate Strategy', level: 'Intermediate', time: '4:00 PM', students: 8, status: 'Upcoming' },
      { id: 'C2', class: 'Advanced Endgames', level: 'Advanced', time: '6:30 PM', students: 5, status: 'Scheduled' }
    ];

    // Load coach notes
    if (!localStorage.getItem('ck_coach_notes')) {
      localStorage.setItem('ck_coach_notes', JSON.stringify([]));
    }

    // 2. Load UI elements
    await this.updateProfile();
    await this.renderDashboard();
    this.nav('home');
  },

  nav(panelId) {
    document.querySelectorAll('#coach-page .p-panel').forEach(p => p.classList.remove('active'));
    
    const target = document.getElementById(`coach-panel-${panelId}`);
    if (target) target.classList.add('active');
    
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
      puzzles: 'Assign Puzzles',
      resources: 'Homework & Notes'
    };
    document.getElementById('coachPanelTitle').innerText = titles[panelId] || 'Dashboard';
    
    document.getElementById('coachTopBtn').style.display = (panelId === 'notes') ? 'block' : 'none';
    if(panelId === 'resources') this.renderResources();
  },

  async updateProfile() {
    const cp = this.coachProfile || {};
    const initial = cp.full_name ? cp.full_name.split(' ').map(n => n[0]).join('') : 'CH';
    
    // Sidebar values
    const elName = document.getElementById('coachSidebarName');
    const elSub = document.getElementById('coachSidebarSub');
    const elAvatar = document.getElementById('coachSidebarAvatar');
    if (elName) elName.innerText = cp.full_name || 'Sarah Chess';
    if (elSub) elSub.innerText = `${cp.puzzle || 'Tactics Specialist'} · FIDE 2100`;
    if (elAvatar) elAvatar.innerText = initial;
    
    // Stats counters
    const students = await CK.db.getProfiles('student');
    const myStudents = students.filter(s => s.coach === cp.full_name);

    const stStud = document.getElementById('coachStatStudents');
    const stAtt = document.getElementById('coachStatAttend');
    const stClass = document.getElementById('coachStatClasses');
    if (stStud) stStud.innerText = myStudents.length || 0;
    if (stAtt) stAtt.innerText = '96%';
    if (stClass) stClass.innerText = '5';
  },

  renderResources() {
    const container = document.getElementById('coachResourcesContainer');
    if (!container) return;

    const resources = CK.db.resources || [];
    
    if (resources.length === 0) {
      container.innerHTML = '<div style="opacity:0.6; padding:20px; text-align:center;">No resources uploaded yet.</div>';
      return;
    }

    // Group by Batch
    const grouped = resources.reduce((acc, res) => {
      const b = res.batch || 'Unassigned';
      if (!acc[b]) acc[b] = [];
      acc[b].push(res);
      return acc;
    }, {});

    let html = '';
    
    for (const [batchStr, files] of Object.entries(grouped)) {
      html += `
        <div style="margin-bottom: 24px;">
          <h4 style="font-family: var(--font-display); font-size: 1.2rem; color: var(--p-gold); margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
            Batch ${batchStr}
          </h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
      `;
      
      files.forEach(f => {
        const typeBadge = f.type === 'Homework' ? 'p-badge-rose' : 'p-badge-blue';
        html += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; background:var(--p-surface3); border-radius:8px;">
              <div>
                <div style="font-weight:600; color:var(--p-text); display:flex; align-items:center; gap:8px;">
                  📄 ${f.name} <span class="p-badge ${typeBadge}" style="font-size:0.7rem; padding: 2px 6px;">${f.type || 'Material'}</span>
                </div>
                <div style="font-size:0.85rem; color:var(--p-text-muted); margin-top:4px;">📝 Note: ${f.notes}</div>
              </div>
              <button class="p-btn p-btn-ghost p-btn-sm" onclick="CK.showToast('Downloading ${f.name}...', 'success')">Download</button>
            </div>
        `;
      });
      
      html += `</div></div>`;
    }

    container.innerHTML = html;
  },

  async renderDashboard() {
    // 1. Load today's class schedule
    const tbody = document.getElementById('coachTodayClasses');
    if (tbody) {
      tbody.innerHTML = this.classesDb.map(c => `
        <tr>
          <td style="font-weight:600">${c.class}</td>
          <td><span class="p-badge p-badge-blue">${c.level}</span></td>
          <td>${c.time}</td>
          <td>${c.students} Students</td>
          <td><span class="p-badge p-badge-green">${c.status}</span></td>
          <td><button class="p-btn p-btn-teal p-btn-sm" onclick="CK.coach.startSession('${c.id}')">Start</button></td>
        </tr>
      `).join('');
    }

    // 2. Load assigned students grid
    const grid = document.getElementById('coachStudentsGrid');
    if (grid) {
      const students = await CK.db.getProfiles('student');
      const myStudents = students.filter(s => s.coach === this.coachProfile.full_name);

      if (myStudents.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:40px; opacity:0.5;">No students currently assigned to you.</div>';
        return;
      }

      grid.innerHTML = myStudents.map(s => {
        const initial = s.full_name ? s.full_name.charAt(0) : '♟';
        const status = s.status || 'Offline';

        return `
          <div class="p-live-card ${status.toLowerCase()}">
            <div class="p-live-avatar" style="background:var(--p-surface3); color:var(--p-teal)">${initial}</div>
            <div class="p-live-info">
              <div class="p-live-name">${s.full_name}</div>
              <div class="p-live-sub">${s.level || 'Beginner'}</div>
              <div class="p-live-status"><span class="p-status-dot ${status.toLowerCase()}"></span> ${status}</div>
            </div>
            <button class="p-icon-btn" onclick="CK.coach.viewStudentMetrics('${s.id}')">📊</button>
          </div>
        `;
      }).join('');
    }
  },

  viewStudentMetrics(studentId) {
    CK.showToast("Loading student diagnostics graph...", "info");
  },

  startSession(classId) {
    const c = this.classesDb.find(x => x.id === classId);
    if (!c) return;

    this.nav('session');
    document.getElementById('coachSessionName').innerText = c.class;
    document.getElementById('coachSessionSub').innerText = `${c.level} · ${c.students} Students Connected`;
    document.getElementById('coachCommandCenter').style.display = 'grid';
    if (CK.renderVaultBoard) CK.renderVaultBoard();
    CK.showToast("Triple-Pane session environment ready", "success");
  },

  toggleSession() {
    const btn = document.getElementById('coachStartBtn');
    if (btn.innerText.includes('Start') || btn.innerText.includes('Resume')) {
      btn.innerText = '⏸ Pause Command Center';
      btn.classList.remove('p-btn-teal');
      btn.classList.add('p-btn-ghost');
      document.getElementById('coachCommandCenter').style.display = 'grid';
      if (CK.renderVaultBoard) CK.renderVaultBoard();
      CK.showToast("Interactive Triple-Pane Command Center started!", "success");
    } else {
      btn.innerText = '▶ Resume Command Center';
      btn.classList.remove('p-btn-ghost');
      btn.classList.add('p-btn-teal');
      CK.showToast("Command Center paused", "info");
    }
  },

  endSession() {
    document.getElementById('coachCommandCenter').style.display = 'none';
    const btn = document.getElementById('coachStartBtn');
    if (btn) {
      btn.innerText = '▶ Start Live Command Center';
      btn.classList.remove('p-btn-ghost');
      btn.classList.add('p-btn-teal');
    }
    CK.showToast("Live session ended successfully", "info");
  },

  async topAction() {
    const select = document.getElementById('coach_note_student');
    if (select) {
      const students = await CK.db.getProfiles('student');
      const myStudents = students.filter(s => s.coach === this.coachProfile.full_name);
      select.innerHTML = myStudents.map(s => `<option value="${s.full_name}">${s.full_name}</option>`).join('');
    }
    CK.openModal('coachNoteModal');
  },

  saveNote() {
    const name = document.getElementById('coach_note_student').value;
    const text = document.getElementById('coach_note_text').value;
    if (!text) return CK.showToast("Note content is required", "error");
    
    CK.tracker.addReview({
      student: name,
      text: text,
      coach: this.coachProfile ? this.coachProfile.full_name : 'Sarah Chess'
    });

    CK.showToast("Game assessment note saved successfully! ELO accuracy updated.", "success");
    CK.closeModal('coachNoteModal');
    document.getElementById('coach_note_text').value = '';
  }
};