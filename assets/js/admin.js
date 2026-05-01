/**
 * ChessKidoo Admin Portal Logic
 * Managed under CK.admin namespace
 */
CK.admin = {
  db: {
    students: [
      { id: '101', name: 'Emma Wilson', age: 10, level: 'Intermediate', coach: 'Sarah Chess', rating: 1120, attendance: '92%', status: 'Online' },
      { id: '102', name: 'James Smith', age: 8, level: 'Beginner', coach: 'Michael Knight', rating: 650, attendance: '85%', status: 'Away' },
      { id: '103', name: 'Leo Garcia', age: 12, level: 'Advanced', coach: 'Sarah Chess', rating: 1450, attendance: '98%', status: 'Online' }
    ],
    coaches: [
      { id: 'C1', name: 'Sarah Chess', rating: 2100, spec: 'Opening Theory', students: 12, classes: 5, status: 'Online' },
      { id: 'C2', name: 'Michael Knight', rating: 1950, spec: 'Tactics', students: 8, classes: 3, status: 'Offline' }
    ],
    classes: [
      { id: 'CL1', title: 'Intermediate Strategy', level: 'Intermediate', coach: 'Sarah Chess', schedule: 'Mon 4:00 PM', students: 8, max: 10 },
      { id: 'CL2', title: 'Beginner Basics', level: 'Beginner', coach: 'Michael Knight', schedule: 'Tue 5:00 PM', students: 5, max: 8 }
    ],
    activity: [
      { time: '2 mins ago', event: 'Student Check-in', user: 'Emma Wilson', status: 'p-badge-green' },
      { time: '15 mins ago', event: 'New Enrollment', user: 'James Smith', status: 'p-badge-blue' },
      { time: '1 hour ago', event: 'Class Completed', user: 'Intermediate Strategy', status: 'p-badge-gold' }
    ]
  },

  init() {
    console.log("Admin Portal Initializing...");
    this.renderDashboard();
    this.initCharts();
    this.updateStats();
    this.loadStudents();
    this.loadCoaches();
    this.loadClasses();
    this.loadAttendance();
    this.loadFiles();
    this.renderActivity();
    
    // Populate modal coach selects
    const coachSelects = ['admin_s_coach', 'admin_cl_coach'];
    coachSelects.forEach(id => {
      const el = document.getElementById(id);
      if(el) el.innerHTML = this.db.coaches.map(c => `<option>${c.name}</option>`).join('');
    });
  },

  renderActivity() {
    const tbody = document.getElementById('adminActivityTable');
    if(!tbody) return;
    const activities = [
      { time: '2 mins ago', event: 'New Student Enrolled', user: 'Emma Wilson', status: 'p-badge-green', label: 'Success' },
      { time: '15 mins ago', event: 'File Uploaded', user: 'Admin', status: 'p-badge-blue', label: 'Info' },
      { time: '1 hour ago', event: 'Class Cancelled', user: 'Sarah Chess', status: 'p-badge-red', label: 'Urgent' },
      { time: '3 hours ago', event: 'New Coach Registered', user: 'Michael Knight', status: 'p-badge-gold', label: 'New' }
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
    document.getElementById(`p-panel-${panelId}`).classList.add('active');
    
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
    
    // Action button context
    const btn = document.getElementById('adminTopActionBtn');
    if(panelId === 'students') { btn.innerText = '+ Add Student'; btn.style.display = 'block'; }
    else if(panelId === 'coaches') { btn.innerText = '+ Add Coach'; btn.style.display = 'block'; }
    else if(panelId === 'classes') { btn.innerText = '+ Add Class'; btn.style.display = 'block'; }
    else { btn.style.display = 'none'; }

    if(panelId === 'live') this.renderLive();
  },

  updateStats() {
    const s = {
      students: this.db.students.length,
      coaches: this.db.coaches.length,
      classes: this.db.classes.length,
      revenue: '$' + (this.db.students.length * 1250).toLocaleString()
    };
    const elS = document.getElementById('stat-students');
    const elC = document.getElementById('stat-coaches');
    const elCl = document.getElementById('stat-classes');
    const elR = document.getElementById('stat-revenue');
    const elB = document.getElementById('badge-students');

    if(elS) elS.innerText = s.students;
    if(elC) elC.innerText = s.coaches;
    if(elCl) elCl.innerText = s.classes;
    if(elR) elR.innerText = s.revenue;
    if(elB) elB.innerText = s.students;
  },

  renderDashboard() {
    const tbody = document.getElementById('adminActivityTable');
    tbody.innerHTML = this.db.activity.map(a => `
      <tr>
        <td style="color:var(--p-text-muted)">${a.time}</td>
        <td style="font-weight:600">${a.event}</td>
        <td>${a.user}</td>
        <td><span class="p-badge ${a.status}">${a.event.split(' ')[1] || 'Info'}</span></td>
      </tr>
    `).join('');
  },

  initCharts() {
    const ctxMain = document.getElementById('chartMain')?.getContext('2d');
    if(ctxMain) {
      new Chart(ctxMain, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Students',
            data: [45, 52, 60, 72, 85, 98],
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
          scales: { y: { grid: { color: '#252b35' }, ticks: { color: '#7a8499' } }, x: { grid: { display: false }, ticks: { color: '#7a8499' } } }
        }
      });
    }

    const ctxLevels = document.getElementById('chartLevels')?.getContext('2d');
    if(ctxLevels) {
      new Chart(ctxLevels, {
        type: 'doughnut',
        data: {
          labels: ['Beginner', 'Intermediate', 'Advanced'],
          datasets: [{
            data: [40, 35, 25],
            backgroundColor: ['#e8b84b', '#00c9a7', '#5b9cf6'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#7a8499', padding: 20, usePointStyle: true } } },
          cutout: '70%'
        }
      });
    }
  },

  loadStudents(data = null) {
    const tbody = document.getElementById('adminStudentsTable');
    if(!tbody) return;
    const list = data || this.db.students;
    if(list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; opacity:0.5; padding:20px;">No students found.</td></tr>';
      return;
    }
    tbody.innerHTML = list.map((s, i) => `
      <tr>
        <td style="color:var(--p-text-muted)">#${s.id}</td>
        <td style="font-weight:600">${s.name}</td>
        <td>${s.age} yrs</td>
        <td><span class="p-badge p-badge-blue">${s.level}</span></td>
        <td>${s.coach}</td>
        <td style="font-weight:700; color:var(--p-gold)">${s.rating}</td>
        <td>${s.attendance}</td>
        <td><span class="p-status-dot ${s.status.toLowerCase()}"></span> ${s.status}</td>
        <td>
          <div class="p-action-group">
            <button class="p-icon-btn p-btn-sm" onclick="CK.admin.editStudent('${s.id}')" title="Edit">✏️</button>
            <button class="p-icon-btn p-btn-sm" style="color:var(--p-danger)" onclick="CK.admin.deleteStudent('${s.id}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  filterStudents() {
    const level = document.getElementById('adminFilterLevel').value;
    const filtered = level ? this.db.students.filter(s => s.level === level) : this.db.students;
    this.loadStudents(filtered);
  },

  editStudent(id) {
    this.openStudentModal(id);
  },

  loadCoaches() {
    const tbody = document.getElementById('adminCoachesTable');
    if(!tbody) return;
    tbody.innerHTML = this.db.coaches.map(c => `
      <tr>
        <td>#${c.id}</td>
        <td style="font-weight:600">${c.name}</td>
        <td style="font-weight:700; color:var(--p-teal)">${c.rating}</td>
        <td>${c.spec}</td>
        <td>${c.students}</td>
        <td>${c.classes}</td>
        <td><span class="p-badge ${c.status === 'Online' ? 'p-badge-green' : 'p-badge-red'}">${c.status}</span></td>
        <td><button class="p-btn p-btn-ghost p-btn-sm" onclick="CK.admin.editCoach('${c.id}')">Edit</button></td>
      </tr>
    `).join('');
  },

  loadClasses() {
    const tbody = document.getElementById('adminClassesTable');
    if(!tbody) return;
    tbody.innerHTML = this.db.classes.map(cl => `
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

  loadAttendance() {
    const tbody = document.getElementById('adminAttendanceTable');
    if(!tbody) return;
    const date = document.getElementById('adminAttendanceDate').value || 'Today';
    
    // Generate mock attendance based on students
    tbody.innerHTML = this.db.students.slice(0, 5).map(s => `
      <tr>
        <td style="font-weight:600">${s.name}</td>
        <td>Intermediate Strategy</td>
        <td>Sarah Chess</td>
        <td>4:0${Math.floor(Math.random()*9)} PM</td>
        <td>${50 + Math.floor(Math.random()*10)} mins</td>
        <td><span class="p-badge p-badge-green">Present</span></td>
      </tr>
    `).join('');
  },

  renderLive() {
    const grid = document.getElementById('adminLiveGrid');
    grid.innerHTML = this.db.students.map(s => `
      <div class="p-live-card ${s.status.toLowerCase()}">
        <div class="p-live-avatar" style="background:var(--p-surface3); color:var(--p-gold)">${s.name.charAt(0)}</div>
        <div class="p-live-info">
          <div class="p-live-name">${s.name}</div>
          <div class="p-live-sub">${s.level} · ${s.coach}</div>
          <div class="p-live-status">
            <span class="p-status-dot ${s.status.toLowerCase()}"></span> ${s.status}
          </div>
        </div>
        <button class="p-icon-btn" title="View Board">👁️</button>
      </div>
    `).join('');
    document.getElementById('adminLiveCount').innerText = `${this.db.students.filter(s => s.status==='Online').length} students online`;
  },

  openModal(id) { CK.openModal(id); },
  closeModal(id) { CK.closeModal(id); },

  topAction() {
    const panel = document.querySelector('#admin-page .p-panel.active').id;
    if(panel === 'p-panel-students') this.openStudentModal();
    if(panel === 'p-panel-coaches') this.openCoachModal();
    if(panel === 'p-panel-classes') this.openClassModal();
  },

  openStudentModal(studentId = null) {
    const modal = document.getElementById('adminStudentModal');
    const title = document.getElementById('adminStudentModalTitle');
    const coachesSelect = document.getElementById('admin_s_coach');
    
    coachesSelect.innerHTML = this.db.coaches.map(c => `<option>${c.name}</option>`).join('');
    
    if(studentId) {
      title.innerText = 'Edit Student';
      const s = this.db.students.find(x => x.id === studentId);
      document.getElementById('admin_s_id').value = s.id;
      document.getElementById('admin_s_name').value = s.name;
      document.getElementById('admin_s_level').value = s.level;
    } else {
      title.innerText = 'Add New Student';
      document.getElementById('admin_s_id').value = '';
      document.getElementById('admin_s_name').value = '';
    }
    this.openModal('adminStudentModal');
  },

  saveStudent() {
    const name = document.getElementById('admin_s_name').value;
    if(!name) return CK.showToast('Name is required', 'error');
    
    const id = document.getElementById('admin_s_id').value || Math.floor(Math.random()*1000).toString();
    const isNew = !document.getElementById('admin_s_id').value;
    
    const studentData = {
      id, name,
      age: document.getElementById('admin_s_age').value || 10,
      level: document.getElementById('admin_s_level').value,
      coach: document.getElementById('admin_s_coach').value,
      rating: document.getElementById('admin_s_rating').value || 800,
      attendance: '100%', status: 'Offline'
    };

    if(isNew) this.db.students.push(studentData);
    else {
      const idx = this.db.students.findIndex(s => s.id === id);
      this.db.students[idx] = studentData;
    }

    this.loadStudents();
    this.updateStats();
    this.closeModal('adminStudentModal');
    CK.showToast(`Student ${isNew ? 'added' : 'updated'} successfully!`, 'success');
  },

  deleteStudent(id) {
    if(confirm('Are you sure you want to delete this student?')) {
      this.db.students = this.db.students.filter(s => s.id !== id);
      this.loadStudents();
      this.updateStats();
      CK.showToast('Student removed', 'success');
    }
  },

  handleSearch(val) {
    const q = val.toLowerCase();
    const filtered = this.db.students.filter(s => s.name.toLowerCase().includes(q) || s.id.includes(q));
    this.loadStudents(filtered);
  },

  async handleResourceUpload(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Uploading...';
    
    try {
      const file = form.file.files[0];
      const path = `docs/${Date.now()}_${file.name}`;
      const { error: upErr } = await window.supabaseClient.storage.from('documents').upload(path, file);
      if (upErr) throw upErr;
      
      await window.supabaseClient.from('document').insert({
        name: form.fileName.value,
        file_name: path,
        level: form.level.value,
        batch: form.batch.value,
        created_at: new Date().toISOString()
      });
      
      CK.showToast('Resource uploaded!', 'success');
      CK.closeModal('uploadModal');
      form.reset();
      this.loadFiles();
    } catch (err) {
      CK.showToast(err.message || 'Upload failed.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Upload';
    }
  },

  async loadFiles() {
    const tbody = document.getElementById('adminFilesTable');
    if(!tbody) return;
    
    try {
      const { data, error } = await window.supabaseClient.from('document').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      tbody.innerHTML = data.map(f => `
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
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; opacity:0.5;">No files found or error loading.</td></tr>';
    }
  },

  async downloadFile(fileName) {
    const { data } = window.supabaseClient.storage.from('documents').getPublicUrl(fileName);
    if (data?.publicUrl) window.open(data.publicUrl, '_blank');
  },

  async deleteFile(id, fileName) {
    if(!confirm('Delete this file permanently?')) return;
    try {
      await window.supabaseClient.storage.from('documents').remove([fileName]);
      await window.supabaseClient.from('document').delete().eq('id', id);
      CK.showToast('File deleted.', 'success');
      this.loadFiles();
    } catch(e) { CK.showToast('Delete failed.', 'error'); }
  },

  saveCoach() {
    const name = document.getElementById('admin_c_name').value;
    if(!name) return CK.showToast('Name required', 'error');
    
    const id = document.getElementById('admin_c_id').value;
    const isNew = !id;
    const coachData = {
      id: id || 'C' + (this.db.coaches.length + 1),
      name: name,
      rating: document.getElementById('admin_c_fide').value || 1200,
      spec: document.getElementById('admin_c_spec').value,
      students: isNew ? 0 : this.db.coaches.find(c=>c.id===id).students,
      classes: isNew ? 0 : this.db.coaches.find(c=>c.id===id).classes,
      status: isNew ? 'Offline' : this.db.coaches.find(c=>c.id===id).status
    };
    
    if(isNew) this.db.coaches.push(coachData);
    else {
      const idx = this.db.coaches.findIndex(c => c.id === id);
      this.db.coaches[idx] = coachData;
    }
    
    this.loadCoaches();
    this.updateStats();
    this.closeModal('adminCoachModal');
    CK.showToast(`Coach ${isNew ? 'added' : 'updated'}!`, 'success');
  },

  openCoachModal(coachId = null) {
    document.getElementById('admin_c_id').value = coachId || '';
    document.getElementById('admin_c_name').value = '';
    document.getElementById('admin_c_fide').value = '';
    document.getElementById('admin_c_spec').value = 'Beginner Expert';
    
    if(coachId) {
      const c = this.db.coaches.find(x => x.id === coachId);
      document.getElementById('admin_c_name').value = c.name;
      document.getElementById('admin_c_fide').value = c.rating;
      document.getElementById('admin_c_spec').value = c.spec;
    }
    this.openModal('adminCoachModal');
  },

  editCoach(id) { this.openCoachModal(id); },

  openClassModal() {
    const coachSelect = document.getElementById('admin_cl_coach');
    coachSelect.innerHTML = this.db.coaches.map(c => `<option>${c.name}</option>`).join('');
    this.openModal('adminClassModal');
  },

  saveClass() {
    const title = document.getElementById('admin_cl_title').value;
    if(!title) return CK.showToast('Title required', 'error');
    
    const coachSelect = document.getElementById('admin_cl_coach');
    this.db.classes.push({
      id: 'CL' + (this.db.classes.length + 1),
      title: title,
      level: document.getElementById('admin_cl_level').value,
      coach: coachSelect.value,
      schedule: document.getElementById('admin_cl_day').value + ' ' + document.getElementById('admin_cl_time').value,
      students: 0, max: 10
    });
    
    this.loadClasses();
    this.updateStats();
    this.closeModal('adminClassModal');
    CK.showToast('Class scheduled!', 'success');
  }
};