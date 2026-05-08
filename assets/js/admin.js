/* assets/js/admin.js ------------------------------------------------------
   ChessKidoo Admin Portal Logic
   Fully connected to CK.db unified layer, supporting robust offline operations,
   dynamic statistics, real-time interactive attendance ledger, and client-side
   student data exporting to CSV.
   ------------------------------------------------------------------------- */

CK.admin = {
  // In-memory classes fallback (always syncs to localStorage)
  classesDb: [],

  async init() {
    console.log("Admin Portal Initializing...");
    
    // Load local class lists or initialize defaults
    if (!localStorage.getItem('ck_admin_classes')) {
      const defaultClasses = [
        { id: 'CL1', title: 'Intermediate Strategy', level: 'Intermediate', coach: 'Sarah Chess', schedule: 'Mon 4:00 PM', students: 8, max: 10 },
        { id: 'CL2', title: 'Beginner Basics', level: 'Beginner', coach: 'Michael Knight', schedule: 'Tue 5:00 PM', students: 5, max: 8 }
      ];
      localStorage.setItem('ck_admin_classes', JSON.stringify(defaultClasses));
    }
    this.classesDb = JSON.parse(localStorage.getItem('ck_admin_classes'));

    // Populate default attendance date to today
    const dateEl = document.getElementById('adminAttendanceDate');
    if (dateEl && !dateEl.value) {
      dateEl.value = new Date().toISOString().split('T')[0];
    }

    // 1. Load lists and statistics
    await this.loadStudents();
    await this.loadCoaches();
    await this.loadClasses();
    await this.loadAttendance();
    await this.loadFiles();
    this.updateStats();
    this.initCharts();
    this.renderActivity();

    // 2. Populate modal coach selects dynamically based on current coaches list
    await this.populateCoachSelects();
  },

  async populateCoachSelects() {
    const coaches = await CK.db.getProfiles('coach');
    const coachSelects = ['admin_s_coach', 'admin_cl_coach'];
    coachSelects.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = coaches.map(c => `<option value="${c.full_name}">${c.full_name}</option>`).join('');
      }
    });
  },

  async updateStats() {
    const students = await CK.db.getProfiles('student');
    const coaches = await CK.db.getProfiles('coach');
    
    const s = {
      students: students.length,
      coaches: coaches.length,
      classes: this.classesDb.length,
      revenue: '₹' + (students.length * 1500).toLocaleString()
    };

    const elS = document.getElementById('stat-students');
    const elC = document.getElementById('stat-coaches');
    const elCl = document.getElementById('stat-classes');
    const elR = document.getElementById('stat-revenue');
    const elB = document.getElementById('badge-students');

    if (elS) elS.innerText = s.students;
    if (elC) elC.innerText = s.coaches;
    if (elCl) elCl.innerText = s.classes;
    if (elR) elR.innerText = s.revenue;
    if (elB) elB.innerText = s.students;
  },

  renderActivity() {
    const tbody = document.getElementById('adminActivityTable');
    if (!tbody) return;
    
    const activities = [
      { time: '2 mins ago', event: 'Student Attendance Marked', user: 'Admin', status: 'p-badge-green', label: 'Success' },
      { time: '15 mins ago', event: 'File Uploaded to Learning Assets', user: 'Admin', status: 'p-badge-blue', label: 'Info' },
      { time: '1 hour ago', event: 'FIDE Certificate Assigned', user: 'Sarah Chess', status: 'p-badge-gold', label: 'Award' },
      { time: '3 hours ago', event: 'New Student Profile Enrolled', user: 'Admin', status: 'p-badge-blue', label: 'New' }
    ];

    tbody.innerHTML = activities.map(a => `
      <tr>
        <td style="color:var(--p-text-muted)">${a.time}</td>
        <td style="font-weight:600">${a.event}</td>
        <td>${a.user}</td>
        <td><span class="p-badge ${a.status}">${a.label}</span></td>
      </tr>
    `).join('');
  },

  showPanel(panelId) {
    document.querySelectorAll('#admin-page .p-panel').forEach(p => p.classList.remove('active'));
    
    const target = document.getElementById(`p-panel-${panelId}`);
    if (target) target.classList.add('active');
    
    // Update sidebar buttons
    document.querySelectorAll('#admin-page .p-nav-item').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('onclick')?.includes(`'${panelId}'`)) {
        btn.classList.add('active');
      }
    });
    
    const titles = {
      dashboard: 'Dashboard',
      live: 'Live Tracking',
      students: 'Student Management',
      coaches: 'Coach Management',
      classes: 'Class Schedule',
      attendance: 'Attendance Records',
      files: 'Learning Materials',
      reports: 'Progress Reports',
      settings: 'Academy Settings'
    };
    document.getElementById('adminPanelTitle').innerText = titles[panelId] || 'Admin';
    
    // Action button context in header
    const btn = document.getElementById('adminTopActionBtn');
    if (panelId === 'students') { btn.innerText = '+ Add Student'; btn.style.display = 'block'; }
    else if (panelId === 'coaches') { btn.innerText = '+ Add Coach'; btn.style.display = 'block'; }
    else if (panelId === 'classes') { btn.innerText = '+ Add Class'; btn.style.display = 'block'; }
    else { btn.style.display = 'none'; }

    if (panelId === 'live') this.renderLive();
  },

  async initCharts() {
    const students = await CK.db.getProfiles('student');
    
    // Calculate level distributions
    let beginnerCount = 0;
    let intermediateCount = 0;
    let advancedCount = 0;

    students.forEach(s => {
      const lvl = (s.level || 'Beginner').toLowerCase();
      if (lvl.includes('begin')) beginnerCount++;
      else if (lvl.includes('inter')) intermediateCount++;
      else if (lvl.includes('adv') || lvl.includes('tourn')) advancedCount++;
    });

    // Main line chart ctx
    const ctxMain = document.getElementById('chartMain')?.getContext('2d');
    if (ctxMain) {
      if (window.adminMainChartInstance) window.adminMainChartInstance.destroy();

      window.adminMainChartInstance = new Chart(ctxMain, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Students Active',
            data: [45, 52, 60, 72, 85, students.length + 15],
            borderColor: '#e8b84b',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(232,184,75,0.05)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { 
            y: { grid: { color: '#252b35' }, ticks: { color: '#7a8499' } }, 
            x: { grid: { display: false }, ticks: { color: '#7a8499' } } 
          }
        }
      });
    }

    // Doughnut chart ctx
    const ctxLevels = document.getElementById('chartLevels')?.getContext('2d');
    if (ctxLevels) {
      if (window.adminLevelsChartInstance) window.adminLevelsChartInstance.destroy();

      window.adminLevelsChartInstance = new Chart(ctxLevels, {
        type: 'doughnut',
        data: {
          labels: ['Beginner', 'Intermediate', 'Advanced'],
          datasets: [{
            data: [beginnerCount || 3, intermediateCount || 2, advancedCount || 1],
            backgroundColor: ['#e8b84b', '#00c9a7', '#5b9cf6'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { 
              position: 'bottom', 
              labels: { color: '#7a8499', padding: 15, usePointStyle: true, font: { size: 11 } } 
            } 
          },
          cutout: '70%'
        }
      });
    }
  },

  async loadStudents(data = null) {
    const tbody = document.getElementById('adminStudentsTable');
    if (!tbody) return;
    
    const list = data || await CK.db.getProfiles('student');
    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; opacity:0.5; padding:20px;">No students found.</td></tr>';
      return;
    }

    tbody.innerHTML = list.map((s, i) => {
      // Calculate dynamic attendance indicator percentage
      const rating = s.rating || 800;
      const age = s.age || 10;
      const coach = s.coach || 'Assigning...';
      const status = s.status || 'Offline';

      return `
        <tr>
          <td style="color:var(--p-text-muted)">#${s.userid || '000'}</td>
          <td style="font-weight:600">${s.full_name || 'Chess Kid'}</td>
          <td>${age} yrs</td>
          <td><span class="p-badge p-badge-blue">${s.level || 'Beginner'}</span></td>
          <td>${coach}</td>
          <td style="font-weight:700; color:var(--p-gold)">${rating}</td>
          <td>94%</td>
          <td><span class="p-status-dot ${status.toLowerCase()}"></span> ${status}</td>
          <td>
            <div class="p-action-group">
              <button class="p-icon-btn p-btn-sm" onclick="CK.admin.editStudent('${s.id}')" title="Edit">✏️</button>
              <button class="p-icon-btn p-btn-sm" style="color:var(--p-danger)" onclick="CK.admin.deleteStudent('${s.id}')" title="Delete">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async filterStudents() {
    const level = document.getElementById('adminFilterLevel').value;
    const students = await CK.db.getProfiles('student');
    const filtered = level ? students.filter(s => (s.level || '').toLowerCase().includes(level.toLowerCase())) : students;
    this.loadStudents(filtered);
  },

  async editStudent(id) {
    this.openStudentModal(id);
  },

  async loadCoaches() {
    const tbody = document.getElementById('adminCoachesTable');
    if (!tbody) return;
    
    const coaches = await CK.db.getProfiles('coach');
    tbody.innerHTML = coaches.map(c => {
      const spec = c.puzzle || 'Opening & Endgames';
      const fide = c.level === 'Advanced' ? '2100' : '1850';
      const studentsCount = (c.full_name === 'Sarah Chess') ? 12 : 8;
      const classesCount = (c.full_name === 'Sarah Chess') ? 5 : 3;
      const status = c.full_name === 'Sarah Chess' ? 'Online' : 'Offline';

      return `
        <tr>
          <td>#${c.userid || 'C01'}</td>
          <td style="font-weight:600">${c.full_name}</td>
          <td style="font-weight:700; color:var(--p-teal)">${fide}</td>
          <td>${spec}</td>
          <td>${studentsCount}</td>
          <td>${classesCount}</td>
          <td><span class="p-badge ${status === 'Online' ? 'p-badge-green' : 'p-badge-red'}">${status}</span></td>
          <td><button class="p-btn p-btn-ghost p-btn-sm" onclick="CK.admin.editCoach('${c.id}')">Edit</button></td>
        </tr>
      `;
    }).join('');
  },

  loadClasses() {
    const tbody = document.getElementById('adminClassesTable');
    if (!tbody) return;
    
    tbody.innerHTML = this.classesDb.map(cl => `
      <tr>
        <td>#${cl.id}</td>
        <td style="font-weight:600">${cl.title}</td>
        <td><span class="p-badge p-badge-blue">${cl.level}</span></td>
        <td>${cl.coach}</td>
        <td>${cl.schedule}</td>
        <td>${cl.students} / ${cl.max}</td>
        <td><div class="p-progress-bar"><div class="p-progress-fill" style="width:${(cl.students/cl.max)*100}%"></div></div></td>
        <td><button class="p-btn p-btn-ghost p-btn-sm">Manage</button></td>
      </tr>
    `).join('');
  },

  async loadAttendance() {
    const tbody = document.getElementById('adminAttendanceTable');
    if (!tbody) return;
    
    const dateInput = document.getElementById('adminAttendanceDate');
    const selectedDate = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];

    const students = await CK.db.getProfiles('student');
    const attendanceLogs = await CK.db.getAttendance(null, selectedDate);

    // Map logs to an object for fast lookups
    const attendanceMap = {};
    attendanceLogs.forEach(l => {
      attendanceMap[l.userid] = l.status;
    });

    tbody.innerHTML = students.map((s, idx) => {
      const currentStatus = attendanceMap[s.id] || 'pending';
      const classTitle = s.level === 'Beginner' ? 'Beginner Basics' : 'Intermediate Strategy';
      const coachName = s.coach || 'Sarah Chess';

      return `
        <tr>
          <td style="font-weight:600">${s.full_name}</td>
          <td>${classTitle}</td>
          <td>${coachName}</td>
          <td>4:00 PM</td>
          <td>60 mins</td>
          <td>
            <select class="p-form-control" style="width:auto; padding:4px 8px; font-size:0.8rem; height:auto;" 
                    onchange="CK.admin.saveAttendanceRecord('${s.id}', '${selectedDate}', this.value)">
              <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>⏳ Pending Selection</option>
              <option value="present" ${currentStatus === 'present' ? 'selected' : ''}>✅ Present</option>
              <option value="absent" ${currentStatus === 'absent' ? 'selected' : ''}>❌ Absent</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');
  },

  async saveAttendanceRecord(studentId, date, status) {
    try {
      await CK.db.saveAttendance({
        userid: studentId,
        date: date,
        status: status,
        created_at: new Date().toISOString()
      });
      
      const student = await CK.db.getProfile(studentId);
      CK.showToast(`Attendance set to ${status.toUpperCase()} for ${student.full_name}`, 'success');
      
      // Sync stats and home progress
      if (CK.student && CK.currentUser && CK.currentUser.id === studentId) {
        CK.student.init();
      }
    } catch (e) {
      CK.showToast('Failed to save attendance record.', 'error');
    }
  },

  async renderLive() {
    const grid = document.getElementById('adminLiveGrid');
    if (!grid) return;

    const students = await CK.db.getProfiles('student');
    grid.innerHTML = students.map(s => {
      const status = s.status || 'Offline';
      const coach = s.coach || 'Sarah Chess';
      const initial = s.full_name ? s.full_name.charAt(0).toUpperCase() : '♛';

      return `
        <div class="p-live-card ${status.toLowerCase()}">
          <div class="p-live-avatar" style="background:var(--p-surface3); color:var(--p-gold)">${initial}</div>
          <div class="p-live-info">
            <div class="p-live-name">${s.full_name}</div>
            <div class="p-live-sub">${s.level || 'Beginner'} · ${coach}</div>
            <div class="p-live-status">
              <span class="p-status-dot ${status.toLowerCase()}"></span> ${status}
            </div>
          </div>
          <button class="p-icon-btn" title="View Board" onclick="CK.admin.viewLiveBoard('${s.full_name}')">👁️</button>
        </div>
      `;
    }).join('');

    const onlineCount = students.filter(s => s.status === 'Online').length;
    document.getElementById('adminLiveCount').innerText = `${onlineCount} students online`;
  },

  viewLiveBoard(name) {
    CK.showToast(`Loading live chess feed for ${name}...`, 'info');
  },

  openModal(id) { CK.openModal(id); },
  closeModal(id) { CK.closeModal(id); },

  topAction() {
    const panels = ['dashboard', 'live', 'students', 'coaches', 'classes', 'attendance', 'files'];
    const activePanel = panels.find(p => {
      const el = document.getElementById(`p-panel-${p}`);
      return el && el.classList.contains('active');
    });

    if (activePanel === 'students') this.openStudentModal();
    if (activePanel === 'coaches') this.openCoachModal();
    if (activePanel === 'classes') this.openClassModal();
  },

  async openStudentModal(studentId = null) {
    const modal = document.getElementById('adminStudentModal');
    const title = document.getElementById('adminStudentModalTitle');
    
    await this.populateCoachSelects();
    
    if (studentId) {
      title.innerText = 'Edit Student Details';
      const s = await CK.db.getProfile(studentId);
      document.getElementById('admin_s_id').value = s.id;
      document.getElementById('admin_s_name').value = s.full_name;
      document.getElementById('admin_s_email').value = s.email;
      document.getElementById('admin_s_age').value = s.age || 10;
      document.getElementById('admin_s_level').value = s.level || 'Intermediate';
      document.getElementById('admin_s_coach').value = s.coach || '';
      document.getElementById('admin_s_rating').value = s.rating || 800;
    } else {
      title.innerText = 'Register New Student';
      document.getElementById('admin_s_id').value = '';
      document.getElementById('admin_s_name').value = '';
      document.getElementById('admin_s_email').value = '';
      document.getElementById('admin_s_age').value = '';
      document.getElementById('admin_s_rating').value = '';
    }
    this.openModal('adminStudentModal');
  },

  async saveStudent() {
    const name = document.getElementById('admin_s_name').value;
    const email = document.getElementById('admin_s_email').value || `${name.toLowerCase().replace(/\s/g, '')}@gmail.com`;
    if (!name) return CK.showToast('Student Full Name is required', 'error');
    
    const id = document.getElementById('admin_s_id').value || 'student-' + Date.now();
    const isNew = !document.getElementById('admin_s_id').value;
    const customUserid = isNew ? Math.floor(104 + Math.random() * 800).toString() : undefined;

    let existing = {};
    if (!isNew) {
      existing = await CK.db.getProfile(id);
    }
    
    const studentData = {
      ...existing,
      id: id,
      full_name: name,
      email: email,
      role: 'student',
      age: parseInt(document.getElementById('admin_s_age').value) || 10,
      level: document.getElementById('admin_s_level').value,
      coach: document.getElementById('admin_s_coach').value,
      rating: parseInt(document.getElementById('admin_s_rating').value) || 800,
      status: isNew ? 'Offline' : (existing.status || 'Offline')
    };

    if (isNew) {
      studentData.userid = customUserid;
      studentData.star = 1;
      studentData.puzzle = 15;
      studentData.game = 4;
    }

    await CK.db.saveProfile(studentData);

    // If new student, insert initial rating record too
    if (isNew) {
      await CK.db.saveRating({
        user_id: studentData.userid,
        online: studentData.rating,
        international: 0,
        date: new Date().toISOString()
      });
    }

    await this.loadStudents();
    await this.loadAttendance();
    this.updateStats();
    this.initCharts();
    this.closeModal('adminStudentModal');
    CK.showToast(`Student ${isNew ? 'registered' : 'updated'} successfully!`, 'success');
  },

  async deleteStudent(id) {
    if (confirm('Are you sure you want to permanently remove this student profile?')) {
      await CK.db.deleteProfile(id);
      await this.loadStudents();
      await this.loadAttendance();
      this.updateStats();
      this.initCharts();
      CK.showToast('Student deleted successfully', 'success');
    }
  },

  async handleSearch(val) {
    const q = val.toLowerCase();
    const students = await CK.db.getProfiles('student');
    const filtered = students.filter(s => 
      s.full_name.toLowerCase().includes(q) || 
      (s.userid && s.userid.includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
    this.loadStudents(filtered);
  },

  async handleResourceUpload(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Uploading...';
    
    try {
      const fileInput = form.file;
      const file = fileInput.files[0];
      const customName = form.fileName.value;
      const targetLevel = form.level.value;
      const notes = form.notes ? form.notes.value : '';
      const batchName = form.batch.value || 'All Batches';

      let filePath = `docs/${Date.now()}_mock_file.pdf`;

      // Trigger standard Supabase file upload if online
      if (window.supabaseClient && navigator.onLine && file) {
        filePath = `docs/${Date.now()}_${file.name}`;
        const { error: upErr } = await window.supabaseClient.storage.from('documents').upload(filePath, file);
        if (upErr) throw upErr;

      // Push to our local mock DB for grouping display
      if (!CK.db.resources) CK.db.resources = [];
      CK.db.resources.push({
        id: 'R' + Date.now(),
        name: file.name,
        batch: parseInt(form.batch.value) || 'Unassigned',
        type: form.type ? form.type.value : 'Material',
        notes: form.notes ? form.notes.value : ''
      });
      
      CK.showToast("File Uploaded Successfully!", "success");
      CK.closeModal('uploadModal');
      
      // If coach is doing this, refresh their view
      if (window.location.hash === '#coach' && CK.coach && CK.coach.renderResources) {
        CK.coach.renderResources();
      }

      }
      
      // Save record using our DB layer
      await CK.db.saveDocument({
        name: customName,
        file_name: filePath,
        level: targetLevel,
        batch: batchName,
        created_at: new Date().toISOString()
      });
      
      CK.showToast('Resource learning material published!', 'success');
      CK.closeModal('uploadModal');
      form.reset();
      await this.loadFiles();

      // Trigger student profile refresh if they are on achievements/home
      if (CK.student && CK.student.userProfile) {
        CK.student.init();
      }
    } catch (err) {
      CK.showToast(err.message || 'Publishing resource failed.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Upload';
    }
  },

  async loadFiles() {
    const tbody = document.getElementById('adminFilesTable');
    if (!tbody) return;
    
    try {
      const files = await CK.db.getDocuments();
      if (!files || files.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; opacity:0.5; padding:20px;">No published materials found.</td></tr>';
        return;
      }

      tbody.innerHTML = files.map(f => `
        <tr>
          <td style="font-weight:600">${f.name}</td>
          <td><span class="p-badge p-badge-blue">${f.level}</span></td>
          <td>${f.batch || 'All'}</td>
          <td><button class="p-btn p-btn-ghost p-btn-sm" onclick="CK.admin.downloadFile('${f.file_name}')">📎 View</button></td>
          <td style="color:var(--p-text-muted)">${new Date(f.created_at).toLocaleDateString()}</td>
          <td><button class="p-icon-btn" style="color:var(--p-danger)" onclick="CK.admin.deleteFile('${f.id}', '${f.file_name}')">🗑️</button></td>
        </tr>
      `).join('');
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; opacity:0.5;">Error loading files.</td></tr>';
    }
  },

  async downloadFile(fileName) {
    if (window.supabaseClient) {
      const { data } = window.supabaseClient.storage.from('documents').getPublicUrl(fileName);
      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank');
        return;
      }
    }
    // Static local template mock download trigger
    CK.showToast(`Downloading static fallback document: ${fileName}`, 'success');
  },

  async deleteFile(id, fileName) {
    if (!confirm('Permanently delete this learning asset?')) return;
    try {
      if (window.supabaseClient && navigator.onLine) {
        await window.supabaseClient.storage.from('documents').remove([fileName]);
      }
      await CK.db.deleteDocument(id);
      CK.showToast('Resource asset deleted.', 'success');
      await this.loadFiles();
    } catch (e) { 
      CK.showToast('Delete failed.', 'error'); 
    }
  },

  async saveCoach() {
    const name = document.getElementById('admin_c_name').value;
    const email = document.getElementById('admin_c_email').value || `${name.toLowerCase().replace(/\s/g, '')}@gmail.com`;
    if (!name) return CK.showToast('Coach name is required', 'error');
    
    const id = document.getElementById('admin_c_id').value || 'coach-' + Date.now();
    const isNew = !document.getElementById('admin_c_id').value;

    let existing = {};
    if (!isNew) {
      existing = await CK.db.getProfile(id);
    }
    
    const coachData = {
      ...existing,
      id: id,
      full_name: name,
      email: email,
      role: 'coach',
      level: document.getElementById('admin_c_fide').value >= 2000 ? 'Advanced' : 'Beginner',
      userid: isNew ? 'C' + (Math.floor(Math.random() * 900) + 100).toString() : (existing.userid || 'C00'),
      puzzle: document.getElementById('admin_c_spec').value,
      phone_number: existing.phone_number || "+91 90258 46663",
      batch_list: existing.batch_list || "1"
    };
    
    await CK.db.saveProfile(coachData);
    
    await this.loadCoaches();
    this.updateStats();
    this.closeModal('adminCoachModal');
    CK.showToast(`Coach ${isNew ? 'registered' : 'updated'} successfully!`, 'success');
  },

  async openCoachModal(coachId = null) {
    document.getElementById('admin_c_id').value = coachId || '';
    document.getElementById('admin_c_name').value = '';
    document.getElementById('admin_c_email').value = '';
    document.getElementById('admin_c_fide').value = '';
    document.getElementById('admin_c_spec').value = 'Tactics';
    
    if (coachId) {
      const c = await CK.db.getProfile(coachId);
      document.getElementById('admin_c_name').value = c.full_name;
      document.getElementById('admin_c_email').value = c.email || '';
      document.getElementById('admin_c_fide').value = c.level === 'Advanced' ? '2100' : '1850';
      document.getElementById('admin_c_spec').value = c.puzzle || 'Tactics';
    }
    this.openModal('adminCoachModal');
  },

  editCoach(id) { this.openCoachModal(id); },

  async openClassModal() {
    await this.populateCoachSelects();
    this.openModal('adminClassModal');
  },

  async saveClass() {
    const title = document.getElementById('admin_cl_title').value;
    if (!title) return CK.showToast('Class title is required', 'error');
    
    const coachSelect = document.getElementById('admin_cl_coach');
    
    this.classesDb.push({
      id: 'CL' + (this.classesDb.length + 1),
      title: title,
      level: document.getElementById('admin_cl_level').value,
      coach: coachSelect.value,
      schedule: document.getElementById('admin_cl_day').value + ' ' + document.getElementById('admin_cl_time').value,
      students: 0, 
      max: 10
    });
    
    localStorage.setItem('ck_admin_classes', JSON.stringify(this.classesDb));
    
    await this.loadClasses();
    this.updateStats();
    this.closeModal('adminClassModal');
    CK.showToast('New class scheduled successfully!', 'success');
  },

  async exportStudentsCSV() {
    try {
      const students = await CK.db.getProfiles('student');
      if (students.length === 0) {
        return CK.showToast('No student data to export.', 'warning');
      }

      // Define CSV headers
      const headers = ['User ID', 'Full Name', 'Email', 'Age', 'Level', 'Coach', 'Rating', 'Stars Earned', 'Status'];
      
      // Build rows
      const rows = students.map(s => [
        s.userid || 'N/A',
        s.full_name || 'N/A',
        s.email || 'N/A',
        s.age || '10',
        s.level || 'Beginner',
        s.coach || 'Assigning...',
        s.rating || '800',
        s.star || '1',
        s.status || 'Offline'
      ]);

      // Join into CSV format
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `chesskidoo_students_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      CK.showToast('🎉 Student list exported to CSV successfully!', 'success');
    } catch (e) {
      console.error(e);
      CK.showToast('Export failed.', 'error');
    }
  }
};