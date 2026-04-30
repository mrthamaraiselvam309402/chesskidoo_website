/* assets/js/admin.js -------------------------------------------------------
   Dynamic Admin Dashboard for ChessKidoo
   --------------------------------------------------------------- */

(() => {
  const CK = window.CK = window.CK || {};

  CK.switchAdminTab = (tab, btn) => {
    // Update UI
    document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Load content
    CK.loadAdminTab(tab);
  };

  CK.loadAdminDashboard = () => {
    CK.loadAdminTab('files');
  };

  CK.loadAdminTab = async (tab) => {
    const content = document.getElementById('admin-tab-content');
    content.innerHTML = '<div class="loading-wrap">♛ Loading...</div>';

    try {
      switch (tab) {
        case 'files':
          await loadFilesTab(content);
          break;
        case 'meetings':
          await loadMeetingsTab(content);
          break;
        case 'attendance':
          await loadAttendanceTab(content);
          break;
        case 'users':
          await loadUsersTab(content);
          break;
        case 'tournaments':
          content.innerHTML = '<h3>Tournaments</h3><p>Tournament management module coming soon.</p>';
          break;
        case 'achievements':
          content.innerHTML = '<h3>Achievements</h3><p>Manage academy achievements here.</p>';
          break;
      }
    } catch (err) {
      console.error("Admin Tab Error:", err);
      content.innerHTML = `<div class="error-wrap">❌ Error: ${err.message}</div>`;
    }
  };

  /* ─── Tab Loaders ─── */

  async function loadFilesTab(el) {
    const { data: files } = await window.supabaseClient.from('document').select('*').order('created_at', { ascending: false });
    
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3>File Management</h3>
        <button class="btn btn-primary" onclick="CK.openModal('uploadModal')">+ Upload Files</button>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr><th>Date</th><th>Document</th><th>Notes</th><th>Coach</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${files.map(f => `
              <tr>
                <td>${new Date(f.created_at).toLocaleDateString()}</td>
                <td style="font-weight:600;">${f.file_name.split('/').pop()}</td>
                <td>${f.name || '-'}</td>
                <td>${f.coach}</td>
                <td>
                  <button class="btn btn-ghost btn-sm" onclick="CK.deleteFile('${f.file_name}')">🗑️</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  async function loadMeetingsTab(el) {
    el.innerHTML = `
      <div style="max-width: 500px; margin: 0 auto;" class="feat-card">
        <h3 style="text-align:center; margin-bottom:24px;">Schedule Meeting Reminder</h3>
        <form onsubmit="CK.handleMeetingSubmit(event)">
          <div class="form-group">
            <label>Meeting URL</label>
            <input type="url" name="meetingUrl" required placeholder="https://zoom.us/j/...">
          </div>
          <div class="form-group">
            <label>Date & Time</label>
            <input type="datetime-local" name="meetingTime" required>
          </div>
          <div class="form-group">
            <label>Batch</label>
            <input type="text" name="batch" required placeholder="e.g. Batch 1">
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 20px;">Schedule Reminder</button>
        </form>
      </div>
    `;
  }

  async function loadAttendanceTab(el) {
    const { data: users } = await window.supabaseClient.from('users').select('*').eq('role', 'student');
    
    el.innerHTML = `
      <h3>User Attendance</h3>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:20px;">
        ${users.map(u => `
          <button class="btn btn-ghost btn-sm" onclick="CK.loadUserAttendance('${u.id}', '${u.full_name}')">${u.full_name}</button>
        `).join('')}
      </div>
      <div id="attendanceCalendar" class="feat-card" style="min-height: 300px; display:flex; align-items:center; justify-content:center; opacity:0.5;">
        Select a student to view attendance calendar
      </div>
    `;
  }

  async function loadUsersTab(el) {
    const { data: users } = await window.supabaseClient.from('users').select('*').order('userid', { ascending: true });
    
    el.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h3>User Management</h3>
        <button class="btn btn-primary" onclick="CK.openModal('addUserModal')">+ Add Student</button>
      </div>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr><th>ID</th><th>Full Name</th><th>Email</th><th>Level</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td>${u.userid || '-'}</td>
                <td style="font-weight:600;">${u.full_name}</td>
                <td>${u.email}</td>
                <td><span class="hero-badge" style="font-size:0.7rem;">${u.level}</span></td>
                <td>${u.role}</td>
                <td>
                  <button class="btn btn-ghost btn-sm">Edit</button>
                  <button class="btn btn-ghost btn-sm" style="color:red;" onclick="CK.deleteUser('${u.id}')">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ─── Handlers ─── */

  CK.handleMeetingSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      meetingLink: form.meetingUrl.value,
      meetingTime: new Date(form.meetingTime.value).toISOString(),
      batch: form.batch.value
    };

    try {
      CK.showToast("Scheduling reminder...", "info");
      await fetch("https://xttxauuiucmoqedkxdoa.supabase.co/functions/v1/create-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      CK.showToast("Reminder scheduled successfully!", "success");
      form.reset();
    } catch (err) {
      CK.showToast("Failed to schedule reminder", "error");
    }
  };

  CK.loadUserAttendance = async (id, name) => {
    const calendarEl = document.getElementById('attendanceCalendar');
    calendarEl.innerHTML = '♛ Loading Calendar...';
    calendarEl.style.opacity = '1';

    const { data: attendance } = await window.supabaseClient.from('attendance').select('*').eq('userid', id);
    
    // Simple calendar render (simplified for Vanilla)
    calendarEl.innerHTML = `
      <div style="width:100%;">
        <h4 style="text-align:center; margin-bottom:20px;">Attendance: ${name}</h4>
        <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:10px; text-align:center;">
          ${['S','M','T','W','T','F','S'].map(d => `<div style="font-weight:bold; opacity:0.5;">${d}</div>`).join('')}
          ${Array.from({length: 30}, (_, i) => {
            const date = `2026-04-${String(i+1).padStart(2, '0')}`;
            const record = attendance.find(a => a.date === date);
            const status = record ? (record.status === 'present' ? '✅' : '❌') : '';
            return `<div style="padding:15px; background:var(--cream); border-radius:8px; position:relative;">
              ${i+1} <span style="position:absolute; bottom:5px; right:5px; font-size:0.8rem;">${status}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  };

})();