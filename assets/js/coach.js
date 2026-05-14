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
      resources: 'Homework & Notes',
      lab: 'PGN Teaching Studio'
    };
    document.getElementById('coachPanelTitle').innerText = titles[panelId] || 'Dashboard';
    
    const topBtn = document.getElementById('coachTopBtn');
    if (topBtn) topBtn.style.display = (panelId === 'notes') ? 'block' : 'none';
    if(panelId === 'resources') this.renderResources();
    if(panelId === 'schedule') this.renderSchedule();
    if(panelId === 'notes') this.initReportEditor();
    if(panelId === 'attendance') this.loadAttendance();
  },

  renderSchedule() {
    const links = window.CK && CK.batchManager ? CK.batchManager.getLinks() : {};
    const tbody = document.querySelector('#coach-panel-schedule tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr><td>Monday</td><td>4:00 PM - 5:00 PM</td><td>Intermediate Strategy</td><td><span class="p-badge p-badge-blue">Intermediate</span></td><td><div style="font-family:monospace; margin-bottom:4px; color:var(--p-teal);">${links['Intermediate'] || 'https://meet.google.com/int-strategy-abc'}</div><button class="p-btn p-btn-ghost p-btn-sm" onclick="CK.coach.editBatchLink('Intermediate')">✏️ Edit Room Link</button></td></tr>
        <tr><td>Tuesday</td><td>5:00 PM - 6:00 PM</td><td>Advanced Endgames</td><td><span class="p-badge p-badge-gold">Advanced</span></td><td><div style="font-family:monospace; margin-bottom:4px; color:var(--p-gold);">${links['Advanced'] || 'https://meet.google.com/adv-endgames-xyz'}</div><button class="p-btn p-btn-ghost p-btn-sm" onclick="CK.coach.editBatchLink('Advanced')">✏️ Edit Room Link</button></td></tr>
        <tr><td>Friday</td><td>6:30 PM - 8:00 PM</td><td>Beginner Fundamentals</td><td><span class="p-badge p-badge-green">Beginner</span></td><td><div style="font-family:monospace; margin-bottom:4px; color:var(--p-green);">${links['Beginner'] || 'https://meet.google.com/beg-inner-room'}</div><button class="p-btn p-btn-ghost p-btn-sm" onclick="CK.coach.editBatchLink('Beginner')">✏️ Edit Room Link</button></td></tr>
      `;
    }
  },

  editBatchLink(batchLevel) {
    const links = window.CK && CK.batchManager ? CK.batchManager.getLinks() : {};
    const newLink = prompt(`Enter Google Meet Class Room URL for ${batchLevel} Batch:`, links[batchLevel] || '');
    if (newLink && window.CK && CK.batchManager) {
      CK.batchManager.saveLink(batchLevel, newLink);
    }
  },

  async updateProfile() {
    const cp = this.coachProfile || {};
    const firstName = cp.full_name ? cp.full_name.split(' ')[0] : 'Coach';
    const initial = cp.full_name ? cp.full_name.split(' ').map(n => n[0]).join('') : 'CH';

    // Sidebar values
    const elName = document.getElementById('coachSidebarName');
    const elSub = document.getElementById('coachSidebarSub');
    const elAvatar = document.getElementById('coachSidebarAvatar');
    if (elName) elName.innerText = cp.full_name || 'Sarah Chess';
    if (elSub) elSub.innerText = `${cp.puzzle || 'Tactics Specialist'} · FIDE 2100`;
    if (elAvatar) elAvatar.innerText = initial;

    // Dynamic welcome banner greeting
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const welcomeEl = document.getElementById('coachWelcomeSub');
    if (welcomeEl) welcomeEl.textContent = `${greeting}, ${firstName}! You have ${this.classesDb.length} classes scheduled today. Your students are ready to learn.`;

    // Stats counters
    const students = await CK.db.getProfiles('student');
    const myStudents = students.filter(s => s.coach === cp.full_name);

    const stStud = document.getElementById('coachStatStudents');
    const stAtt = document.getElementById('coachStatAttend');
    const stClass = document.getElementById('coachStatClasses');
    if (stStud) stStud.innerText = myStudents.length || 0;
    if (stAtt) stAtt.innerText = '96%';
    if (stClass) stClass.innerText = this.classesDb.length || 0;
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
      const levelBadge = { Beginner: 'p-badge-green', Intermediate: 'p-badge-blue', Advanced: 'p-badge-gold' };
      tbody.innerHTML = this.classesDb.map(c => `
        <tr>
          <td style="font-weight:700; color:var(--p-text);">${c.class}</td>
          <td><span class="p-badge ${levelBadge[c.level] || 'p-badge-blue'}">${c.level}</span></td>
          <td style="color:var(--p-gold); font-weight:600;">${c.time}</td>
          <td><span style="font-size:0.85rem; color:var(--p-text-muted);">👥 ${c.students} students</span></td>
          <td><span class="p-badge p-badge-green">${c.status}</span></td>
          <td><button class="p-btn p-btn-teal p-btn-sm" onclick="CK.coach.startSession('${c.id}')">▶ Start</button></td>
        </tr>
      `).join('');
    }

    // 2. Load assigned students grid
    const grid = document.getElementById('coachStudentsGrid');
    if (grid) {
      const students = await CK.db.getProfiles('student');
      const myStudents = students.filter(s => s.coach === this.coachProfile.full_name);

      if (myStudents.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; opacity:0.5;">No students currently assigned to you.</div>';
        return;
      }

      const colors = ['var(--p-teal)', 'var(--p-gold)', 'var(--p-blue)', 'var(--p-rose)'];
      grid.innerHTML = myStudents.map((s, i) => {
        const initial = s.full_name ? s.full_name.charAt(0).toUpperCase() : '♟';
        const status = s.status || 'Offline';
        const color = colors[i % colors.length];
        return `
          <div class="p-live-card ${status.toLowerCase()}">
            <div class="p-live-avatar" style="background:rgba(255,255,255,0.06); color:${color}; font-size:1.1rem; font-weight:700; border:2px solid ${color}20;">${initial}</div>
            <div class="p-live-info">
              <div class="p-live-name">${s.full_name}</div>
              <div class="p-live-sub">${s.level || 'Beginner'} · ${s.rating || 800} ELO</div>
              <div class="p-live-status"><span class="p-status-dot ${status.toLowerCase()}"></span> ${status}</div>
            </div>
            <button class="p-icon-btn" onclick="CK.coach.viewStudentMetrics('${s.id}')" title="View Progress">📊</button>
          </div>
        `;
      }).join('');
    }
  },

  async loadAttendance() {
    const tbody = document.getElementById('coachAttendanceTable');
    if (!tbody) return;

    const dateInput = document.getElementById('coachAttendanceDate');
    if (!dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
    const selectedDate = dateInput.value;

    const coachName = this.coachProfile ? this.coachProfile.full_name : 'Sarah Chess';
    const students = await CK.db.getProfiles('student');
    const myStudents = students.filter(s => s.coach === coachName || !s.coach);
    const attendanceLogs = await CK.db.getAttendance(null, selectedDate);

    const attendanceMap = {};
    attendanceLogs.forEach(l => { attendanceMap[l.userid] = l.status; });

    if (myStudents.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; opacity:0.5; padding:20px;">No students assigned to you.</td></tr>';
      return;
    }

    tbody.innerHTML = myStudents.map(s => {
      const currentStatus = attendanceMap[s.id] || 'pending';
      const levelBatch = s.level === 'Beginner' ? 'Beginner Fundamentals' : s.level === 'Advanced' ? 'Advanced Endgames' : 'Intermediate Strategy';
      const badgeCls = currentStatus === 'present' ? 'p-badge-green' : currentStatus === 'absent' ? 'p-badge-red' : 'p-badge-ghost';
      return `
        <tr>
          <td style="font-weight:700;">${s.full_name}</td>
          <td><span class="p-badge p-badge-blue" style="font-size:0.75rem;">${s.level || 'Beginner'}</span></td>
          <td style="font-size:0.85rem; color:var(--p-text-muted);">${levelBatch}</td>
          <td style="font-size:0.85rem; color:var(--p-text-muted);">${selectedDate}</td>
          <td><span class="p-badge ${badgeCls}" id="coach_att_${s.id}">${currentStatus === 'present' ? '✅ Present' : currentStatus === 'absent' ? '❌ Absent' : '⏳ Pending'}</span></td>
          <td>
            <select class="p-form-control" style="width:auto; padding:4px 8px; font-size:0.8rem; height:auto;"
                    onchange="CK.admin && CK.admin.saveAttendanceRecord ? CK.admin.saveAttendanceRecord('${s.id}', '${selectedDate}', this.value) : CK.showToast('Admin not loaded','warning')">
              <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>⏳ Pending</option>
              <option value="present" ${currentStatus === 'present' ? 'selected' : ''}>✅ Present</option>
              <option value="absent" ${currentStatus === 'absent' ? 'selected' : ''}>❌ Absent</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');
  },

  async viewStudentMetrics(studentId) {
    const students = await CK.db.getProfiles('student');
    const s = students.find(u => u.id === studentId);
    if (!s) return;

    const rc = s.report_card || {};
    const stats = [
      { label: 'Opening', val: rc.opening ?? 84 },
      { label: 'Middlegame', val: rc.middlegame ?? 76 },
      { label: 'Tactics', val: rc.tactics ?? 88 },
      { label: 'Endgame', val: rc.endgame ?? 62 },
      { label: 'Time Mgmt', val: rc.time ?? 71 },
      { label: 'Sportsmanship', val: rc.sports ?? 95 }
    ];
    const bars = stats.map(st => {
      const color = st.val >= 85 ? 'var(--p-teal)' : st.val >= 70 ? 'var(--p-gold)' : 'var(--p-rose)';
      return `<div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:3px;">
          <span style="color:var(--p-text-muted)">${st.label}</span>
          <span style="color:${color};font-weight:700">${st.val}%</span>
        </div>
        <div style="height:7px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:${st.val}%;background:${color};border-radius:4px;transition:width .6s ease;"></div>
        </div>
      </div>`;
    }).join('');

    const modal = document.getElementById('coachMetricsModal');
    if (modal) {
      const nameEl = modal.querySelector('#metricsStudentName');
      const barsEl = modal.querySelector('#metricsBars');
      const ratingEl = modal.querySelector('#metricsRating');
      if (nameEl) nameEl.textContent = s.full_name;
      if (ratingEl) ratingEl.textContent = `ELO ${s.rating || 800} · ${s.level || 'Beginner'} · ${s.puzzle || 0} puzzles solved`;
      if (barsEl) barsEl.innerHTML = bars;
      CK.openModal('coachMetricsModal');
    } else {
      CK.showToast(`${s.full_name}: Rating ${s.rating || 800} · Puzzles ${s.puzzle || 0} · Level ${s.level || 'Beginner'}`, 'info');
    }
  },

  getGrade(mark) {
    const n = parseInt(mark) || 0;
    if (n >= 90) return 'A+';
    if (n >= 80) return 'A';
    if (n >= 70) return 'B';
    if (n >= 60) return 'C';
    return 'D';
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
      const coachName = this.coachProfile ? this.coachProfile.full_name : 'Sarah Chess';
      const myStudents = students.filter(s => s.coach === coachName || !s.coach);
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
  },

  async initReportEditor() {
    const select = document.getElementById('coachReportStudentSelect');
    if (!select) return;
    const students = await CK.db.getProfiles('student');
    const coachName = this.coachProfile ? this.coachProfile.full_name : 'Sarah Chess';
    const myStudents = students.filter(s => s.coach === coachName || !s.coach);
    select.innerHTML = myStudents.map(s => `<option value="${s.full_name}">${s.full_name}</option>`).join('');
    if (myStudents.length > 0) {
      this.loadStudentReport(myStudents[0].full_name);
    }
  },

  async loadStudentReport(studentName) {
    const students = await CK.db.getProfiles('student');
    const s = students.find(u => u.full_name === studentName);
    if (!s) return;
    const rc = s.report_card || {
      opening: 84,
      middlegame: 76,
      tactics: 88,
      endgame: 62,
      time: 71,
      sports: 95,
      remarks: "Excellent concentration and tactical calculation. Shows great promise when navigating complex middlegame positions.",
      goals: ["Participate in State Level Rapid U-14", "Master Lucena and Philidor Rook Endgames", "Maintain blunder rate under 3% in tournaments"]
    };
    document.getElementById('rep_opening').value = rc.opening;
    document.getElementById('rep_middlegame').value = rc.middlegame;
    document.getElementById('rep_tactics').value = rc.tactics;
    document.getElementById('rep_endgame').value = rc.endgame;
    document.getElementById('rep_time').value = rc.time;
    document.getElementById('rep_sports').value = rc.sports;
    document.getElementById('rep_remarks').value = rc.remarks;
    document.getElementById('rep_goals').value = Array.isArray(rc.goals) ? rc.goals.join(', ') : rc.goals;
  },

  async saveStudentReport() {
    const studentName = document.getElementById('coachReportStudentSelect').value;
    const students = await CK.db.getProfiles('student');
    const s = students.find(u => u.full_name === studentName);
    if (!s) return CK.showToast("Student profile not found", "error");

    const goalsVal = document.getElementById('rep_goals').value;
    s.report_card = {
      opening: Number(document.getElementById('rep_opening').value) || 0,
      middlegame: Number(document.getElementById('rep_middlegame').value) || 0,
      tactics: Number(document.getElementById('rep_tactics').value) || 0,
      endgame: Number(document.getElementById('rep_endgame').value) || 0,
      time: Number(document.getElementById('rep_time').value) || 0,
      sports: Number(document.getElementById('rep_sports').value) || 0,
      remarks: document.getElementById('rep_remarks').value || '',
      goals: goalsVal ? goalsVal.split(',').map(x => x.trim()) : []
    };

    await CK.db.saveProfile(s);
    CK.showToast(`Weekly Report Card saved for ${studentName}!`, "success");
  }
};